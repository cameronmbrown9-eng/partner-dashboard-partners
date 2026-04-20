import React, { useState, useEffect } from 'react';
import {
  supabase,
  hasSupabaseConfig,
  listShipments,
  insertShipment,
  updateShipment,
  logCustodyEvent,
  listCustodyEvents,
} from './supabaseClient';
import { MapPin, List, Users, ChevronDown, ChevronUp, Clock, Trophy, ExternalLink, RotateCcw, Presentation, Maximize2, Minimize2, Check, CheckCircle, FileText, Mail, Phone, BookOpen, Download, MessageSquare, ArrowUp, AlertTriangle, Printer, HelpCircle, Newspaper, GraduationCap, X, Activity, Building2, Smartphone, TrendingUp, Globe, Target, Zap, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Discourse Forum Configuration - UPDATE THESE VALUES AFTER SETUP
const DISCOURSE_CONFIG = {
  forumUrl: 'https://forum.uwo-drugchecking.ca',
  embedUrl: 'https://forum.uwo-drugchecking.ca/embed/comments',
  isConfigured: false
};

// Announcement Banner Configuration - UPDATE MESSAGE AS NEEDED
const ANNOUNCEMENT_CONFIG = {
  isActive: false,
  type: 'info',
  message: 'Welcome to the new Project Partner Dashboard! Explore the features and reach out if you have any questions.',
  link: null,
};

// News/Updates Feed Data - ADD NEW ITEMS AT THE TOP
const NEWS_UPDATES = [
  { date: '2026-03-17', title: '⚠️ Important Update: Ontario CTS Site Funding Announcement', description: 'On March 13, 2026, the Ontario Ministry of Health notified seven provincially-funded Consumption and Treatment Services (CTS) sites that provincial funding will terminate effective June 13, 2026. This announcement may affect certain Ontario project partner sites. Importantly, drug checking services are authorized under CDSA Section 56(1) — a separate federal pathway from supervised consumption. The Western University project team has prepared a detailed information document for affected partners outlining the regulatory landscape, your exemption status, and available options for continuing drug-checking services. Please contact Cameron directly with any questions.', link: { text: 'Download the Partner Information Document →', url: '/SCS-Closure-Information-Mar2026.pdf' } },
  { date: '2026-03-12', title: '🚨 London Mass Overdose Event — Scatr Drug-Checking Plays Key Public Role', description: 'On March 11–12, 2026, London experienced a mass overdose emergency after a suspect drove through the downtown core distributing a toxic substance. Emergency services responded to 39 overdose-related calls in 24 hours and London hospitals activated a Code Orange Alert. Scatr drug-checking services at Carepoint (RHAC) played a direct public health role during the crisis. Lily Bialas, RHAC\'s Interim Director of Harm Reduction, was cited in CBC and CTV coverage highlighting the importance of on-site drug checking for providing timely, accurate information about drug supply trends — exactly what this network was built to do.', link: { text: 'CBC Coverage →', url: 'https://www.cbc.ca/news/canada/london/39-overdoses-free-drugs-london-ontario-9.7126514' } },
  { date: '2026-03-18', title: '📄 DCP Training Invoice Package Now Available', description: 'The Drug-Checking Peer (DCP) Training & Certification Invoice Submission Package is now available for download. East Coast and other upcoming training sites: please complete and return your invoice to Cameron at cbrown58@uwo.ca as soon as possible so that your $3,000 CAD stipend can be processed before month end. If your organization already has its own invoice format, feel free to use that — the package is provided as a guide for sites that need one.', link: { text: 'Download Invoice Package →', url: '/DCP-Invoice-Template.docx' } },
  { date: '2026-03-18', title: '⚠️ Ontario CTS Funding Cuts — Drug-Checking Services Context', description: 'On March 13, 2026, the Ontario Ministry of Health notified seven provincially-funded Consumption and Treatment Services (CTS) sites that provincial funding will terminate effective June 13, 2026. Five of our Ontario partner sites may be affected. Critically, the Province confirmed in court proceedings that drug-checking services are NOT captured by the CCRA — they are authorized under a separate federal CDSA Section 56(1) pathway and may be able to continue independently of supervised consumption services. Please read the full information document and contact Cameron directly with any questions.', link: { text: 'Read the Full Information Document →', url: '/SCS-Closure-Information-Mar2026.pdf' } },
  { date: '2026-02-08', title: '🎉 Paper Published in Harm Reduction Journal!', description: 'Our peer-reviewed manuscript has been published as open access in Harm Reduction Journal (Springer Nature). The paper — "Street drug monitoring with networked spectrometers powered by machine learning: a pilot study in Ontario, Canada" — reports on 7,752 samples analyzed across 10 Ontario sites over 14 months, comparing Raman spectroscopy against HPLC-MS and documenting participant consumption-related behavior changes. Congratulations to all co-authors and partner sites whose participation made this research possible!', link: { text: 'Read the Full Paper (Open Access) →', url: 'https://link.springer.com/article/10.1186/s12954-026-01403-3' } },
  { date: '2025-12-13', title: 'New Resource: Standard Operating Procedures for Sample Preparation', description: 'We have published the official Standard Operating Procedures (SOP) for Sample Preparation document. This resource outlines the proper protocols for packaging and labelling samples for transport to the Western Laboratory. All partner sites are reminded to review and adhere to these SOPs to ensure sample integrity, regulatory compliance, and accurate analysis results.', link: { text: 'View the SOP Document', url: '/SOP-Sample-Preparation.pdf' } },
  { date: '2025-12-12', title: 'Reminder: Sample Submission Accountability', description: 'Health Canada requires every sample to be accounted for. Please only use the sample submission feature in the Scatr portal when there is a real sample to submit. Accurate record-keeping is essential for regulatory compliance and the integrity of our network data.' },
  { date: '2025-12-12', title: 'Health Canada Releases Updated National Opioid & Stimulant Harms Data', description: 'The Public Health Agency of Canada has published updated national surveillance data showing a 17% decrease in opioid toxicity deaths in 2024 compared to 2023. Key findings: deaths dropped from 8,623 (2023) to 7,146 (2024), averaging 20 deaths per day (down from 22). Hospitalizations also fell 15%, alongside similar decreases in EMS responses and ED visits. BC, Alberta, Saskatchewan, Ontario, New Brunswick, and Yukon all reported decreases, with some jurisdictions attributing the decline partly to lower fentanyl concentrations in the drug supply.', link: { text: 'View the Full Report', url: 'https://health-infobase.canada.ca/substance-related-harms/opioids-stimulants/' } },
  { date: '2025-12-12', title: 'Share Your Story: PWLLE Voices Needed', description: 'At the heart of this project is a simple belief: the best improvements to drug-checking services come directly from the people who use them. We want to hear from People with Lived or Living Experience (PWLLEs) who are willing to share their stories and perspectives. Your insights help shape how these services evolve. Interested in having a conversation? Contact Cameron at cbrown58@uwo.ca — no pressure, just a chance to be heard.' },
  { date: '2025-12-12', title: 'Exemption 56 Document Reminder', description: 'Please don\'t forget to send Cameron your site\'s updated Exemption 56 Approval Document(s) as soon as possible subsequent to their receipt.' },
  { date: '2025-12-11', title: 'Project Partner Dashboard Launched', description: 'The new interactive dashboard is now live, providing partners with centralized access to project information, documents, and contact details.' },
  { date: '2025-12-01', title: '22 Partner Sites Now Active', description: 'We have successfully onboarded 22 partner sites across 7 provinces, 20 cities, with 24 spectrometers deployed.' },
  { date: '2025-11-15', title: 'Drug-Checking Peer Training Program Begins', description: 'Virtual training sessions are now being scheduled for partner sites. Contact the Project Manager to arrange training for your team.' },
  { date: '2025-09-15', title: 'Manuscript Submitted to Harm Reduction Journal', description: 'Our peer-reviewed paper on street drug monitoring using Raman spectroscopy was submitted for review — now published February 8, 2026! See the News & Updates section above for the link.' },
];

const FAQ_DATA = [
  { question: 'How do I update my site\'s contact information on the dashboard?', answer: 'Contact the Project Manager with your updated information and we will update the dashboard accordingly.' },
  { question: 'Can I share this dashboard with others at my organization?', answer: 'Yes, you may share access with colleagues directly involved in the drug-checking program at your site. However, please do not share access with individuals outside of the project network.' },
  { question: 'What is the difference between Mobile and Non-Mobile exemptions?', answer: 'A Non-Mobile exemption allows drug-checking at a fixed location only. A Mobile exemption allows you to conduct drug-checking at various locations within your approved geographic area, such as outreach services or pop-up sites.' },
];

const TRAINING_STATUS = {
  1: { completed: true, date: '2025-06-15' },
  2: { completed: true, date: '2025-07-20' },
  3: { completed: true, date: '2025-08-10' },
  4: { completed: false, date: null },
  5: { completed: true, date: '2025-09-05' },
  6: { completed: false, date: null },
  7: { completed: true, date: '2025-08-25' },
  8: { completed: true, date: '2025-09-12' },
  9: { completed: false, date: null },
  10: { completed: true, date: '2025-10-01' },
  11: { completed: false, date: null },
  12: { completed: true, date: '2025-10-15' },
  13: { completed: false, date: null },
  14: { completed: false, date: null },
  15: { completed: false, date: null },
  16: { completed: true, date: '2025-11-01' },
  17: { completed: false, date: null },
  18: { completed: false, date: null },
  19: { completed: true, date: '2025-11-10' },
  20: { completed: false, date: null },
  21: { completed: false, date: null },
  22: { completed: false, date: null },
};

// PWLLE Drug-Checking Peer Training Sessions data
const PWLLE_TRAINING_SESSIONS = [
  // PHASE 1 — Jan–May 2025 · Focus Groups → Feedback → DCP Certification at 3 Ontario pilot sites
  { id: 1,  phase: 1, site: "Sanguen Health Centre",              location: "Kitchener, ON",       sessionNum: 1, scheduledDate: "2025-01-19", purpose: "Focus Group",           status: "Complete",    attendants: 10,   newAttendants: 10,   stipend: 1000, notes: "2025-01-20 Sanguen Focus Group Session One Notes" },
  { id: 2,  phase: 1, site: "Grey County",                        location: "Owen Sound, ON",      sessionNum: 1, scheduledDate: "2025-02-02", purpose: "Focus Group",           status: "Complete",    attendants: 10,   newAttendants: 10,   stipend: 1000, notes: "2025-02-04 Grey Bruce Focus Group Session One Notes" },
  { id: 3,  phase: 1, site: "Sanguen Health Centre",              location: "Kitchener, ON",       sessionNum: 2, scheduledDate: "2025-02-13", purpose: "Feedback on Materials", status: "Complete",    attendants: 10,   newAttendants: 9,    stipend: 1000, notes: "2025-02-14 Sanguen Focus Group Session Two Notes" },
  { id: 4,  phase: 1, site: "Regional HIV/AIDS Connection (RHAC)", location: "London, ON",         sessionNum: 1, scheduledDate: "2025-02-17", purpose: "Focus Group",           status: "Complete",    attendants: 20,   newAttendants: 20,   stipend: 1000, notes: "2025-02-19 London Focus Group Session One Notes" },
  { id: 5,  phase: 1, site: "Regional HIV/AIDS Connection (RHAC)", location: "London, ON",         sessionNum: 2, scheduledDate: "2025-03-05", purpose: "Feedback on Materials", status: "Complete",    attendants: 5,    newAttendants: 0,    stipend: 1000, notes: "2025-03-06 London Feedback Session Note" },
  { id: 6,  phase: 1, site: "Sanguen Health Centre",              location: "Kitchener, ON",       sessionNum: 3, scheduledDate: "2025-03-16", purpose: "DCP Certification",     status: "Complete",    attendants: 10,   newAttendants: 3,    stipend: 1000, notes: "DCP Pre- and Post-Surveys" },
  { id: 7,  phase: 1, site: "Grey County",                        location: "Owen Sound, ON",      sessionNum: 2, scheduledDate: "2025-03-27", purpose: "DCP Certification",     status: "Complete",    attendants: 14,   newAttendants: 4,    stipend: 1000, notes: "DCP Pre- and Post-Surveys" },
  { id: 8,  phase: 1, site: "Regional HIV/AIDS Connection (RHAC)", location: "London, ON",         sessionNum: 3, scheduledDate: "2025-04-14", purpose: "DCP Certification",     status: "Complete",    attendants: 20,   newAttendants: 6,    stipend: 1000, notes: "DCP Pre- and Post-Surveys" },
  { id: 9,  phase: 1, site: "Grey County",                        location: "Owen Sound, ON",      sessionNum: 3, scheduledDate: "2025-05-29", purpose: "DCP Certification",     status: "Complete",    attendants: 12,   newAttendants: 12,   stipend: 1000, notes: "DCP Pre- and Post-Surveys" },
  // PHASE 2 — Mar 2026 onward · DCP Certification at Year 2 sites (9 sessions, 2 complete)
  { id: 10, phase: 2, site: "Avenue B Harm Reduction Inc.",       location: "Saint John, NB",      sessionNum: 1, scheduledDate: "2026-03-27", purpose: "DCP Certification",     status: "Complete",    attendants: 17,   newAttendants: 17,   stipend: 3000, notes: "Awaiting receipt of LOICs and Surveys for final signature and input" },
  { id: 11, phase: 2, site: "Ensemble",                   location: "Moncton, NB",         sessionNum: 1, scheduledDate: "2026-04-10", purpose: "DCP Certification",     status: "Complete",    attendants: 15,   newAttendants: 15,   stipend: 3000, notes: "Awaiting receipt of LOICs and Surveys for final signature and input" },
  { id: 12, phase: 2, site: "Lower Mainland Purpose Society",     location: "New Westminster, BC", sessionNum: 1, scheduledDate: "2026-04-21", purpose: "DCP Certification",     status: "To schedule", attendants: null, newAttendants: null, stipend: 3000, notes: "Preferred date: Tuesday April 21, 2026; time TBD" },
  { id: 13, phase: 2, site: "AIDS New Brunswick",                 location: "Fredericton, NB",         sessionNum: 1, scheduledDate: null,         purpose: "DCP Certification",     status: "To schedule", attendants: null, newAttendants: null, stipend: 3000, notes: "Training upcoming" },
  { id: 14, phase: 2, site: "Breakaway",                          location: "Toronto, ON",         sessionNum: 1, scheduledDate: null,         purpose: "DCP Certification",     status: "To schedule", attendants: null, newAttendants: null, stipend: 3000, notes: "Training upcoming" },
  { id: 15, phase: 2, site: "Moyo Health",                        location: "Brampton, ON",        sessionNum: 1, scheduledDate: null,         purpose: "DCP Certification",     status: "To schedule", attendants: null, newAttendants: null, stipend: 3000, notes: "Training upcoming" },
  { id: 16, phase: 2, site: "Regional HIV/AIDS Connection (RHAC)", location: "London, ON",         sessionNum: 4, scheduledDate: null,         purpose: "DCP Certification",     status: "To schedule", attendants: null, newAttendants: null, stipend: 6000, notes: "Training upcoming (double-session budget: $6,000)" },
  { id: 17, phase: 2, site: "Renfrew Paramedic Services",         location: "Renfrew, ON",         sessionNum: 1, scheduledDate: null,         purpose: "DCP Certification",     status: "To schedule", attendants: null, newAttendants: null, stipend: 3000, notes: "Training upcoming" },
  { id: 18, phase: 2, site: "Sanguen Health Centre",              location: "Kitchener, ON",       sessionNum: 4, scheduledDate: null,         purpose: "DCP Certification",     status: "To schedule", attendants: null, newAttendants: null, stipend: 3000, notes: "Training upcoming" },
];

const formatDateDisplay = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const PWLLETrainingSessionsTracker = () => {
  const [showTable, setShowTable] = useState(false);

  const completed = PWLLE_TRAINING_SESSIONS.filter(s => s.status === 'Complete');
  const toSchedule = PWLLE_TRAINING_SESSIONS.filter(s => s.status !== 'Complete');
  const totalSessions = PWLLE_TRAINING_SESSIONS.length;
  const totalComplete = completed.length;
  const totalAttendants = completed.reduce((a, s) => a + (s.attendants || 0), 0);
  const totalUnique = completed.reduce((a, s) => a + (s.newAttendants || 0), 0);
  const stipendsPaid = completed.reduce((a, s) => a + (s.stipend || 0), 0);
  const stipendsCommitted = PWLLE_TRAINING_SESSIONS.reduce((a, s) => a + (s.stipend || 0), 0);

  const siteMap = new Map();
  PWLLE_TRAINING_SESSIONS.forEach(s => {
    if (!siteMap.has(s.site)) {
      siteMap.set(s.site, { site: s.site, location: s.location, p1Unique: 0, p2Unique: 0, p1Sessions: 0, p2Sessions: 0, pendingSessions: 0 });
    }
    const entry = siteMap.get(s.site);
    if (s.status === 'Complete') {
      if (s.phase === 1) { entry.p1Unique += (s.newAttendants || 0); entry.p1Sessions += 1; }
      else { entry.p2Unique += (s.newAttendants || 0); entry.p2Sessions += 1; }
    } else {
      entry.pendingSessions += 1;
    }
  });
  const siteData = Array.from(siteMap.values()).sort((a, b) => (b.p1Unique + b.p2Unique) - (a.p1Unique + a.p2Unique));
  const maxTotal = Math.max(...siteData.map(s => s.p1Unique + s.p2Unique), 1);

  return (
    <div className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4">
        <h2 className="flex items-center gap-2 font-bold text-2xl"><Users size={28} />PWLLE Drug-Checking Peer Training Sessions</h2>
        <p className="text-purple-200 text-sm mt-1">{totalComplete} of {totalSessions} sessions complete · {totalUnique} unique PWLLE trained · Phases 1 &amp; 2 combined</p>
      </div>
      <div className="p-6 bg-gradient-to-br from-white to-purple-50">
        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border-2 border-purple-200 shadow-md">
            <div className="text-xs text-purple-600 font-semibold uppercase tracking-wide mb-1">Total Sessions</div>
            <div className="text-3xl font-bold text-purple-900">{totalSessions}</div>
            <div className="text-xs text-gray-600 mt-1">{totalComplete} complete · {toSchedule.length} to schedule</div>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-purple-200 shadow-md">
            <div className="text-xs text-purple-600 font-semibold uppercase tracking-wide mb-1">Unique PWLLE</div>
            <div className="text-3xl font-bold text-purple-900">{totalUnique}</div>
            <div className="text-xs text-gray-600 mt-1">across {siteData.filter(s => s.p1Unique + s.p2Unique > 0).length} sites</div>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-purple-200 shadow-md">
            <div className="text-xs text-purple-600 font-semibold uppercase tracking-wide mb-1">Total Attendants</div>
            <div className="text-3xl font-bold text-purple-900">{totalAttendants}</div>
            <div className="text-xs text-gray-600 mt-1">including repeats</div>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-purple-200 shadow-md">
            <div className="text-xs text-purple-600 font-semibold uppercase tracking-wide mb-1">Stipends</div>
            <div className="text-3xl font-bold text-purple-900">${(stipendsPaid/1000).toFixed(0)}k<span className="text-base text-gray-500"> / ${(stipendsCommitted/1000).toFixed(0)}k</span></div>
            <div className="mt-2 h-2 bg-purple-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-purple-700" style={{ width: `${(stipendsPaid/stipendsCommitted*100).toFixed(0)}%` }}></div>
            </div>
            <div className="text-xs text-gray-600 mt-1">paid / committed</div>
          </div>
        </div>

        {/* Horizontal bar chart — unique PWLLE by site */}
        <div className="bg-white rounded-xl p-5 border-2 border-purple-200 shadow-md mb-6">
          <h3 className="font-bold text-purple-900 mb-1">Unique PWLLE Trained by Site</h3>
          <p className="text-xs text-gray-600 mb-4">Phase 1 (Jan–May 2025) + Phase 2 (Mar 2026 onward) — completed sessions only. Sites with only upcoming sessions shown as placeholders.</p>
          <div className="space-y-2">
            {siteData.map(s => {
              const total = s.p1Unique + s.p2Unique;
              const p1Pct = (s.p1Unique / maxTotal) * 100;
              const p2Pct = (s.p2Unique / maxTotal) * 100;
              const hasData = total > 0;
              return (
                <div key={s.site} className="flex items-center gap-3">
                  <div className="w-40 md:w-52 flex-shrink-0 text-right">
                    <div className="text-xs md:text-sm font-semibold text-purple-900 leading-tight truncate">{s.site}</div>
                    <div className="text-xs text-gray-500 truncate">{s.location}</div>
                  </div>
                  <div className="flex-1 relative h-7 bg-purple-50 rounded-md overflow-hidden border border-purple-100">
                    {hasData ? (
                      <>
                        <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 to-purple-700 flex items-center justify-end pr-2" style={{ width: `${p1Pct}%` }}>
                          {s.p1Unique > 0 && <span className="text-white text-xs font-bold">{s.p1Unique}</span>}
                        </div>
                        <div className="absolute top-0 h-full bg-gradient-to-r from-teal-400 to-teal-600 flex items-center justify-end pr-2" style={{ left: `${p1Pct}%`, width: `${p2Pct}%` }}>
                          {s.p2Unique > 0 && <span className="text-white text-xs font-bold">{s.p2Unique}</span>}
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-semibold text-purple-400 italic">{s.pendingSessions} session{s.pendingSessions > 1 ? 's' : ''} to schedule</span>
                      </div>
                    )}
                  </div>
                  <div className="w-10 text-right text-sm font-bold text-purple-900">{total || '—'}</div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-purple-100 text-xs">
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-gradient-to-r from-purple-500 to-purple-700"></div><span className="text-gray-700">Phase 1 (2025)</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-gradient-to-r from-teal-400 to-teal-600"></div><span className="text-gray-700">Phase 2 (2026)</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-purple-50 border border-purple-100"></div><span className="text-gray-700">Upcoming — not yet conducted</span></div>
          </div>
        </div>

        {/* Collapsible details table */}
        <button
          onClick={() => setShowTable(!showTable)}
          className="w-full flex items-center justify-between gap-2 p-3 bg-white rounded-xl border-2 border-purple-200 hover:bg-purple-50 transition-colors shadow-md"
        >
          <span className="font-semibold text-purple-900 text-sm">{showTable ? 'Hide' : 'Show'} session-by-session details ({totalSessions} rows)</span>
          {showTable ? <ChevronUp size={18} className="text-purple-700" /> : <ChevronDown size={18} className="text-purple-700" />}
        </button>

        {showTable && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
                  <th className="border border-purple-300 p-3 text-center">Phase</th>
                  <th className="border border-purple-300 p-3 text-left">Site</th>
                  <th className="border border-purple-300 p-3 text-left">Location</th>
                  <th className="border border-purple-300 p-3 text-center">Session #</th>
                  <th className="border border-purple-300 p-3 text-left">Date</th>
                  <th className="border border-purple-300 p-3 text-left">Purpose</th>
                  <th className="border border-purple-300 p-3 text-center">Status</th>
                  <th className="border border-purple-300 p-3 text-center">Attend.</th>
                  <th className="border border-purple-300 p-3 text-center">Unique</th>
                  <th className="border border-purple-300 p-3 text-right">Stipend</th>
                  <th className="border border-purple-300 p-3 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {PWLLE_TRAINING_SESSIONS.map((session, idx) => (
                  <tr key={session.id} className={idx % 2 === 0 ? 'bg-purple-50' : 'bg-white'}>
                    <td className="border border-purple-200 p-3 text-center"><span className={`px-2 py-1 rounded text-xs font-bold ${session.phase === 1 ? 'bg-purple-200 text-purple-900' : 'bg-teal-200 text-teal-900'}`}>P{session.phase}</span></td>
                    <td className="border border-purple-200 p-3 font-semibold text-purple-900">{session.site}</td>
                    <td className="border border-purple-200 p-3">{session.location}</td>
                    <td className="border border-purple-200 p-3 text-center font-bold">{session.sessionNum}</td>
                    <td className="border border-purple-200 p-3">{session.scheduledDate ? formatDateDisplay(session.scheduledDate) : 'TBD'}</td>
                    <td className="border border-purple-200 p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${session.purpose === 'Focus Group' ? 'bg-blue-100 text-blue-800' : session.purpose === 'Feedback on Materials' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                        {session.purpose}
                      </span>
                    </td>
                    <td className="border border-purple-200 p-3 text-center">
                      {session.status === 'Complete' ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium inline-flex items-center gap-1"><CheckCircle size={12} />Complete</span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium inline-flex items-center gap-1"><Clock size={12} />To schedule</span>
                      )}
                    </td>
                    <td className="border border-purple-200 p-3 text-center font-bold text-purple-700">{session.attendants ?? '—'}</td>
                    <td className="border border-purple-200 p-3 text-center font-medium">{session.newAttendants ?? '—'}</td>
                    <td className="border border-purple-200 p-3 text-right text-gray-700">${session.stipend.toLocaleString()}</td>
                    <td className="border border-purple-200 p-3 text-xs text-gray-600">{session.notes}</td>
                  </tr>
                ))}
                <tr className="bg-purple-100 font-bold">
                  <td colSpan="7" className="border border-purple-300 p-3 text-right text-purple-900">Cumulative Totals:</td>
                  <td className="border border-purple-300 p-3 text-center text-purple-900">{totalAttendants}</td>
                  <td className="border border-purple-300 p-3 text-center text-purple-900">{totalUnique}</td>
                  <td className="border border-purple-300 p-3 text-right text-purple-900">${stipendsCommitted.toLocaleString()}</td>
                  <td className="border border-purple-300 p-3 text-xs text-purple-900">{totalSessions} sessions</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const CanadianFlag = ({ size = 20 }) => (
  <svg width={size * 1.5} height={size} viewBox="0 0 30 20" className="inline-block ml-2" style={{ verticalAlign: 'middle' }}>
    <rect width="30" height="20" fill="#fff"/>
    <rect width="7.5" height="20" fill="#FF0000"/>
    <rect x="22.5" width="7.5" height="20" fill="#FF0000"/>
    <path fill="#FF0000" d="M15 4l-1 2h-2l1.5 1.5-.5 2.5 2-1 2 1-.5-2.5L18 6h-2l-1-2z"/>
  </svg>
);

const ResetMapButton = () => {
  const map = useMap();
  return (
    <button
      onClick={() => map.setView([52.0, -95.0], 4)}
      className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded-lg shadow-lg border-2 border-purple-300 hover:bg-purple-50 transition-colors flex items-center gap-2"
      title="Reset Map View"
    >
      <RotateCcw size={18} className="text-purple-700" />
      <span className="text-sm font-medium text-purple-700">Reset View</span>
    </button>
  );
};

const ProjectPhases = () => (
  <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl shadow-lg border-2 border-purple-200 mb-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-5 rounded-xl border-2 border-purple-300 shadow-md text-center">
        <h3 className="font-bold text-2xl text-purple-900 mb-3">Phase #1</h3>
        <p className="text-gray-800 font-semibold mb-2">Creating a Drug Checking Network Using Machine Learning Enabled Spectrometers</p>
        <p className="text-sm text-gray-600">Health Canada, Substance Use and Addictions Program (<a href="https://www.canada.ca/en/health-canada/services/substance-use/canadian-drugs-substances-strategy/funding/substance-use-addictions-program.html" target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:text-purple-900 underline">SUAP</a>)</p>
        <p className="text-sm text-gray-600">Contribution Agreement_Arrangement # 2223-HQ-000095</p>
      </div>
      <div className="bg-white p-5 rounded-xl border-2 border-purple-300 shadow-md text-center">
        <h3 className="font-bold text-2xl text-purple-900 mb-3">Phase #2</h3>
        <p className="text-gray-800 font-semibold mb-2">Leading the Way: PWLLE at the Forefront of Drug-Checking Initiatives</p>
        <p className="text-sm text-gray-600">Health Canada, Substance Use and Addictions Program (<a href="https://www.canada.ca/en/health-canada/services/substance-use/canadian-drugs-substances-strategy/funding/substance-use-addictions-program.html" target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:text-purple-900 underline">SUAP</a>)</p>
        <p className="text-sm text-gray-600">Amendment of Contribution Agreement_Arrangement # 2425-HQ-000058</p>
      </div>
    </div>
    <div className="mt-6 overflow-x-auto">
      <table className="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-md">
        <thead>
          <tr className="bg-purple-100">
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-bold text-purple-900">Organization</th>
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-bold text-purple-900">Project Name</th>
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-bold text-purple-900">Description</th>
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-bold text-purple-900">Substances</th>
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-bold text-purple-900">Location</th>
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-bold text-purple-900">Funding</th>
          </tr>
        </thead>
        <tbody>
          <tr className="hover:bg-purple-50">
            <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800 align-top">University of Western Ontario</td>
            <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800 align-top">Leading the Way: People with Lived and Living Experience at the Forefront of Drug-Checking Initiative</td>
            <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700 align-top">This initiative will integrate People with Lived and Living Experience (PWLLE) into drug-checking initiatives by training them in drug-checking technologies to enable them to implement drug-checking initiatives and training programs in participating harm reduction and public health centres in Alberta, Ontario, Manitoba and Nova Scotia.</td>
            <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800 align-top">Multiple substances</td>
            <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800 align-top">London, Ontario</td>
            <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800 align-top font-medium">$4,473,473</td>
          </tr>
        </tbody>
      </table>
      <p className="text-xs text-gray-500 mt-2 text-right">Source: <a href="https://www.canada.ca/en/health-canada/services/substance-use/canadian-drugs-substances-strategy/funding/substance-use-addictions-program/active-projects.html" target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:underline">Health Canada SUAP Active Projects</a></p>
    </div>
  </div>
);

const ProjectContactInfo = ({ isFooter = false }) => (
  <div className={`bg-gradient-to-br ${isFooter ? 'from-purple-100 to-purple-200' : 'from-purple-50 to-white'} p-6 rounded-2xl shadow-lg border-2 border-purple-200 ${isFooter ? 'mt-6' : 'mb-4'}`}>
    <h3 className="font-bold text-xl text-purple-900 mb-4 flex items-center gap-2">
      <Mail size={24} className="text-purple-700" />
      Project Contact Information
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded-xl border border-purple-200">
        <div className="font-bold text-purple-900 mb-2">Principal Investigator (PI):</div>
        <div className="text-gray-800 font-medium">Professor Francois Lagugne-Labarthet</div>
        <div className="text-gray-600">Faculty of Science, Western University</div>
        <div className="text-gray-600">London, ON, Canada</div>
        <div className="flex items-center gap-2 mt-2 text-purple-700"><Phone size={14} /><span>519-661-2111 x81006</span></div>
        <div className="flex items-center gap-2 text-purple-700"><Mail size={14} /><a href="mailto:flagugne@uwo.ca" className="hover:underline">flagugne@uwo.ca</a></div>
        <div className="flex items-center gap-2 mt-2 text-purple-700"><ExternalLink size={14} /><a href="https://publish.uwo.ca/~flagugne/#about" target="_blank" rel="noopener noreferrer" className="hover:underline">FLL Group Bio</a></div>
      </div>
      <div className="bg-white p-4 rounded-xl border border-purple-200">
        <div className="font-bold text-purple-900 mb-2">Project Manager:</div>
        <div className="text-gray-800 font-medium">Cameron Brown</div>
        <div className="text-gray-600">Faculty of Science, Western University</div>
        <div className="text-gray-600">London, ON, Canada</div>
        <div className="flex items-center gap-2 mt-2 text-purple-700"><Phone size={14} /><span>226-238-9970</span></div>
        <div className="flex items-center gap-2 text-purple-700"><Mail size={14} /><a href="mailto:cbrown58@uwo.ca" className="hover:underline">cbrown58@uwo.ca</a></div>
        <div className="flex items-center gap-2 mt-2 text-purple-700"><ExternalLink size={14} /><a href="https://publish.uwo.ca/~flagugne/#about" target="_blank" rel="noopener noreferrer" className="hover:underline">FLL Group Bio</a></div>
      </div>
    </div>
  </div>
);

const PowerPointViewer = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const pptxUrl = `https://partners.uwo-drugchecking.ca/project-presentation.pptx?v=${Date.now()}`;
  const embedUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(pptxUrl)}`;
  return (
    <div className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden mb-8">
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4 cursor-pointer flex items-center justify-between" onClick={() => setIsExpanded(!isExpanded)}>
        <h2 className="flex items-center gap-2 font-bold text-2xl"><Presentation size={28} />Project Overview Presentation</h2>
        <div className="flex items-center gap-3">
          {isExpanded && <button onClick={(e) => { e.stopPropagation(); setIsFullscreen(!isFullscreen); }} className="p-2 hover:bg-purple-600 rounded-lg transition-colors">{isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}</button>}
          <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-lg">
            <span className="text-sm font-medium">{isExpanded ? 'Collapse' : 'Expand'}</span>
            {isExpanded ? <ChevronUp size={28} strokeWidth={2.5} /> : <ChevronDown size={28} strokeWidth={2.5} />}
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className={`bg-gradient-to-br from-white to-purple-50 ${isFullscreen ? 'fixed inset-0 z-50 p-4' : 'p-6'}`}>
          {isFullscreen && <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-purple-900">Project Overview Presentation</h2><button onClick={() => setIsFullscreen(false)} className="p-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"><Minimize2 size={20} className="text-purple-700" /></button></div>}
          <div className={`${isFullscreen ? 'h-[calc(100%-60px)]' : 'h-[600px]'} w-full rounded-lg overflow-hidden border-2 border-purple-200 shadow-lg`}>
            <iframe src={embedUrl} width="100%" height="100%" frameBorder="0" allowFullScreen title="Project Presentation" className="bg-white" />
          </div>
          <p className="text-sm text-purple-600 mt-3 text-center">Click through the slides above to view the full project presentation. <a href={pptxUrl} download className="ml-2 underline hover:text-purple-800">Download PowerPoint</a></p>
        </div>
      )}
    </div>
  );
};

const ScatrResearchPDFViewer = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const pdfUrl = `https://partners.uwo-drugchecking.ca/Scatr-Technical-Research-Strategy.pdf`;
  return (
    <div className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden mb-8">
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4 cursor-pointer flex items-center justify-between" onClick={() => setIsExpanded(!isExpanded)}>
        <h2 className="flex items-center gap-2 font-bold text-2xl"><FileText size={28} />Scatr Technical Research Strategy</h2>
        <div className="flex items-center gap-3">
          {isExpanded && <button onClick={(e) => { e.stopPropagation(); setIsFullscreen(!isFullscreen); }} className="p-2 hover:bg-purple-600 rounded-lg transition-colors">{isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}</button>}
          <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-lg">
            <span className="text-sm font-medium">{isExpanded ? 'Collapse' : 'Expand'}</span>
            {isExpanded ? <ChevronUp size={28} strokeWidth={2.5} /> : <ChevronDown size={28} strokeWidth={2.5} />}
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className={`bg-gradient-to-br from-white to-purple-50 ${isFullscreen ? 'fixed inset-0 z-50 p-4' : 'p-6'}`}>
          {isFullscreen && <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-purple-900">Scatr Technical Research Strategy</h2><button onClick={() => setIsFullscreen(false)} className="p-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"><Minimize2 size={20} className="text-purple-700" /></button></div>}
          <div className={`${isFullscreen ? 'h-[calc(100%-60px)]' : 'h-[600px]'} w-full rounded-lg overflow-hidden border-2 border-purple-200 shadow-lg`}>
            <iframe src={pdfUrl} width="100%" height="100%" frameBorder="0" title="Scatr Technical Research Strategy" className="bg-white" />
          </div>
          <p className="text-sm text-purple-600 mt-3 text-center">Scroll through the document above to view the full Scatr Technical Research Strategy. <a href={pdfUrl} download className="ml-2 underline hover:text-purple-800">Download PDF</a></p>
        </div>
      )}
    </div>
  );
};

const ProjectPublications = () => (
  <div className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden">
    <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4">
      <h2 className="flex items-center gap-2 font-bold text-2xl"><BookOpen size={28} />Project-Related Publications</h2>
    </div>
    <div className="p-6 bg-gradient-to-br from-white to-purple-50 space-y-4">
      <div className="bg-white rounded-xl border-2 border-green-300 shadow-lg p-6">
        <div className="flex items-start gap-4">
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0">✓ PUBLISHED</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">Open Access</span>
              <span className="text-xs text-gray-500">Harm Reduction Journal · February 8, 2026</span>
            </div>
            <h3 className="font-bold text-purple-900 text-lg leading-snug mb-2">Street drug monitoring with networked spectrometers powered by machine learning: a pilot study in Ontario, Canada</h3>
            <p className="text-sm text-gray-600 mb-3">Aliyari E., Brown C., Van Boheemen M., Wardlaw L., Storm T., Hopkins A.M., Ezepue S., Dewar D., Sodtke L., McNab K., Watkins J., Pham A.T., Oudshoorn A., &amp; Lagugné-Labarthet F.</p>
            <p className="text-sm text-gray-500 italic mb-4"><em>Harm Reduction Journal</em>, Volume 23, Article 45 (2026). DOI: 10.1186/s12954-026-01403-3</p>
            <p className="text-sm text-gray-700 mb-4">Reports on 7,752 street drug samples analyzed across 10 Ontario harm reduction sites over 14 months (July 2023–August 2024) using networked Raman spectrometers with ML-enabled real-time analysis. Includes comparative validation against HPLC-MS and self-reported participant consumption-related behavior change data from 3,902 respondents.</p>
            <div className="flex flex-wrap gap-3">
              <a href="https://link.springer.com/article/10.1186/s12954-026-01403-3" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-800 transition-colors text-sm font-medium"><ExternalLink size={16} />Read Full Paper</a>
              <a href="https://link.springer.com/content/pdf/10.1186/s12954-026-01403-3.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-purple-700 border-2 border-purple-700 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"><Download size={16} />Download PDF</a>
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 text-center italic">Additional publications will be listed here as the project progresses.</p>
    </div>
  </div>
);

const PartnerDiscussionBoard = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4 cursor-pointer flex items-center justify-between" onClick={() => setIsExpanded(!isExpanded)}>
        <h2 className="flex items-center gap-2 font-bold text-2xl"><MessageSquare size={28} />Partner Discussion Board</h2>
        <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-lg">
          <span className="text-sm font-medium">{isExpanded ? 'Collapse' : 'Expand'}</span>
          {isExpanded ? <ChevronUp size={28} strokeWidth={2.5} /> : <ChevronDown size={28} strokeWidth={2.5} />}
        </div>
      </div>
      {isExpanded && (
        <div className="p-6 bg-gradient-to-br from-white to-purple-50">
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-6 rounded-xl border-2 border-purple-300 text-center">
              <MessageSquare size={64} className="mx-auto text-purple-600 mb-4" />
              <h3 className="text-2xl font-bold text-purple-900 mb-2">Discussion Forum Coming Soon!</h3>
              <p className="text-purple-700 mb-4">We're setting up a dedicated discussion board where project partners can ask questions, share updates, collaborate, and discuss best practices.</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200">
              <div className="flex items-start gap-3">
                <div className="text-2xl">📧</div>
                <div>
                  <div className="font-bold text-yellow-800 mb-1">In the meantime...</div>
                  <p className="text-sm text-yellow-700">Please direct any questions or concerns to the Project Manager at <a href="mailto:cbrown58@uwo.ca" className="underline hover:text-yellow-900">cbrown58@uwo.ca</a> or call <span className="font-medium">226-238-9970</span>.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const toggle = () => setIsVisible(window.scrollY > 300);
    window.addEventListener('scroll', toggle);
    return () => window.removeEventListener('scroll', toggle);
  }, []);
  if (!isVisible) return null;
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 right-6 z-50 bg-purple-700 hover:bg-purple-800 text-white p-3 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2 group" title="Back to Top">
      <ArrowUp size={24} />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-sm font-medium">Back to Top</span>
    </button>
  );
};

const AnnouncementBanner = ({ onDismiss }) => {
  if (!ANNOUNCEMENT_CONFIG.isActive) return null;
  const bgColors = { info: 'bg-gradient-to-r from-blue-600 to-blue-700', warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600', urgent: 'bg-gradient-to-r from-red-600 to-red-700' };
  const icons = { info: <Newspaper size={20} />, warning: <AlertTriangle size={20} />, urgent: <AlertTriangle size={20} /> };
  return (
    <div className={`${bgColors[ANNOUNCEMENT_CONFIG.type]} text-white px-4 py-3 shadow-lg`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {icons[ANNOUNCEMENT_CONFIG.type]}
          <span className="text-sm font-medium">{ANNOUNCEMENT_CONFIG.message}</span>
          {ANNOUNCEMENT_CONFIG.link && <a href={ANNOUNCEMENT_CONFIG.link.url} className="underline hover:no-underline text-sm font-bold">{ANNOUNCEMENT_CONFIG.link.text}</a>}
        </div>
        <button onClick={onDismiss} className="p-1 hover:bg-white/20 rounded transition-colors"><X size={18} /></button>
      </div>
    </div>
  );
};

const NewsUpdatesFeed = () => {
  const [showAll, setShowAll] = useState(false);
  const displayedNews = showAll ? NEWS_UPDATES : NEWS_UPDATES.slice(0, 3);
  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <div className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4">
        <h2 className="flex items-center gap-2 font-bold text-2xl"><Newspaper size={28} />News & Updates</h2>
      </div>
      <div className="p-6 bg-gradient-to-br from-white to-purple-50">
        <div className="space-y-4">
          {displayedNews.map((item, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border-2 border-purple-200 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">{formatDate(item.date)}</div>
                <div>
                  <h3 className="font-bold text-purple-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}{item.link && <> <a href={item.link.url} target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:text-purple-900 underline font-medium">{item.link.text} →</a></>}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {NEWS_UPDATES.length > 3 && (
          <button onClick={() => setShowAll(!showAll)} className="mt-4 w-full py-2 text-purple-700 hover:text-purple-900 font-medium text-sm flex items-center justify-center gap-2">
            {showAll ? <><ChevronUp size={18} /> Show Less</> : <><ChevronDown size={18} /> Show All Updates ({NEWS_UPDATES.length})</>}
          </button>
        )}
      </div>
    </div>
  );
};

const FAQSection = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);
  return (
    <div className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4">
        <h2 className="flex items-center gap-2 font-bold text-2xl"><HelpCircle size={28} />Frequently Asked Questions</h2>
      </div>
      <div className="p-6 bg-gradient-to-br from-white to-purple-50">
        <div className="space-y-3">
          {FAQ_DATA.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-xl border-2 border-purple-200 overflow-hidden">
              <button onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)} className="w-full px-4 py-3 text-left flex items-center justify-between gap-4 hover:bg-purple-50 transition-colors">
                <span className="font-medium text-purple-900">{faq.question}</span>
                {expandedFaq === idx ? <ChevronUp size={20} className="text-purple-600 flex-shrink-0" /> : <ChevronDown size={20} className="text-purple-600 flex-shrink-0" />}
              </button>
              {expandedFaq === idx && <div className="px-4 pb-4 pt-0"><div className="bg-purple-50 p-4 rounded-lg text-sm text-gray-700 leading-relaxed">{faq.answer}</div></div>}
            </div>
          ))}
        </div>
        <div className="mt-6 bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-xl border-2 border-purple-300">
          <p className="text-sm text-purple-800"><span className="font-bold">Further Questions?</span> Contact the Project Manager at <a href="mailto:cbrown58@uwo.ca" className="underline hover:text-purple-900">cbrown58@uwo.ca</a> or call <span className="font-medium">226-238-9970</span>.</p>
        </div>
      </div>
    </div>
  );
};

