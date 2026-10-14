// Shared page-level components used by both dashboards. Keep identical in both repos.
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Clock, Trophy, ExternalLink, Maximize2, Minimize2, Check, FileText, BookOpen, Download, ArrowUp, AlertTriangle, Printer, Newspaper, X } from 'lucide-react';
import { SectionCard } from './ui.jsx';

export const DEFAULT_TOC = [
  { id: 'metrics', label: 'Network Summary & Analytics' },
  { id: 'onboarding', label: 'Informational Onboarding Document' },
  { id: 'csuch', label: 'Picturing the Problem' },
  { id: 'timeline', label: 'Project Background & Timeline' },
  { id: 'news', label: 'News & Updates' },
  { id: 'publications', label: 'Project-Related Publications' },
  { id: 'scatr-research', label: 'Scatr Technical Research Strategy' },
  { id: 'documents', label: 'Research, Ethics & Exemptions Documents' },
  { id: 'map', label: 'Interactive Map View of Partner Sites' },
  { id: 'table', label: 'Project Partner Contact Info' },
  { id: 'chain-of-custody', label: 'Submit Samples for Courier Pickup' },
  { id: 'links', label: 'Related Links & Resources' },
];

// ─── Document viewers ─────────────────────────────────────────────────────────
// PDFs are offered as a download/open-in-new-tab card first (works on phones);
// the inline viewer is optional.
export const PdfCard = ({ id, icon: Icon = FileText, title, url, summary, printable = false, expandedDefault = false }) => {
  const [isExpanded, setIsExpanded] = useState(expandedDefault);
  const [showInline, setShowInline] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef(null);
  const handlePrint = () => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) { iframeRef.current.contentWindow.focus(); iframeRef.current.contentWindow.print(); return; }
    } catch (err) { /* fall through */ }
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  return (
    <SectionCard id={id} icon={Icon} title={title} expanded={isExpanded} onToggle={() => setIsExpanded(!isExpanded)}
      actions={isExpanded && printable && showInline && <button type="button" onClick={handlePrint} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300" title="Print / Save as PDF"><Printer size={18} aria-hidden="true" />Print / Save as PDF</button>}>
      <div className={`bg-gradient-to-br from-white to-purple-50 ${isFullscreen ? 'fixed inset-0 z-50 p-4 overflow-auto' : 'p-6'}`}>
        {isFullscreen && <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-purple-900">{title}</h3><button type="button" onClick={() => setIsFullscreen(false)} className="p-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors" aria-label="Exit full screen"><Minimize2 size={20} className="text-purple-700" aria-hidden="true" /></button></div>}
        {!isFullscreen && (
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {summary && <p className="text-sm text-gray-700 flex-1 min-w-[16rem]">{summary}</p>}
            <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-800 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"><ExternalLink size={16} aria-hidden="true" />Open PDF</a>
            <a href={url} download className="inline-flex items-center gap-2 bg-white text-purple-700 border-2 border-purple-700 px-4 py-2 rounded-lg hover:bg-purple-50 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"><Download size={16} aria-hidden="true" />Download</a>
            <button type="button" onClick={() => setShowInline(!showInline)} aria-expanded={showInline} className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-lg hover:bg-purple-200 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500">{showInline ? 'Hide preview' : 'Preview here'}</button>
            {showInline && <button type="button" onClick={() => setIsFullscreen(true)} className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-2 rounded-lg hover:bg-purple-200 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500" aria-label="Full screen preview"><Maximize2 size={16} aria-hidden="true" /></button>}
          </div>
        )}
        {(showInline || isFullscreen) && (
          <div className={`${isFullscreen ? 'h-[calc(100%-60px)]' : 'h-[600px]'} w-full rounded-lg overflow-hidden border-2 border-purple-200 shadow-lg`}>
            <iframe ref={iframeRef} src={url} width="100%" height="100%" frameBorder="0" title={title} className="bg-white" />
          </div>
        )}
      </div>
    </SectionCard>
  );
};

export const ProjectPublications = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <SectionCard id="publications" icon={BookOpen} title="Project-Related Publications" expanded={isExpanded} onToggle={() => setIsExpanded(!isExpanded)}>
      <div className="p-6 bg-gradient-to-br from-white to-purple-50 space-y-4">
        <article className="bg-white rounded-xl border-2 border-green-300 shadow-lg p-6">
          <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0">Published</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">Open Access</span>
                <span className="text-xs text-gray-500">Harm Reduction Journal · 8 Feb 2026</span>
              </div>
              <h3 className="font-bold text-purple-900 text-lg leading-snug mb-2">Street drug monitoring with networked spectrometers powered by machine learning: a pilot study in Ontario, Canada</h3>
              <p className="text-sm text-gray-600 mb-3">Aliyari E., Brown C., Van Boheemen M., Wardlaw L., Storm T., Hopkins A.M., Ezepue S., Dewar D., Sodtke L., McNab K., Watkins J., Pham A.T., Oudshoorn A., &amp; Lagugné-Labarthet F.</p>
              <p className="text-sm text-gray-500 italic mb-4"><em>Harm Reduction Journal</em>, Volume 23, Article 45 (2026). DOI: 10.1186/s12954-026-01403-3</p>
              <p className="text-sm text-gray-700 mb-4">Reports on 7,752 street drug samples analyzed across 10 Ontario harm reduction sites over 14 months (July 2023–August 2024) using networked Raman spectrometers with ML-enabled real-time analysis. Includes comparative validation against HPLC-MS and self-reported participant consumption-related behavior change data from 3,902 respondents.</p>
              <div className="flex flex-wrap gap-3">
                <a href="https://link.springer.com/article/10.1186/s12954-026-01403-3" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-800 transition-colors text-sm font-medium"><ExternalLink size={16} aria-hidden="true" />Read Full Paper</a>
                <a href="https://link.springer.com/content/pdf/10.1186/s12954-026-01403-3.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-purple-700 border-2 border-purple-700 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"><Download size={16} aria-hidden="true" />Download PDF</a>
              </div>
            </div>
          </div>
        </article>
        <p className="text-xs text-gray-500 text-center">Further publications will be listed here as they appear.</p>
      </div>
    </SectionCard>
  );
};

