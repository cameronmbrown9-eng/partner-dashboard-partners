import React, { useState, useEffect, useRef } from 'react';
import {
  supabase,
  hasSupabaseConfig,
  listShipments,
  insertShipment,
  updateShipment,
  logCustodyEvent,
  listCustodyEvents,
  listQueuedSamples,
  listUnbatchedSamples,
  listBatchSamples,
  insertQueuedSample,
  deleteQueuedSample,
  attachSamplesToBatch,
  updateQueuedSample,
} from './supabaseClient';
import { MapPin, List, Users, ChevronDown, ChevronUp, Clock, Trophy, ExternalLink, RotateCcw, Presentation, Maximize2, Minimize2, Check, CheckCircle, FileText, Mail, Phone, BookOpen, Download, MessageSquare, ArrowUp, AlertTriangle, Printer, Newspaper, X, Activity, Building2, Smartphone, TrendingUp, Globe, Target, Zap, Navigation } from 'lucide-react';
import L from 'leaflet';

// Shared, data-driven building blocks (identical copies live in both dashboard repos)
import { SectionCard, SkipLink, DataStamp, fmtDate } from './shared/ui.jsx';
import { ACTIVE_PARTNERS, LISTED_PARTNERS, METRICS, partnersMeta, networkStats } from './shared/data.js';
import { NewsFeed, DocumentsSection, RelatedLinks, NetworkSummary, PwlleTrainingSessions, MapSection, ContactsSection } from './shared/sections.jsx';
import { PdfCard, ProjectPublications, BackToTop, AnnouncementBanner, TableOfContents, ProjectCountdown, PicturingTheProblem, ProjectTimeline } from './shared/common.jsx';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Announcement Banner Configuration - UPDATE MESSAGE AS NEEDED
const ANNOUNCEMENT_CONFIG = {
  isActive: false,
  type: 'info',
  message: 'Welcome to the new Project Partner Dashboard! Explore the features and reach out if you have any questions.',
  link: null,
};

// ═══════════════════════════════════════════════════════════════════════════
// SAMPLE CHAIN OF CUSTODY v2 — Queue + Batch Workflow
// Workflow: (1) Site queues samples → (2) Site assembles batch + signs →
//           (3) Courier signs pickup → (4) Western Chemistry lab signs arrival/verify
// All timestamps auto-captured. One signoff per handoff (not per sample).
// ═══════════════════════════════════════════════════════════════════════════

const CUSTODY_PASSWORD = import.meta.env.VITE_CUSTODY_PASSWORD || '';   // set in .env.local / CI secret; no fallback in source

// ═══════════════════════════════════════════════════════════════════════════
// 👇 EDIT THIS WHEN THE NEXT COURIER PICKUP DATE CHANGES, THEN REDEPLOY.
//    Format: 'YYYY-MM-DD' (auto-formats to "Mon, Apr 27, 2026" in the UI).
//    Set to null or '' to hide the banner entirely.
// ═══════════════════════════════════════════════════════════════════════════
const NEXT_PICKUP_DATE = 'TBD';