const TrainingTracker = ({ partnersData }) => {
  const completedCount = Object.values(TRAINING_STATUS).filter(s => s.completed).length;
  const totalCount = Object.keys(TRAINING_STATUS).length;
  const progressPercent = (completedCount / totalCount) * 100;
  const formatDate = (d) => { if (!d) return null; return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); };
  return (
    <div className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4">
        <h2 className="flex items-center gap-2 font-bold text-2xl"><GraduationCap size={28} />Drug-Checking Peer (DCP) Training Status</h2>
      </div>
      <div className="p-6 bg-gradient-to-br from-white to-purple-50">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-purple-900">Network Training Progress</span>
            <span className="text-sm font-bold text-purple-700">{completedCount} of {totalCount} sites ({Math.round(progressPercent)}%)</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {partnersData.map((site) => {
            const status = TRAINING_STATUS[site.id];
            return (
              <div key={site.id} className={`p-3 rounded-xl border-2 flex items-center gap-3 ${status?.completed ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${status?.completed ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'}`}>
                  {status?.completed ? <Check size={18} /> : <Clock size={18} />}
                </div>
                <div className="min-w-0">
                  <div className={`font-medium text-sm truncate ${status?.completed ? 'text-green-900' : 'text-gray-700'}`}>{site.nameOrganization.length > 30 ? site.nameOrganization.substring(0, 27) + '...' : site.nameOrganization}</div>
                  <div className="text-xs text-gray-500">{status?.completed ? `Completed ${formatDate(status.date)}` : 'Training Pending'}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200">
          <p className="text-sm text-yellow-800"><span className="font-bold">Ready to schedule training?</span> Contact the Project Manager at <a href="mailto:cbrown58@uwo.ca" className="underline hover:text-yellow-900">cbrown58@uwo.ca</a> to arrange a virtual training session for your team.</p>
        </div>
      </div>
    </div>
  );
};

const printContactList = (partnersData) => {
  const printWindow = window.open('', '_blank');
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const html = `<!DOCTYPE html><html><head><title>Project Partner Contact List - ${today}</title><style>body{font-family:Arial,sans-serif;font-size:11px;margin:20px}h1{font-size:18px;color:#5b21b6;margin-bottom:5px}h2{font-size:12px;color:#666;font-weight:normal;margin-top:0}table{width:100%;border-collapse:collapse;margin-top:15px}th,td{border:1px solid #ddd;padding:6px;text-align:left}th{background-color:#5b21b6;color:white;font-size:10px}tr:nth-child(even){background-color:#f9f9f9}.footer{margin-top:20px;font-size:10px;color:#666;border-top:1px solid #ddd;padding-top:10px}@media print{body{margin:10px}table{font-size:9px}th,td{padding:4px}}</style></head><body><h1>Western University Drug-Checking Network</h1><h2>Project Partner Contact List - Generated ${today}</h2><table><thead><tr><th>Organization</th><th>City, Prov</th><th>Primary Contact</th><th>Email</th><th>Phone</th><th>Additional Contact</th><th>Email</th><th>Phone</th></tr></thead><tbody>${partnersData.map(site => `<tr><td><strong>${site.nameOrganization}</strong></td><td>${site.city}, ${site.prov}</td><td>${site.primaryContact}</td><td>${site.email1}</td><td>${site.phone1}</td><td>${site.additionalContact}</td><td>${site.email2}</td><td>${site.phone2}</td></tr>`).join('')}</tbody></table><div class="footer"><p><strong>Project Contact:</strong> Cameron Brown, Project Manager | cbrown58@uwo.ca | 226-238-9970</p><p><strong>Principal Investigator:</strong> Prof. Francois Lagugne-Labarthet | flagugne@uwo.ca | 519-661-2111 x81006</p><p><em>This document contains confidential contact information. Please do not share outside the project network.</em></p></div></body></html>`;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 250);
};

const ProgressRing = ({ progress, size = 120, strokeWidth = 10, color = '#7c3aed' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
    </svg>
  );
};

const Sparkline = ({ data, color = '#7c3aed', height = 40 }) => {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1, width = 100;
  const points = data.map((val, i) => `${(i/(data.length-1))*width},${height-((val-min)/range)*(height-4)-2}`).join(' ');
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={width} cy={height-((data[data.length-1]-min)/range)*(height-4)-2} r="3" fill={color} />
    </svg>
  );
};

const DonutChart = ({ data, size = 160 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const strokeWidth = 24, radius = (size - strokeWidth) / 2, circumference = radius * 2 * Math.PI;
  let currentOffset = 0;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {data.map((item, idx) => {
          const segmentLength = (item.value / total) * circumference;
          const offset = currentOffset;
          currentOffset += segmentLength;
          return <circle key={idx} cx={size/2} cy={size/2} r={radius} fill="none" stroke={item.color} strokeWidth={strokeWidth} strokeDasharray={`${segmentLength} ${circumference - segmentLength}`} strokeDashoffset={-offset} className="transition-all duration-500" />;
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center"><div className="text-2xl font-bold text-gray-800">{total}</div><div className="text-xs text-gray-500">Total</div></div>
      </div>
    </div>
  );
};

const MiniCanadaMap = ({ activeProvinces }) => {
  const c = (p) => activeProvinces.includes(p) ? '#7c3aed' : '#e5e7eb';
  return (
    <svg viewBox="0 0 300 200" className="w-full h-auto">
      <path d="M20,60 L45,40 L50,80 L55,120 L35,140 L20,100 Z" fill={c('BC')} stroke="#fff" strokeWidth="1"/>
      <path d="M50,50 L80,50 L80,120 L50,120 Z" fill={c('AB')} stroke="#fff" strokeWidth="1"/>
      <path d="M80,50 L110,50 L110,120 L80,120 Z" fill={c('SK')} stroke="#fff" strokeWidth="1"/>
      <path d="M110,50 L140,50 L145,80 L140,120 L110,120 Z" fill={c('MB')} stroke="#fff" strokeWidth="1"/>
      <path d="M140,60 L180,50 L200,80 L190,130 L160,140 L140,120 Z" fill={c('ON')} stroke="#fff" strokeWidth="1"/>
      <path d="M200,40 L240,30 L260,60 L250,100 L220,120 L200,100 Z" fill={c('QC')} stroke="#fff" strokeWidth="1"/>
      <path d="M250,100 L270,95 L275,115 L255,120 Z" fill={c('NB')} stroke="#fff" strokeWidth="1"/>
      <path d="M270,110 L290,105 L295,125 L275,130 Z" fill={c('NS')} stroke="#fff" strokeWidth="1"/>
      <path d="M25,20 L45,20 L50,45 L30,50 Z" fill={c('YT')} stroke="#fff" strokeWidth="1"/>
      <path d="M50,15 L120,15 L120,45 L50,45 Z" fill={c('NT')} stroke="#fff" strokeWidth="1"/>
      <path d="M120,10 L200,10 L200,45 L140,50 L120,40 Z" fill={c('NU')} stroke="#fff" strokeWidth="1"/>
      {activeProvinces.includes('BC') && <text x="35" y="95" className="text-[8px] font-bold fill-white">BC</text>}
      {activeProvinces.includes('AB') && <text x="58" y="90" className="text-[8px] font-bold fill-white">AB</text>}
      {activeProvinces.includes('SK') && <text x="88" y="90" className="text-[8px] font-bold fill-white">SK</text>}
      {activeProvinces.includes('ON') && <text x="158" y="100" className="text-[8px] font-bold fill-white">ON</text>}
      {activeProvinces.includes('QC') && <text x="220" y="75" className="text-[8px] font-bold fill-white">QC</text>}
      {activeProvinces.includes('NB') && <text x="255" y="112" className="text-[6px] font-bold fill-white">NB</text>}
      {activeProvinces.includes('NS') && <text x="275" y="122" className="text-[6px] font-bold fill-white">NS</text>}
    </svg>
  );
};

const SummaryMetrics = ({ partnersData, stats, sitesByProvince }) => {
  const networkGrowth = [4, 8, 12, 16, 18, 20, 22, 22];
  const regions = {
    Western: { provinces: ['BC', 'AB'], sites: 0, devices: 0 },
    Prairies: { provinces: ['SK', 'MB'], sites: 0, devices: 0 },
    Central: { provinces: ['ON', 'QC'], sites: 0, devices: 0 },
    Atlantic: { provinces: ['NB', 'NS', 'PE', 'NL'], sites: 0, devices: 0 },
  };
  partnersData.forEach(site => {
    Object.keys(regions).forEach(region => {
      if (regions[region].provinces.includes(site.prov)) {
        regions[region].sites++;
        regions[region].devices += parseInt(site.devicesAssigned);
      }
    });
  });
  const mobileCount = stats.mobileSites.length;
  const nonMobileCount = stats.nonMobileSites.length;
  const bothCount = partnersData.filter(s => s.exemptionType1 !== 'NA' && s.exemptionType2 !== 'NA').length;
  const exemptionData = [
    { label: 'Non-Mobile Only', value: nonMobileCount - bothCount, color: '#3b82f6' },
    { label: 'Mobile Only', value: mobileCount - bothCount, color: '#10b981' },
    { label: 'Both Types', value: bothCount, color: '#8b5cf6' },
  ];
  const provinceData = Object.entries(sitesByProvince).map(([prov, sites]) => ({ prov, count: sites.length, devices: partnersData.filter(s => s.prov === prov).reduce((sum, s) => sum + parseInt(s.devicesAssigned), 0) })).sort((a, b) => b.count - a.count);
  const deviceProgress = (stats.totalDevices / 28) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-5">
        <h2 className="flex items-center gap-3 font-bold text-2xl"><Activity size={28} />Network Summary & Analytics</h2>
        <p className="text-purple-200 text-sm mt-1">Real-time overview of the drug-checking network across Canada</p>
      </div>
      <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4"><div className="bg-purple-100 p-3 rounded-xl"><Building2 size={28} className="text-purple-600" /></div><Sparkline data={networkGrowth} color="#7c3aed" /></div>
            <div className="text-4xl font-black text-gray-900">{stats.totalPartners}</div>
            <div className="text-sm font-medium text-gray-500 mt-1">Partner Sites</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4"><div className="bg-indigo-100 p-3 rounded-xl"><Zap size={28} className="text-indigo-600" /></div><div className="relative"><ProgressRing progress={deviceProgress} size={60} strokeWidth={6} color="#6366f1" /><div className="absolute inset-0 flex items-center justify-center"><span className="text-xs font-bold text-indigo-600">{Math.round(deviceProgress)}%</span></div></div></div>
            <div className="text-4xl font-black text-gray-900">{stats.totalDevices}<span className="text-lg font-normal text-gray-400">/28</span></div>
            <div className="text-sm font-medium text-gray-500 mt-1">Spectrometers Deployed</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3"><div className="bg-indigo-500 h-2 rounded-full transition-all duration-500" style={{ width: `${deviceProgress}%` }}></div></div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4"><div className="bg-emerald-100 p-3 rounded-xl"><Globe size={28} className="text-emerald-600" /></div><div className="text-right"><div className="text-xs text-gray-400">Coverage</div><div className="text-sm font-bold text-emerald-600">{Math.round((stats.provinces.length / 13) * 100)}%</div></div></div>
            <div className="text-4xl font-black text-gray-900">{stats.provinces.length}<span className="text-lg font-normal text-gray-400">/13</span></div>
            <div className="text-sm font-medium text-gray-500 mt-1">Provinces & Territories</div>
            <div className="flex flex-wrap gap-1 mt-3">{stats.provinces.map(p => <span key={p} className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-medium">{p}</span>)}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4"><div className="bg-amber-100 p-3 rounded-xl"><Navigation size={28} className="text-amber-600" /></div><Sparkline data={[8,12,14,16,18,19,20,20]} color="#f59e0b" /></div>
            <div className="text-4xl font-black text-gray-900">20</div>
            <div className="text-sm font-medium text-gray-500 mt-1">Cities Across Canada</div>
            <div className="flex items-center gap-2 mt-3"><Target size={14} className="text-amber-500" /><span className="text-xs text-amber-600 font-medium">Coast to coast coverage</span></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><MapPin size={20} className="text-purple-600" />Geographic Coverage</h3>
            <div className="flex items-center gap-6">
              <div className="flex-1"><MiniCanadaMap activeProvinces={stats.provinces} /></div>
              <div className="flex-1">
                <div className="space-y-3">
                  {Object.entries(regions).map(([region, data]) => (
                    <div key={region}>
                      <div className="flex justify-between text-sm mb-1"><span className="font-medium text-gray-700">{region}</span><span className="text-gray-500">{data.sites} sites</span></div>
                      <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-purple-500 h-2 rounded-full transition-all duration-500" style={{ width: `${(data.sites/stats.totalPartners)*100}%` }}></div></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><Activity size={16} className="text-purple-600" />Province-by-Province Breakdown</h4>
              <div className="flex flex-wrap gap-2">
                {provinceData.map(({ prov, count, devices }) => (
                  <div key={prov} className="bg-gray-50 rounded-lg px-3 py-2 hover:bg-purple-50 transition-colors flex items-center gap-2">
                    <span className="text-lg font-black text-purple-700">{prov}</span>
                    <span className="text-xs text-gray-600">{devices} device{devices !== 1 ? 's' : ''} · {count} site{count !== 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText size={20} className="text-purple-600" />Exemption Types Distribution</h3>
            <div className="flex items-center justify-around">
              <DonutChart data={exemptionData} size={160} />
              <div className="space-y-4">
                {exemptionData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <div><div className="text-sm font-medium text-gray-800">{item.label}</div><div className="text-lg font-bold" style={{ color: item.color }}>{item.value} sites</div></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-3 text-center"><Smartphone size={20} className="mx-auto text-blue-600 mb-1" /><div className="text-xl font-bold text-blue-700">{mobileCount}</div><div className="text-xs text-blue-600">Mobile Exemptions</div></div>
              <div className="bg-emerald-50 rounded-xl p-3 text-center"><Building2 size={20} className="mx-auto text-emerald-600 mb-1" /><div className="text-xl font-bold text-emerald-700">{nonMobileCount}</div><div className="text-xs text-emerald-600">Non-Mobile Exemptions</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TableOfContents = () => {
  const sections = [
    { id: 'csuch', label: 'Picturing the Problem' },
    { id: 'timeline', label: 'Project Background & Timeline' },
    { id: 'news', label: 'News & Updates' },
    { id: 'publications', label: 'Project-Related Publications' },
    { id: 'presentation', label: 'Project Overview Presentation' },
    { id: 'scatr-research', label: 'Scatr Technical Research Strategy' },
    { id: 'documents', label: 'Research, Ethics & Exemptions Documents' },
    { id: 'map', label: 'Interactive Map View of Partner Sites' },
    { id: 'table', label: 'Project Partner Contact Info' },
    { id: 'pwlle-sessions', label: 'PWLLE Training Sessions' },
    { id: 'metrics', label: 'Network Summary & Analytics' },
    { id: 'chain-of-custody', label: 'Sample Chain of Custody' },
    { id: 'links', label: 'Related Links & Resources' }
  ];
  const scrollTo = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  return (
    <div className="mt-4 bg-white p-4 rounded-xl border-2 border-purple-300 shadow-md">
      <div className="font-bold text-purple-900 mb-3 text-sm">Quick Navigation:</div>
      <div className="grid grid-cols-2 gap-3">
        {sections.map((section) => (
          <button key={section.id} onClick={() => scrollTo(section.id)} className="text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-left flex items-center gap-2 border-2 border-purple-700 hover:scale-[1.02]">
            <span className="text-purple-200">→</span> {section.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── ProjectCountdown ─────────────────────────────────────────────────────────
const ProjectCountdown = () => {
  const PROJECT_END = new Date("2028-03-31T23:59:59");
  const calculate = () => {
    const now = new Date();
    const totalMs = PROJECT_END - now;
    if (totalMs <= 0) return { expired: true, years: 0, months: 0, weeks: 0, days: 0, totalDays: 0, pct: 100 };
    const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));
    let y = PROJECT_END.getFullYear() - now.getFullYear();
    let m = PROJECT_END.getMonth() - now.getMonth();
    if (m < 0) { y--; m += 12; }
    let tempDate = new Date(now);
    tempDate.setFullYear(tempDate.getFullYear() + y);
    tempDate.setMonth(tempDate.getMonth() + m);
    let rd = Math.floor((PROJECT_END - tempDate) / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(rd / 7);
    const days = rd % 7;
    const pct = Math.min(100, Math.max(0, ((now - new Date("2024-06-27")) / (PROJECT_END - new Date("2024-06-27"))) * 100));
    return { expired: false, years: y, months: m, weeks, days, totalDays, pct };
  };
  const [time, setTime] = React.useState(calculate());
  React.useEffect(() => { const t = setInterval(() => setTime(calculate()), 60000); return () => clearInterval(t); }, []);
  const units = [
    { label: "Years",  value: time.years,  cls: "from-purple-600 to-purple-800" },
    { label: "Months", value: time.months, cls: "from-purple-500 to-purple-700" },
    { label: "Weeks",  value: time.weeks,  cls: "from-purple-400 to-purple-600" },
    { label: "Days",   value: time.days,   cls: "from-yellow-500 to-yellow-600" },
  ];
  const urgency = time.totalDays < 90 ? "border-red-400 bg-red-50" : time.totalDays < 180 ? "border-orange-400 bg-orange-50" : "border-purple-200 bg-white";
  return (
    <div className={`mx-4 mt-4 mb-2 rounded-2xl shadow-xl border-2 overflow-hidden ${urgency}`}>
      <div className="bg-gradient-to-r from-purple-900 to-purple-700 px-6 py-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-purple-200 text-xs font-semibold tracking-widest uppercase">Health Canada SUAP · Agreement #2425-HQ-000058</p>
          <h2 className="text-white font-bold text-lg leading-tight">Leading the Way: PWLLE at the Forefront of Drug-Checking Initiatives</h2>
        </div>
        <div className="text-right">
          <p className="text-purple-200 text-xs">Contract end date</p>
          <p className="text-yellow-300 font-bold text-sm">March 31, 2028</p>
        </div>
      </div>
      <div className="px-6 py-5">
        {time.expired ? <p className="text-center text-2xl font-bold text-red-700 py-4">Project contract period has ended.</p> : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {units.map(({ label, value, cls }) => (
                <div key={label} className={`bg-gradient-to-br ${cls} rounded-xl p-4 text-center text-white shadow-md`}>
                  <div className="text-4xl md:text-5xl font-extrabold leading-none tabular-nums">{value}</div>
                  <div className="text-xs md:text-sm font-semibold mt-1 uppercase tracking-widest opacity-90">{label}</div>
                </div>
              ))}
            </div>
            <div className="mb-1 flex justify-between text-xs text-gray-500 font-medium">
              <span>Project Start: Jun 27, 2024</span>
              <span className="text-purple-700 font-bold">{time.totalDays.toLocaleString()} calendar days remaining</span>
              <span>Contract End: Mar 31, 2028</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-yellow-400 rounded-full" style={{ width: `${time.pct.toFixed(1)}%` }} />
            </div>
            <div className="mt-1 text-right text-xs text-gray-400">{time.pct.toFixed(1)}% of project period elapsed</div>
          </>
        )}
      </div>
    </div>
  );
};
// ─── End ProjectCountdown ─────────────────────────────────────────────────────

const PicturingTheProblem = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div id="csuch" className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden scroll-mt-4">
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4 cursor-pointer flex items-center justify-between" onClick={() => setIsExpanded(!isExpanded)}>
        <h2 className="flex items-center gap-2 font-bold text-2xl">Picturing the Problem</h2>
        <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-lg">
          <span className="text-sm font-medium">{isExpanded ? 'Collapse' : 'Expand'}</span>
          {isExpanded ? <ChevronUp size={28} strokeWidth={2.5} /> : <ChevronDown size={28} strokeWidth={2.5} />}
        </div>
      </div>
      {isExpanded && (
        <div className="p-6 bg-gradient-to-br from-white to-purple-50">
          <a href="https://www.csuch.ca/explore-the-data" target="_blank" rel="noopener noreferrer" className="block hover:opacity-90 transition-opacity">
            <img src="/csuch-infographic.png" alt="Canadian Substance Use Costs and Harms Infographic" className="w-full rounded-lg shadow-lg cursor-pointer" />
          </a>
          <p className="text-sm text-gray-600 mt-4 text-center italic">Source: Canadian Centre on Substance Use and Addiction (CCSA), 2023. <a href="https://www.csuch.ca/explore-the-data" target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:text-purple-900 underline">Explore the Data →</a></p>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SAMPLE CHAIN OF CUSTODY — Password-gated module
// Embedded section for Partner Dashboard App.jsx.
// Anchors on id="chain-of-custody" · follows existing purple-card visual pattern.
//
// Data model lives in Supabase (public.shipments + public.custody_events).
// Schema verified against HC clarification items in response_to_exemption.docx
// (project_admin/003, Sep 29 2025).
// ═══════════════════════════════════════════════════════════════════════════

const CUSTODY_PASSWORD = import.meta.env.VITE_CUSTODY_PASSWORD || 'WUDC-custody-2026';

// Derive a stable-ish browser fingerprint (NOT real fingerprinting — just a
// breadcrumb for the audit log to distinguish devices).
const getFingerprint = () => {
  try {
    const stored = localStorage.getItem('wudc_fp');
    if (stored) return stored;
    const fp = 'fp-' + Math.random().toString(36).slice(2, 10) + '-' + Date.now().toString(36);
    localStorage.setItem('wudc_fp', fp);
    return fp;
  } catch {
    return 'fp-unknown';
  }
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
  packaged:   { label: 'Packaged',           color: 'bg-slate-100 text-slate-800 border-slate-300' },
  in_transit: { label: 'In Transit',          color: 'bg-amber-100 text-amber-800 border-amber-300' },
  delivered:  { label: 'Delivered (pending intake)', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  verified:   { label: 'Verified & Logged',  color: 'bg-green-100 text-green-800 border-green-300' },
  exception:  { label: '⚠ Exception',         color: 'bg-red-100 text-red-800 border-red-300' },
};

const SampleChainOfCustody = ({ partnersData }) => {
  const [unlocked, setUnlocked] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState('');

  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [expandedShipmentId, setExpandedShipmentId] = useState(null);
  const [view, setView] = useState('list'); // 'list' | 'new' | 'detail'
  const [busy, setBusy] = useState(false);

  const fingerprint = getFingerprint();

  // On unlock, fetch shipments.
  useEffect(() => {
    if (!unlocked) return;
    (async () => {
      setLoading(true);
      setLoadError('');
      const { data, error } = await listShipments();
      if (error) setLoadError(error.message || String(error));
      else setShipments(data || []);
      setLoading(false);
    })();
  }, [unlocked]);

  const refreshShipments = async () => {
    const { data, error } = await listShipments();
    if (!error) setShipments(data || []);
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    if (pwInput === CUSTODY_PASSWORD) {
      setUnlocked(true);
      setPwError('');
      setPwInput('');
    } else {
      setPwError('Incorrect password. Contact Cameron (cbrown58@uwo.ca) if you need access.');
    }
  };

  // ─── Password gate ────────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div id="chain-of-custody" className="scroll-mt-4 bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4">
          <h2 className="flex items-center gap-2 font-bold text-2xl">
            <FileText size={28} />Sample Chain of Custody
          </h2>
          <p className="text-purple-200 text-sm mt-1">
            Password-protected · Health Canada §56(1) compliant transport log
          </p>
        </div>
        <div className="p-6 bg-gradient-to-br from-white to-purple-50">
          <div className="max-w-md mx-auto bg-white rounded-xl p-6 border-2 border-purple-200 shadow-md">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <AlertTriangle size={24} className="text-purple-700" />
              </div>
              <div>
                <div className="font-bold text-purple-900">Access required</div>
                <div className="text-sm text-gray-600">
                  This section contains controlled-substance custody records and requires the module password.
                </div>
              </div>
            </div>
            <form onSubmit={handleUnlock} className="space-y-3">
              <input
                type="password"
                value={pwInput}
                onChange={(e) => setPwInput(e.target.value)}
                placeholder="Module password"
                className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                autoFocus
              />
              {pwError && <div className="text-sm text-red-700">{pwError}</div>}
              <button
                type="submit"
                className="w-full bg-purple-700 text-white font-bold py-2 rounded-lg hover:bg-purple-800"
              >
                Unlock
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-4">
              The module password is distributed separately. Contact Cameron at{' '}
              <a href="mailto:cbrown58@uwo.ca" className="text-purple-700 hover:underline">cbrown58@uwo.ca</a>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Unlocked header ──────────────────────────────────────────────────
  const activeShipment = shipments.find((s) => s.id === expandedShipmentId);

  return (
    <div id="chain-of-custody" className="scroll-mt-4 bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-bold text-2xl">
            <FileText size={28} />Sample Chain of Custody
          </h2>
          <p className="text-purple-200 text-sm mt-1">
            {shipments.length} shipment{shipments.length !== 1 ? 's' : ''} on file
            {!hasSupabaseConfig && (
              <span className="ml-2 bg-red-600 px-2 py-0.5 rounded text-xs font-bold">
                ⚠ Offline mode — Supabase not configured
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {view !== 'list' && (
            <button
              onClick={() => { setView('list'); setExpandedShipmentId(null); }}
              className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm font-medium"
            >
              ← Back to list
            </button>
          )}
          {view === 'list' && (
            <button
              onClick={() => setView('new')}
              className="bg-white text-purple-800 hover:bg-purple-50 font-bold px-4 py-2 rounded-lg text-sm"
            >
              + New Shipment
            </button>
          )}
        </div>
      </div>

      <div className="p-6 bg-gradient-to-br from-white to-purple-50">
        {view === 'new' && (
          <NewShipmentForm
            partnersData={partnersData}
            fingerprint={fingerprint}
            onCreated={async () => {
              await refreshShipments();
              setView('list');
            }}
            onCancel={() => setView('list')}
            busy={busy}
            setBusy={setBusy}
          />
        )}

        {view === 'detail' && activeShipment && (
          <ShipmentDetail
            shipment={activeShipment}
            fingerprint={fingerprint}
            onUpdated={refreshShipments}
          />
        )}

        {view === 'list' && (
          <>
            {loading && (
              <div className="text-center py-8 text-gray-600">Loading shipments…</div>
            )}
            {loadError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-sm text-red-800 mb-4">
                <div className="font-bold">Could not load shipments</div>
                <div>{loadError}</div>
                <div className="mt-2 text-xs">
                  Check that <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>{' '}
                  are set in <code>.env.local</code>.
                </div>
              </div>
            )}
            {!loading && !loadError && shipments.length === 0 && (
              <div className="text-center py-12 bg-white border-2 border-dashed border-purple-200 rounded-xl">
                <FileText size={48} className="mx-auto text-purple-300 mb-3" />
                <div className="text-purple-900 font-bold">No shipments recorded yet</div>
                <div className="text-sm text-gray-600 mt-1">
                  Click "+ New Shipment" above to create the first entry.
                </div>
              </div>
            )}
            {!loading && shipments.length > 0 && (
              <div className="overflow-x-auto rounded-xl border-2 border-purple-200 shadow-md">
                <table className="w-full border-collapse text-sm bg-white">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-700 to-purple-900 text-white">
                      <th className="p-3 text-left">Shipment Date</th>
                      <th className="p-3 text-left">From Site</th>
                      <th className="p-3 text-center">Samples</th>
                      <th className="p-3 text-left">Courier</th>
                      <th className="p-3 text-left">Pickup</th>
                      <th className="p-3 text-left">Arrival</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipments.map((s, idx) => {
                      const meta = STATUS_META[s.status] || STATUS_META.packaged;
                      return (
                        <tr key={s.id} className={idx % 2 === 0 ? 'bg-purple-50' : 'bg-white'}>
                          <td className="border border-purple-100 p-3">{formatDT(s.created_at)}</td>
                          <td className="border border-purple-100 p-3 font-medium text-purple-900">{s.scs_site_name}</td>
                          <td className="border border-purple-100 p-3 text-center font-bold">{s.sample_count}</td>
                          <td className="border border-purple-100 p-3">{s.courier_name}</td>
                          <td className="border border-purple-100 p-3">{formatDT(s.pickup_at)}</td>
                          <td className="border border-purple-100 p-3">{formatDT(s.arrival_at)}</td>
                          <td className="border border-purple-100 p-3 text-center">
                            <span className={`px-2 py-1 border rounded text-xs font-bold ${meta.color}`}>{meta.label}</span>
                          </td>
                          <td className="border border-purple-100 p-3 text-right">
                            <button
                              onClick={() => { setExpandedShipmentId(s.id); setView('detail'); }}
                              className="text-purple-700 hover:text-purple-900 font-semibold text-xs"
                            >
                              Open →
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ─── New Shipment Form ───────────────────────────────────────────────────
const NewShipmentForm = ({ partnersData, fingerprint, onCreated, onCancel, busy, setBusy }) => {
  const [form, setForm] = useState({
    scs_site_id: '',
    scs_site_name: '',
    sample_ids_raw: '',
    sample_descriptions_raw: '',
    packaged_by_name: '',
    packaged_at: new Date().toISOString().slice(0, 16),
    removed_from_storage_by_name: '',
    removed_from_storage_at: new Date().toISOString().slice(0, 16),
    courier_name: '',
    pickup_at: new Date().toISOString().slice(0, 16),
    courier_consent_signature: '',
    courier_consent_affirmed: false,
  });
  const [error, setError] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSiteChange = (siteId) => {
    const site = partnersData.find((p) => String(p.id) === String(siteId));
    set('scs_site_id', siteId);
    set('scs_site_name', site ? site.nameOrganization : '');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    const sample_ids = form.sample_ids_raw.split(',').map((s) => s.trim()).filter(Boolean);
    const sample_descriptions = form.sample_descriptions_raw.split(',').map((s) => s.trim()).filter(Boolean);

    if (sample_ids.length === 0) return setError('At least one sample ID is required.');
    if (sample_ids.length !== sample_descriptions.length) {
      return setError(`Sample IDs (${sample_ids.length}) and descriptions (${sample_descriptions.length}) must be the same count.`);
    }
    if (!form.scs_site_name) return setError('Select the originating SCS site.');
    if (!form.packaged_by_name.trim()) return setError('Enter the name of the staff member who packaged the sample.');
    if (!form.removed_from_storage_by_name.trim()) return setError('Enter the name of the staff member who removed the sample from secure storage.');
    if (!form.courier_name.trim()) return setError('Enter the courier name.');
    if (!form.courier_consent_signature.trim()) return setError('Courier must provide typed signature.');
    if (!form.courier_consent_affirmed) return setError('Courier consent checkbox must be affirmed.');

    setBusy(true);
    const payload = {
      scs_site_id: form.scs_site_id,
      scs_site_name: form.scs_site_name,
      sample_ids,
      sample_descriptions,
      packaged_by_name: form.packaged_by_name.trim(),
      packaged_at: new Date(form.packaged_at).toISOString(),
      removed_from_storage_by_name: form.removed_from_storage_by_name.trim(),
      removed_from_storage_at: new Date(form.removed_from_storage_at).toISOString(),
      courier_name: form.courier_name.trim(),
      courier_consent_signature: form.courier_consent_signature.trim(),
      courier_consent_affirmed: form.courier_consent_affirmed,
      courier_consent_at: new Date().toISOString(),
      pickup_at: new Date(form.pickup_at).toISOString(),
      status: 'in_transit',
      created_by_fingerprint: fingerprint,
    };

    const { data, error: insertError } = await insertShipment(payload);
    if (insertError) {
      setError(insertError.message || String(insertError));
      setBusy(false);
      return;
    }

    await logCustodyEvent({
      shipment_id: data.id,
      event_type: 'picked_up',
      actor_name: form.courier_name.trim(),
      actor_role: 'courier',
      actor_signature: form.courier_consent_signature.trim(),
      actor_affirmed: true,
      actor_fingerprint: fingerprint,
      notes: `Shipment of ${sample_ids.length} sample(s) picked up from ${form.scs_site_name}.`,
    });

    setBusy(false);
    onCreated();
  };

  const inputCls = 'w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm';
  const labelCls = 'block text-sm font-semibold text-purple-900 mb-1';

  return (
    <form onSubmit={submit} className="space-y-6 bg-white p-6 rounded-xl border-2 border-purple-200">
      <h3 className="font-bold text-xl text-purple-900">New Shipment — Pickup at SCS Site</h3>

      {/* Site */}
      <div>
        <label className={labelCls}>Originating SCS Partner Site *</label>
        <select className={inputCls} value={form.scs_site_id} onChange={(e) => handleSiteChange(e.target.value)} required>
          <option value="">-- Select site --</option>
          {partnersData.filter((p) => !p.isLead).map((p) => (
            <option key={p.id} value={p.id}>{p.nameOrganization} ({p.city}, {p.prov})</option>
          ))}
        </select>
      </div>

      {/* Samples */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Sample IDs (comma-separated, format: site + sample #) *</label>
          <input className={inputCls} value={form.sample_ids_raw} onChange={(e) => set('sample_ids_raw', e.target.value)} placeholder="e.g. SAN-001, SAN-002, SAN-003" required />
        </div>
        <div>
          <label className={labelCls}>Sample Descriptions (comma-separated, same count) *</label>
          <input className={inputCls} value={form.sample_descriptions_raw} onChange={(e) => set('sample_descriptions_raw', e.target.value)} placeholder="e.g. white powder, bright yellow, grey rocks" required />
        </div>
      </div>

      {/* Packaged */}
      <div className="border-t pt-4">
        <div className="text-xs uppercase tracking-wider text-purple-700 font-bold mb-3">HC-mandated: Who packaged & stored the sample</div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Staff member who packaged & stored *</label>
            <input className={inputCls} value={form.packaged_by_name} onChange={(e) => set('packaged_by_name', e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>Packaged at (date/time) *</label>
            <input type="datetime-local" className={inputCls} value={form.packaged_at} onChange={(e) => set('packaged_at', e.target.value)} required />
          </div>
        </div>
      </div>

      {/* Removed from storage */}
      <div className="border-t pt-4">
        <div className="text-xs uppercase tracking-wider text-purple-700 font-bold mb-3">HC-mandated: Who removed from secure storage</div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Staff member who removed from storage *</label>
            <input className={inputCls} value={form.removed_from_storage_by_name} onChange={(e) => set('removed_from_storage_by_name', e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>Removed from storage at *</label>
            <input type="datetime-local" className={inputCls} value={form.removed_from_storage_at} onChange={(e) => set('removed_from_storage_at', e.target.value)} required />
          </div>
        </div>
      </div>

      {/* Courier */}
      <div className="border-t pt-4">
        <div className="text-xs uppercase tracking-wider text-purple-700 font-bold mb-3">HC-mandated: Courier identity & pickup</div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Courier (or transporting staff) name *</label>
            <input className={inputCls} value={form.courier_name} onChange={(e) => set('courier_name', e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>Pickup date/time (leaves SCS site) *</label>
            <input type="datetime-local" className={inputCls} value={form.pickup_at} onChange={(e) => set('pickup_at', e.target.value)} required />
          </div>
        </div>
        <div className="mt-4 bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
          <div className="font-bold text-purple-900 mb-2">Courier E-signature — Consent of Transport</div>
          <div className="text-xs text-gray-700 mb-3">
            By typing my full legal name and affirming the checkbox below, I acknowledge that I am taking custody of the
            above-listed controlled substance sample(s) for transport to Western University under the authority of Health
            Canada's §56(1) exemption, and that this typed signature is legally equivalent to my handwritten signature.
          </div>
          <input className={inputCls} value={form.courier_consent_signature} onChange={(e) => set('courier_consent_signature', e.target.value)} placeholder="Type full legal name" required />
          <label className="flex items-center gap-2 mt-3 text-sm">
            <input type="checkbox" checked={form.courier_consent_affirmed} onChange={(e) => set('courier_consent_affirmed', e.target.checked)} />
            <span>I affirm the above statement and accept custody of these samples. *</span>
          </label>
        </div>
      </div>

      {error && <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-sm text-red-800">{error}</div>}

      <div className="flex gap-3">
        <button type="submit" disabled={busy} className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-6 py-2 rounded-lg disabled:opacity-50">
          {busy ? 'Saving…' : 'Create shipment & record pickup'}
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-6 py-2 rounded-lg">
          Cancel
        </button>
      </div>
    </form>
  );
};

// ─── Shipment Detail (view + mark arrival + mark verified) ────────────────
const ShipmentDetail = ({ shipment, fingerprint, onUpdated }) => {
  const [events, setEvents] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [arrivalForm, setArrivalForm] = useState({
    arrival_at: new Date().toISOString().slice(0, 16),
    intake_by_name: '',
    intake_signature: '',
    intake_affirmed: false,
    intake_matches_paper: true,
    intake_notes: '',
  });

  useEffect(() => {
    (async () => {
      const { data } = await listCustodyEvents(shipment.id);
      setEvents(data || []);
    })();
  }, [shipment.id]);

  const markArrival = async (e) => {
    e.preventDefault();
    setError('');
    if (!arrivalForm.intake_by_name.trim()) return setError('Intake staff name required.');
    if (!arrivalForm.intake_signature.trim()) return setError('Intake signature required.');
    if (!arrivalForm.intake_affirmed) return setError('Intake affirmation checkbox required.');

    setBusy(true);
    const patch = {
      arrival_at: new Date(arrivalForm.arrival_at).toISOString(),
      intake_by_name: arrivalForm.intake_by_name.trim(),
      intake_signature: arrivalForm.intake_signature.trim(),
      intake_affirmed: arrivalForm.intake_affirmed,
      intake_matches_paper: arrivalForm.intake_matches_paper,
      intake_notes: arrivalForm.intake_notes.trim(),
      intake_at: new Date().toISOString(),
      status: arrivalForm.intake_matches_paper ? 'verified' : 'exception',
      updated_by_fingerprint: fingerprint,
    };
    const { error: updateError } = await updateShipment(shipment.id, patch);
    if (updateError) { setError(updateError.message); setBusy(false); return; }

    await logCustodyEvent({
      shipment_id: shipment.id,
      event_type: arrivalForm.intake_matches_paper ? 'verified' : 'exception_raised',
      actor_name: arrivalForm.intake_by_name.trim(),
      actor_role: 'western_intake',
      actor_signature: arrivalForm.intake_signature.trim(),
      actor_affirmed: true,
      actor_fingerprint: fingerprint,
      notes: arrivalForm.intake_notes || (arrivalForm.intake_matches_paper
        ? 'Samples received & cross-checked against printed + online records.'
        : 'Discrepancy noted on intake.'),
    });

    setBusy(false);
    onUpdated();
  };

  const printChainOfCustody = () => {
    const html = `<!DOCTYPE html><html><head><title>Chain of Custody — ${shipment.scs_site_name}</title>
<style>body{font-family:Arial,sans-serif;font-size:11px;max-width:800px;margin:20px auto;padding:20px}
h1{color:#5b21b6;font-size:18px;margin-bottom:5px}h2{font-size:12px;color:#666;margin-top:0}
table{width:100%;border-collapse:collapse;margin-top:15px}th,td{border:1px solid #ddd;padding:6px;text-align:left;font-size:10px}
th{background:#5b21b6;color:#fff}.sig{border:1px solid #333;padding:10px;margin-top:8px;min-height:40px;font-family:cursive;font-size:14px}
.section{margin-top:16px;padding:12px;border:2px solid #e9d5ff;border-radius:4px}
@media print{body{margin:10px}}</style></head><body>
<h1>Western University Drug-Checking Network</h1>
<h2>Sample Chain of Custody Record — Health Canada §56(1) Transport Log</h2>
<div class="section">
<strong>Shipment ID:</strong> ${shipment.id}<br/>
<strong>Created:</strong> ${formatDT(shipment.created_at)}<br/>
<strong>Originating Site:</strong> ${shipment.scs_site_name}<br/>
<strong>Status:</strong> ${STATUS_META[shipment.status]?.label || shipment.status}
</div>
<div class="section"><strong>Samples transported (${shipment.sample_count}):</strong>
<table><thead><tr><th>Sample ID</th><th>Description</th></tr></thead><tbody>
${shipment.sample_ids.map((id, i) => `<tr><td>${id}</td><td>${shipment.sample_descriptions[i] || '—'}</td></tr>`).join('')}
</tbody></table></div>
<div class="section"><strong>Packaged & stored by:</strong> ${shipment.packaged_by_name} at ${formatDT(shipment.packaged_at)}<br/>
<strong>Removed from storage by:</strong> ${shipment.removed_from_storage_by_name} at ${formatDT(shipment.removed_from_storage_at)}</div>
<div class="section"><strong>Courier:</strong> ${shipment.courier_name}<br/>
<strong>Pickup:</strong> ${formatDT(shipment.pickup_at)}<br/>
<strong>Courier e-signature (typed):</strong><div class="sig">${shipment.courier_consent_signature}</div>
<em>Consent affirmed:</em> ${shipment.courier_consent_affirmed ? 'YES' : 'NO'} · <em>at:</em> ${formatDT(shipment.courier_consent_at)}</div>
${shipment.arrival_at ? `
<div class="section"><strong>Arrival at Western:</strong> ${formatDT(shipment.arrival_at)}<br/>
<strong>Western intake:</strong> ${shipment.intake_by_name || '—'}<br/>
<strong>Intake e-signature (typed):</strong><div class="sig">${shipment.intake_signature || '—'}</div>
<em>Samples match paper + online records:</em> ${shipment.intake_matches_paper ? 'YES' : 'NO — EXCEPTION'}<br/>
${shipment.intake_notes ? `<em>Notes:</em> ${shipment.intake_notes}` : ''}</div>` : '<div class="section"><em>Not yet received at Western.</em></div>'}
<div style="margin-top:30px;font-size:9px;color:#666;border-top:1px solid #ccc;padding-top:10px">
Generated ${new Date().toLocaleString('en-CA')} · Western University Drug-Checking Project · Retained for duration of §56(1) exemption per HC record-keeping requirements.
</div></body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 250);
  };

  const meta = STATUS_META[shipment.status] || STATUS_META.packaged;
  const isAwaitingIntake = ['in_transit', 'delivered'].includes(shipment.status);

  return (
    <div className="space-y-4">
      <div className="bg-white p-5 rounded-xl border-2 border-purple-200 shadow-md">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="text-xs text-purple-600 font-bold uppercase tracking-wider">Shipment detail</div>
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
            <div className="font-semibold text-purple-900">Samples ({shipment.sample_count})</div>
            <ul className="list-disc list-inside text-gray-700 mt-1">
              {shipment.sample_ids.map((id, i) => (
                <li key={i}><strong>{id}</strong> — {shipment.sample_descriptions[i] || '—'}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-1 text-gray-700">
            <div><strong>Packaged by:</strong> {shipment.packaged_by_name} <span className="text-gray-500">at {formatDT(shipment.packaged_at)}</span></div>
            <div><strong>Removed from storage:</strong> {shipment.removed_from_storage_by_name} <span className="text-gray-500">at {formatDT(shipment.removed_from_storage_at)}</span></div>
            <div><strong>Courier:</strong> {shipment.courier_name}</div>
            <div><strong>Pickup:</strong> {formatDT(shipment.pickup_at)}</div>
            <div><strong>Courier consent:</strong> <em>{shipment.courier_consent_signature}</em> · {shipment.courier_consent_affirmed ? '✓ affirmed' : '✗ unaffirmed'}</div>
            {shipment.arrival_at && <div><strong>Arrival at Western:</strong> {formatDT(shipment.arrival_at)}</div>}
            {shipment.intake_by_name && <div><strong>Intake:</strong> {shipment.intake_by_name} · <em>{shipment.intake_signature}</em></div>}
            {shipment.intake_notes && <div><strong>Intake notes:</strong> {shipment.intake_notes}</div>}
          </div>
        </div>
      </div>

      {/* Intake form if awaiting */}
      {isAwaitingIntake && (
        <form onSubmit={markArrival} className="bg-blue-50 border-2 border-blue-300 p-5 rounded-xl">
          <h3 className="font-bold text-lg text-blue-900 mb-3">Western Intake — Mark Arrival & Verify</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1">Arrival date/time at Western *</label>
              <input type="datetime-local" className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg text-sm" value={arrivalForm.arrival_at} onChange={(e) => setArrivalForm((f) => ({ ...f, arrival_at: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1">Intake staff name *</label>
              <input className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg text-sm" value={arrivalForm.intake_by_name} onChange={(e) => setArrivalForm((f) => ({ ...f, intake_by_name: e.target.value }))} placeholder="e.g. Elnaz Aliyari" required />
            </div>
          </div>
          <label className="flex items-center gap-2 mt-3 text-sm text-blue-900">
            <input type="checkbox" checked={arrivalForm.intake_matches_paper} onChange={(e) => setArrivalForm((f) => ({ ...f, intake_matches_paper: e.target.checked }))} />
            <span>Physical samples match printed courier form AND match the online record (cross-check pass)</span>
          </label>
          {!arrivalForm.intake_matches_paper && (
            <div className="mt-3">
              <label className="block text-sm font-semibold text-red-900 mb-1">⚠ Discrepancy notes *</label>
              <textarea className="w-full px-3 py-2 border-2 border-red-300 rounded-lg text-sm" rows={3} value={arrivalForm.intake_notes} onChange={(e) => setArrivalForm((f) => ({ ...f, intake_notes: e.target.value }))} />
            </div>
          )}
          <div className="mt-4 bg-white border-2 border-blue-200 rounded-lg p-3">
            <label className="block text-sm font-semibold text-blue-900 mb-1">Intake e-signature (typed full legal name) *</label>
            <input className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg text-sm" value={arrivalForm.intake_signature} onChange={(e) => setArrivalForm((f) => ({ ...f, intake_signature: e.target.value }))} required />
            <label className="flex items-center gap-2 mt-2 text-sm">
              <input type="checkbox" checked={arrivalForm.intake_affirmed} onChange={(e) => setArrivalForm((f) => ({ ...f, intake_affirmed: e.target.checked }))} />
              <span>I affirm that I have received these samples and performed the cross-check described above. *</span>
            </label>
          </div>
          {error && <div className="mt-3 bg-red-50 border-2 border-red-200 rounded-lg p-3 text-sm text-red-800">{error}</div>}
          <button type="submit" disabled={busy} className="mt-4 bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-2 rounded-lg disabled:opacity-50">
            {busy ? 'Saving…' : 'Record intake & verify'}
          </button>
        </form>
      )}

      {/* Custody event log */}
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
  const [expandedMetrics, setExpandedMetrics] = useState({});
  const [expandedRow, setExpandedRow] = useState(null);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  const toggleRow = (rowId) => setExpandedRow(expandedRow === rowId ? null : rowId);
  const todayFormatted = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const partnersData = [
    { id: 1, nameOrganization: "Western University", address: "1151 Richmond Street", city: "London", prov: "ON", primaryContact: "Francois Lagugne-Labarthet, Primary Investigator", email1: "flagugne@uwo.ca", phone1: "519-661-2111 x81006", additionalContact: "Cameron Brown, Project Manager", email2: "cbrown58@uwo.ca", phone2: "226-238-9970", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "NA", lat: 42.9849, lng: -81.2453, isLead: true },
    { id: 2, nameOrganization: "Regional HIV/AIDS Connection (RHAC)", address: "446 York Street", city: "London", prov: "ON", primaryContact: "Lily Bialas, Interim Director of Harm Reduction", email1: "lbialas@hivaidsconnection.ca", phone1: "226-377-8721", additionalContact: "Donovan Wiebe", email2: "DWiebe@hivaidsconnection.ca", phone2: "519-434-1601", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "NA", lat: 42.9835, lng: -81.2497 },
    { id: 3, nameOrganization: "Sandy Hill Community Health Centre", address: "221 Nelson Street", city: "Ottawa", prov: "ON", primaryContact: "Dean Dewar", email1: "ddewar@sandyhillchc.on.ca", phone1: "613-795-8985", additionalContact: "Fiona Miller", email2: "fmiller@sandyhillchc.on.ca", phone2: "613-277-8932", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "NA", lat: 45.4215, lng: -75.6972 },
    { id: 4, nameOrganization: "Ottawa Inner City Health", address: "5 Myrand Ave", city: "Ottawa", prov: "ON", primaryContact: "Louise Beaudoin", email1: "lbeaudoin@oich.ca", phone1: "613-797-7514", additionalContact: "Chad Bouthillier", email2: "cbouthillier@oich.ca", phone2: "613-709-9656", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "NA", lat: 45.4235, lng: -75.6919 },
    { id: 5, nameOrganization: "Lower Mainland Purpose Society", address: "40 Begbie Street", city: "New Westminster", prov: "BC", primaryContact: "Lynda Fletcher-Gordon", email1: "lyndafg@purposesociety.org", phone1: "604-526-2522", additionalContact: "Jasmine Kaur", email2: "jasmine.kaur@purposesociety.org", phone2: "236-883-5584", devicesAssigned: "1", exemptionType1: "Mobile", exemptionType2: "NA", lat: 49.2057, lng: -122.9110 },
    { id: 6, nameOrganization: "County of Grey", address: "595 9th Avenue East", city: "Owen Sound", prov: "ON", primaryContact: "Kevin McNab", email1: "kevin.mcnab@grey.ca", phone1: "519-379-0279", additionalContact: "Teresa Tibbo", email2: "Teresa.Tibbo@grey.ca", phone2: "519-379-8743", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "Mobile", lat: 44.5667, lng: -80.9333 },
    { id: 7, nameOrganization: "Guelph Community Health Centre", address: "176 Wyndham Street North", city: "Guelph", prov: "ON", primaryContact: "Lindsey Sodtke", email1: "lsodtke@guephchc.ca", phone1: "519-821-6638 Ext302", additionalContact: "Cristiane Kraft", email2: "ckraft@guelphchc.ca", phone2: "519-821-6638 Ext341", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "NA", lat: 43.5448, lng: -80.2482 },
    { id: 8, nameOrganization: "Sanguen Health Centre", address: "150 Duke Street West", city: "Kitchener", prov: "ON", primaryContact: "Leigh Wardlaw", email1: "l.wardlaw@sanguen.com", phone1: "226-789-5250", additionalContact: "Violet Umanetz", email2: "v.umanetz@sanguen.com", phone2: "519-547-7222", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "Mobile", lat: 43.4516, lng: -80.4925 },
    { id: 9, nameOrganization: "Moyo Health", address: "7700 Hurontario St. #601", city: "Brampton", prov: "ON", primaryContact: "Jillian Watkins", email1: "jillianw@moyohcs.ca", phone1: "905-361-0523 x215", additionalContact: "Adam Chalcraft", email2: "adamc@moyohcs.ca", phone2: "905-781-0223", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "NA", lat: 43.7315, lng: -79.7624 },
    { id: 10, nameOrganization: "Hamilton Urban Core Community Health Centre", address: "430 Cannon Street East", city: "Hamilton", prov: "ON", primaryContact: "Dr. Sandy Ezepue, Executive Director", email1: "ezepues@hucchc.com", phone1: "905-522-3233 Ext246", additionalContact: "Wilson Lapointe", email2: "wlapointe@hucchc.com", phone2: "TBD", devicesAssigned: "1", exemptionType1: "Mobile", exemptionType2: "NA", lat: 43.2557, lng: -79.8711 },
    { id: 11, nameOrganization: "Positive Living Niagara", address: "120 Queenston St", city: "St. Catharines", prov: "ON", primaryContact: "Talia Storm, Director of StreetWorks Services", email1: "tstorm@positivelivingniagara.com", phone1: "905-984-8684 Ext128", additionalContact: "Myrtle Stage, CTS Supervisor", email2: "mstage@positivelivingniagara.com", phone2: "905-984-8684 Ext312", devicesAssigned: "2", exemptionType1: "Non-Mobile", exemptionType2: "Mobile", lat: 43.1594, lng: -79.2469, hasBothExemptions: true },
    { id: 12, nameOrganization: "Ensemble Moncton", address: "80 Weldon Street", city: "Moncton", prov: "NB", primaryContact: "Scott Phipps", email1: "sphipps@ensemblegm.ca", phone1: "506-859-9616", additionalContact: "Josue Goguen", email2: "jgoguen@ensemblegm.ca", phone2: "506-227-6416", devicesAssigned: "2", exemptionType1: "Non-Mobile", exemptionType2: "Mobile", lat: 46.0878, lng: -64.7782, hasBothExemptions: true },
    { id: 13, nameOrganization: "Prairie Harm Reduction", address: "1516 20th St W", city: "Saskatoon", prov: "SK", primaryContact: "Kayla DeMong", email1: "admin@prairiehr.ca", phone1: "306-242-5005 Ext 4", additionalContact: "Julene Rawson", email2: "operations@prairiehr.ca", phone2: "306-242-5005 Ext4", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "NA", lat: 52.1332, lng: -106.6700 },
    { id: 14, nameOrganization: "Cochrane District Paramedic Service", address: "500 Algonquin Blvd East", city: "Timmins", prov: "ON", primaryContact: "Seamus Murphy", email1: "seamus.murphy@cdsb.care", phone1: "705-268-772 x296", additionalContact: "Chantal Riva", email2: "Chantal.riva@cdsb.care", phone2: "705-268-722 x150", devicesAssigned: "1", exemptionType1: "Mobile", exemptionType2: "NA", lat: 48.4758, lng: -81.3304 },
    { id: 15, nameOrganization: "Renfrew Paramedic Services", address: "450 O'Brien Rd", city: "Renfrew", prov: "ON", primaryContact: "Stephanie Rose", email1: "SRose@countyofrenfrew.on.ca", phone1: "613-818-9813", additionalContact: "Kaylie Kuehl, Community Paramedicine Program Clinical Coordinator", email2: "KKuehl@countyofrenfrew.on.ca", phone2: "613-818-9813", devicesAssigned: "1", exemptionType1: "Mobile", exemptionType2: "NA", lat: 45.4729, lng: -76.6867 },
    { id: 16, nameOrganization: "Peterborough AIDS Resource Network", address: "60 Hunter St E 2nd Floor", city: "Peterborough", prov: "ON", primaryContact: "Dane Record", email1: "executivedirector@parn.ca", phone1: "705-559-0656", additionalContact: "Aizha Pollock", email2: "aizha@parn.ca", phone2: "705-749-9110 Ext206", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "NA", lat: 44.3091, lng: -78.3197 },
    { id: 17, nameOrganization: "Travailderue", address: "221 Rue Tessier", city: "Chicoutimi", prov: "QC", primaryContact: "Stéphanie Bouchard", email1: "stephanie.bouchard@strchic.com", phone1: "418-545-0999", additionalContact: "Janick Meunier", email2: "janick.meunier@strchic.com", phone2: "418-545-0999", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "NA", lat: 48.4284, lng: -71.0649 },
    { id: 18, nameOrganization: "NHC Society", address: "76 Esplanade", city: "Truro", prov: "NS", primaryContact: "Albert McNutt, Executive Director", email1: "super@nhcsociety.ca", phone1: "902-895-0931", additionalContact: "TBD", email2: "TBD", phone2: "902-324-7201", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "NA", lat: 45.3669, lng: -63.2755 },
    { id: 19, nameOrganization: "Breakaway", address: "21 Strickland Ave", city: "Toronto", prov: "ON", primaryContact: "Ruben Tarajano", email1: "Rubent@breakawaycs.ca", phone1: "647-883-1135", additionalContact: "Angie Porter", email2: "AngieP@breakawaycs.ca", phone2: "416-537-9346 Ext235", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "NA", lat: 43.6532, lng: -79.3832 },
    { id: 20, nameOrganization: "AIDS New Brunswick", address: "354 King St", city: "Fredericton", prov: "NB", primaryContact: "Linda Thompson-Brown", email1: "linda@aidsnb.com", phone1: "506-455-2625", additionalContact: "Jess Gionet", email2: "Jess.gionet@aidsnb.com", phone2: "506-478-4765", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "NA", lat: 45.9636, lng: -66.6431 },
    { id: 21, nameOrganization: "Avenue B Harm Reduction Inc.", address: "62 Waterloo St", city: "Saint John", prov: "NB", primaryContact: "Laura MacNeill", email1: "laura.macneill@avenueb.ca", phone1: "506-652-2437", additionalContact: "Allie Myles", email2: "allie.myles@avenueb.ca", phone2: "506-652-2437", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "NA", lat: 45.2733, lng: -66.0633 },
    { id: 22, nameOrganization: "Boyle Street Service Society", address: "10740 99 St NW", city: "Edmonton", prov: "AB", primaryContact: "Sindi Addorisio", email1: "saddorisio@boylestreet.org", phone1: "587-340-2985", additionalContact: "Alyssa Miller", email2: "amiller@boylestreet.org", phone2: "780-424-4106", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "Mobile", lat: 53.5461, lng: -113.4938 }
  ];

  const getSitesByProvince = () => {
    const byProvince = {};
    partnersData.forEach(site => { if (!byProvince[site.prov]) byProvince[site.prov] = []; byProvince[site.prov].push(site.nameOrganization); });
    return byProvince;
  };

  const sitesByProvince = getSitesByProvince();
  const getMobileSites = () => partnersData.filter(site => site.exemptionType1 === "Mobile" || site.exemptionType2 === "Mobile");
  const getNonMobileSites = () => partnersData.filter(site => site.exemptionType1 === "Non-Mobile" || site.exemptionType2 === "Non-Mobile");
  const getStatistics = () => {
    const provinces = [...new Set(partnersData.map(s => s.prov))];
    const totalDevices = partnersData.reduce((sum, s) => sum + parseInt(s.devicesAssigned), 0);
    return { totalPartners: partnersData.length, provinces, totalDevices, mobileSites: getMobileSites(), nonMobileSites: getNonMobileSites() };
  };
  const stats = getStatistics();

  const ProjectTimeline = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const today = new Date();
    const fy1End = new Date('2025-03-31'), fy2End = new Date('2026-03-31'), fy3End = new Date('2027-03-31'), projectEnd = new Date('2028-03-31');
    let fyNumber, fyProgress;
    if (today <= fy1End) { fyNumber = 0; fyProgress = (today - new Date('2024-04-01')) / (fy1End - new Date('2024-04-01')); }
    else if (today <= fy2End) { fyNumber = 1; fyProgress = (today - new Date('2025-04-01')) / (fy2End - new Date('2025-04-01')); }
    else if (today <= fy3End) { fyNumber = 2; fyProgress = (today - new Date('2026-04-01')) / (fy3End - new Date('2026-04-01')); }
    else { fyNumber = 3; fyProgress = (today - new Date('2027-04-01')) / (projectEnd - new Date('2027-04-01')); }
    const progressPercent = Math.min(Math.max(((fyNumber + fyProgress) / 4) * 100, 0), 100);
    const currentYear = today.getFullYear();
    const dayOfYear = Math.floor((today - new Date(currentYear, 0, 1)) / (1000 * 60 * 60 * 24)) + 1;
    const daysInYear = ((currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0) ? 366 : 365;
    // Timeline spans 2022–2028 (6 years). Calculate exact position.
    const timelineStart = new Date('2022-01-01');
    const timelineEnd = new Date('2028-12-31');
    const hcProgressPercent = Math.min(98, Math.max(2, ((today - timelineStart) / (timelineEnd - timelineStart)) * 100));
    const formatDate = (d) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const challengeUrl = "https://impact.canada.ca/en/challenges/drug-checking-challenge";
    return (
      <div className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4 cursor-pointer flex items-center justify-between" onClick={() => setIsExpanded(!isExpanded)}>
          <h2 className="flex items-center gap-2 font-bold text-2xl"><Clock size={28} />Project Background & Timeline</h2>
          <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-lg">
            <span className="text-sm font-medium">{isExpanded ? 'Collapse' : 'Expand'}</span>
            {isExpanded ? <ChevronUp size={28} strokeWidth={2.5} /> : <ChevronDown size={28} strokeWidth={2.5} />}
          </div>
        </div>
        {isExpanded && <div className="p-6 bg-gradient-to-br from-white to-purple-50">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">Drug Checking Technology Challenge (2018-2021)<a href={challengeUrl} target="_blank" rel="noopener noreferrer" className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm hover:bg-purple-700 flex items-center gap-1">Learn More <ExternalLink size={14} /></a></h3>
            <div className="relative">
              <div className="absolute top-1/2 left-0 right-0 h-2 bg-gradient-to-r from-purple-400 via-purple-600 to-purple-800 transform -translate-y-1/2"></div>
              <div className="relative flex justify-between items-center py-8">
                <div className="flex flex-col items-center"><div className="bg-purple-600 text-white font-bold text-lg px-4 py-2 rounded-full shadow-lg mb-2 flex items-center gap-1">2018 <Check size={16} className="text-green-300" /></div><div className="w-5 h-5 bg-purple-600 rounded-full border-4 border-white shadow-lg"></div><div className="mt-4 bg-gradient-to-br from-purple-100 to-purple-200 p-3 rounded-xl shadow-lg border-2 border-purple-300 max-w-[180px] text-center"><div className="font-bold text-purple-900 text-sm">Challenge Launched</div><div className="text-xs text-purple-700 mt-1">October 2018</div><div className="text-xs text-purple-600">Health Canada</div></div></div>
                <div className="flex flex-col items-center"><div className="mb-4 bg-gradient-to-br from-purple-100 to-purple-200 p-3 rounded-xl shadow-lg border-2 border-purple-300 max-w-[150px] text-center"><div className="font-bold text-purple-900 text-sm">Application Deadline</div></div><div className="w-5 h-5 bg-purple-500 rounded-full border-4 border-white shadow-lg"></div><div className="bg-purple-500 text-white font-bold text-lg px-4 py-2 rounded-full shadow-lg mt-2 flex items-center gap-1">2019 <Check size={16} className="text-green-300" /></div></div>
                <div className="flex flex-col items-center"><div className="bg-purple-500 text-white font-bold text-lg px-4 py-2 rounded-full shadow-lg mb-2 flex items-center gap-1">2020 <Check size={16} className="text-green-300" /></div><div className="w-5 h-5 bg-purple-500 rounded-full border-4 border-white shadow-lg"></div><div className="mt-4 bg-gradient-to-br from-purple-100 to-purple-200 p-3 rounded-xl shadow-lg border-2 border-purple-300 max-w-[150px] text-center"><div className="font-bold text-purple-900 text-sm">Pilot-Phase</div></div></div>
                <div className="flex flex-col items-center"><div className="mb-4 bg-gradient-to-br from-yellow-100 to-yellow-200 p-3 rounded-xl shadow-lg border-2 border-yellow-400 max-w-[220px] text-center"><div className="flex items-center justify-center gap-1 mb-1"><Trophy className="text-yellow-600" size={16} /><span className="font-bold text-yellow-800 text-sm">Scatr Wins!</span></div><div className="text-xs text-yellow-700">$1,000,000 Prize</div></div><div className="w-6 h-6 bg-yellow-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center"><Trophy className="text-white" size={12} /></div><div className="bg-purple-700 text-white font-bold text-lg px-4 py-2 rounded-full shadow-lg mt-2 flex items-center gap-1">2021 <Check size={16} className="text-green-300" /></div></div>
              </div>
            </div>
          </div>
          <div className="mt-8 mb-8">
            <h3 className="text-xl font-bold text-purple-900 mb-4">Health Canada Contribution Agreements w/ Western University (2022-2028)</h3>
            <div className="relative pt-12">
              <div className="absolute top-0 flex flex-col items-center z-10" style={{ left: `${hcProgressPercent}%`, transform: 'translateX(-50%)' }}>
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white px-2 py-1 rounded-lg shadow-lg text-xs font-bold whitespace-nowrap">We Are Here</div>
                <div className="text-xs text-green-700 font-medium whitespace-nowrap">{formatDate(today)}</div>
                <div className="w-1 h-6 bg-green-500 mt-1"></div>
              </div>
              <div className="absolute top-12 left-0 right-0 h-2 bg-gradient-to-r from-purple-400 via-purple-600 to-purple-800"></div>
              <div className="relative flex justify-between items-start pt-8" style={{ marginTop: '8px' }}>
                <div className="flex flex-col items-center"><div className="bg-purple-600 text-white font-bold text-sm px-3 py-1 rounded-full shadow-lg mb-2">2022</div><div className="w-5 h-5 bg-purple-600 rounded-full border-4 border-white shadow-lg"></div><div className="mt-4 bg-gradient-to-br from-purple-100 to-purple-200 p-3 rounded-xl shadow-lg border-2 border-purple-300 max-w-[220px] text-center"><div className="font-bold text-purple-900 text-sm">Phase #1</div><div className="text-xs text-purple-600 mt-1">Creating a Drug Checking Network Using ML Enabled Spectrometers</div></div></div>
                <div className="flex flex-col items-center"><div className="bg-purple-500 text-white font-bold text-sm px-3 py-1 rounded-full shadow-lg mb-2">2023</div><div className="w-4 h-4 bg-purple-500 rounded-full border-4 border-white shadow-lg"></div></div>
                <div className="flex flex-col items-center"><div className="mb-2 bg-gradient-to-br from-purple-200 to-purple-300 p-3 rounded-xl shadow-lg border-2 border-purple-400 max-w-[220px] text-center"><div className="font-bold text-purple-900 text-sm">Phase #2</div><div className="text-xs text-purple-600 mt-1">Leading the Way: PWLLE at the Forefront</div></div><div className="w-5 h-5 bg-purple-600 rounded-full border-4 border-white shadow-lg"></div><div className="bg-purple-600 text-white font-bold text-sm px-3 py-1 rounded-full shadow-lg mt-2">2024</div></div>
                <div className="flex flex-col items-center"><div className="bg-purple-500 text-white font-bold text-sm px-3 py-1 rounded-full shadow-lg mb-2">2025</div><div className="w-4 h-4 bg-purple-500 rounded-full border-4 border-white shadow-lg"></div></div>
                <div className="flex flex-col items-center"><div className="bg-purple-500 text-white font-bold text-sm px-3 py-1 rounded-full shadow-lg mb-2">2026</div><div className="w-4 h-4 bg-purple-500 rounded-full border-4 border-white shadow-lg"></div></div>
                <div className="flex flex-col items-center"><div className="bg-purple-500 text-white font-bold text-sm px-3 py-1 rounded-full shadow-lg mb-2">2027</div><div className="w-4 h-4 bg-purple-500 rounded-full border-4 border-white shadow-lg"></div></div>
                <div className="flex flex-col items-center"><div className="bg-purple-800 text-white font-bold text-sm px-3 py-1 rounded-full shadow-lg mb-2">2028</div><div className="w-5 h-5 bg-purple-800 rounded-full border-4 border-white shadow-lg"></div><div className="mt-4 bg-gradient-to-br from-purple-100 to-purple-200 p-2 rounded-xl shadow-lg border-2 border-purple-300 max-w-[100px] text-center"><div className="font-bold text-purple-900 text-xs">Project End</div><div className="text-xs text-purple-600">Mar 31, 2028</div></div></div>
              </div>
            </div>
          </div>
          <div className="mt-24">
            <h3 className="text-xl font-bold text-purple-900 mb-4">Phase #2 (CURRENT) Project Fiscal Years (April 1, 2024 - March 31, 2028)</h3>
            <div className="relative pt-16 pb-8">
              <div className="absolute top-0 flex flex-col items-center z-10" style={{ left: `${progressPercent}%`, transform: 'translateX(-50%)' }}>
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white px-3 py-1.5 rounded-lg shadow-lg text-sm font-bold whitespace-nowrap">We Are Here</div>
                <div className="text-xs text-green-700 font-medium mt-1 whitespace-nowrap">{formatDate(today)}</div>
                <div className="w-1 h-8 bg-green-500 mt-1"></div>
              </div>
              <div className="relative h-16 bg-gray-200 rounded-full overflow-hidden shadow-inner mt-8">
                <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-l-full" style={{ width: `${progressPercent}%` }}></div>
                <div className="absolute inset-0 flex">
                  {['Fiscal Year 1\nApr 1, 2024 - Mar 31, 2025','Fiscal Year 2\nApr 1, 2025 - Mar 31, 2026','Fiscal Year 3\nApr 1, 2026 - Mar 31, 2027','Fiscal Year 4\nApr 1, 2027 - Mar 31, 2028'].map((fy, i) => (
                    <div key={i} className={`flex-1 ${i < 3 ? 'border-r-2 border-white' : ''} flex items-center justify-center`}>
                      <div className="text-center">
                        <div className="font-bold text-purple-900 text-sm">{fy.split('\n')[0]}</div>
                        <div className="text-xs text-purple-700">{fy.split('\n')[1]}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between mt-2">
                <div className="text-center"><div className="font-bold text-purple-800 text-sm">Start</div><div className="text-xs text-purple-600">April 1, 2024</div></div>
                <div className="text-center"><div className="font-bold text-purple-800 text-sm">End</div><div className="text-xs text-purple-600">March 31, 2028</div></div>
              </div>
            </div>
          </div>
        </div>}
      </div>
    );
  };

  const SiteDetails = ({ site }) => (
    <div className="text-sm space-y-1">
      <div className="font-bold text-purple-900 text-base mb-2">{site.nameOrganization}</div>
      <div><span className="font-semibold">Address:</span> {site.address}, {site.city}, {site.prov}</div>
      <div><span className="font-semibold">Primary Contact:</span> {site.primaryContact}</div>
      <div><span className="font-semibold">Email:</span> {site.email1}</div>
      <div><span className="font-semibold">Phone:</span> {site.phone1}</div>
      <div><span className="font-semibold">Additional Contact:</span> {site.additionalContact}</div>
      <div><span className="font-semibold">Email:</span> {site.email2}</div>
      <div><span className="font-semibold">Phone:</span> {site.phone2}</div>
      <div><span className="font-semibold">Devices Assigned:</span> {site.devicesAssigned}</div>
      <div><span className="font-semibold">Exemption Type #1:</span> {site.exemptionType1}</div>
      {site.exemptionType2 !== "NA" && <div><span className="font-semibold">Exemption Type #2:</span> {site.exemptionType2}</div>}
    </div>
  );

  const MapView = () => (
    <div className="h-[600px] rounded-xl overflow-hidden shadow-2xl border-4 border-purple-200 relative">
      <MapContainer center={[52.0, -95.0]} zoom={4} style={{ height: '100%', width: '100%' }}>
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ResetMapButton />
        {partnersData.map((site) => (
          <Marker key={site.id} position={[site.lat, site.lng]}>
            <Tooltip permanent direction="top" offset={[0, -10]} className="font-semibold text-xs">{site.nameOrganization.length > 25 ? site.nameOrganization.substring(0, 22) + '...' : site.nameOrganization}</Tooltip>
            <Popup maxWidth={350}><SiteDetails site={site} /></Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );

  const TableView = () => (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl shadow-2xl border-4 border-purple-200">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-purple-700 to-purple-900 text-white">
              <th className="border border-purple-300 p-2 text-left font-bold">Name/Organization</th>
              <th className="border border-purple-300 p-2 text-left font-bold">Address</th>
              <th className="border border-purple-300 p-2 text-left font-bold">City</th>
              <th className="border border-purple-300 p-2 text-left font-bold">Prov</th>
              <th className="border border-purple-300 p-2 text-left font-bold">Primary Contact</th>
              <th className="border border-purple-300 p-2 text-left font-bold">Email</th>
              <th className="border border-purple-300 p-2 text-left font-bold">Phone</th>
              <th className="border border-purple-300 p-2 text-left font-bold">Additional Contact</th>
              <th className="border border-purple-300 p-2 text-left font-bold">Email</th>
              <th className="border border-purple-300 p-2 text-left font-bold">Phone</th>
              <th className="border border-purple-300 p-2 text-left font-bold">Devices</th>
              <th className="border border-purple-300 p-2 text-left font-bold">Type #1</th>
              <th className="border border-purple-300 p-2 text-left font-bold">Type #2</th>
            </tr>
          </thead>
          <tbody>
            {partnersData.map((site, idx) => (
              <tr key={site.id} onClick={() => toggleRow(site.id)} className={`cursor-pointer transition-all duration-200 ${expandedRow === site.id ? 'bg-purple-200 scale-[1.02] shadow-lg z-10 relative' : site.isLead ? 'bg-purple-200 border-4 border-purple-600' : idx % 2 === 0 ? 'bg-purple-50 hover:bg-purple-100' : 'bg-white hover:bg-purple-50'}`}>
                <td className={`border border-purple-200 p-2 font-bold text-purple-900 ${expandedRow === site.id ? 'text-base py-4' : ''}`}>{site.nameOrganization}</td>
                <td className={`border border-purple-200 p-2 ${expandedRow === site.id ? 'py-4' : ''}`}>{site.address}</td>
                <td className={`border border-purple-200 p-2 ${expandedRow === site.id ? 'py-4' : ''}`}>{site.city}</td>
                <td className={`border border-purple-200 p-2 ${expandedRow === site.id ? 'py-4' : ''}`}>{site.prov}</td>
                <td className={`border border-purple-200 p-2 ${expandedRow === site.id ? 'py-4' : ''}`}>{site.primaryContact}</td>
                <td className={`border border-purple-200 p-2 text-blue-700 ${expandedRow === site.id ? 'py-4' : ''}`}>{site.email1}</td>
                <td className={`border border-purple-200 p-2 ${expandedRow === site.id ? 'py-4' : ''}`}>{site.phone1}</td>
                <td className={`border border-purple-200 p-2 ${expandedRow === site.id ? 'py-4' : ''}`}>{site.additionalContact}</td>
                <td className={`border border-purple-200 p-2 text-blue-700 ${expandedRow === site.id ? 'py-4' : ''}`}>{site.email2}</td>
                <td className={`border border-purple-200 p-2 ${expandedRow === site.id ? 'py-4' : ''}`}>{site.phone2}</td>
                <td className={`border border-purple-200 p-2 font-bold text-center ${expandedRow === site.id ? 'py-4' : ''}`}>{site.devicesAssigned}</td>
                <td className={`border border-purple-200 p-2 ${expandedRow === site.id ? 'py-4' : ''}`}>{site.exemptionType1}</td>
                <td className={`border border-purple-200 p-2 ${expandedRow === site.id ? 'py-4' : ''}`}>{site.exemptionType2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 text-center italic">Click on any row to expand for easier viewing</p>
    </div>
  );

  const ResearchDocuments = () => (
    <div className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4">
        <h2 className="flex items-center gap-2 font-bold text-2xl"><FileText size={28} />Research, Ethics & Exemptions Documents</h2>
      </div>
      <div className="p-6 bg-gradient-to-br from-white to-purple-50 space-y-6">
        <div className="bg-gradient-to-br from-red-50 to-white p-4 rounded-xl border-2 border-red-200">
          <h3 className="font-bold text-lg text-red-900 mb-3 flex items-center gap-2"><AlertTriangle size={18} className="text-red-600" />Policy & Announcements</h3>
          <div className="space-y-2">
            <a href="/SCS-Closure-Information-Mar2026.pdf" target="_blank" className="flex items-center gap-2 text-red-700 hover:text-red-900 text-sm p-2 bg-white rounded border border-red-200 hover:bg-red-50"><Download size={16} />Ontario CTS Funding Announcement — Drug-Checking Partner Information Document (March 17, 2026)</a>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border-2 border-purple-200">
          <h3 className="font-bold text-lg text-purple-900 mb-3">Research</h3>
          <div className="space-y-2">
            <a href="/SOP-Sample-Preparation.pdf" target="_blank" className="flex items-center gap-2 text-purple-700 hover:text-purple-900 text-sm p-2 bg-white rounded border border-purple-200 hover:bg-purple-50"><Download size={16} />Standard Operating Procedures for Sample Preparation (PDF)</a>
            <a href="/Scatr-Results-FAQ.pdf" target="_blank" className="flex items-center gap-2 text-purple-700 hover:text-purple-900 text-sm p-2 bg-white rounded border border-purple-200 hover:bg-purple-50"><Download size={16} />Scatr Results Explanation Document (PDF)</a>
            <a href="/Scatr-LOD-Study.pdf" target="_blank" className="flex items-center gap-2 text-purple-700 hover:text-purple-900 text-sm p-2 bg-white rounded border border-purple-200 hover:bg-purple-50"><Download size={16} />Scatr Series One LOD Study (PDF)</a>
            <a href="/Scatr-Technical-Research-Strategy.pdf" target="_blank" className="flex items-center gap-2 text-purple-700 hover:text-purple-900 text-sm p-2 bg-white rounded border border-purple-200 hover:bg-purple-50"><Download size={16} />Scatr Technical Research Strategy (PDF)</a>
            <a href="/Canadian-Substance-Use-Costs-Harms-2007-2020.pdf" target="_blank" className="flex items-center gap-2 text-purple-700 hover:text-purple-900 text-sm p-2 bg-white rounded border border-purple-200 hover:bg-purple-50"><Download size={16} />Canadian Substance Use Costs and Harms Report 2007-2020 (PDF)</a>
            <a href="/CIHR-SCS-Operational-Guidance-2023.pdf" target="_blank" className="flex items-center gap-2 text-purple-700 hover:text-purple-900 text-sm p-2 bg-white rounded border border-purple-200 hover:bg-purple-50"><Download size={16} />National Operational Guidance for Supervised Consumption Services - CIHR July 2023 (PDF)</a>
            <a href="/CAPSA-Annual-Report-2023-2024.pdf" target="_blank" className="flex items-center gap-2 text-purple-700 hover:text-purple-900 text-sm p-2 bg-white rounded border border-purple-200 hover:bg-purple-50"><Download size={16} />Community Addictions Peer Support Association (CAPSA). Annual Report 2023-2024 (PDF)</a>
            <a href="/Ontario-CCRA-2024.pdf" target="_blank" className="flex items-center gap-2 text-purple-700 hover:text-purple-900 text-sm p-2 bg-white rounded border border-purple-200 hover:bg-purple-50"><Download size={16} />Ontario Community Care and Recovery Act 2024 (PDF)</a>
            <a href="/Canadian-Drugs-Substances-Strategy-2023.pdf" target="_blank" className="flex items-center gap-2 text-purple-700 hover:text-purple-900 text-sm p-2 bg-white rounded border border-purple-200 hover:bg-purple-50"><Download size={16} />Government of Canada. The Canadian Drugs and Substances Strategy 2023 (PDF)</a>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border-2 border-purple-200">
          <h3 className="font-bold text-lg text-purple-900 mb-3">Ethics</h3>
          <div className="space-y-2">
            <a href="/LOI-Phase1.pdf" target="_blank" className="flex items-center gap-2 text-purple-700 hover:text-purple-900 text-sm p-2 bg-white rounded border border-purple-200 hover:bg-purple-50"><Download size={16} />Drug-Checking Device Use - Letter of Information & Consent (PDF)</a>
            <a href="/LOI-DCP-Training.pdf" target="_blank" className="flex items-center gap-2 text-purple-700 hover:text-purple-900 text-sm p-2 bg-white rounded border border-purple-200 hover:bg-purple-50"><Download size={16} />Drug-Checking Peer Training - Letter of Information & Consent (PDF)</a>
            <a href="/DCP-Survey.pdf" target="_blank" className="flex items-center gap-2 text-purple-700 hover:text-purple-900 text-sm p-2 bg-white rounded border border-purple-200 hover:bg-purple-50"><Download size={16} />Drug-Checking Peer Training - Pre- and Post-Surveys (PDF)</a>
            <a href="/DCP-Certificate-Example.pdf" target="_blank" className="flex items-center gap-2 text-purple-700 hover:text-purple-900 text-sm p-2 bg-white rounded border border-purple-200 hover:bg-purple-50"><Download size={16} />Drug-Checking Peer Training - Example Certificate of Achievement (PDF)</a>
            <a href="/Collaborative-Site-Agreement.pdf" target="_blank" className="flex items-center gap-2 text-purple-700 hover:text-purple-900 text-sm p-2 bg-white rounded border border-purple-200 hover:bg-purple-50"><Download size={16} />Collaborative Site Agreement - Example Template (PDF)</a>
            <a href="/DCP-Invoice-Template.docx" download className="flex items-center gap-2 text-purple-700 hover:text-purple-900 text-sm p-2 bg-white rounded border border-purple-200 hover:bg-purple-50"><Download size={16} />DCP Training &amp; Certification — Invoice Submission Package (Word)</a>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border-2 border-purple-200">
          <h3 className="font-bold text-lg text-purple-900 mb-3">Exemptions</h3>
          <div className="space-y-2">
            <a href="/Exemption-56-Template.pdf" target="_blank" className="flex items-center gap-2 text-purple-700 hover:text-purple-900 text-sm p-2 bg-white rounded border border-purple-200 hover:bg-purple-50"><Download size={16} />Exemption 56 Approved - Redacted Template (PDF)</a>
            <a href="/Exemption-56-Blank.pdf" target="_blank" className="flex items-center gap-2 text-purple-700 hover:text-purple-900 text-sm p-2 bg-white rounded border border-purple-200 hover:bg-purple-50"><Download size={16} />Exemption 56 Application - Blank Template (PDF)</a>
          </div>
        </div>
        <p className="text-xs text-gray-500 italic">Click to view or download PDF documents</p>
      </div>
    </div>
  );

  const linksData = [
    { title: "Western University News: Health Canada Grant", url: "https://news.westernu.ca/2023/04/health-canada-grant-funds-innovative-drug-checking-technology/", description: "Chemistry professor Francois Lagugné-Labarthet teams up with Scatr Inc. to pilot drug-checking technology.", category: "Western University" },
    { title: "FLL Group Bio", url: "https://publish.uwo.ca/~flagugne/#about", description: "Principal Investigator's research group at Western University.", category: "Western University" },
    { title: "Scatr Portal (Partner Login)", url: "https://scatr.ca/auth", description: "Secure login for partners to access the drug-checking data management system.", category: "Scatr Inc." },
    { title: "Scatr Live Dashboard", url: "https://scatr.live/", description: "Public dashboard with real-time drug-checking results across the network.", category: "Scatr Inc." },
    { title: "Grand Prize Winner Announcement", url: "https://www.canada.ca/en/health-canada/news/2021/07/government-of-canada-announces-the-grand-prize-winner-of-the-drug-checking-technology-challenge.html", description: "Health Canada announces Scatr Inc. as the $1 million grand prize winner.", category: "Scatr Inc." },
    { title: "Impact Canada - Drug Checking Challenge", url: "https://impact.canada.ca/en/challenges/drug-checking-challenge", description: "Official Government of Canada page for the Drug Checking Technology Challenge.", category: "Scatr Inc." },
    { title: "Regional HIV/AIDS Connection (RHAC)", url: "https://www.hivaidsconnection.ca/carepoint", description: "London's Carepoint supervised consumption and harm reduction service — project partner site.", category: "Project Partners" },
    { title: "Sandy Hill Community Health Centre", url: "https://www.sandyhillchc.on.ca/", description: "Ottawa community health centre — project partner site.", category: "Project Partners" },
    { title: "Ottawa Inner City Health", url: "https://oich.ca/", description: "Ottawa inner city health services — project partner site.", category: "Project Partners" },
    { title: "Lower Mainland Purpose Society", url: "https://www.purposesociety.org/", description: "New Westminster, BC harm reduction and community services — project partner site.", category: "Project Partners" },
    { title: "County of Grey — Public Health", url: "https://www.grey.ca/health-community-services/public-health", description: "Owen Sound, ON public health services — project partner site.", category: "Project Partners" },
    { title: "Guelph Community Health Centre", url: "https://www.guelphchc.ca/", description: "Guelph, ON community health and harm reduction services — project partner site.", category: "Project Partners" },
    { title: "Sanguen Health Centre — Drug Checking", url: "https://www.sanguen.com/drug-checking", description: "Drug checking services at Sanguen Health Centre, Kitchener — project partner site.", category: "Project Partners" },
    { title: "Moyo Health & Community Services", url: "https://moyohcs.ca/", description: "Brampton, ON community health and harm reduction services — project partner site.", category: "Project Partners" },
    { title: "Hamilton Urban Core Community Health Centre", url: "https://hucchc.com/", description: "Hamilton, ON community health and harm reduction services — project partner site.", category: "Project Partners" },
    { title: "Positive Living Niagara", url: "https://www.positivelivingniagara.com/", description: "St. Catharines, ON HIV/AIDS and harm reduction services — project partner site.", category: "Project Partners" },
    { title: "Ensemble Moncton", url: "https://www.ensemblegm.ca/", description: "Moncton, NB harm reduction and supervised consumption services — project partner site.", category: "Project Partners" },
    { title: "Prairie Harm Reduction", url: "https://prairiehr.ca/", description: "Saskatoon, SK harm reduction services — project partner site.", category: "Project Partners" },
    { title: "Cochrane District Services Board (CDSB)", url: "https://www.cdsb.care/", description: "Timmins, ON paramedic and community services — project partner site.", category: "Project Partners" },
    { title: "Renfrew County & District Health Unit", url: "https://www.rcdhu.com/", description: "Renfrew, ON public health and paramedic services — project partner site.", category: "Project Partners" },
    { title: "Peterborough AIDS Resource Network (PARN)", url: "https://www.parn.ca/", description: "Peterborough, ON HIV/AIDS and harm reduction services — project partner site.", category: "Project Partners" },
    { title: "Travail de rue de Chicoutimi", url: "https://www.travailderue-chicoutimi.org/", description: "Chicoutimi, QC community outreach and harm reduction services — project partner site.", category: "Project Partners" },
    { title: "NHC Society (Northern Healthy Connections)", url: "https://nhcsociety.ca/", description: "Truro, NS harm reduction and community health services — project partner site.", category: "Project Partners" },
    { title: "Breakaway Community Services", url: "https://www.breakawaycs.ca/", description: "Toronto, ON harm reduction and social services — project partner site.", category: "Project Partners" },
    { title: "AIDS New Brunswick", url: "https://www.aidsnb.com/", description: "Fredericton, NB HIV/AIDS and harm reduction services — project partner site.", category: "Project Partners" },
    { title: "Avenue B Harm Reduction", url: "https://avenueb.ca/", description: "Saint John, NB harm reduction and HIV/AIDS services — project partner site.", category: "Project Partners" },
    { title: "Boyle Street Community Services", url: "https://www.boylestreet.org/", description: "Edmonton, AB community services and harm reduction — project partner site.", category: "Project Partners" },
    { title: "Health Canada - SUAP Active Projects", url: "https://www.canada.ca/en/health-canada/services/substance-use/canadian-drugs-substances-strategy/funding/substance-use-addictions-program/active-projects.html", description: "List of active projects funded through the Substance Use and Addictions Program.", category: "Health Canada" },
    { title: "Health Canada - Office of Controlled Substances", url: "https://www.canada.ca/en/health-canada/corporate/contact-us/office-controlled-substances.html", description: "Contact information for Health Canada's Office of Controlled Substances.", category: "Health Canada" },
    { title: "Health Canada - Opioid/Stimulant Harms", url: "https://health-infobase.canada.ca/substance-related-harms/opioids-stimulants/", description: "Latest statistics on opioid and stimulant-related harms in Canada.", category: "Health Canada" },
    { title: "Health Canada - SCS Statistics", url: "https://www.canada.ca/en/health-canada/services/substance-use/supervised-consumption-sites/status-application.html", description: "Federal statistics on supervised consumption sites in Canada.", category: "Health Canada" },
    { title: "BCCSU Drug Checking", url: "https://drugcheckingbc.ca/", description: "BC Centre on Substance Use drug checking program information.", category: "Other" },
    { title: "CCSA - Drug Checking", url: "https://www.ccsa.ca/drug-checking", description: "Canadian Centre on Substance Use resources on drug checking.", category: "Other" },
    { title: "CCRA 2024 Legislation", url: "https://www.ontario.ca/laws/statute/24c27", description: "Full text of Ontario's Community Care and Recovery Act.", category: "Other" },
    { title: "CATIE - Harm Reduction Toolkit", url: "https://www.catie.ca/harm-reduction-fundamentals-a-toolkit-for-service-providers", description: "Comprehensive toolkit for implementing harm reduction approaches.", category: "Other" },
    { title: "CSUCH - Costs and Harms Reports", url: "https://csuch.ca/publications/substance-use-costs-and-harms/", description: "Reports on economic and health burden of substance use.", category: "Other" },
    { title: "Harm Reduction Journal", url: "https://harmreductionjournal.biomedcentral.com/", description: "Open-access journal on harm reduction approaches to drug use.", category: "Other" },
  ];

  const RelatedLinks = () => {
    const categories = ['Western University', 'Scatr Inc.', 'Project Partners', 'Health Canada', 'Other'];
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-6 border-4 border-purple-100">
        <div className="flex items-center gap-3 mb-6"><ExternalLink className="text-purple-700" size={32} /><h2 className="font-bold text-2xl text-purple-900">Related Links & Resources</h2></div>
        <div className="space-y-6">
          {categories.map((category) => {
            const categoryLinks = linksData.filter(link => link.category === category);
            if (categoryLinks.length === 0) return null;
            return (
              <div key={category} className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border-2 border-purple-200">
                <h3 className="font-bold text-lg text-purple-900 mb-3">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categoryLinks.map((link, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-purple-200 hover:shadow-lg transition-shadow">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-2 mb-1 text-sm">{link.title} <ExternalLink size={14} /></a>
                      <p className="text-xs text-gray-600">{link.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white" id="top">
      <BackToTop />
      {showAnnouncement && <AnnouncementBanner onDismiss={() => setShowAnnouncement(false)} />}
      <div className="bg-white shadow-lg">
        <div className="px-8 py-8">
          <div className="flex items-stretch gap-8">
            <img src="/western-logo.png" alt="Western University" style={{height: '365px', width: 'auto'}} />
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight">A Novel Concurrent Two Phase<br />Drug-Checking Initiative</h1>
              <div className="border-b-2 border-gray-300 my-2"></div>
              <p className="text-lg md:text-xl text-black font-medium">Contribution Agreement Funding Provided by Health Canada's Substance Use and Addictions Program (SUAP)</p>
              <p className="text-base mt-1">In partnership with <a href="https://scatr.ca/" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:text-blue-800 hover:underline">Scatr Inc.</a></p>
            </div>
          </div>
        </div>
        <div className="h-24 bg-purple-800"></div>
      </div>
      <ProjectCountdown />
      <div className="px-6 pt-6">
        <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl shadow-lg border-2 border-purple-200">
          <h2 className="text-3xl font-bold text-purple-900 mb-6">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border-2 border-purple-300 shadow-md text-center"><h3 className="font-bold text-2xl text-purple-900 mb-3">Phase #1</h3><p className="text-gray-800 font-semibold mb-2">Creating a Drug Checking Network Using Machine Learning Enabled Spectrometers</p><p className="text-sm text-gray-600">Contribution Agreement_Arrangement # 2223-HQ-000095</p></div>
            <div className="bg-white p-5 rounded-xl border-2 border-purple-300 shadow-md text-center"><h3 className="font-bold text-2xl text-purple-900 mb-3">Phase #2</h3><p className="text-gray-800 font-semibold mb-2">Leading the Way: PWLLE at the Forefront of Drug-Checking Initiatives</p><p className="text-sm text-gray-600">Amendment of Contribution Agreement_Arrangement # 2425-HQ-000058</p></div>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-md">
              <thead><tr className="bg-purple-100"><th className="border border-gray-200 px-4 py-3 text-left text-sm font-bold text-purple-900">Organization</th><th className="border border-gray-200 px-4 py-3 text-left text-sm font-bold text-purple-900">Project Name</th><th className="border border-gray-200 px-4 py-3 text-left text-sm font-bold text-purple-900">Description</th><th className="border border-gray-200 px-4 py-3 text-left text-sm font-bold text-purple-900">Substances</th><th className="border border-gray-200 px-4 py-3 text-left text-sm font-bold text-purple-900">Location</th><th className="border border-gray-200 px-4 py-3 text-left text-sm font-bold text-purple-900">Funding</th></tr></thead>
              <tbody><tr className="hover:bg-purple-50"><td className="border border-gray-200 px-4 py-3 text-sm text-gray-800 align-top">University of Western Ontario</td><td className="border border-gray-200 px-4 py-3 text-sm text-gray-800 align-top">Leading the Way: People with Lived and Living Experience at the Forefront of Drug-Checking Initiative</td><td className="border border-gray-200 px-4 py-3 text-sm text-gray-700 align-top">This initiative will integrate People with Lived and Living Experience (PWLLE) into drug-checking initiatives by training them in drug-checking technologies to enable them to implement drug-checking initiatives and training programs in participating harm reduction and public health centres in Alberta, Ontario, Manitoba and Nova Scotia.</td><td className="border border-gray-200 px-4 py-3 text-sm text-gray-800 align-top">Multiple substances</td><td className="border border-gray-200 px-4 py-3 text-sm text-gray-800 align-top">London, Ontario</td><td className="border border-gray-200 px-4 py-3 text-sm text-gray-800 align-top font-medium">$4,473,473</td></tr></tbody>
            </table>
            <p className="text-xs text-gray-500 mt-2 text-right">Source: <a href="https://www.canada.ca/en/health-canada/services/substance-use/canadian-drugs-substances-strategy/funding/substance-use-addictions-program/active-projects.html" target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:underline">Health Canada SUAP Active Projects</a></p>
          </div>
          <div className="mt-6">
            <p className="text-gray-800 leading-relaxed">As of today (<strong>{todayFormatted}</strong>) Phase #2 <em>"Leading the Way: PWLLE at the Forefront of Drug-Checking Initiatives"</em>, funded via Health Canada's Substance Use and Addictions Program (<a href="https://www.canada.ca/en/health-canada/services/substance-use/canadian-drugs-substances-strategy/funding/substance-use-addictions-program.html" target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:text-purple-900 underline">SUAP</a>), has successfully allocated <strong>24 total spectrometers</strong> across Canada.</p>
            <p className="text-gray-800 leading-relaxed mt-4">Looking ahead, the project aims to deploy 4 more spectrometers: 2 in Fiscal Year 3 (April 1st 2026 to March 31st 2027) and 2 in Fiscal Year 4 (April 1st 2027 to March 31st 2028), bringing the total network capacity upon project completion, to <strong>28 spectrometers</strong>.</p>
            <p className="text-gray-800 leading-relaxed mt-4">For those of you undergoing any sort of Exemption 56 related application, renewal, transfer or likewise process, please let Cameron know if he can be of any ongoing assistance at any time.</p>
            <div className="mt-4 bg-yellow-50 border-4 border-yellow-400 rounded-xl p-4">
              <p className="text-yellow-900 font-black text-lg leading-snug">⚠️ Please send Cameron copies of all Exemption-related approval documents, notices, or likewise as soon as possible, subsequent to receipt. Thank you kindly.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="bg-white p-4 rounded-xl border border-purple-200">
              <div className="font-bold text-purple-900 mb-2">Principal Investigator (PI):</div>
              <div className="text-gray-800 font-medium">Professor Francois Lagugne-Labarthet</div>
              <div className="text-gray-600">Faculty of Science, Western University · London, ON</div>
              <div className="flex items-center gap-2 mt-2 text-purple-700"><Phone size={14} /><span>519-661-2111 x81006</span></div>
              <div className="flex items-center gap-2 text-purple-700"><Mail size={14} /><a href="mailto:flagugne@uwo.ca" className="hover:underline">flagugne@uwo.ca</a></div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-purple-200">
              <div className="font-bold text-purple-900 mb-2">Project Manager:</div>
              <div className="text-gray-800 font-medium">Cameron Brown</div>
              <div className="text-gray-600">Faculty of Science, Western University · London, ON</div>
              <div className="flex items-center gap-2 mt-2 text-purple-700"><Phone size={14} /><span>226-238-9970</span></div>
              <div className="flex items-center gap-2 text-purple-700"><Mail size={14} /><a href="mailto:cbrown58@uwo.ca" className="hover:underline">cbrown58@uwo.ca</a></div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-24 bg-purple-800 mt-6"></div>
      <div className="text-center py-6 bg-white"><h2 className="text-5xl md:text-6xl font-black text-purple-900 tracking-tight">Interactive Project Partner Dashboard</h2></div>
      <div className="px-6 pb-4">
        <div className="bg-gradient-to-br from-purple-100 to-white p-6 rounded-2xl shadow-lg border-2 border-purple-200">
          <p className="text-gray-800 leading-relaxed">Welcome to the Project Partner Dashboard — a centralized platform designed to provide all project partners with comprehensive visibility into the project's network and infrastructure.</p>
          <TableOfContents />
        </div>
      </div>
      <div className="p-6 space-y-6">
        <PicturingTheProblem />
        <div id="timeline" className="scroll-mt-4"><ProjectTimeline /></div>
        <div id="news" className="scroll-mt-4"><NewsUpdatesFeed /></div>
        <div id="metrics" className="scroll-mt-4"><SummaryMetrics partnersData={partnersData} stats={stats} sitesByProvince={sitesByProvince} /></div>
        <div id="publications" className="scroll-mt-4"><ProjectPublications /></div>
        <div id="presentation" className="scroll-mt-4"><PowerPointViewer /></div>
        <div id="scatr-research" className="scroll-mt-4"><ScatrResearchPDFViewer /></div>
        <div id="documents" className="scroll-mt-4"><ResearchDocuments /></div>
        <div id="map" className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden scroll-mt-4">
          <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4"><h2 className="flex items-center gap-2 font-bold text-2xl"><MapPin size={28} />Interactive Map View of Project Partner Sites</h2></div>
          <div className="p-6 bg-gradient-to-br from-white to-purple-50"><MapView /></div>
        </div>
        <div id="table" className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden scroll-mt-4">
          <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold text-2xl"><List size={28} />Project Partner Contact Info</h2>
            <button onClick={() => printContactList(partnersData)} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors text-sm font-medium" title="Print Contact List"><Printer size={18} />Print List / Save as PDF</button>
          </div>
          <div className="p-6 bg-gradient-to-br from-white to-purple-50"><TableView /></div>
        </div>
        <div id="pwlle-sessions" className="scroll-mt-4"><PWLLETrainingSessionsTracker /></div>
        <SampleChainOfCustody partnersData={partnersData} />
        <div id="links" className="scroll-mt-4"><RelatedLinks /></div>
      </div>
    </div>
  );
};

export default ProjectPartnerDashboard;