export const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const toggle = () => setIsVisible(window.scrollY > 300);
    window.addEventListener('scroll', toggle);
    return () => window.removeEventListener('scroll', toggle);
  }, []);
  if (!isVisible) return null;
  return (
    <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-24 right-6 z-50 bg-purple-700 hover:bg-purple-800 text-white p-3 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300" aria-label="Back to top">
      <ArrowUp size={24} aria-hidden="true" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-sm font-medium">Back to Top</span>
    </button>
  );
};

export const AnnouncementBanner = ({ config: ANNOUNCEMENT_CONFIG, onDismiss }) => {
  if (!ANNOUNCEMENT_CONFIG || !ANNOUNCEMENT_CONFIG.isActive) return null;
  const bgColors = { info: 'bg-gradient-to-r from-blue-600 to-blue-700', warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600', urgent: 'bg-gradient-to-r from-red-600 to-red-700' };
  const icons = { info: <Newspaper size={20} aria-hidden="true" />, warning: <AlertTriangle size={20} aria-hidden="true" />, urgent: <AlertTriangle size={20} aria-hidden="true" /> };
  return (
    <div className={`${bgColors[ANNOUNCEMENT_CONFIG.type]} text-white px-4 py-3 shadow-lg`} role="status">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {icons[ANNOUNCEMENT_CONFIG.type]}
          <span className="text-sm font-medium">{ANNOUNCEMENT_CONFIG.message}</span>
          {ANNOUNCEMENT_CONFIG.link && <a href={ANNOUNCEMENT_CONFIG.link.url} className="underline hover:no-underline text-sm font-bold">{ANNOUNCEMENT_CONFIG.link.text}</a>}
        </div>
        <button type="button" onClick={onDismiss} className="p-1 hover:bg-white/20 rounded transition-colors" aria-label="Dismiss announcement"><X size={18} aria-hidden="true" /></button>
      </div>
    </div>
  );
};

export const TableOfContents = ({ sections = DEFAULT_TOC }) => {
  const scrollTo = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  return (
    <nav className="mt-4 bg-white p-4 rounded-xl border-2 border-purple-300 shadow-md" aria-label="Quick navigation">
      <div className="font-bold text-purple-900 mb-3 text-sm">Quick Navigation:</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sections.map((section) => (
          <button key={section.id} type="button" onClick={() => scrollTo(section.id)} className="text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-left flex items-center gap-2 border-2 border-purple-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400">
            <span className="text-purple-200" aria-hidden="true">→</span> {section.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

// ─── ProjectCountdown ─────────────────────────────────────────────────────────
export const ProjectCountdown = () => {
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
    <section aria-label="Project countdown" className={`mx-4 mt-4 mb-2 rounded-2xl shadow-xl border-2 overflow-hidden ${urgency}`}>
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
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(time.pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Project period elapsed">
              <div className="h-full bg-gradient-to-r from-purple-500 to-yellow-400 rounded-full" style={{ width: `${time.pct.toFixed(1)}%` }} />
            </div>
            <div className="mt-1 text-right text-xs text-gray-400">{time.pct.toFixed(1)}% of project period elapsed</div>
          </>
        )}
      </div>
    </section>
  );
};
// ─── End ProjectCountdown ─────────────────────────────────────────────────────

export const PicturingTheProblem = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <SectionCard id="csuch" title="Picturing the Problem" expanded={isExpanded} onToggle={() => setIsExpanded(!isExpanded)}>
      <div className="p-6 bg-gradient-to-br from-white to-purple-50">
        <a href="https://www.csuch.ca/explore-the-data" target="_blank" rel="noopener noreferrer" className="block hover:opacity-90 transition-opacity">
          <img src="/csuch-infographic.png" alt="Canadian Substance Use Costs and Harms infographic (CCSA, 2023)" className="w-full rounded-lg shadow-lg" />
        </a>
        <p className="text-sm text-gray-600 mt-4 text-center">Source: Canadian Centre on Substance Use and Addiction (CCSA), 2023. <a href="https://www.csuch.ca/explore-the-data" target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:text-purple-900 underline">Explore the data →</a></p>
      </div>
    </SectionCard>
  );
};

export const ProjectTimeline = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const today = new Date();
  const fy1End = new Date('2025-03-31'), fy2End = new Date('2026-03-31'), fy3End = new Date('2027-03-31'), projectEnd = new Date('2028-03-31');
  let fyNumber, fyProgress;
  if (today <= fy1End) { fyNumber = 0; fyProgress = (today - new Date('2024-04-01')) / (fy1End - new Date('2024-04-01')); }
  else if (today <= fy2End) { fyNumber = 1; fyProgress = (today - new Date('2025-04-01')) / (fy2End - new Date('2025-04-01')); }
  else if (today <= fy3End) { fyNumber = 2; fyProgress = (today - new Date('2026-04-01')) / (fy3End - new Date('2026-04-01')); }
  else { fyNumber = 3; fyProgress = (today - new Date('2027-04-01')) / (projectEnd - new Date('2027-04-01')); }
  const progressPercent = Math.min(Math.max(((fyNumber + fyProgress) / 4) * 100, 0), 100);
  const timelineStart = new Date('2022-01-01');
  const timelineEnd = new Date('2028-12-31');
  const hcProgressPercent = Math.min(98, Math.max(2, ((today - timelineStart) / (timelineEnd - timelineStart)) * 100));
  const formatDate = (d) => d.toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' });
  const challengeUrl = "https://impact.canada.ca/en/challenges/drug-checking-challenge";
  return (
    <SectionCard id="timeline" icon={Clock} title="Project Background & Timeline" expanded={isExpanded} onToggle={() => setIsExpanded(!isExpanded)}>
      <div className="p-6 bg-gradient-to-br from-white to-purple-50">
        <div className="mb-8">
          <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2 flex-wrap">Drug Checking Technology Challenge (2018-2021)<a href={challengeUrl} target="_blank" rel="noopener noreferrer" className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm hover:bg-purple-700 flex items-center gap-1">Learn More <ExternalLink size={14} aria-hidden="true" /></a></h3>
          <div className="relative overflow-x-auto">
            <div className="absolute top-1/2 left-0 right-0 h-2 bg-gradient-to-r from-purple-400 via-purple-600 to-purple-800 transform -translate-y-1/2"></div>
            <div className="relative flex justify-between items-center py-8 min-w-[640px]">
              <div className="flex flex-col items-center"><div className="bg-purple-600 text-white font-bold text-lg px-4 py-2 rounded-full shadow-lg mb-2 flex items-center gap-1">2018 <Check size={16} className="text-green-300" aria-hidden="true" /></div><div className="w-5 h-5 bg-purple-600 rounded-full border-4 border-white shadow-lg"></div><div className="mt-4 bg-gradient-to-br from-purple-100 to-purple-200 p-3 rounded-xl shadow-lg border-2 border-purple-300 max-w-[180px] text-center"><div className="font-bold text-purple-900 text-sm">Challenge Launched</div><div className="text-xs text-purple-700 mt-1">October 2018</div><div className="text-xs text-purple-600">Health Canada</div></div></div>
              <div className="flex flex-col items-center"><div className="mb-4 bg-gradient-to-br from-purple-100 to-purple-200 p-3 rounded-xl shadow-lg border-2 border-purple-300 max-w-[150px] text-center"><div className="font-bold text-purple-900 text-sm">Application Deadline</div></div><div className="w-5 h-5 bg-purple-500 rounded-full border-4 border-white shadow-lg"></div><div className="bg-purple-500 text-white font-bold text-lg px-4 py-2 rounded-full shadow-lg mt-2 flex items-center gap-1">2019 <Check size={16} className="text-green-300" aria-hidden="true" /></div></div>
              <div className="flex flex-col items-center"><div className="bg-purple-500 text-white font-bold text-lg px-4 py-2 rounded-full shadow-lg mb-2 flex items-center gap-1">2020 <Check size={16} className="text-green-300" aria-hidden="true" /></div><div className="w-5 h-5 bg-purple-500 rounded-full border-4 border-white shadow-lg"></div><div className="mt-4 bg-gradient-to-br from-purple-100 to-purple-200 p-3 rounded-xl shadow-lg border-2 border-purple-300 max-w-[150px] text-center"><div className="font-bold text-purple-900 text-sm">Pilot-Phase</div></div></div>
              <div className="flex flex-col items-center"><div className="mb-4 bg-gradient-to-br from-yellow-100 to-yellow-200 p-3 rounded-xl shadow-lg border-2 border-yellow-400 max-w-[220px] text-center"><div className="flex items-center justify-center gap-1 mb-1"><Trophy className="text-yellow-600" size={16} aria-hidden="true" /><span className="font-bold text-yellow-800 text-sm">Scatr Wins!</span></div><div className="text-xs text-yellow-700">$1,000,000 Prize</div></div><div className="w-6 h-6 bg-yellow-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center"><Trophy className="text-white" size={12} aria-hidden="true" /></div><div className="bg-purple-700 text-white font-bold text-lg px-4 py-2 rounded-full shadow-lg mt-2 flex items-center gap-1">2021 <Check size={16} className="text-green-300" aria-hidden="true" /></div></div>
            </div>
          </div>
        </div>
        <div className="mt-8 mb-8">
          <h3 className="text-xl font-bold text-purple-900 mb-4">Health Canada Contribution Agreements w/ Western University (2022-2028)</h3>
          <div className="relative pt-12 overflow-x-auto">
            <div className="min-w-[640px] relative">
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
                      <div className="text-xs text-purple-700 hidden md:block">{fy.split('\n')[1]}</div>
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
      </div>
    </SectionCard>
  );
};