const formatPickupDate = (isoDate) => {
  if (!isoDate) return null;
  if (isoDate === 'TBD') return 'TBD';
  // Parse as local date (YYYY-MM-DD without time component avoids TZ shift issues)
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  if (isNaN(date)) return null;
  return date.toLocaleDateString('en-CA', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
};

const getFingerprint = () => {
  try {
    const stored = localStorage.getItem('wudc_fp');
    if (stored) return stored;
    const fp = 'fp-' + Math.random().toString(36).slice(2, 10) + '-' + Date.now().toString(36);
    localStorage.setItem('wudc_fp', fp);
    return fp;
  } catch { return 'fp-unknown'; }
};

const formatDT = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleString('en-CA', {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
};

const STATUS_META = {
  batch_assembled: { label: 'Batch Ready — awaiting courier', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  in_transit:      { label: 'In Transit',                    color: 'bg-blue-100 text-blue-800 border-blue-300' },
  delivered:       { label: 'Delivered (pending intake)',    color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  verified:        { label: 'Verified & Logged',             color: 'bg-green-100 text-green-800 border-green-300' },
  exception:       { label: '⚠ Exception',                   color: 'bg-red-100 text-red-800 border-red-300' },
  packaged:        { label: 'Legacy (v1)',                   color: 'bg-slate-100 text-slate-800 border-slate-300' },
};

// --- Site-Worker Walkthrough Modal ----------------------------------------
// Pop-up tour mirroring the partner-facing "How to Log and Send Your Samples"
// deck. Auto-opens on first visit (per device) and is reachable from a button
// on the overview view. Covers the site-worker portion only -- courier and
// Western intake steps are mentioned only as "what happens next" so workers
// know to expect those signoffs.
const WALKTHROUGH_LS_KEY = 'wudc-custody-walkthrough-seen-v2';

const SiteWorkerWalkthroughModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);

  useEffect(() => { if (isOpen) setStep(0); }, [isOpen]);

  const steps = [
    {
      emoji: '👋',
      badge: 'Welcome',
      headerColor: 'from-purple-700 to-purple-900',
      title: 'This page is for sending your samples.',
      body: 'You will log each drug sample as you collect it from a client. On pickup day, the courier takes the bag of samples to the Western University Chemistry lab for testing.',
      tip: 'Each sample only takes a minute or so to log.',
    },
    {
      emoji: '✍️',
      badge: 'Step 1',
      headerColor: 'from-purple-700 to-purple-900',
      title: 'Sign in once for the day.',
      body: 'Tap "+ Queue a Sample" at the top. Pick your site from the list. Type your name. You only do this one time per visit -- then you can keep adding samples without signing each one.',
      tip: 'Your name will be saved on every sample you log that day.',
    },
    {
      emoji: '➕',
      badge: 'Step 2',
      headerColor: 'from-amber-500 to-orange-500',
      title: 'Add each sample as it comes in.',
      body: 'For each sample, type the Sample ID and the Client Code. Notes are optional. Tap "+ Add to Queue". Do this every time a sample comes in over the days or weeks before pickup.',
      tip: 'Samples wait safely in the queue until pickup day.',
    },
    {
      emoji: '✎',
      badge: 'If you spot a typo',
      headerColor: 'from-blue-500 to-blue-700',
      title: 'You can fix mistakes before pickup.',
      body: 'See a typo in a sample you queued? Tap the ✎ pencil next to it to fix the Sample ID, Client Code, or description. Spelled your own name wrong at sign-in? Tap "✎ Fix my name" at the top of the page -- it corrects every sample you signed at once, even ones from earlier sessions.',
      tip: 'Every change is logged in the sample history, so the audit trail stays clean.',
    },
    {
      emoji: '📦',
      badge: 'On pickup day',
      headerColor: 'from-amber-500 to-orange-500',
      title: 'On pickup day -- make the batch.',
      body: 'Tap "📦 Assemble Batch" at the top. Tick the samples going in the bag today. Type the total number you ticked. The page checks the count for you.',
      tip: 'If the count does not match, the page will not let you send. Just count again.',
    },
    {
      emoji: '✅',
      badge: "You're done",
      headerColor: 'from-green-600 to-green-800',
      title: 'Sign once and your part is done.',
      body: 'Type your name and tap "Confirm Batch". From here, the courier signs when they pick up the bag, and Western lab staff sign when it arrives. You can watch each step right on this page.',
      tip: 'You never enter dates or times -- the page stamps them for you.',
    },
  ];

  if (!isOpen) return null;
  const current = steps[step];
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;

  const handleClose = () => {
    try { localStorage.setItem(WALKTHROUGH_LS_KEY, '1'); } catch (e) { /* private mode */ }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-xl max-h-[92vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className={`bg-gradient-to-r ${current.headerColor} text-white px-5 py-4 flex items-center justify-between flex-shrink-0`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl" aria-hidden="true">{current.emoji}</span>
            <div>
              <div className="text-xs sm:text-sm font-bold tracking-wider uppercase opacity-90">{current.badge}</div>
              <div className="text-xs opacity-75">Step {step + 1} of {steps.length}</div>
            </div>
          </div>
          <button onClick={handleClose} aria-label="Close walkthrough"
            className="opacity-70 hover:opacity-100 text-3xl leading-none p-1 hover:bg-white/10 rounded-lg transition">×</button>
        </div>
        <div className="px-5 py-6 sm:px-7 sm:py-8 overflow-y-auto flex-1 bg-gradient-to-br from-white to-purple-50">
          <h3 className="text-xl sm:text-2xl font-bold text-purple-900 mb-3 leading-snug">{current.title}</h3>
          <p className="text-gray-800 text-base sm:text-lg leading-relaxed mb-5">{current.body}</p>
          <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg px-3 py-3 sm:px-4 flex items-start gap-3">
            <span className="text-xl flex-shrink-0" aria-hidden="true">💡</span>
            <div className="text-sm sm:text-base text-amber-900 font-medium leading-snug">{current.tip}</div>
          </div>
        </div>
        <div className="flex justify-center gap-2 py-3 bg-white border-t border-gray-100">
          {steps.map((_, i) => (
            <button key={i} onClick={() => setStep(i)} aria-label={`Go to step ${i + 1}`}
              className={`h-2.5 rounded-full transition-all ${i === step ? 'w-8 bg-purple-700' : 'w-2.5 bg-gray-300 hover:bg-gray-400'}`} />
          ))}
        </div>
        <div className="px-4 sm:px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2 flex-shrink-0">
          <button type="button" onClick={() => setStep(Math.max(0, step - 1))} disabled={isFirst}
            className="px-4 py-2 rounded-lg font-semibold text-sm bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition">
            ← Back
          </button>
          {!isLast ? (
            <button type="button" onClick={() => setStep(step + 1)}
              className="px-5 py-2 rounded-lg font-bold text-sm bg-purple-700 text-white hover:bg-purple-800 shadow transition">
              Next →
            </button>
          ) : (
            <button type="button" onClick={handleClose}
              className="px-5 py-2 rounded-lg font-bold text-sm bg-green-600 text-white hover:bg-green-700 shadow transition">
              Got it ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const SampleChainOfCustody = ({ partnersData }) => {
  const [unlocked, setUnlocked] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState('');

  const [shipments, setShipments] = useState([]);
  const [queueCounts, setQueueCounts] = useState({});  // { siteId: count } for display
  const [allQueue, setAllQueue] = useState([]);        // full queue for stats panel
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [view, setView] = useState('list'); // list | queue | assemble | detail
  const [activeSiteId, setActiveSiteId] = useState(null);
  const [activeShipmentId, setActiveShipmentId] = useState(null);
  const [busy, setBusy] = useState(false);
  const pwInputRef = useRef(null);
  const [toast, setToast] = useState(null);  // { msg, kind: 'success'|'info' } | null

  // Auto-clear toast after 5 seconds
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const fingerprint = getFingerprint();

  const refreshShipments = async () => {
    const { data, error } = await listShipments();
    if (error) setLoadError(error.message || String(error));
    else setShipments(data || []);
  };

  const refreshQueueCounts = async () => {
    const { data } = await listQueuedSamples();
    const all = data || [];
    setAllQueue(all);
    const counts = {};
    all.filter(s => s.queue_status === 'queued' && !s.batch_id).forEach(s => {
      counts[s.scs_site_id] = (counts[s.scs_site_id] || 0) + 1;
    });
    setQueueCounts(counts);
  };

  useEffect(() => {
    if (!unlocked) return;
    (async () => {
      setLoading(true);
      setLoadError('');
      await refreshShipments();
      await refreshQueueCounts();
      setLoading(false);
    })();
  }, [unlocked]);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (CUSTODY_PASSWORD && pwInput === CUSTODY_PASSWORD) {
      setUnlocked(true); setPwError(''); setPwInput('');
    } else {
      setPwError(CUSTODY_PASSWORD ? 'Incorrect password. Contact Katelyn Melo (katelyn.melo@scatr.ca) if you need access.' : 'The module password is not configured for this build. Contact Cameron Brown (cbrown58@uwo.ca).');
      setPwInput('');                                     // clear the field so dots don't persist
      // Refocus the input on the next tick so the user can immediately retype
      setTimeout(() => { if (pwInputRef.current) pwInputRef.current.focus(); }, 0);
    }
  };

  // ─── Password gate ────────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div id="chain-of-custody" className="scroll-mt-4 bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-4 sm:px-6 py-4">
          <h2 className="flex items-center gap-2 font-bold text-xl sm:text-2xl">
            <FileText size={24} className="sm:w-7 sm:h-7" />Submit Samples for Courier Pickup
          </h2>
          <p className="text-purple-200 text-xs sm:text-sm mt-1">Password-protected · Health Canada §56(1) compliant transport log</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-white to-purple-50">
          <div className="max-w-md mx-auto bg-white rounded-xl p-6 border-2 border-purple-200 shadow-md">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-lg"><AlertTriangle size={24} className="text-purple-700" /></div>
              <div>
                <div className="font-bold text-purple-900">Access required</div>
                <div className="text-sm text-gray-600">This section contains controlled-substance custody records and requires the module password.</div>
              </div>
            </div>
            <form onSubmit={handleUnlock} className="space-y-3" autoComplete="off">
              <input
                ref={pwInputRef}
                type="password"
                name="custody-module-access"
                autoComplete="new-password"
                value={pwInput}
                onChange={(e) => setPwInput(e.target.value)}
                onFocus={(e) => e.target.select()}
                placeholder="Module password"
                className="w-full px-4 py-3 sm:py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none text-base sm:text-sm"
                autoFocus
              />
              {pwError && <div className="text-sm text-red-700">{pwError}</div>}
              <button type="submit" className="w-full bg-purple-700 text-white font-bold py-3 sm:py-2 rounded-lg hover:bg-purple-800 text-base">Unlock</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const activeShipment = shipments.find((s) => s.id === activeShipmentId);
  const activeSite = partnersData.find((p) => String(p.id) === String(activeSiteId));

  return (
    <div id="chain-of-custody" className="scroll-mt-4 bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="flex items-center gap-2 font-bold text-xl sm:text-2xl">
            <FileText size={24} className="sm:w-7 sm:h-7" />Submit Samples for Courier Pickup
          </h2>
          <p className="text-purple-200 text-xs sm:text-sm mt-1">
            {shipments.length} batch{shipments.length !== 1 ? 'es' : ''} · {Object.values(queueCounts).reduce((a, b) => a + b, 0)} sample{Object.values(queueCounts).reduce((a, b) => a + b, 0) !== 1 ? 's' : ''} in queue
            {!hasSupabaseConfig && (
              <span className="ml-2 bg-red-600 px-2 py-0.5 rounded text-xs font-bold">⚠ Offline mode</span>
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {view !== 'list' && (
            <button onClick={() => { setView('list'); setActiveShipmentId(null); setActiveSiteId(null); refreshShipments(); refreshQueueCounts(); }}
              className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm font-medium">← Back to overview</button>
          )}
          {view === 'list' && (
            <>
              <button onClick={() => setView('queue')}
                className="bg-white text-purple-800 hover:bg-purple-50 font-bold px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap">
                + Queue a Sample
              </button>
              <button onClick={() => setView('assemble')}
                className="bg-amber-400 text-amber-900 hover:bg-amber-300 font-bold px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap">
                📦 Assemble Batch
              </button>
            </>
          )}
        </div>
      </div>

      <div className="p-3 sm:p-6 bg-gradient-to-br from-white to-purple-50">
        {/* Auto-dismissing toast banner shown after batch handoff signoffs */}
        {toast && (
          <div className={`mb-4 rounded-xl p-3 sm:p-4 border-2 shadow-md flex items-start justify-between gap-3 ${
            toast.kind === 'success'
              ? 'bg-green-50 border-green-300 text-green-900'
              : 'bg-blue-50 border-blue-300 text-blue-900'
          }`}>
            <div className="font-bold text-sm sm:text-base flex-1">{toast.msg}</div>
            <button onClick={() => setToast(null)}
              aria-label="Dismiss"
              className="opacity-60 hover:opacity-100 text-lg leading-none">×</button>
          </div>
        )}

        {view === 'queue' && (
          <QueueSampleForm
            partnersData={partnersData}
            fingerprint={fingerprint}
            onSaved={() => { refreshQueueCounts(); }}
            onDone={() => { setView('list'); refreshQueueCounts(); }}
          />
        )}

        {view === 'assemble' && (
          <AssembleBatchView
            partnersData={partnersData}
            queueCounts={queueCounts}
            activeSiteId={activeSiteId}
            setActiveSiteId={setActiveSiteId}
            fingerprint={fingerprint}
            busy={busy} setBusy={setBusy}
            onBatchCreated={async () => {
              await refreshShipments();
              await refreshQueueCounts();
              setView('list');
            }}
          />
        )}

        {view === 'detail' && activeShipment && (
          <BatchDetail
            shipment={activeShipment}
            fingerprint={fingerprint}
            onUpdated={refreshShipments}
            onCompleted={async (msg) => {
              await refreshShipments();
              await refreshQueueCounts();
              setActiveShipmentId(null);
              setView('list');
              setToast({ msg, kind: 'success' });
            }}
          />
        )}

        {view === 'list' && (
          <ListView
            loading={loading} loadError={loadError}
            shipments={shipments}
            queueCounts={queueCounts} allQueue={allQueue} partnersData={partnersData}
            onOpenBatch={(id) => { setActiveShipmentId(id); setView('detail'); }}
          />
        )}
      </div>
    </div>
  );
};

// ─── List View (overview of batches + per-site queue counts) ─────────────
const ListView = ({ loading, loadError, shipments, queueCounts, allQueue, partnersData, onOpenBatch }) => {
  const sitesWithQueue = Object.keys(queueCounts).sort((a, b) => queueCounts[b] - queueCounts[a]);
  const [showHelp, setShowHelp] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  // Auto-open the walkthrough on first visit (per device). After the user
  // closes it once, the localStorage flag prevents reopening; the button
  // above the help panel still lets them launch it manually anytime.
  useEffect(() => {
    let seen = '0';
    try { seen = localStorage.getItem(WALKTHROUGH_LS_KEY) || '0'; } catch (e) { /* private mode */ }
    if (seen !== '1') setShowWalkthrough(true);
  }, []);

  return (
    <div className="space-y-6">
      {loadError && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-sm text-red-800">
          <div className="font-bold">Could not load data</div><div>{loadError}</div>
        </div>
      )}

      {/* Site-worker walkthrough modal (auto-opens once per device) */}
      <SiteWorkerWalkthroughModal isOpen={showWalkthrough} onClose={() => setShowWalkthrough(false)} />

      {/* Big visual tour launcher — pairs with the text-only help panel below */}
      <button type="button" onClick={() => setShowWalkthrough(true)}
        className="w-full text-left bg-gradient-to-r from-purple-700 via-purple-800 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white rounded-xl shadow-lg border-2 border-purple-300 p-4 sm:p-5 transition transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="text-3xl sm:text-4xl flex-shrink-0" aria-hidden="true">🎯</div>
          <div className="min-w-0">
            <div className="font-bold text-base sm:text-lg">Show me how to use this page</div>
            <div className="text-xs sm:text-sm text-purple-100">A short visual tour of the site-worker steps — about 30 seconds.</div>
          </div>
        </div>
        <div className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap flex-shrink-0">
          Start →
        </div>
      </button>

      {/* How to use this — collapsible plain-language instructions */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl overflow-hidden">
        <button type="button" onClick={() => setShowHelp(!showHelp)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 hover:bg-blue-100 transition text-left">
          <div className="flex items-center gap-2">
            <span className="text-xl">❓</span>
            <span className="font-bold text-blue-900 text-sm sm:text-base">How does this work? (tap to {showHelp ? 'hide' : 'show'})</span>
          </div>
          <span className="text-blue-700 text-lg">{showHelp ? '▲' : '▼'}</span>
        </button>
        {showHelp && (
          <div className="px-4 pb-4 text-sm text-blue-900 space-y-3">
            <div>
              <div className="font-bold mb-1">👋 What is this page for?</div>
              <div>This is where you log drug samples that are waiting to be picked up by the courier and sent to the Western University Chemistry lab for testing.</div>
            </div>
            <div>
              <div className="font-bold mb-1">📝 How do I add a sample?</div>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Tap <strong>"+ Queue a Sample"</strong> at the top.</li>
                <li>Pick your site and type your name to sign in once.</li>
                <li>For each sample, type the Sample ID and Client Code. Description is optional.</li>
                <li>Tap <strong>"+ Add to Queue"</strong>. Repeat for every sample.</li>
                <li>When you're all done, tap <strong>"Done"</strong>.</li>
              </ol>
            </div>
            <div>
              <div className="font-bold mb-1">📦 What happens on courier pickup day?</div>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Tap <strong>"📦 Assemble Batch"</strong> at the top.</li>
                <li>Pick your site. You'll see all the samples you queued.</li>
                <li>Tick the ones going in today's batch, type the total count, and sign.</li>
                <li>When the courier arrives, they open the batch on their phone and sign to accept it.</li>
                <li>When it arrives at Western, the Chemistry lab staff sign to confirm receipt.</li>
              </ol>
            </div>
            <div>
              <div className="font-bold mb-1">🕒 Do I need to enter a date and time?</div>
              <div>No. Every action is timestamped automatically when you save it.</div>
            </div>
            <div>
              <div className="font-bold mb-1">✎ I made a typo — can I fix it?</div>
              <div className="space-y-1">
                <div>Yes. Tap the <strong>✎ pencil</strong> next to any sample to correct the Sample ID, Client Code, or description. You can do this any time <em>before</em> the courier picks up the bag.</div>
                <div>Spelled your own name wrong at sign-in? Tap <strong>"✎ Fix my name"</strong> in the green sign-in banner — it fixes every sample you signed in this session, and offers to fix older un-batched samples too.</div>
                <div>Every edit is logged automatically — managers can see who changed what and when, so feel free to correct mistakes as soon as you notice them.</div>
              </div>
            </div>
            <div>
              <div className="font-bold mb-1">❓ Something else looks wrong</div>
              <div>If a sample has already left in a courier bag or something else looks off, email Katelyn Melo at <a href="mailto:katelyn.melo@scatr.ca" className="underline font-semibold">katelyn.melo@scatr.ca</a> and she'll be glad to help.</div>
            </div>
          </div>
        )}
      </div>

      {/* Next pickup banner — manually-edited date constant at top of file */}
      {NEXT_PICKUP_DATE && formatPickupDate(NEXT_PICKUP_DATE) && (
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-300 rounded-xl p-3 sm:p-4 flex items-start gap-3">
          <div className="text-2xl sm:text-3xl">📅</div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-cyan-900 text-sm sm:text-base">
              Next pickup: <span className="text-blue-900">{formatPickupDate(NEXT_PICKUP_DATE)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Queue summary */}
      {sitesWithQueue.length > 0 && (
        <div className="bg-white p-4 sm:p-5 rounded-xl border-2 border-amber-200 shadow-md">
          <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
            <span className="text-xl">📦</span> Samples in Queue (awaiting batch assembly)
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {sitesWithQueue.map((siteId) => {
              const site = partnersData.find((p) => String(p.id) === String(siteId));
              return (
                <div key={siteId} className="flex justify-between items-center bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm">
                  <span className="font-semibold text-amber-900 truncate">{site?.nameOrganization || siteId}</span>
                  <span className="bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full text-xs whitespace-nowrap ml-2">{queueCounts[siteId]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Batches table */}
      <div>
        <h3 className="font-bold text-purple-900 mb-3">Batches ({shipments.length})</h3>
        {loading && <div className="text-center py-8 text-gray-600">Loading…</div>}
        {!loading && shipments.length === 0 && (
          <div className="text-center py-12 bg-white border-2 border-dashed border-purple-200 rounded-xl">
            <FileText size={48} className="mx-auto text-purple-300 mb-3" />
            <div className="text-purple-900 font-bold">No batches yet</div>
            <div className="text-sm text-gray-600 mt-1">Queue some samples, then click "Assemble Batch" to create the first one.</div>
          </div>
        )}

        {!loading && shipments.length > 0 && (
          <div className="overflow-x-auto rounded-xl border-2 border-purple-200 shadow-md">
            <table className="w-full border-collapse text-sm bg-white">
              <thead>
                <tr className="bg-gradient-to-r from-purple-700 to-purple-900 text-white">
                  <th className="p-3 text-left">Batch Created</th>
                  <th className="p-3 text-left">From Site</th>
                  <th className="p-3 text-center">Samples</th>
                  <th className="p-3 text-left">Pickup</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-left">Arrival</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((s, idx) => {
                  const meta = STATUS_META[s.status] || STATUS_META.batch_assembled;
                  return (
                    <tr key={s.id} className={idx % 2 === 0 ? 'bg-purple-50' : 'bg-white'}>
                      <td className="border border-purple-100 p-3">{formatDT(s.created_at)}</td>
                      <td className="border border-purple-100 p-3 font-medium text-purple-900">{s.scs_site_name}</td>
                      <td className="border border-purple-100 p-3 text-center font-bold">{s.batch_sample_count ?? s.sample_count ?? '—'}</td>
                      <td className="border border-purple-100 p-3">{formatDT(s.pickup_at)}</td>
                      <td className="border border-purple-100 p-3 text-center">
                        <span className={`px-2 py-1 border rounded text-xs font-bold ${meta.color}`}>{meta.label}</span>
                      </td>
                      <td className="border border-purple-100 p-3">{formatDT(s.arrival_at)}</td>
                      <td className="border border-purple-100 p-3 text-right">
                        <button onClick={() => onOpenBatch(s.id)} className="text-purple-700 hover:text-purple-900 font-semibold text-xs">Open →</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Submission Statistics ───────────────────────────────────────── */}
      <SubmissionStatistics
        shipments={shipments}
        allQueue={allQueue}
        partnersData={partnersData}
      />
    </div>
  );
};

// ─── Submission Statistics (KPI cards + status bar + collapsible per-site) ─
const SubmissionStatistics = ({ shipments, allQueue, partnersData }) => {
  const [expanded, setExpanded] = useState(false);

  // Don't render at all if there's nothing to summarize
  if (shipments.length === 0 && allQueue.length === 0) return null;

  // ── Aggregate calculations ──
  const queuedSamples = allQueue.filter(s => s.queue_status === 'queued' && !s.batch_id);
  const queuedSiteIds = new Set(queuedSamples.map(s => s.scs_site_id));

  const statusCounts = {
    batch_assembled: 0, in_transit: 0, delivered: 0, verified: 0, exception: 0,
  };
  shipments.forEach(s => {
    if (statusCounts[s.status] !== undefined) statusCounts[s.status] += 1;
  });

  const activeBatches = shipments.filter(s =>
    ['batch_assembled', 'in_transit', 'delivered'].includes(s.status));
  const completedBatches = shipments.filter(s => s.status === 'verified');
  const exceptionBatches = shipments.filter(s => s.status === 'exception');

  const activeSites = new Set(activeBatches.map(b => b.scs_site_id));
  const completedSites = new Set(completedBatches.map(b => b.scs_site_id));

  // Per-site rollup: combine queue + batches per site
  const siteRollup = {};
  const ensure = (siteId, siteName) => {
    if (!siteRollup[siteId]) {
      siteRollup[siteId] = {
        siteId, siteName,
        queued: 0, active: 0, completed: 0, exception: 0,
        totalSamplesHandled: 0, lastActivity: null,
      };
    }
    return siteRollup[siteId];
  };
  queuedSamples.forEach(s => {
    const r = ensure(s.scs_site_id, s.scs_site_name);
    r.queued += 1;
    if (!r.lastActivity || s.entered_at > r.lastActivity) r.lastActivity = s.entered_at;
  });
  shipments.forEach(s => {
    const r = ensure(s.scs_site_id, s.scs_site_name);
    if (['batch_assembled', 'in_transit', 'delivered'].includes(s.status)) r.active += 1;
    if (s.status === 'verified')   r.completed += 1;
    if (s.status === 'exception')  r.exception += 1;
    r.totalSamplesHandled += (s.batch_sample_count || 0);
    const ts = s.intake_at || s.pickup_at || s.batch_assembled_at || s.created_at;
    if (ts && (!r.lastActivity || ts > r.lastActivity)) r.lastActivity = ts;
  });
  const siteRows = Object.values(siteRollup).sort((a, b) =>
    (b.queued + b.active + b.completed) - (a.queued + a.active + a.completed));

  const totalSamplesHandled = shipments.reduce((sum, s) => sum + (s.batch_sample_count || 0), 0);

  return (
    <div className="mt-6 bg-white rounded-xl border-2 border-purple-200 shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-4 sm:px-5 py-3">
        <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
          <Activity size={20} /> Submission Statistics
        </h3>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-3">
            <div className="text-xs uppercase tracking-wider text-amber-800 font-bold">Samples in Queue</div>
            <div className="text-3xl font-black text-amber-900 mt-1">{queuedSamples.length}</div>
            <div className="text-xs text-amber-800 mt-1">across {queuedSiteIds.size} site{queuedSiteIds.size !== 1 ? 's' : ''}</div>
          </div>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
            <div className="text-xs uppercase tracking-wider text-blue-800 font-bold">Active Batches</div>
            <div className="text-3xl font-black text-blue-900 mt-1">{activeBatches.length}</div>
            <div className="text-xs text-blue-800 mt-1">across {activeSites.size} site{activeSites.size !== 1 ? 's' : ''}</div>
          </div>
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
            <div className="text-xs uppercase tracking-wider text-green-800 font-bold">Completed Batches</div>
            <div className="text-3xl font-black text-green-900 mt-1">{completedBatches.length}</div>
            <div className="text-xs text-green-800 mt-1">{totalSamplesHandled} sample{totalSamplesHandled !== 1 ? 's' : ''} handled · across {completedSites.size} site{completedSites.size !== 1 ? 's' : ''}</div>
          </div>
        </div>

        {/* Status breakdown */}
        {shipments.length > 0 && (
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-3">
            <div className="text-xs uppercase tracking-wider text-purple-800 font-bold mb-2">Batch Status Breakdown</div>
            <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
              {statusCounts.batch_assembled > 0 && (
                <span className="bg-amber-100 border border-amber-300 text-amber-900 font-bold px-2 py-1 rounded">
                  {statusCounts.batch_assembled} ready for courier
                </span>
              )}
              {statusCounts.in_transit > 0 && (
                <span className="bg-blue-100 border border-blue-300 text-blue-900 font-bold px-2 py-1 rounded">
                  {statusCounts.in_transit} in transit
                </span>
              )}
              {statusCounts.delivered > 0 && (
                <span className="bg-indigo-100 border border-indigo-300 text-indigo-900 font-bold px-2 py-1 rounded">
                  {statusCounts.delivered} delivered (pending intake)
                </span>
              )}
              {statusCounts.verified > 0 && (
                <span className="bg-green-100 border border-green-300 text-green-900 font-bold px-2 py-1 rounded">
                  {statusCounts.verified} verified & logged
                </span>
              )}
              {statusCounts.exception > 0 && (
                <span className="bg-red-100 border border-red-300 text-red-900 font-bold px-2 py-1 rounded">
                  ⚠ {statusCounts.exception} exception{statusCounts.exception !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Per-site collapsible breakdown */}
        {siteRows.length > 0 && (
          <div className="border-2 border-purple-200 rounded-lg overflow-hidden">
            <button type="button" onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 hover:bg-purple-100 transition text-left">
              <span className="font-bold text-purple-900 text-sm sm:text-base">
                Per-site activity breakdown ({siteRows.length} site{siteRows.length !== 1 ? 's' : ''})
              </span>
              <span className="text-purple-700 text-lg">{expanded ? '▲' : '▼'}</span>
            </button>
            {expanded && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs sm:text-sm bg-white">
                  <thead>
                    <tr className="bg-purple-100 text-purple-900">
                      <th className="p-2 text-left">Site</th>
                      <th className="p-2 text-center">Queued</th>
                      <th className="p-2 text-center">Active</th>
                      <th className="p-2 text-center">Completed</th>
                      <th className="p-2 text-center">Samples Handled</th>
                      <th className="p-2 text-left">Last Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {siteRows.map((r, idx) => (
                      <tr key={r.siteId} className={idx % 2 === 0 ? 'bg-white' : 'bg-purple-50'}>
                        <td className="border border-purple-100 p-2 font-semibold text-purple-900">{r.siteName}</td>
                        <td className="border border-purple-100 p-2 text-center">{r.queued || '—'}</td>
                        <td className="border border-purple-100 p-2 text-center">{r.active || '—'}</td>
                        <td className="border border-purple-100 p-2 text-center font-bold text-green-700">{r.completed || '—'}</td>
                        <td className="border border-purple-100 p-2 text-center">{r.totalSamplesHandled || '—'}</td>
                        <td className="border border-purple-100 p-2 text-gray-600">{formatDT(r.lastActivity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Queue Sample Form (one sample at a time) ─────────────────────────────
// ─── Edit Queued Sample Modal (Tier 1 — fix typos on un-batched samples) ──
const EditQueuedSampleModal = ({ sample, actor, fingerprint, onClose, onSaved }) => {
  const [form, setForm] = useState({
    sample_id:  sample.sample_id  || '',
    client_code: sample.client_code || '',
    description: sample.description || '',
  });
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    const patch = {
      sample_id:   form.sample_id.trim() || null,
      client_code: form.client_code.trim() || null,
      description: form.description.trim() || null,
    };
    const { data, error: err } = await updateQueuedSample(sample.id, patch, {
      currentRow: sample, actor, fingerprint, kind: 'edit',
      reason: reason.trim() || undefined,
    });
    if (err) { setError(err.message || String(err)); setBusy(false); return; }
    onSaved(data);
    onClose();
  };

  const inp = 'w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none';
  const lab = 'block text-sm font-semibold text-purple-900 mb-1';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="font-bold text-lg text-purple-900 mb-1">Edit queued sample</h3>
        <p className="text-xs text-gray-600 mb-4">Changes are logged in this sample's audit history.</p>
        <form onSubmit={save} className="space-y-3">
          <div><label className={lab}>Sample ID <span className="text-gray-500 font-normal">(optional)</span></label>
            <input className={inp} value={form.sample_id}
              onChange={(e) => setForm({ ...form, sample_id: e.target.value })} autoFocus /></div>
          <div><label className={lab}>Client code <span className="text-gray-500 font-normal">(optional)</span></label>
            <input className={inp} value={form.client_code}
              onChange={(e) => setForm({ ...form, client_code: e.target.value })} /></div>
          <div><label className={lab}>Description <span className="text-gray-500 font-normal">(optional)</span></label>
            <input className={inp} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><label className={lab}>Reason for change <span className="text-gray-500 font-normal">(optional)</span></label>
            <input className={inp + ' text-sm'} value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. typo, wrong client code" /></div>

          {sample.edits && sample.edits.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs">
              <div className="font-semibold text-gray-700 mb-1">Previous edits ({sample.edits.length}):</div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {sample.edits.slice(0, 5).map((h, i) => (
                  <div key={i} className="text-gray-600">
                    <span className="text-gray-400">
                      {new Date(h.ts).toLocaleString('en-CA', {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}
                    </span>
                    {' · '}{h.by || 'unknown'} · {h.kind}
                    {h.changes && h.changes.map((c, j) => (
                      <div key={j} className="ml-3 text-gray-500">
                        <code>{c.field}</code>: {JSON.stringify(c.from)} → {JSON.stringify(c.to)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <div className="bg-red-50 border-2 border-red-200 rounded-lg p-2 text-sm text-red-800">{error}</div>}
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={busy}
              className="flex-1 bg-purple-700 hover:bg-purple-800 text-white font-bold px-4 py-2 rounded-lg disabled:opacity-50">
              {busy ? 'Saving…' : 'Save changes'}
            </button>
            <button type="button" onClick={onClose} disabled={busy}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-4 py-2 rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Session Resign Modal — fix a typo in the session signature ──────────
const SessionResignModal = ({ recent, siteQueue, currentSig, fingerprint, onClose, onSaved }) => {
  const [newSig, setNewSig] = useState(currentSig || '');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [includeOlder, setIncludeOlder] = useState(true);

  // Older un-batched samples at this site signed under the current (typo'd) name —
  // excluding rows already represented in `recent` so we don't double-PATCH.
  const recentIds = new Set(recent.map((r) => r.id));
  const matchingOlder = (siteQueue || []).filter(
    (s) => !recentIds.has(s.id) && s.entered_by_name === currentSig
  );

  const targets = includeOlder ? [...recent, ...matchingOlder] : recent;

  const save = async (e) => {
    e.preventDefault();
    const trimmed = newSig.trim();
    if (!trimmed) return setError('Type your corrected legal name.');
    if (trimmed === currentSig) return setError('The new name is the same as the current one.');
    setBusy(true); setError(''); setProgress(0);

    const updated = [];
    for (let i = 0; i < targets.length; i++) {
      const samp = targets[i];
      const { data, error: err } = await updateQueuedSample(samp.id, { entered_by_name: trimmed }, {
        currentRow: samp, actor: trimmed, fingerprint, kind: 'resign',
        reason: reason.trim() || 'session signature correction',
      });
      if (err) {
        setError(`Failed at ${samp.sample_id}: ${err.message || String(err)}`);
        setBusy(false);
        onSaved(updated, trimmed);   // commit what we managed
        return;
      }
      updated.push(data);
      setProgress(i + 1);
    }
    setBusy(false);
    onSaved(updated, trimmed);
    onClose();
  };

  const inp = 'w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none';
  const lab = 'block text-sm font-semibold text-purple-900 mb-1';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 sm:p-6">
        <h3 className="font-bold text-lg text-purple-900 mb-1">Fix your session signature</h3>
        <p className="text-sm text-gray-700 mb-4">
          Updates the name on every sample you've queued in this session
          (<strong>{recent.length}</strong>). Each change is logged in the audit history.
        </p>
        <form onSubmit={save} className="space-y-3">
          <div><label className={lab}>Currently signing as</label>
            <div className="text-sm text-gray-600 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">{currentSig}</div></div>
          <div><label className={lab}>Correct full legal name *</label>
            <input className={inp} value={newSig} onChange={(e) => setNewSig(e.target.value)}
              required autoFocus placeholder="e.g. Geoff Smith" /></div>
          <div><label className={lab}>Reason <span className="text-gray-500 font-normal">(optional)</span></label>
            <input className={inp + ' text-sm'} value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. typo at sign-in" /></div>

          {matchingOlder.length > 0 && (
            <label className="flex items-start gap-2 bg-amber-50 border-2 border-amber-200 rounded-lg p-3 text-sm cursor-pointer">
              <input type="checkbox" className="mt-0.5 w-5 h-5" checked={includeOlder}
                onChange={(e) => setIncludeOlder(e.target.checked)} />
              <span>
                Also update <strong>{matchingOlder.length}</strong> older un-batched sample{matchingOlder.length !== 1 ? 's' : ''} at this site signed as <em>"{currentSig}"</em> from previous sessions.
              </span>
            </label>
          )}

          {busy && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-2 text-sm text-blue-900">
              Updating {progress} of {targets.length}…
            </div>
          )}
          {error && <div className="bg-red-50 border-2 border-red-200 rounded-lg p-2 text-sm text-red-800">{error}</div>}
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={busy || targets.length === 0}
              className="flex-1 bg-purple-700 hover:bg-purple-800 text-white font-bold px-4 py-2 rounded-lg disabled:opacity-50">
              {busy ? 'Updating…' : `Update ${targets.length} sample${targets.length !== 1 ? 's' : ''}`}
            </button>
            <button type="button" onClick={onClose} disabled={busy}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-4 py-2 rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const QueueSampleForm = ({ partnersData, fingerprint, onSaved, onDone }) => {
  // Session-level signature: typed once at session start, carries across every sample.
  // Resets when user clicks Done.
  const [sessionSig, setSessionSig] = useState({
    signature: '',
    affirmed: false,
    locked: false,          // true after user "starts session"
  });

  const [form, setForm] = useState({
    scs_site_id: '', scs_site_name: '',
    sample_id: '', client_code: '', description: '',
  });
  const [error, setError] = useState('');
  const [recent, setRecent] = useState([]);   // samples queued in this session
  const [busy, setBusy] = useState(false);
  const [editingSample, setEditingSample] = useState(null);
  const [showResignModal, setShowResignModal] = useState(false);
  const [siteQueue, setSiteQueue] = useState([]);   // un-batched samples at this site (across sessions)

  // Fetch the un-batched queue for this site whenever the session is locked.
  useEffect(() => {
    if (!sessionSig.locked || !form.scs_site_id) { setSiteQueue([]); return; }
    let cancelled = false;
    listUnbatchedSamples(form.scs_site_id).then(({ data, error }) => {
      if (!cancelled && !error && data) setSiteQueue(data);
    });
    return () => { cancelled = true; };
  }, [sessionSig.locked, form.scs_site_id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setSig = (k, v) => setSessionSig((s) => ({ ...s, [k]: v }));

  const handleSiteChange = (siteId) => {
    const site = partnersData.find((p) => String(p.id) === String(siteId));
    set('scs_site_id', siteId);
    set('scs_site_name', site ? site.nameOrganization : '');
  };

  const startSession = (e) => {
    e.preventDefault();
    setError('');
    if (!form.scs_site_name) return setError('Select your partner site first.');
    if (!sessionSig.signature.trim()) return setError('Type your full legal name to sign.');
    if (!sessionSig.affirmed) return setError('Check the consent box to start signing samples.');
    setSig('locked', true);
  };

  const endSession = () => {
    // Reset everything — user is done
    setSessionSig({ signature: '', affirmed: false, locked: false });
    setForm({ scs_site_id: '', scs_site_name: '', sample_id: '', client_code: '', description: '' });
    setRecent([]);
    onDone();
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!sessionSig.locked) return setError('Start your signed session first.');

    setBusy(true);
    const payload = {
      scs_site_id: form.scs_site_id,
      scs_site_name: form.scs_site_name,
      sample_id: form.sample_id.trim() || null,
      client_code: form.client_code.trim() || null,
      description: form.description.trim() || null,
      entered_by_name: sessionSig.signature.trim(),    // signature IS the name
    };

    const { data, error: insertError } = await insertQueuedSample(payload);
    if (insertError) { setError(insertError.message || String(insertError)); setBusy(false); return; }

    setRecent((r) => [data, ...r].slice(0, 20));
    setForm((f) => ({ ...f, sample_id: '', client_code: '', description: '' }));
    setBusy(false);
    onSaved();
  };

  const inputCls = 'w-full px-3 py-3 sm:py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none text-base sm:text-sm';
  const labelCls = 'block text-sm font-semibold text-purple-900 mb-1';

  // ─── Step 1: Pick site + sign session (if not yet locked) ─────────────
  if (!sessionSig.locked) {
    return (
      <div className="space-y-4">
        <form onSubmit={startSession} className="space-y-5 bg-white p-4 sm:p-6 rounded-xl border-2 border-purple-200 shadow-md">
          <div>
            <h3 className="font-bold text-lg sm:text-xl text-purple-900">Start a Queueing Session</h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              First, pick your site and sign once. Then you can add as many samples as you want without signing again until you're done.
            </p>
          </div>

          <div>
            <label className={labelCls}>Your Drug-Checking Project Partner Site *</label>
            <select className={inputCls} value={form.scs_site_id} onChange={(e) => handleSiteChange(e.target.value)} required>
              <option value="">-- Select your site --</option>
              {partnersData.filter((p) => !p.isLead).map((p) => (
                <option key={p.id} value={p.id}>{p.nameOrganization} ({p.city}, {p.prov})</option>
              ))}
            </select>
          </div>

          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-3 sm:p-4">
            <div className="font-bold text-purple-900 mb-2 text-sm sm:text-base">Sign to start</div>
            <div className="text-xs text-gray-700 mb-3">
              By typing my full legal name and checking the box below, I confirm that every sample I add to the queue in this session is accurate, properly stored, and intended for transport to Western University under the Health Canada §56(1) exemption. This typed signature is legally equivalent to my handwritten signature.
            </div>
            <label className={labelCls}>Type your full legal name *</label>
            <input className={inputCls} value={sessionSig.signature}
              onChange={(e) => setSig('signature', e.target.value)}
              placeholder="e.g. Jane Smith" required autoComplete="name" />
            <label className="flex items-start gap-2 mt-3 text-sm cursor-pointer">
              <input type="checkbox" className="mt-1 w-5 h-5" checked={sessionSig.affirmed}
                onChange={(e) => setSig('affirmed', e.target.checked)} />
              <span>I affirm the statement above. *</span>
            </label>
          </div>

          {error && <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-sm text-red-800">{error}</div>}

          <button type="submit"
            className="w-full sm:w-auto bg-purple-700 hover:bg-purple-800 text-white font-bold px-6 py-3 rounded-lg text-base">
            Sign & Start Queueing Samples →
          </button>
          <button type="button" onClick={onDone}
            className="w-full sm:w-auto sm:ml-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-6 py-3 rounded-lg text-base">
            Cancel
          </button>
        </form>
      </div>
    );
  }

  // ─── Step 2: Session locked — add samples rapidly ─────────────────────
  return (
    <div className="space-y-4">
      <div className="bg-green-50 border-2 border-green-300 rounded-xl p-3 sm:p-4 flex items-start justify-between gap-3 flex-wrap">
        <div className="text-sm">
          <div className="font-bold text-green-900">
            ✓ Signed in as <span className="underline">{sessionSig.signature}</span>
            {(recent.length > 0 || siteQueue.some((s) => s.entered_by_name === sessionSig.signature)) && (
              <span className="ml-2 text-xs font-normal text-green-800 italic">
                (typo?{' '}
                <button type="button" onClick={() => setShowResignModal(true)}
                  className="text-purple-700 hover:text-purple-900 underline font-semibold not-italic">
                  click ✎ Fix my name
                </button>
                )
              </span>
            )}
          </div>
          <div className="text-green-800 text-xs">At {form.scs_site_name} · samples will be logged under this signature</div>
        </div>
        <button onClick={endSession}
          className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-4 py-2 rounded-lg text-sm">
          Done (end session)
        </button>
      </div>

      <form onSubmit={submit} className="space-y-4 bg-white p-4 sm:p-6 rounded-xl border-2 border-purple-200 shadow-md">
        <h3 className="font-bold text-lg sm:text-xl text-purple-900">Add a Sample to the Queue</h3>

        <div className="space-y-3">
          <div>
            <label className={labelCls}>Sample ID <span className="text-gray-500 font-normal">(optional)</span></label>
            <input className={inputCls} value={form.sample_id} onChange={(e) => set('sample_id', e.target.value)}
              placeholder="e.g. SAN-047" autoFocus />
          </div>
          <div>
            <label className={labelCls}>Client code <span className="text-gray-500 font-normal">(optional)</span></label>
            <input className={inputCls} value={form.client_code} onChange={(e) => set('client_code', e.target.value)}
              placeholder="e.g. C-1138" />
          </div>
          <div>
            <label className={labelCls}>Description <span className="text-gray-500 font-normal">(optional)</span></label>
            <input className={inputCls} value={form.description} onChange={(e) => set('description', e.target.value)}
              placeholder="e.g. white powder, tan rocks — leave blank if unknown" />
          </div>
        </div>

        {error && <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-sm text-red-800">{error}</div>}

        <button type="submit" disabled={busy}
          className="w-full sm:w-auto bg-purple-700 hover:bg-purple-800 text-white font-bold px-6 py-3 rounded-lg disabled:opacity-50 text-base">
          {busy ? 'Saving…' : '+ Add to Queue'}
        </button>
      </form>

      {(() => {
        const recentIds = new Set(recent.map((r) => r.id));
        const earlier = siteQueue.filter((s) => !recentIds.has(s.id));
        if (earlier.length === 0) return null;
        return (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3 sm:p-4">
            <div className="font-bold text-amber-900 mb-1 text-sm sm:text-base">
              📋 Earlier in queue at this site ({earlier.length})
            </div>
            <div className="text-xs text-amber-800 mb-2 italic">From previous sessions — still un-batched. Tap ✎ to fix a typo.</div>
            <div className="space-y-1 text-xs sm:text-sm">
              {earlier.map((s) => (
                <div key={s.id} className="flex justify-between items-center bg-white rounded px-2 py-1 gap-2 flex-wrap">
                  <span className="break-all flex-1">
                    <strong>{s.sample_id}</strong> · client {s.client_code}
                    {s.description && <span className="text-gray-500"> · {s.description}</span>}
                    <span className="ml-2 text-xs text-gray-500">by {s.entered_by_name}</span>
                    {s.edits && s.edits.length > 0 && (
                      <span className="ml-2 text-xs text-purple-600 italic"
                        title={`${s.edits.length} edit${s.edits.length !== 1 ? 's' : ''} on this sample`}>
                        ✎ edited
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <span className="text-xs text-gray-500">{formatDT(s.entered_at)}</span>
                    <button type="button" onClick={() => setEditingSample(s)}
                      className="text-purple-700 hover:text-purple-900 font-bold text-base px-2 py-1 rounded hover:bg-purple-50"
                      title="Edit this sample (fix a typo)">
                      ✎
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {recent.length > 0 && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 sm:p-4">
          <div className="font-bold text-green-900 mb-2 text-sm sm:text-base">✓ Just queued this session ({recent.length})</div>
          <div className="space-y-1 text-xs sm:text-sm">
            {recent.map((s) => (
              <div key={s.id} className="flex justify-between items-center bg-white rounded px-2 py-1 gap-2 flex-wrap">
                <span className="break-all flex-1">
                  <strong>{s.sample_id}</strong> · client {s.client_code}
                  {s.description && <span className="text-gray-500"> · {s.description}</span>}
                  {s.edits && s.edits.length > 0 && (
                    <span className="ml-2 text-xs text-purple-600 italic"
                      title={`${s.edits.length} edit${s.edits.length !== 1 ? 's' : ''} on this sample`}>
                      ✎ edited
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="text-xs text-gray-500">{formatDT(s.entered_at)}</span>
                  <button type="button" onClick={() => setEditingSample(s)}
                    className="text-purple-700 hover:text-purple-900 font-bold text-base px-2 py-1 rounded hover:bg-purple-50"
                    title="Edit this sample (fix a typo)">
                    ✎
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {editingSample && (
        <EditQueuedSampleModal
          sample={editingSample}
          actor={sessionSig.signature}
          fingerprint={fingerprint}
          onClose={() => setEditingSample(null)}
          onSaved={(updated) => {
            setRecent((r) => r.map((x) => x.id === updated.id ? updated : x));
            setSiteQueue((q) => q.map((x) => x.id === updated.id ? updated : x));
          }}
        />
      )}
      {showResignModal && (
        <SessionResignModal
          recent={recent}
          siteQueue={siteQueue}
          currentSig={sessionSig.signature}
          fingerprint={fingerprint}
          onClose={() => setShowResignModal(false)}
          onSaved={(updatedList, newSig) => {
            setRecent((r) => r.map((x) => {
              const u = updatedList.find((y) => y.id === x.id);
              return u || x;
            }));
            setSiteQueue((q) => q.map((x) => {
              const u = updatedList.find((y) => y.id === x.id);
              return u || x;
            }));
            setSig('signature', newSig);
          }}
        />
      )}
    </div>
  );
};

// ─── Assemble Batch View (pickup day) ─────────────────────────────────────
const AssembleBatchView = ({ partnersData, queueCounts, activeSiteId, setActiveSiteId, fingerprint, busy, setBusy, onBatchCreated }) => {
  const [queued, setQueued] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [assembler, setAssembler] = useState({
    batch_assembled_signature: '',
    batch_assembled_affirmed: false,
    typed_count: '',
  });

  const setA = (k, v) => setAssembler((a) => ({ ...a, [k]: v }));

  useEffect(() => {
    if (!activeSiteId) { setQueued([]); setSelectedIds(new Set()); return; }
    (async () => {
      setLoading(true);
      const { data, error: e } = await listUnbatchedSamples(activeSiteId);
      if (e) setError(e.message);
      setQueued(data || []);
      setSelectedIds(new Set((data || []).map(s => s.id)));  // default: select all
      setLoading(false);
    })();
  }, [activeSiteId]);

  const toggleAll = () => {
    if (selectedIds.size === queued.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(queued.map(s => s.id)));
  };

  const toggleOne = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const site = partnersData.find((p) => String(p.id) === String(activeSiteId));
  const selectedSamples = queued.filter(s => selectedIds.has(s.id));
  const typedCountNum = parseInt(assembler.typed_count, 10);
  const countMatches = !isNaN(typedCountNum) && typedCountNum === selectedIds.size;

  const submitBatch = async (e) => {
    e.preventDefault();
    setError('');
    if (selectedIds.size === 0) return setError('Select at least one sample to include in this batch.');
    if (!assembler.batch_assembled_signature.trim()) return setError('Type your full legal name as signature.');
    if (!assembler.batch_assembled_affirmed) return setError('You must affirm the batch contents.');
    if (!countMatches) {
      return setError(`Batch count tripwire: you selected ${selectedIds.size} sample(s) but typed ${assembler.typed_count || '(blank)'}. These must match before proceeding.`);
    }

    setBusy(true);
    const now = new Date().toISOString();
    const assemblerName = assembler.batch_assembled_signature.trim();   // signature IS the name

    // 1. Create the shipment (batch) row.
    const { data: batch, error: batchErr } = await insertShipment({
      scs_site_id: String(activeSiteId),
      scs_site_name: site.nameOrganization,
      status: 'batch_assembled',
      batch_assembled_by_name: assemblerName,
      batch_assembled_signature: assemblerName,
      batch_assembled_affirmed: true,
      batch_assembled_at: now,
      batch_sample_count: selectedIds.size,
      packaged_by_name: assemblerName,                                  // legacy field, mirrored
      packaged_at: now,
      removed_from_storage_by_name: assemblerName,
      removed_from_storage_at: now,
      sample_ids: selectedSamples.map(s => s.sample_id),
      sample_descriptions: selectedSamples.map(s => s.description || ''),
      created_by_fingerprint: fingerprint,
    });
    if (batchErr) { setError(batchErr.message || String(batchErr)); setBusy(false); return; }

    // 2. Attach queue samples to this batch.
    const { error: attachErr } = await attachSamplesToBatch([...selectedIds], batch.id);
    if (attachErr) { setError('Batch created but sample linking failed: ' + attachErr.message); setBusy(false); return; }

    // 3. Log the custody event.
    await logCustodyEvent({
      shipment_id: batch.id,
      event_type: 'packaged',
      actor_name: assemblerName,
      actor_role: 'scs_staff',
      actor_signature: assemblerName,
      actor_affirmed: true,
      actor_fingerprint: fingerprint,
      notes: `Batch assembled at ${site.nameOrganization} with ${selectedIds.size} sample(s).`,
    });

    setBusy(false);
    onBatchCreated();
  };

  const inputCls = 'w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm';
  const labelCls = 'block text-sm font-semibold text-purple-900 mb-1';

  // Site picker first
  if (!activeSiteId) {
    const sitesWithQueue = Object.keys(queueCounts).sort((a, b) => queueCounts[b] - queueCounts[a]);
    return (
      <div className="bg-white p-6 rounded-xl border-2 border-purple-200 shadow-md">
        <h3 className="font-bold text-xl text-purple-900 mb-1">Assemble a Batch for Pickup</h3>
        <p className="text-sm text-gray-600 mb-4">Select the site you're assembling a batch for. You'll then pick which queued samples go in this batch.</p>
        {sitesWithQueue.length === 0 ? (
          <div className="text-center py-8 text-gray-600 bg-purple-50 rounded-lg border-2 border-dashed border-purple-200">
            <div className="font-bold text-purple-900">No samples are currently in the queue.</div>
            <div className="text-sm mt-1">Queue some samples first using "+ Queue a Sample".</div>
          </div>
        ) : (
          <div className="space-y-2">
            {sitesWithQueue.map((siteId) => {
              const s = partnersData.find((p) => String(p.id) === String(siteId));
              return (
                <button key={siteId} onClick={() => setActiveSiteId(siteId)}
                  className="w-full flex justify-between items-center bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 rounded-lg px-4 py-3 text-left transition">
                  <div>
                    <div className="font-bold text-amber-900">{s?.nameOrganization || siteId}</div>
                    {s && <div className="text-xs text-amber-800">{s.city}, {s.prov}</div>}
                  </div>
                  <span className="bg-amber-500 text-white font-bold px-3 py-1 rounded-full text-sm">{queueCounts[siteId]} queued</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Site selected — show queue + batch signoff
  return (
    <form onSubmit={submitBatch} className="space-y-5">
      <div className="bg-white p-5 rounded-xl border-2 border-purple-200 shadow-md">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-xl text-purple-900">Assembling batch for:</h3>
            <div className="text-lg text-purple-700">{site?.nameOrganization}</div>
            <div className="text-xs text-gray-500">{site?.city}, {site?.prov}</div>
          </div>
          <button type="button" onClick={() => setActiveSiteId(null)}
            className="text-xs text-purple-700 hover:underline">← Pick different site</button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border-2 border-purple-200 shadow-md">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-bold text-purple-900">Select samples to include in this batch</h4>
          <button type="button" onClick={toggleAll} className="text-xs text-purple-700 hover:underline font-semibold">
            {selectedIds.size === queued.length ? 'Deselect all' : 'Select all'}
          </button>
        </div>
        {loading && <div className="text-center py-4 text-gray-500">Loading queue…</div>}
        {!loading && queued.length === 0 && <div className="text-center py-4 text-gray-500 italic">No queued samples at this site.</div>}
        {!loading && queued.length > 0 && (
          <div className="divide-y border rounded-lg overflow-hidden">
            {queued.map((s) => (
              <label key={s.id} className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${selectedIds.has(s.id) ? 'bg-amber-50' : 'bg-white hover:bg-gray-50'}`}>
                <input type="checkbox" checked={selectedIds.has(s.id)} onChange={() => toggleOne(s.id)} />
                <div className="flex-1 text-sm">
                  <div><strong>{s.sample_id}</strong> · client <strong>{s.client_code}</strong>
                    {s.description && <span className="text-gray-600"> · {s.description}</span>}
                  </div>
                  <div className="text-xs text-gray-500">Queued by {s.entered_by_name} · {formatDT(s.entered_at)}</div>
                </div>
              </label>
            ))}
          </div>
        )}
        <div className="mt-3 text-right text-sm font-bold text-purple-900">
          {selectedIds.size} of {queued.length} selected
        </div>
      </div>

      <div className="bg-amber-50 border-2 border-amber-300 p-5 rounded-xl">
        <h4 className="font-bold text-amber-900 mb-3">Site-Worker Batch Signoff</h4>

        <div>
          <label className={labelCls}>
            Confirm total count * <span className="text-xs text-gray-500 font-normal">(must match selection)</span>
          </label>
          <input type="number" min="0" className={`${inputCls} ${assembler.typed_count && !countMatches ? 'border-red-400 bg-red-50' : ''} ${countMatches && selectedIds.size > 0 ? 'border-green-400 bg-green-50' : ''}`}
            value={assembler.typed_count}
            onChange={(e) => setA('typed_count', e.target.value)}
            placeholder={`Should equal ${selectedIds.size}`} required />
          {assembler.typed_count && !countMatches && (
            <div className="text-xs text-red-700 mt-1">⚠ You typed {assembler.typed_count} but {selectedIds.size} are selected.</div>
          )}
          {countMatches && selectedIds.size > 0 && (
            <div className="text-xs text-green-700 mt-1">✓ Count matches selection.</div>
          )}
        </div>

        <div className="mt-4 bg-white border-2 border-amber-200 rounded-lg p-3">
          <div className="text-xs text-gray-700 mb-2">
            By typing my full legal name and checking the box below, I confirm that the {selectedIds.size} sample(s) selected above
            represent the complete and accurate batch being handed to the courier. This typed signature is legally equivalent to my handwritten signature.
          </div>
          <label className={labelCls}>E-signature (typed full legal name) *</label>
          <input className={inputCls} value={assembler.batch_assembled_signature}
            onChange={(e) => setA('batch_assembled_signature', e.target.value)}
            placeholder="Type full legal name" required />
          <label className="flex items-center gap-2 mt-2 text-sm">
            <input type="checkbox" checked={assembler.batch_assembled_affirmed}
              onChange={(e) => setA('batch_assembled_affirmed', e.target.checked)} />
            <span>I affirm this batch is complete and accurate. *</span>
          </label>
        </div>
      </div>

      {error && <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-sm text-red-800">{error}</div>}

      <button type="submit" disabled={busy || !countMatches || selectedIds.size === 0}
        className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-3 rounded-lg disabled:opacity-50">
        {busy ? 'Creating batch…' : `✓ Create Batch (${selectedIds.size} sample${selectedIds.size !== 1 ? 's' : ''}) — awaiting courier`}
      </button>
    </form>
  );
};

// ─── Batch Detail (view + courier pickup + Western intake) ────────────────
const BatchDetail = ({ shipment, fingerprint, onUpdated, onCompleted }) => {
  const [samples, setSamples] = useState([]);
  const [events, setEvents] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Courier form
  const [courier, setCourier] = useState({
    courier_consent_signature: '', courier_consent_affirmed: false,
  });
  const setC = (k, v) => setCourier((c) => ({ ...c, [k]: v }));

  // Intake form
  const [intake, setIntake] = useState({
    intake_signature: '', intake_affirmed: false,
    intake_matches_paper: true, intake_notes: '',
  });
  const setI = (k, v) => setIntake((it) => ({ ...it, [k]: v }));

  useEffect(() => {
    (async () => {
      const { data: sd } = await listBatchSamples(shipment.id);
      setSamples(sd || []);
      const { data: ed } = await listCustodyEvents(shipment.id);
      setEvents(ed || []);
    })();
  }, [shipment.id]);

  const signCourier = async (e) => {
    e.preventDefault();
    setError('');
    if (!courier.courier_consent_signature.trim()) return setError('Type your full legal name as signature.');
    if (!courier.courier_consent_affirmed) return setError('Tick the affirmation box to accept custody.');

    setBusy(true);
    const now = new Date().toISOString();
    const courierName = courier.courier_consent_signature.trim();   // signature IS the name
    const { error: upErr } = await updateShipment(shipment.id, {
      courier_name: courierName,
      courier_consent_signature: courierName,
      courier_consent_affirmed: true,
      courier_consent_at: now,
      pickup_at: now,
      status: 'in_transit',
      updated_by_fingerprint: fingerprint,
    });
    if (upErr) { setError(upErr.message); setBusy(false); return; }

    await logCustodyEvent({
      shipment_id: shipment.id, event_type: 'picked_up',
      actor_name: courierName, actor_role: 'courier',
      actor_signature: courierName,
      actor_affirmed: true, actor_fingerprint: fingerprint,
      notes: `Courier signed off pickup of ${shipment.batch_sample_count} sample(s).`,
    });
    setBusy(false);
    if (onCompleted) {
      onCompleted(`✓ Pickup signed for ${shipment.scs_site_name} — courier in transit. Western Chemistry lab will sign upon arrival.`);
    } else {
      onUpdated();
    }
  };

  const signIntake = async (e) => {
    e.preventDefault();
    setError('');
    if (!intake.intake_signature.trim()) return setError('Type your full legal name as signature.');
    if (!intake.intake_affirmed) return setError('Tick the affirmation box to confirm receipt.');

    setBusy(true);
    const now = new Date().toISOString();
    const intakeName = intake.intake_signature.trim();   // signature IS the name
    const { error: upErr } = await updateShipment(shipment.id, {
      arrival_at: now,
      intake_by_name: intakeName,
      intake_signature: intakeName,
      intake_affirmed: true,
      intake_matches_paper: intake.intake_matches_paper,
      intake_notes: intake.intake_notes.trim(),
      intake_at: now,
      status: intake.intake_matches_paper ? 'verified' : 'exception',
      updated_by_fingerprint: fingerprint,
    });
    if (upErr) { setError(upErr.message); setBusy(false); return; }

    await logCustodyEvent({
      shipment_id: shipment.id,
      event_type: intake.intake_matches_paper ? 'verified' : 'exception_raised',
      actor_name: intakeName, actor_role: 'western_intake',
      actor_signature: intakeName,
      actor_affirmed: true, actor_fingerprint: fingerprint,
      notes: intake.intake_notes || (intake.intake_matches_paper
        ? `Batch of ${shipment.batch_sample_count} sample(s) received & verified.`
        : 'Discrepancy noted on intake.'),
    });
    setBusy(false);
    if (onCompleted) {
      const msg = intake.intake_matches_paper
        ? `✓ Intake recorded — batch from ${shipment.scs_site_name} verified and logged.`
        : `⚠ Intake recorded with discrepancy — batch from ${shipment.scs_site_name} flagged as exception.`;
      onCompleted(msg);
    } else {
      onUpdated();
    }
  };

  const printChainOfCustody = () => {
    const sampleRows = samples.length > 0
      ? samples.map(s => `<tr><td>${s.sample_id || '—'}</td><td>${s.client_code || '—'}</td><td>${s.description || '—'}</td><td>${s.entered_by_name}</td><td>${formatDT(s.entered_at)}</td></tr>`).join('')
      : (shipment.sample_ids || []).map((id, i) => `<tr><td>${id}</td><td>—</td><td>${(shipment.sample_descriptions || [])[i] || '—'}</td><td>—</td><td>—</td></tr>`).join('');

    const html = `<!DOCTYPE html><html><head><title>Chain of Custody — ${shipment.scs_site_name}</title>
<style>body{font-family:Arial,sans-serif;font-size:11px;max-width:800px;margin:20px auto;padding:20px}
h1{color:#5b21b6;font-size:18px;margin-bottom:5px}h2{font-size:12px;color:#666;margin-top:0}
table{width:100%;border-collapse:collapse;margin-top:8px}th,td{border:1px solid #ddd;padding:5px;text-align:left;font-size:10px}
th{background:#5b21b6;color:#fff}.sig{border:1px solid #333;padding:10px;margin-top:6px;min-height:36px;font-family:cursive;font-size:14px}
.section{margin-top:14px;padding:10px;border:2px solid #e9d5ff;border-radius:4px}
@media print{body{margin:10px}}</style></head><body>
<h1>Western University Drug-Checking Network</h1>
<h2>Sample Chain of Custody Record — Health Canada §56(1) Transport Log</h2>
<div class="section">
<strong>Batch ID:</strong> ${shipment.id}<br/>
<strong>Batch created:</strong> ${formatDT(shipment.created_at)}<br/>
<strong>Originating Site:</strong> ${shipment.scs_site_name}<br/>
<strong>Status:</strong> ${STATUS_META[shipment.status]?.label || shipment.status}<br/>
<strong>Sample count:</strong> ${shipment.batch_sample_count ?? samples.length}
</div>
<div class="section"><strong>Samples in batch:</strong>
<table><thead><tr><th>Sample ID</th><th>Client code</th><th>Description</th><th>Queued by</th><th>Queued at</th></tr></thead>
<tbody>${sampleRows}</tbody></table></div>
<div class="section"><strong>Site-worker batch assembly:</strong><br/>
${shipment.batch_assembled_by_name || '—'} at ${formatDT(shipment.batch_assembled_at)}<br/>
<strong>Signature:</strong><div class="sig">${shipment.batch_assembled_signature || '—'}</div></div>
<div class="section"><strong>Courier pickup:</strong> ${shipment.courier_name || '(pending)'}<br/>
<strong>Pickup time:</strong> ${formatDT(shipment.pickup_at)}<br/>
<strong>Signature:</strong><div class="sig">${shipment.courier_consent_signature || '—'}</div></div>
${shipment.arrival_at ? `<div class="section"><strong>Arrival at Western:</strong> ${formatDT(shipment.arrival_at)}<br/>
<strong>Intake staff:</strong> ${shipment.intake_by_name || '—'}<br/>
<strong>Signature:</strong><div class="sig">${shipment.intake_signature || '—'}</div>
<em>Cross-check passed:</em> ${shipment.intake_matches_paper ? 'YES' : 'NO — EXCEPTION'}
${shipment.intake_notes ? `<br/><em>Notes:</em> ${shipment.intake_notes}` : ''}</div>` : '<div class="section"><em>Not yet received at Western.</em></div>'}
<div style="margin-top:24px;font-size:9px;color:#666;border-top:1px solid #ccc;padding-top:8px">
Generated ${new Date().toLocaleString('en-CA')} · Western University Drug-Checking Project · Retained per HC §56(1) record-keeping requirements.
</div></body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html); w.document.close();
    setTimeout(() => w.print(), 250);
  };

  const meta = STATUS_META[shipment.status] || STATUS_META.batch_assembled;
  const awaitingCourier = shipment.status === 'batch_assembled';
  const awaitingIntake = shipment.status === 'in_transit' || shipment.status === 'delivered';
  const inputCls = 'w-full px-3 py-2 border-2 rounded-lg focus:outline-none text-sm';
  const displaySamples = samples.length > 0 ? samples : (shipment.sample_ids || []).map((id, i) => ({
    id: `legacy-${i}`, sample_id: id, client_code: '—',
    description: (shipment.sample_descriptions || [])[i] || '',
    entered_by_name: '—', entered_at: null,
  }));

  return (
    <div className="space-y-4">
      <div className="bg-white p-5 rounded-xl border-2 border-purple-200 shadow-md">
        <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
          <div>
            <div className="text-xs text-purple-600 font-bold uppercase tracking-wider">Batch detail</div>
            <div className="font-bold text-xl text-purple-900">{shipment.scs_site_name}</div>
            <div className="text-xs text-gray-500 font-mono">{shipment.id}</div>
          </div>
          <div className="flex gap-2 items-start">
            <span className={`px-3 py-1 border rounded text-xs font-bold ${meta.color}`}>{meta.label}</span>
            <button onClick={printChainOfCustody} className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-3 py-1 rounded flex items-center gap-1">
              <Printer size={14} />Print chain-of-custody
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-semibold text-purple-900 mb-1">Samples ({shipment.batch_sample_count ?? displaySamples.length})</div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {displaySamples.map((s) => (
                <div key={s.id} className="bg-purple-50 rounded px-2 py-1 text-xs">
                  <strong>{s.sample_id}</strong> · client <strong>{s.client_code}</strong>
                  {s.description && <span className="text-gray-600"> · {s.description}</span>}
                  {s.entered_by_name !== '—' && <div className="text-gray-500">Queued by {s.entered_by_name} · {formatDT(s.entered_at)}</div>}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-1 text-gray-700 text-sm">
            <div><strong>Batch assembled by:</strong> {shipment.batch_assembled_by_name || '—'} <span className="text-gray-500">{shipment.batch_assembled_at ? `at ${formatDT(shipment.batch_assembled_at)}` : ''}</span></div>
            <div><strong>Courier:</strong> {shipment.courier_name || '(pending)'}</div>
            <div><strong>Pickup:</strong> {formatDT(shipment.pickup_at)}</div>
            {shipment.arrival_at && <div><strong>Arrival at Western:</strong> {formatDT(shipment.arrival_at)}</div>}
            {shipment.intake_by_name && <div><strong>Intake:</strong> {shipment.intake_by_name}</div>}
            {shipment.intake_notes && <div><strong>Intake notes:</strong> {shipment.intake_notes}</div>}
          </div>
        </div>
      </div>

      {/* Courier pickup signoff */}
      {awaitingCourier && (
        <form onSubmit={signCourier} className="bg-blue-50 border-2 border-blue-300 p-5 rounded-xl">
          <h3 className="font-bold text-lg text-blue-900 mb-3">Courier Pickup Signoff</h3>
          <p className="text-xs text-blue-800 mb-3">
            One signoff for the whole batch of {shipment.batch_sample_count} sample(s). Pickup time will be auto-stamped.
          </p>
          <div className="mt-4 bg-white border-2 border-blue-200 rounded-lg p-3">
            <div className="text-xs text-gray-700 mb-2">
              By typing my full legal name and checking below, I confirm I am taking custody of
              the {shipment.batch_sample_count} sample(s) in this batch for transport to Western University
              under the §56(1) exemption. Typed signature is legally equivalent to handwritten.
            </div>
            <label className="block text-sm font-semibold text-blue-900 mb-1">E-signature (typed full legal name) *</label>
            <input className={`${inputCls} border-blue-200 focus:border-blue-500`}
              value={courier.courier_consent_signature} onChange={(e) => setC('courier_consent_signature', e.target.value)}
              placeholder="Type full legal name" required />
            <label className="flex items-center gap-2 mt-2 text-sm">
              <input type="checkbox" checked={courier.courier_consent_affirmed}
                onChange={(e) => setC('courier_consent_affirmed', e.target.checked)} />
              <span>I accept custody of this batch. *</span>
            </label>
          </div>
          {error && <div className="mt-3 bg-red-50 border-2 border-red-200 rounded-lg p-3 text-sm text-red-800">{error}</div>}
          <button type="submit" disabled={busy} className="mt-4 bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-2 rounded-lg disabled:opacity-50">
            {busy ? 'Saving…' : '✓ Sign pickup & mark in-transit'}
          </button>
        </form>
      )}

      {/* Western intake signoff (single batch-level signoff) */}
      {awaitingIntake && (
        <form onSubmit={signIntake} className="bg-indigo-50 border-2 border-indigo-300 p-5 rounded-xl">
          <h3 className="font-bold text-lg text-indigo-900 mb-3">Western Intake Signoff — Entire Batch</h3>
          <p className="text-xs text-indigo-800 mb-3">
            One signoff for the whole batch of {shipment.batch_sample_count} sample(s). Arrival time will be auto-stamped.
          </p>
          <label className="flex items-center gap-2 mt-3 text-sm text-indigo-900">
            <input type="checkbox" checked={intake.intake_matches_paper}
              onChange={(e) => setI('intake_matches_paper', e.target.checked)} />
            <span>Physical samples received match the batch manifest (cross-check pass)</span>
          </label>
          {!intake.intake_matches_paper && (
            <div className="mt-3">
              <label className="block text-sm font-semibold text-red-900 mb-1">⚠ Discrepancy notes *</label>
              <textarea className="w-full px-3 py-2 border-2 border-red-300 rounded-lg text-sm" rows={3}
                value={intake.intake_notes} onChange={(e) => setI('intake_notes', e.target.value)} />
            </div>
          )}
          <div className="mt-4 bg-white border-2 border-indigo-200 rounded-lg p-3">
            <label className="block text-sm font-semibold text-indigo-900 mb-1">Intake e-signature (typed full legal name) *</label>
            <input className={`${inputCls} border-indigo-200 focus:border-indigo-500`}
              value={intake.intake_signature} onChange={(e) => setI('intake_signature', e.target.value)} required />
            <label className="flex items-center gap-2 mt-2 text-sm">
              <input type="checkbox" checked={intake.intake_affirmed}
                onChange={(e) => setI('intake_affirmed', e.target.checked)} />
              <span>I affirm receipt of this entire batch and have performed the cross-check. *</span>
            </label>
          </div>
          {error && <div className="mt-3 bg-red-50 border-2 border-red-200 rounded-lg p-3 text-sm text-red-800">{error}</div>}
          <button type="submit" disabled={busy} className="mt-4 bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-6 py-2 rounded-lg disabled:opacity-50">
            {busy ? 'Saving…' : '✓ Record intake & verify entire batch'}
          </button>
        </form>
      )}

      {/* Custody event audit log */}
      <div className="bg-white p-5 rounded-xl border-2 border-purple-200 shadow-md">
        <h3 className="font-bold text-purple-900 mb-3">Chain-of-custody audit log ({events.length} event{events.length !== 1 ? 's' : ''})</h3>
        {events.length === 0 && <div className="text-sm text-gray-500">No events recorded yet.</div>}
        {events.length > 0 && (
          <div className="space-y-2">
            {events.map((ev) => (
              <div key={ev.id} className="flex gap-3 text-xs border-l-4 border-purple-300 pl-3 py-1">
                <div className="font-mono text-gray-500 whitespace-nowrap">{formatDT(ev.occurred_at)}</div>
                <div className="font-bold text-purple-900 uppercase">{ev.event_type.replace(/_/g, ' ')}</div>
                <div className="text-gray-700">by {ev.actor_name} ({ev.actor_role.replace(/_/g, ' ')})</div>
                {ev.notes && <div className="text-gray-500 italic">· {ev.notes}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


const ProjectPartnerDashboard = () => {
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  // On page load, clear any stale hash and scroll to top so we never land
  // mid-page. The custody section is reachable via the banner/FAB/TOC.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      window.scrollTo(0, 0);
    }
  }, []);

  const todayFormatted = new Date().toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' });
  const stats = networkStats();
  const custodyPartners = ACTIVE_PARTNERS;   // sites with a device on site today

  return (
    <div className="min-h-screen bg-white" id="top">
      <SkipLink />
      <BackToTop />
      {showAnnouncement && <AnnouncementBanner config={ANNOUNCEMENT_CONFIG} onDismiss={() => setShowAnnouncement(false)} />}
      <header className="bg-white shadow-lg">
        <div className="px-4 sm:px-8 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
            <img src="/western-logo.png" alt="Western University" className="h-32 sm:h-44 lg:h-56 w-auto self-start md:self-center" />
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight">A Novel Concurrent Two Phase<br />Drug-Checking Initiative</h1>
              <div className="border-b-2 border-gray-300 my-2"></div>
              <p className="text-base sm:text-lg md:text-xl text-black font-medium">Contribution Agreement Funding Provided by Health Canada's Substance Use and Addictions Program (SUAP)</p>
              <p className="text-base mt-1">In partnership with <a href="https://scatr.ca/" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:text-blue-800 hover:underline">Scatr Inc.</a></p>
              <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {[
                  [stats.signedPartners, 'Partner organizations'],
                  [stats.deployedDevices, 'Spectrometers deployed'],
                  [stats.provinces.length, 'Provinces'],
                  [METRICS.totals.pocAllTime.toLocaleString(), 'Point-of-care scans'],
                ].map(([v, l]) => (
                  <div key={l} className="bg-purple-50 border border-purple-200 rounded-xl px-3 py-2"><dt className="text-xs text-purple-700 font-semibold uppercase tracking-wide order-2">{l}</dt><dd className="text-2xl font-black text-purple-900">{v}</dd></div>
                ))}
              </dl>
            </div>
          </div>
        </div>
        <div className="h-24 bg-purple-800"></div>
      </header>
      <main id="main">
      <ProjectCountdown />
      <div className="px-6 pt-6">
        <section aria-labelledby="overview-h" className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl shadow-lg border-2 border-purple-200">
          <h2 id="overview-h" className="text-3xl font-bold text-purple-900 mb-6">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border-2 border-purple-300 shadow-md text-center"><h3 className="font-bold text-2xl text-purple-900 mb-3">Phase #1</h3><p className="text-gray-800 font-semibold mb-2">Creating a Drug Checking Network Using Machine Learning Enabled Spectrometers</p><p className="text-sm text-gray-600">Contribution Agreement_Arrangement # 2223-HQ-000095</p></div>
            <div className="bg-white p-5 rounded-xl border-2 border-purple-300 shadow-md text-center"><h3 className="font-bold text-2xl text-purple-900 mb-3">Phase #2</h3><p className="text-gray-800 font-semibold mb-2">Leading the Way: PWLLE at the Forefront of Drug-Checking Initiatives</p><p className="text-sm text-gray-600">Amendment of Contribution Agreement_Arrangement # 2425-HQ-000058</p></div>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-md">
              <caption className="sr-only">Health Canada SUAP funding record for the project</caption>
              <thead><tr className="bg-purple-100"><th scope="col" className="border border-gray-200 px-4 py-3 text-left text-sm font-bold text-purple-900">Organization</th><th scope="col" className="border border-gray-200 px-4 py-3 text-left text-sm font-bold text-purple-900">Project Name</th><th scope="col" className="border border-gray-200 px-4 py-3 text-left text-sm font-bold text-purple-900">Description</th><th scope="col" className="border border-gray-200 px-4 py-3 text-left text-sm font-bold text-purple-900">Substances</th><th scope="col" className="border border-gray-200 px-4 py-3 text-left text-sm font-bold text-purple-900">Location</th><th scope="col" className="border border-gray-200 px-4 py-3 text-left text-sm font-bold text-purple-900">Funding</th></tr></thead>
              <tbody><tr className="hover:bg-purple-50"><td className="border border-gray-200 px-4 py-3 text-sm text-gray-800 align-top">University of Western Ontario</td><td className="border border-gray-200 px-4 py-3 text-sm text-gray-800 align-top">Leading the Way: People with Lived and Living Experience at the Forefront of Drug-Checking Initiative</td><td className="border border-gray-200 px-4 py-3 text-sm text-gray-700 align-top">This initiative will integrate People with Lived and Living Experience (PWLLE) into drug-checking initiatives by training them in drug-checking technologies to enable them to implement drug-checking initiatives and training programs in participating harm reduction and public health centres in Alberta, Ontario, Manitoba and Nova Scotia.</td><td className="border border-gray-200 px-4 py-3 text-sm text-gray-800 align-top">Multiple substances</td><td className="border border-gray-200 px-4 py-3 text-sm text-gray-800 align-top">London, Ontario</td><td className="border border-gray-200 px-4 py-3 text-sm text-gray-800 align-top font-medium">$4,473,473</td></tr></tbody>
            </table>
            <p className="text-xs text-gray-500 mt-2 text-right">Source: <a href="https://www.canada.ca/en/health-canada/services/substance-use/canadian-drugs-substances-strategy/funding/substance-use-addictions-program/active-projects.html" target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:underline">Health Canada SUAP Active Projects</a> (Phase 2 as amended, Amending Agreement #1)</p>
          </div>
          <div className="mt-6">
            <p className="text-gray-800 leading-relaxed">As of <strong>{todayFormatted}</strong>, Phase #2 <em>"Leading the Way: PWLLE at the Forefront of Drug-Checking Initiatives"</em>, funded through Health Canada's Substance Use and Addictions Program (<a href="https://www.canada.ca/en/health-canada/services/substance-use/canadian-drugs-substances-strategy/funding/substance-use-addictions-program.html" target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:text-purple-900 underline">SUAP</a>), has <strong>{stats.signedPartners} partner organizations</strong> under signed agreements in <strong>{stats.provinces.length} provinces</strong>, with <strong>{stats.deployedDevices} spectrometers</strong> deployed at {stats.activeSites - 1} partner sites plus Western's laboratory{stats.plannedSites > 0 && <> and {stats.plannedSites} more allocated for installation in December 2026</>}{stats.onboarding > 0 && <>; {stats.onboarding} further organization{stats.onboarding === 1 ? ' is' : 's are'} completing onboarding</>}.</p>
            <p className="text-gray-800 leading-relaxed mt-4">The project plan is a network of <strong>{stats.plannedDevicesTotal} spectrometers</strong> by project completion on March 31, 2028. {stats.allocatedDevices} of the {stats.plannedDevicesTotal} are allocated today.</p>
            <p className="text-gray-800 leading-relaxed mt-4">For those of you undergoing any sort of Exemption 56 related application, renewal, transfer or likewise process, please let Cameron know if he can be of any ongoing assistance at any time.</p>
            <div className="mt-4 bg-yellow-50 border-4 border-yellow-400 rounded-xl p-4" role="note">
              <p className="text-yellow-900 font-black text-lg leading-snug"><AlertTriangle size={22} className="inline-block mr-2 -mt-1" aria-hidden="true" />Please send Cameron copies of all Exemption-related approval documents, notices, or likewise as soon as possible, subsequent to receipt. Thank you kindly.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="bg-white p-4 rounded-xl border border-purple-200">
              <div className="font-bold text-purple-900 mb-2">Principal Investigator (PI):</div>
              <div className="text-gray-800 font-medium">Professor Francois Lagugne-Labarthet</div>
              <div className="text-gray-600">Faculty of Science, Western University · London, ON</div>
              <div className="flex items-center gap-2 mt-2 text-purple-700"><Phone size={14} aria-hidden="true" /><span>519-661-2111 x81006</span></div>
              <div className="flex items-center gap-2 text-purple-700"><Mail size={14} aria-hidden="true" /><a href="mailto:flagugne@uwo.ca" className="hover:underline">flagugne@uwo.ca</a></div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-purple-200">
              <div className="font-bold text-purple-900 mb-2">Project Manager:</div>
              <div className="text-gray-800 font-medium">Cameron Brown</div>
              <div className="text-gray-600">Faculty of Science, Western University · London, ON</div>
              <div className="flex items-center gap-2 mt-2 text-purple-700"><Phone size={14} aria-hidden="true" /><span>226-238-9970</span></div>
              <div className="flex items-center gap-2 text-purple-700"><Mail size={14} aria-hidden="true" /><a href="mailto:cbrown58@uwo.ca" className="hover:underline">cbrown58@uwo.ca</a></div>
            </div>
          </div>
        </section>
      </div>
      <div className="h-24 bg-purple-800 mt-6"></div>
      <div className="text-center py-6 bg-white"><h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-purple-900 tracking-tight">Interactive Project Partner Dashboard</h2></div>

      {/* Prominent site-worker entry banner — links to the custody section */}
      <div className="px-4 sm:px-6 pb-4">
        <button type="button"
           onClick={() => {
             const el = document.getElementById('chain-of-custody');
             if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
           }}
           className="w-full text-left block bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:via-amber-600 hover:to-orange-600 text-white rounded-2xl shadow-xl border-4 border-amber-300 p-4 sm:p-6 transition transform hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-500">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-4xl sm:text-5xl" aria-hidden="true">📦</div>
              <div>
                <div className="font-black text-xl sm:text-2xl tracking-tight">Site Workers — Click Here</div>
                <div className="text-sm sm:text-base font-semibold text-amber-50">Submit your samples for courier pickup</div>
              </div>
            </div>
            <div className="bg-white/25 hover:bg-white/35 px-4 py-2 rounded-lg font-bold text-sm sm:text-base whitespace-nowrap">
              Go →
            </div>
          </div>
        </button>
      </div>
      <div className="px-6 pb-4">
        <div className="bg-gradient-to-br from-purple-100 to-white p-6 rounded-2xl shadow-lg border-2 border-purple-200">
          <p className="text-gray-800 leading-relaxed">Welcome to the Project Partner Dashboard — a centralized platform designed to provide all project partners with comprehensive visibility into the project's network and infrastructure.</p>
          <TableOfContents />
        </div>
      </div>
      <div className="p-6 space-y-6">
        <PdfCard id="onboarding" title="Informational Onboarding Document" url="https://partners.uwo-drugchecking.ca/Informational-Onboarding-Document.pdf" printable summary="Prospective-partner onboarding document (Apr 2026): how the network works, what a site receives, and the steps from agreement to first scan." />
        <PicturingTheProblem />
        <ProjectTimeline />
        <NewsFeed />
        <NetworkSummary />
        <ProjectPublications />
        <PdfCard id="scatr-research" title="Scatr Technical Research Strategy" url="https://partners.uwo-drugchecking.ca/Scatr-Technical-Research-Strategy.pdf" summary="Scatr Inc.'s technical research strategy for the Series One platform." />
        <DocumentsSection />
        <MapSection />
        <ContactsSection />
        <PwlleTrainingSessions />
        <SampleChainOfCustody partnersData={custodyPartners} />
        <RelatedLinks />
        <footer className="pt-4 border-t border-purple-100">
          <DataStamp metrics={METRICS} partners={partnersMeta} />
          <p className="text-xs text-gray-500 mt-1">Corrections: Cameron Brown, Project Manager · <a href="mailto:cbrown58@uwo.ca?subject=Partner%20Dashboard%20correction" className="underline">cbrown58@uwo.ca</a></p>
        </footer>
      </div>
      </main>

      {/* Floating action button — always visible shortcut to sample submission */}
      <button type="button"
         aria-label="Submit Samples for Courier Pickup"
         onClick={() => {
           const el = document.getElementById('chain-of-custody');
           if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
         }}
         className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-4 py-3 sm:px-5 sm:py-4 rounded-full shadow-2xl border-2 border-amber-300 transition transform hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-500">
        <span className="text-xl" aria-hidden="true">📦</span>
        <span className="hidden sm:inline text-sm">Submit Samples</span>
        <span className="inline sm:hidden text-sm">Samples</span>
      </button>
    </div>
  );
};

export default ProjectPartnerDashboard;
