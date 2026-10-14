// Shared dashboard sections (data-driven). Keep identical in both repos.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import { MapPin, List, Users, ChevronDown, ChevronUp, CheckCircle, Clock, FileText, Download, ExternalLink, RotateCcw, Printer, Newspaper, Activity, Building2, Smartphone, Globe, Zap, Search } from 'lucide-react';
import { SectionCard, StatusBadge, STATUS_META, statusMarkerIcon, fmtDate, fmtMonth, SparkBars, DataStamp } from './ui.jsx';
import { LISTED_PARTNERS, ACTIVE_PARTNERS, NEWS_UPDATES, PWLLE_TRAINING_SESSIONS, DOCUMENT_GROUPS, LINKS, METRICS, partnersMeta, networkStats, sitesByProvince, metricsFor } from './data.js';

// ─── News ────────────────────────────────────────────────────────────────────
const TAG_CLS = { Regulatory: 'bg-red-100 text-red-800', Research: 'bg-blue-100 text-blue-800', Training: 'bg-teal-100 text-teal-800', Network: 'bg-purple-100 text-purple-800' };

export const NewsFeed = ({ id = 'news', expandedDefault = false }) => {
  const [isExpanded, setIsExpanded] = useState(expandedDefault);
  const [showAll, setShowAll] = useState(false);
  const [tag, setTag] = useState('All');
  const tags = ['All', ...Array.from(new Set(NEWS_UPDATES.map((n) => n.tag).filter(Boolean)))];
  const filtered = tag === 'All' ? NEWS_UPDATES : NEWS_UPDATES.filter((n) => n.tag === tag);
  const shown = showAll ? filtered : filtered.slice(0, 3);
  return (
    <SectionCard id={id} icon={Newspaper} title="News & Updates" subtitle={`Latest item ${fmtDate(NEWS_UPDATES[0]?.date)}`} expanded={isExpanded} onToggle={() => setIsExpanded(!isExpanded)}>
      <div className="p-6 bg-gradient-to-br from-white to-purple-50">
        <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Filter news by topic">
          {tags.map((t) => (
            <button key={t} type="button" onClick={() => { setTag(t); setShowAll(false); }} aria-pressed={tag === t} className={`px-3 py-1 rounded-full text-xs font-bold border focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${tag === t ? 'bg-purple-700 text-white border-purple-700' : 'bg-white text-purple-800 border-purple-300 hover:bg-purple-50'}`}>{t}</button>
          ))}
        </div>
        <ul className="space-y-4">
          {shown.map((item, idx) => (
            <li key={`${item.date}-${idx}`} className="bg-white p-4 rounded-xl border-2 border-purple-200 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <time dateTime={item.date} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">{fmtDate(item.date)}</time>
                  {item.tag && <span className={`px-3 py-0.5 rounded-full text-xs font-semibold text-center ${TAG_CLS[item.tag] || TAG_CLS.Network}`}>{item.tag}</span>}
                </div>
                <div>
                  <h3 className="font-bold text-purple-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-700">{item.description}{item.link && <> <a href={item.link.url} target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:text-purple-900 underline font-medium">{item.link.text} →</a></>}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {filtered.length > 3 && (
          <button type="button" onClick={() => setShowAll(!showAll)} className="mt-4 w-full py-2 text-purple-700 hover:text-purple-900 font-medium text-sm flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-lg">
            {showAll ? <><ChevronUp size={18} aria-hidden="true" /> Show fewer</> : <><ChevronDown size={18} aria-hidden="true" /> Show all {filtered.length} items</>}
          </button>
        )}
      </div>
    </SectionCard>
  );
};

// ─── Documents ───────────────────────────────────────────────────────────────
export const DocumentsSection = ({ id = 'documents', expandedDefault = false }) => {
  const [isExpanded, setIsExpanded] = useState(expandedDefault);
  return (
    <SectionCard id={id} icon={FileText} title="Research, Ethics & Exemptions Documents" subtitle="Current approved versions; older versions are withdrawn" expanded={isExpanded} onToggle={() => setIsExpanded(!isExpanded)}>
      <div className="p-6 bg-gradient-to-br from-white to-purple-50 space-y-6">
        {DOCUMENT_GROUPS.map((g) => (
          <div key={g.title} className={`p-4 rounded-xl border-2 ${g.tone === 'red' ? 'bg-gradient-to-br from-red-50 to-white border-red-200' : 'bg-gradient-to-br from-purple-50 to-white border-purple-200'}`}>
            <h3 className={`font-bold text-lg mb-3 ${g.tone === 'red' ? 'text-red-900' : 'text-purple-900'}`}>{g.title}</h3>
            <ul className="space-y-2">
              {g.items.map((d) => (
                <li key={d.url}>
                  <a href={d.url} target={d.download ? undefined : '_blank'} rel="noopener noreferrer" download={d.download || undefined}
                     className={`flex items-center gap-2 text-sm p-2 bg-white rounded border focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${g.tone === 'red' ? 'text-red-700 hover:text-red-900 border-red-200 hover:bg-red-50' : 'text-purple-700 hover:text-purple-900 border-purple-200 hover:bg-purple-50'}`}>
                    <Download size={16} aria-hidden="true" /><span>{d.label}</span>
                    {d.version && <span className="ml-auto text-xs text-gray-500 whitespace-nowrap">{d.version}</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <p className="text-xs text-gray-500">Documents open in a new tab. Updated {fmtDate(partnersMeta.lastUpdated)}.</p>
      </div>
    </SectionCard>
  );
};

// ─── Related links ───────────────────────────────────────────────────────────
export const RelatedLinks = ({ id = 'links' }) => {
  const categories = ['Western University', 'Scatr Inc.', 'Project Partners', 'Health Canada', 'Other'];
  return (
    <section id={id} aria-labelledby="links-h" className="bg-white rounded-2xl shadow-2xl p-6 border-4 border-purple-100 scroll-mt-4">
      <div className="flex items-center gap-3 mb-6"><ExternalLink className="text-purple-700" size={32} aria-hidden="true" /><h2 id="links-h" className="font-bold text-2xl text-purple-900">Related Links & Resources</h2></div>
      <div className="space-y-6">
        {categories.map((category) => {
          const items = LINKS.filter((l) => l.category === category);
          if (!items.length) return null;
          return (
            <div key={category} className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border-2 border-purple-200">
              <h3 className="font-bold text-lg text-purple-900 mb-3">{category}</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((link) => (
                  <li key={link.url} className="bg-white p-3 rounded-lg border border-purple-200 hover:shadow-lg transition-shadow">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-2 mb-1 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded">{link.title} <ExternalLink size={14} aria-hidden="true" /></a>
                    <p className="text-xs text-gray-600">{link.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
};

// ─── Partner details (popup + expanded row) ──────────────────────────────────
export const SiteDetails = ({ site, showMetrics = false }) => {
  const m = metricsFor(site);
  return (
    <div className="text-sm space-y-1">
      <div className="font-bold text-purple-900 text-base mb-1 flex items-center gap-2 flex-wrap">{site.nameOrganization} <StatusBadge status={site.status} /></div>
      {site.statusNote && <div className="text-xs text-gray-600 italic">{site.statusNote}</div>}
      <div><span className="font-semibold">Address:</span> {site.address}, {site.city}, {site.prov}{site.postal ? ` ${site.postal}` : ''}</div>
      {site.primaryContact && <div><span className="font-semibold">Primary contact:</span> {site.primaryContact}{site.email1 && <> · <a className="text-purple-700 underline" href={`mailto:${site.email1}`}>{site.email1}</a></>}{site.phone1 && <> · {site.phone1}</>}</div>}
      {site.additionalContact && <div><span className="font-semibold">Additional contact:</span> {site.additionalContact}{site.email2 && <> · <a className="text-purple-700 underline" href={`mailto:${site.email2}`}>{site.email2}</a></>}{site.phone2 && <> · {site.phone2}</>}</div>}
      <div><span className="font-semibold">Devices:</span> {site.devicesAssigned}{site.devices?.length > 0 && (
        <ul className="list-disc ml-5">{site.devices.map((d) => <li key={d.deviceId}><span className="font-mono">{d.serial}</span> (scatr device {d.deviceId}){d.lastScan ? ` · last scan ${fmtDate(d.lastScan)}` : ''}{d.note ? ` · ${d.note}` : ''}</li>)}</ul>
      )}</div>
      <div><span className="font-semibold">Exemption type:</span> {site.exemptionType1}{site.exemptionType2 && site.exemptionType2 !== 'NA' ? ` + ${site.exemptionType2}` : ''}</div>
      {showMetrics && m && <div><span className="font-semibold">Point-of-care scans:</span> {m.pocAllTime.toLocaleString()} all time · {m.pocFiscalYearToDate} this fiscal year · last scan {fmtDate(m.lastScan)}</div>}
      {site.notes?.length > 0 && <ul className="list-disc ml-5 text-xs text-gray-700">{site.notes.map((n) => <li key={n}>{n}</li>)}</ul>}
    </div>
  );
};

// ─── Map ─────────────────────────────────────────────────────────────────────
const ResetMapButton = () => {
  const map = useMap();
  return (
    <button type="button" onClick={() => map.setView([56.0, -96.0], 4)} className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded-lg shadow-lg border-2 border-purple-300 hover:bg-purple-50 transition-colors flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500" title="Reset map view">
      <RotateCcw size={18} className="text-purple-700" aria-hidden="true" />
      <span className="text-sm font-medium text-purple-700">Reset view</span>
    </button>
  );
};

export const PartnerMap = ({ sites = LISTED_PARTNERS, showMetrics = false }) => (
  <div>
    <div className="h-[600px] rounded-xl overflow-hidden shadow-2xl border-4 border-purple-200 relative" aria-label="Map of partner sites. The contact table lists the same sites." role="region">
      <MapContainer center={[56.0, -96.0]} zoom={4} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ResetMapButton />
        {sites.map((site) => (
          <Marker key={site.id} position={[site.lat, site.lng]} icon={statusMarkerIcon(site.status)} alt={site.nameOrganization}>
            <Tooltip direction="top" offset={[0, -8]} className="font-semibold text-xs">{site.shortName || site.nameOrganization}</Tooltip>
            <Popup maxWidth={380}><SiteDetails site={site} showMetrics={showMetrics} /></Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-700" aria-label="Map legend">
      {Object.entries(STATUS_META).filter(([k]) => k !== 'closed').map(([k, m]) => (
        <span key={k} className="flex items-center gap-2"><span aria-hidden="true" style={{ background: m.dot }} className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white shadow" />{m.label}</span>
      ))}
      <span className="ml-auto">Hover or focus a marker for the site name; click for details. Scroll-zoom is off; use the + / − controls.</span>
    </div>
  </div>
);

// ─── Contact table ───────────────────────────────────────────────────────────
export const printContactList = (partnersData, title = 'Project Partner Contact List') => {
  const printWindow = window.open('', '_blank');
  const today = new Date().toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' });
  const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const html = `<!DOCTYPE html><html><head><title>${esc(title)} - ${today}</title><style>body{font-family:Arial,sans-serif;font-size:11px;margin:20px}h1{font-size:18px;color:#5b21b6;margin-bottom:5px}h2{font-size:12px;color:#666;font-weight:normal;margin-top:0}table{width:100%;border-collapse:collapse;margin-top:15px}th,td{border:1px solid #ddd;padding:6px;text-align:left}th{background-color:#5b21b6;color:white;font-size:10px}tr:nth-child(even){background-color:#f9f9f9}.footer{margin-top:20px;font-size:10px;color:#666;border-top:1px solid #ddd;padding-top:10px}@media print{body{margin:10px}table{font-size:9px}th,td{padding:4px}}</style></head><body><h1>Western University Drug-Checking Network</h1><h2>${esc(title)} - Generated ${today}</h2><table><thead><tr><th>Organization</th><th>Status</th><th>City, Prov</th><th>Primary Contact</th><th>Email</th><th>Phone</th><th>Additional Contact</th><th>Email</th><th>Phone</th></tr></thead><tbody>${partnersData.map((site) => `<tr><td><strong>${esc(site.nameOrganization)}</strong></td><td>${esc((STATUS_META[site.status] || STATUS_META.active).label)}</td><td>${esc(site.city)}, ${esc(site.prov)}</td><td>${esc(site.primaryContact)}</td><td>${esc(site.email1)}</td><td>${esc(site.phone1)}</td><td>${esc(site.additionalContact)}</td><td>${esc(site.email2)}</td><td>${esc(site.phone2)}</td></tr>`).join('')}</tbody></table><div class="footer"><p><strong>Project Contact:</strong> Cameron Brown, Project Manager | cbrown58@uwo.ca | 226-238-9970</p><p><strong>Principal Investigator:</strong> Prof. Francois Lagugne-Labarthet | flagugne@uwo.ca | 519-661-2111 x81006</p><p><em>This document contains confidential contact information. Please do not share outside the project network.</em></p></div></body></html>`;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 250);
};

export const PartnerTable = ({ sites = LISTED_PARTNERS, showMetrics = false }) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [q, setQ] = useState('');
  const [prov, setProv] = useState('All');
  const [status, setStatus] = useState('All');
  const provinces = ['All', ...Array.from(new Set(sites.map((s) => s.prov))).sort()];
  const statuses = ['All', ...Array.from(new Set(sites.map((s) => s.status)))];
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return sites.filter((s) => (prov === 'All' || s.prov === prov) && (status === 'All' || s.status === status) &&
      (!needle || [s.nameOrganization, s.shortName, s.city, s.primaryContact, s.additionalContact, s.email1, s.email2, s.address].join(' ').toLowerCase().includes(needle)));
  }, [sites, q, prov, status]);
  const colCount = showMetrics ? 16 : 14;
  const toggle = (id) => setExpandedRow(expandedRow === id ? null : id);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <label className="flex flex-col text-xs font-semibold text-purple-900">
          <span className="mb-1">Search</span>
          <span className="relative"><Search size={16} aria-hidden="true" className="absolute left-2 top-2.5 text-purple-400" /><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Organization, city, contact…" className="pl-8 pr-3 py-2 rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:outline-none text-sm w-64" /></span>
        </label>
        <label className="flex flex-col text-xs font-semibold text-purple-900"><span className="mb-1">Province</span>
          <select value={prov} onChange={(e) => setProv(e.target.value)} className="py-2 px-3 rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:outline-none text-sm bg-white">{provinces.map((p) => <option key={p}>{p}</option>)}</select></label>
        <label className="flex flex-col text-xs font-semibold text-purple-900"><span className="mb-1">Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="py-2 px-3 rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:outline-none text-sm bg-white">{statuses.map((s) => <option key={s} value={s}>{s === 'All' ? 'All' : (STATUS_META[s] || {}).label || s}</option>)}</select></label>
        <span className="text-sm text-gray-600 ml-auto" aria-live="polite">{rows.length} of {sites.length} sites</span>
      </div>
      <div className="overflow-x-auto rounded-xl shadow-2xl border-4 border-purple-200">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Project partner contact information. Select a row to show more detail.</caption>
          <thead>
            <tr className="bg-gradient-to-r from-purple-700 to-purple-900 text-white">
              {['Organization', 'Status', 'Address', 'City', 'Prov', 'Primary contact', 'Email', 'Phone', 'Additional contact', 'Email', 'Phone', 'Devices', 'Type #1', 'Type #2'].concat(showMetrics ? ['Serial(s)', 'Last scan'] : []).map((h, i) => (
                <th key={i} scope="col" className="border border-purple-300 p-2 text-left font-bold sticky top-0 bg-purple-800">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((site, idx) => {
              const open = expandedRow === site.id;
              const m = metricsFor(site);
              const base = site.isLead ? 'bg-purple-200' : idx % 2 === 0 ? 'bg-purple-50' : 'bg-white';
              return (
                <React.Fragment key={site.id}>
                  <tr className={`${open ? 'bg-purple-100' : base} hover:bg-purple-100 transition-colors ${site.status !== 'active' ? 'text-gray-600' : ''}`}>
                    <td className="border border-purple-200 p-2 font-bold text-purple-900">
                      <button type="button" onClick={() => toggle(site.id)} aria-expanded={open} aria-controls={`site-detail-${site.id}`} className="text-left w-full flex items-start gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded">
                        {open ? <ChevronUp size={14} className="mt-1 flex-shrink-0" aria-hidden="true" /> : <ChevronDown size={14} className="mt-1 flex-shrink-0" aria-hidden="true" />}<span>{site.nameOrganization}</span>
                      </button>
                    </td>
                    <td className="border border-purple-200 p-2"><StatusBadge status={site.status} /></td>
                    <td className="border border-purple-200 p-2">{site.address}</td>
                    <td className="border border-purple-200 p-2">{site.city}</td>
                    <td className="border border-purple-200 p-2">{site.prov}</td>
                    <td className="border border-purple-200 p-2">{site.primaryContact}</td>
                    <td className="border border-purple-200 p-2 text-blue-700">{site.email1 && <a href={`mailto:${site.email1}`} className="hover:underline">{site.email1}</a>}</td>
                    <td className="border border-purple-200 p-2 whitespace-nowrap">{site.phone1}</td>
                    <td className="border border-purple-200 p-2">{site.additionalContact}</td>
                    <td className="border border-purple-200 p-2 text-blue-700">{site.email2 && <a href={`mailto:${site.email2}`} className="hover:underline">{site.email2}</a>}</td>
                    <td className="border border-purple-200 p-2 whitespace-nowrap">{site.phone2}</td>
                    <td className="border border-purple-200 p-2 font-bold text-center">{site.devicesAssigned}</td>
                    <td className="border border-purple-200 p-2">{site.exemptionType1}</td>
                    <td className="border border-purple-200 p-2">{site.exemptionType2 === 'NA' ? '' : site.exemptionType2}</td>
                    {showMetrics && <td className="border border-purple-200 p-2 font-mono text-xs">{(site.devices || []).filter((d) => !d.loaner).map((d) => d.serial).join(', ') || '—'}</td>}
                    {showMetrics && <td className="border border-purple-200 p-2 whitespace-nowrap">{m ? fmtDate(m.lastScan) : '—'}</td>}
                  </tr>
                  {open && (
                    <tr id={`site-detail-${site.id}`} className="bg-white">
                      <td colSpan={colCount} className="border border-purple-200 p-4"><SiteDetails site={site} showMetrics={showMetrics} /></td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={colCount} className="p-6 text-center text-gray-500">No sites match the current filter.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 text-center">Select an organization name to show its details. Data updated {fmtDate(partnersMeta.lastUpdated)}.</p>
    </div>
  );
};

// ─── Network summary & analytics ─────────────────────────────────────────────
const prefersReducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Counts from 0 to `target` once on mount (instant under prefers-reduced-motion). */
const useCountUp = (target, duration = 1100) => {
  const [val, setVal] = useState(() => (prefersReducedMotion() ? target : 0));
  useEffect(() => {
    if (!Number.isFinite(target)) return undefined;
    if (prefersReducedMotion()) { setVal(target); return undefined; }
    let raf; const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration), eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
};
const CountUp = ({ value }) => { const v = useCountUp(Number(value) || 0); return <>{v.toLocaleString()}</>; };

/** True one frame after mount, so widths and heights can transition in from zero. */
const useMounted = () => { const [m, setM] = useState(false); useEffect(() => { const t = requestAnimationFrame(() => setM(true)); return () => cancelAnimationFrame(t); }, []); return m; };
/** Width of a container element, tracked with ResizeObserver (0 until measured). */
const useElementWidth = () => {
  const ref = useRef(null); const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return undefined;
    const measure = () => setW(el.getBoundingClientRect().width);
    measure();
    if (typeof ResizeObserver === 'undefined') { window.addEventListener('resize', measure); return () => window.removeEventListener('resize', measure); }
    const ro = new ResizeObserver(measure); ro.observe(el); return () => ro.disconnect();
  }, []);
  return [ref, w];
};
const fmtMonthLong = (ym) => { const [y, m] = ym.split('-').map(Number); return new Date(y, m - 1, 1).toLocaleDateString('en-CA', { month: 'long', year: 'numeric' }); };

const niceStep = (rough) => { const p = Math.pow(10, Math.floor(Math.log10(rough || 1))), r = (rough || 1) / p; return (r <= 1 ? 1 : r <= 2 ? 2 : r <= 5 ? 5 : 10) * p; };
const fiscalYearOf = (ym) => { const [y, m] = ym.split('-').map(Number); const s = m >= 4 ? y : y - 1; return `FY${s}-${String(s + 1).slice(-2)}`; };
const fmtCompact = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : String(n));
/** Column with a 4px rounded top and a square baseline. */
const barPath = (x, yTop, w, h, r = 4) => {
  if (h <= 0) return '';
  const rr = Math.min(r, h, w / 2), yb = yTop + h;
  return `M${x},${yb} V${yTop + rr} A${rr},${rr} 0 0 1 ${x + rr},${yTop} H${x + w - rr} A${rr},${rr} 0 0 1 ${x + w},${yTop + rr} V${yb} Z`;
};

const DonutChart = ({ data, size = 160, centerLabel = 'Sites' }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  const strokeWidth = 22, radius = (size - strokeWidth) / 2, circumference = radius * 2 * Math.PI, gap = 2;
  const mounted = useMounted();
  let currentOffset = 0;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90" role="img" aria-label={data.map((d) => `${d.label}: ${d.value}`).join(', ')}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f3f4f6" strokeWidth={strokeWidth} />
        {data.filter((d) => d.value > 0).map((item) => {
          const segmentLength = Math.max(0, (item.value / total) * circumference - gap), offset = currentOffset;
          currentOffset += (item.value / total) * circumference;
          return <circle key={item.label} cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={item.color} strokeWidth={strokeWidth} strokeDasharray={`${mounted ? segmentLength : 0} ${circumference}`} strokeDashoffset={-offset} style={{ transition: 'stroke-dasharray 900ms cubic-bezier(.2,.8,.2,1)' }} />;
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center"><div className="text-center"><div className="text-2xl font-bold text-gray-900">{data.reduce((s, d) => s + d.value, 0)}</div><div className="text-xs text-gray-500">{centerLabel}</div></div></div>
    </div>
  );
};

/** Tile cartogram of Canada: one tile per province or territory, lit where the network has a site. */
const PROVINCE_TILES = [
  ['YT', 1, 1, 'Yukon'], ['NT', 2, 1, 'Northwest Territories'], ['NU', 3, 1, 'Nunavut'],
  ['BC', 1, 2, 'British Columbia'], ['AB', 2, 2, 'Alberta'], ['SK', 3, 2, 'Saskatchewan'], ['MB', 4, 2, 'Manitoba'], ['ON', 5, 2, 'Ontario'], ['QC', 6, 2, 'Quebec'], ['NL', 7, 2, 'Newfoundland and Labrador'],
  ['NB', 6, 3, 'New Brunswick'], ['PE', 7, 3, 'Prince Edward Island'],
  ['NS', 7, 4, 'Nova Scotia'],
];
const ProvinceTiles = ({ byProv, devicesByProv }) => {
  const mounted = useMounted();
  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }} role="list" aria-label="Partner sites by province and territory">
      {PROVINCE_TILES.map(([code, col, row, name], idx) => {
        const sites = byProv[code] || [], n = sites.length, devices = devicesByProv[code] || 0, lit = n > 0;
        return (
          <div key={code} role="listitem" className="relative group" style={{ gridColumn: col, gridRow: row, aspectRatio: '1 / 1' }}>
            <button type="button" aria-label={`${name}: ${n} partner site${n === 1 ? '' : 's'}${lit ? `, ${devices} device${devices === 1 ? '' : 's'}: ${sites.join(', ')}` : ''}`}
              className={`w-full h-full rounded-lg flex flex-col items-center justify-center leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 transition-all duration-500 ${lit ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5' : 'bg-gray-100 text-gray-400'}`}
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? undefined : 'scale(.85)', transitionDelay: `${idx * 35}ms` }}>
              <span className={`text-[11px] font-semibold tracking-wide ${lit ? 'text-purple-100' : ''}`}>{code}</span>
              {lit && <span className="text-xl font-black mt-0.5">{n}</span>}
            </button>
            {lit && (
              <div role="tooltip" className="pointer-events-none absolute z-20 left-1/2 -translate-x-1/2 top-full mt-1.5 w-60 rounded-lg bg-gray-900 text-white text-xs p-2.5 shadow-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                <div className="font-semibold mb-1">{name} · {n} site{n === 1 ? '' : 's'} · {devices} device{devices === 1 ? '' : 's'}</div>
                <ul className="space-y-0.5 text-gray-200">{sites.map((s) => <li key={s}>{s}</li>)}</ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/** One slot per planned instrument: deployed, allocated for installation, or still to be assigned. */
const DeviceSlots = ({ deployed, allocated, total }) => {
  const mounted = useMounted();
  const toAssign = Math.max(0, total - allocated), pending = Math.max(0, allocated - deployed);
  return (
    <div>
      <div className="flex flex-wrap gap-1 mt-3" role="img" aria-label={`${deployed} of ${total} spectrometers deployed, ${pending} allocated but not yet in service, ${toAssign} to be assigned`}>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`h-5 w-2.5 rounded-sm transition-all duration-500 ${i < deployed ? 'bg-indigo-600' : i < allocated ? 'bg-indigo-300' : 'bg-white border border-indigo-200'}`} style={{ transitionDelay: `${i * 25}ms`, opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(6px)' }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600 mt-2">
        <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-indigo-600" aria-hidden="true"></span>{deployed} deployed</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-indigo-300" aria-hidden="true"></span>{pending} allocated, not yet in service</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-white border border-indigo-200" aria-hidden="true"></span>{toAssign} to be assigned</span>
      </div>
    </div>
  );
};

/** Monthly column chart: current fiscal year in the accent, earlier years lighter, the month in progress outlined; hover/focus readout; table view. */
const MonthlyBars = ({ series: fullSeries, dataAsOf, label }) => {
  const [active, setActive] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const mounted = useMounted();
  const [wrapRef, wrapW] = useElementWidth();
  const narrow = wrapW > 0 && wrapW < 600;
  const series = narrow ? fullSeries.slice(-12) : fullSeries;
  const n = series.length;
  if (!n) return null;
  const lastIdx = n - 1, currentMonth = (dataAsOf || '').slice(0, 7);
  const partialIdx = series[lastIdx].month === currentMonth ? lastIdx : -1;
  const latestCompleteIdx = partialIdx === -1 ? lastIdx : Math.max(0, lastIdx - 1);
  const fullPartialIdx = fullSeries[fullSeries.length - 1].month === currentMonth ? fullSeries.length - 1 : -1;
  const complete12 = fullSeries.filter((_, i) => i !== fullPartialIdx).slice(-12);
  const avg12 = complete12.length ? Math.round(complete12.reduce((a, s) => a + s.poc, 0) / complete12.length) : 0;
  const max = Math.max(1, ...series.map((s) => s.poc));
  const step = niceStep(max / 4), yMax = Math.max(step, Math.ceil(max / step) * step);
  const ticks = []; for (let t = 0; t <= yMax; t += step) ticks.push(t);
  const W = narrow ? 420 : 760, H = 170, padL = 44, padR = 16, top = 24, axisH = 22, fyH = 18, totalH = top + H + axisH + fyH, fs = narrow ? 12 : 10;
  const plotW = W - padL - padR, slot = plotW / n, bw = Math.min(24, slot - 4);
  const yOf = (v) => top + H - (v / yMax) * H;
  const curFY = fiscalYearOf(currentMonth || series[lastIdx].month);
  const bands = []; series.forEach((s, i) => { const fy = fiscalYearOf(s.month), b = bands[bands.length - 1]; if (b && b.fy === fy) b.end = i; else bands.push({ fy, start: i, end: i }); });
  const maxIdx = series.reduce((bi, s, i) => (s.poc > series[bi].poc ? i : bi), 0);
  const labelEvery = n > 12 || narrow ? 2 : 1;
  const readout = series[active != null ? active : latestCompleteIdx];
  return (
    <div ref={wrapRef}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
          <span className="flex items-center gap-1.5"><span aria-hidden="true" className="inline-block w-3 h-3 rounded-sm" style={{ background: '#7c3aed' }}></span>{curFY}, the current fiscal year</span>
          <span className="flex items-center gap-1.5"><span aria-hidden="true" className="inline-block w-3 h-3 rounded-sm" style={{ background: '#c4b5fd' }}></span>Earlier fiscal years</span>
          {partialIdx !== -1 && <span className="flex items-center gap-1.5"><span aria-hidden="true" className="inline-block w-3 h-3 rounded-sm border border-purple-500" style={{ background: '#ede9fe' }}></span>Month in progress</span>}
          {avg12 > 0 && <span className="flex items-center gap-1.5"><span aria-hidden="true" className="inline-block w-4 border-t-2 border-gray-400"></span>12-month average {avg12.toLocaleString()}</span>}
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-lg px-3 py-1.5 text-sm" aria-live="polite">
          <span className="font-bold text-gray-900 text-lg">{readout.poc.toLocaleString()}</span> <span className="text-gray-600">scans · {fmtMonth(readout.month)}{active == null ? ' (latest complete month)' : (active === partialIdx ? ' (in progress)' : '')}</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${totalH}`} className="w-full h-auto" role="img" aria-label={label} onMouseLeave={() => setActive(null)}>
        {bands.map((b, k) => (
          <g key={b.fy}>
            <rect x={padL + b.start * slot} y={top - 8} width={(b.end - b.start + 1) * slot} height={H + 8 + axisH + fyH} fill={k % 2 ? '#faf5ff' : 'transparent'} />
            {k > 0 && <line x1={padL + b.start * slot} x2={padL + b.start * slot} y1={top - 8} y2={top + H + axisH + fyH} stroke="#e9d5ff" />}
            <text x={padL + (b.start + (b.end - b.start + 1) / 2) * slot} y={top + H + axisH + 12} fontSize={fs} fontWeight="600" textAnchor="middle" fill="#6d28d9">{b.fy}</text>
          </g>
        ))}
        {ticks.map((t) => <g key={t}><line x1={padL} x2={W - padR} y1={yOf(t)} y2={yOf(t)} stroke="#e5e7eb" /><text x={padL - 6} y={yOf(t) + 3.5} fontSize={fs} textAnchor="end" fill="#6b7280">{fmtCompact(t)}</text></g>)}
        {avg12 > 0 && <line x1={padL} x2={W - padR} y1={yOf(avg12)} y2={yOf(avg12)} stroke="#9ca3af" strokeWidth="1.5" />}
        {series.map((s, i) => {
          const x = padL + i * slot + (slot - bw) / 2, h = (s.poc / yMax) * H, yTop = top + H - h;
          const isPartial = i === partialIdx, isCur = fiscalYearOf(s.month) === curFY, isActive = active === i;
          const fill = isPartial ? '#ede9fe' : isCur ? '#7c3aed' : '#c4b5fd';
          const showLabel = isActive || i === maxIdx || i === latestCompleteIdx;
          return (
            <g key={s.month}>
              <path d={barPath(x, yTop, bw, h)} fill={fill} stroke={isPartial ? '#7c3aed' : 'none'} strokeWidth={isPartial ? 1.25 : 0} opacity={isActive ? 0.8 : 1} style={{ transform: mounted ? 'scaleY(1)' : 'scaleY(0)', transformOrigin: `${x + bw / 2}px ${top + H}px`, transition: `transform 800ms cubic-bezier(.2,.8,.2,1) ${i * 18}ms` }} />
              {showLabel && h > 0 && <text x={x + bw / 2} y={yTop - 5} fontSize={fs} fontWeight="700" textAnchor="middle" fill="#374151">{s.poc.toLocaleString()}</text>}
              {(lastIdx - i) % labelEvery === 0 && <text x={padL + i * slot + slot / 2} y={top + H + 14} fontSize={fs} textAnchor="middle" fill={isCur ? '#4b5563' : '#9ca3af'}>{fmtMonth(s.month)}</text>}
              <rect x={padL + i * slot} y={top - 8} width={slot} height={H + 8 + axisH} fill="transparent" tabIndex="0" role="img" aria-label={`${fmtMonth(s.month)}: ${s.poc} scans${isPartial ? ' (month in progress)' : ''}`} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onBlur={() => setActive(null)} style={{ outline: 'none', cursor: 'default' }} />
            </g>
          );
        })}
        {avg12 > 0 && <text x={W - padR} y={yOf(avg12) - 5} fontSize={fs} fontWeight="600" textAnchor="end" fill="#4b5563" stroke="#ffffff" strokeWidth="3" paintOrder="stroke">avg {avg12.toLocaleString()}</text>}
      </svg>
      <button type="button" onClick={() => setShowTable(!showTable)} aria-expanded={showTable} className="mt-2 text-xs font-semibold text-purple-700 hover:text-purple-900 underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded">{showTable ? 'Hide' : 'Show'} the monthly figures as a table</button>
      {showTable && (
        <div className="mt-2 overflow-x-auto">
          <table className="text-sm border-collapse">
            <caption className="sr-only">Point-of-care scans per month</caption>
            <thead><tr className="text-left text-xs text-gray-500"><th scope="col" className="pr-6 py-1 font-semibold">Month</th><th scope="col" className="pr-6 py-1 font-semibold">Fiscal year</th><th scope="col" className="py-1 font-semibold text-right">Scans</th></tr></thead>
            <tbody>{[...fullSeries].reverse().map((s, i) => <tr key={s.month} className="border-t border-gray-100"><td className="pr-6 py-1 text-gray-800">{fmtMonth(s.month)}{i === 0 && partialIdx !== -1 ? ' (in progress)' : ''}</td><td className="pr-6 py-1 text-gray-600">{fiscalYearOf(s.month)}</td><td className="py-1 text-right tabular-nums font-medium text-gray-900">{s.poc.toLocaleString()}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/** Scans by fiscal year as thin horizontal bars; the current year is emphasised and marked "to date". */
const FiscalYearBars = ({ byFy, currentFy }) => {
  const mounted = useMounted();
  const rows = Object.entries(byFy || {}).sort(([a], [b]) => a.localeCompare(b));
  const max = Math.max(1, ...rows.map(([, v]) => v));
  return (
    <div className="space-y-2" role="list" aria-label="Point-of-care scans by fiscal year">
      {rows.map(([fy, v]) => {
        const cur = fy === currentFy;
        return (
          <div key={fy} role="listitem" className="flex items-center gap-3 text-sm">
            <div className={`w-24 flex-shrink-0 text-right ${cur ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{fy}{cur && <span className="block text-[10px] font-medium text-purple-700 leading-tight">to date</span>}</div>
            <div className="flex-1 h-5 bg-gray-50 rounded relative overflow-hidden"><div className={`absolute left-0 top-0 h-full rounded-r ${cur ? 'bg-purple-600' : 'bg-purple-300'}`} style={{ width: mounted ? `${(v / max) * 100}%` : 0, transition: 'width 900ms cubic-bezier(.2,.8,.2,1)' }}></div></div>
            <div className={`w-14 text-right tabular-nums ${cur ? 'font-bold text-gray-900' : 'text-gray-700'}`}>{v.toLocaleString()}</div>
          </div>
        );
      })}
    </div>
  );
};

const KpiTile = ({ icon: Icon, tone, aside, value, unit, label, children }) => {
  const tones = {
    purple: ['from-purple-500 to-purple-700', 'from-purple-50'],
    indigo: ['from-indigo-500 to-indigo-700', 'from-indigo-50'],
    emerald: ['from-emerald-500 to-emerald-700', 'from-emerald-50'],
    amber: ['from-amber-400 to-orange-500', 'from-amber-50'],
  }[tone] || ['from-purple-500 to-purple-700', 'from-purple-50'];
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${tones[1]} via-white to-white rounded-2xl p-5 shadow-lg border border-gray-100`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className={`bg-gradient-to-br ${tones[0]} text-white p-2.5 rounded-xl shadow-md`}><Icon size={24} aria-hidden="true" /></div>
        {aside}
      </div>
      <div className="text-4xl md:text-[2.6rem] font-black text-gray-900 leading-none">{value}{unit && <span className="text-lg font-semibold text-gray-400 ml-1">{unit}</span>}</div>
      <div className="text-sm font-medium text-gray-600 mt-2">{label}</div>
      {children}
    </div>
  );
};

export const NetworkSummary = ({ id = 'metrics', expandedDefault = false }) => {
  const [isExpanded, setIsExpanded] = useState(expandedDefault);
  const stats = networkStats();
  const byProv = sitesByProvince();
  const devicesByProv = {}; stats.counted.forEach((s) => { devicesByProv[s.prov] = (devicesByProv[s.prov] || 0) + Number(s.devicesAssigned || 0); });
  const regions = { 'Western Canada': { provinces: ['BC', 'AB'], sites: 0, devices: 0 }, Prairies: { provinces: ['SK', 'MB'], sites: 0, devices: 0 }, 'Central Canada': { provinces: ['ON', 'QC'], sites: 0, devices: 0 }, Atlantic: { provinces: ['NB', 'NS', 'PE', 'NL'], sites: 0, devices: 0 } };
  stats.counted.forEach((site) => { Object.values(regions).forEach((r) => { if (r.provinces.includes(site.prov)) { r.sites++; r.devices += Number(site.devicesAssigned || 0); } }); });
  const both = stats.bothSites.length;
  const exemptionData = [
    { label: 'Fixed site only', value: stats.nonMobileSites.length - both, color: '#3b82f6' },
    { label: 'Mobile only', value: stats.mobileSites.length - both, color: '#10b981' },
    { label: 'Fixed site and mobile', value: both, color: '#8b5cf6' },
  ];
  const monthly = METRICS.networkMonthly || [];
  const last12 = monthly.slice(-12), last24 = monthly.slice(-24);
  const t = METRICS.totals;
  // network activity, from the per-site metrics of sites that have a device today
  const activeSites = stats.counted.filter((p) => p.status === 'active');
  const siteMetrics = activeSites.map((p) => metricsFor(p)).filter(Boolean);
  const asOf = METRICS.dataAsOf ? new Date(`${METRICS.dataAsOf}T12:00:00`) : new Date();
  const daysSince = (iso) => (iso ? Math.round((asOf - new Date(`${iso}T12:00:00`)) / 86400000) : Infinity);
  const scanned12 = siteMetrics.filter((m) => m.pocLast12Months > 0).length;
  const scanned30 = siteMetrics.filter((m) => daysSince(m.lastScan) <= 30).length;
  const lastNetworkScan = siteMetrics.map((m) => m.lastScan).filter(Boolean).sort().slice(-1)[0];
  const thisMonth = last24.length && last24[last24.length - 1].month === (METRICS.dataAsOf || '').slice(0, 7) ? last24[last24.length - 1] : null;
  const firstPocMonth = monthly.length ? monthly[0].month : null;
  // sites by year of first scan (growth)
  const firstYears = {}; activeSites.forEach((p) => { const m = metricsFor(p); if (m && m.firstScan) { const y = m.firstScan.slice(0, 4); firstYears[y] = (firstYears[y] || 0) + 1; } });
  const years = Object.keys(firstYears).sort();
  const growth = years.map((y) => ({ key: y, label: `${y}: ${firstYears[y]} site${firstYears[y] === 1 ? '' : 's'} started scanning`, value: firstYears[y] }));
  return (
    <SectionCard id={id} icon={Activity} title="Network Summary & Analytics" subtitle={`Scan data as of ${fmtDate(METRICS.dataAsOf)} · partner data updated ${fmtDate(partnersMeta.lastUpdated)}`} expanded={isExpanded} onToggle={() => setIsExpanded(!isExpanded)}>
      <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
          <KpiTile icon={Building2} tone="purple" value={<CountUp value={stats.signedPartners} />} label="Partner organizations with signed agreements"
            aside={<div className="text-right"><SparkBars series={growth} color="#a78bfa" label="Sites starting to scan, by year" /><div className="text-[10px] text-gray-500 mt-1">sites starting to scan {years[0]}–{years[years.length - 1]}</div></div>}>
            <div className="text-xs text-gray-500 mt-2">{stats.activeSites - 1} operating sites · {stats.plannedSites} installing Dec 2026 · plus Western's laboratory{stats.onboarding > 0 && <> · {stats.onboarding} onboarding</>}</div>
          </KpiTile>
          <KpiTile icon={Zap} tone="indigo" value={<CountUp value={stats.deployedDevices} />} unit="deployed" label={`${stats.allocatedDevices} allocated of ${stats.plannedDevicesTotal} planned spectrometers`}
            aside={<div className="text-right"><div className="text-2xl font-black text-indigo-600 leading-none">{Math.round((stats.allocatedDevices / stats.plannedDevicesTotal) * 100)}%</div><div className="text-[10px] text-gray-500 mt-1">of the plan allocated</div></div>}>
            <DeviceSlots deployed={stats.deployedDevices} allocated={stats.allocatedDevices} total={stats.plannedDevicesTotal} />
          </KpiTile>
          <KpiTile icon={Globe} tone="emerald" value={<CountUp value={stats.provinces.length} />} unit="of 13" label="Provinces and territories with partner sites"
            aside={<div className="text-right"><div className="text-2xl font-black text-emerald-600 leading-none"><CountUp value={stats.cities} /></div><div className="text-[10px] text-gray-500 mt-1">cities and towns</div></div>}>
            <div className="flex flex-wrap gap-1 mt-3">{stats.provinces.map((p) => <span key={p} className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs font-semibold">{p}<span className="font-normal text-emerald-700"> {(byProv[p] || []).length}</span></span>)}</div>
          </KpiTile>
          <KpiTile icon={Activity} tone="amber" value={<CountUp value={t.pocAllTime} />} label={firstPocMonth ? `Point-of-care scans since ${fmtMonthLong(firstPocMonth)}` : 'Point-of-care scans to date'}
            aside={<div className="text-right"><SparkBars series={last12.map((m) => ({ key: m.month, label: `${fmtMonth(m.month)}: ${m.poc} scans`, value: m.poc }))} color="#f59e0b" label="Point-of-care scans per month, last 12 months" /><div className="text-[10px] text-gray-500 mt-1">last 12 months</div></div>}>
            <div className="text-xs text-gray-500 mt-2"><span className="font-semibold text-gray-700">{t.pocFiscalYearToDate.toLocaleString()}</span> this fiscal year ({METRICS.fiscalYearNow}) · <span className="font-semibold text-gray-700">{t.pocLast12Months.toLocaleString()}</span> in the last 12 months{thisMonth && <> · {thisMonth.poc.toLocaleString()} so far in {fmtMonth(thisMonth.month)}</>}</div>
          </KpiTile>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6" role="list" aria-label="Network activity">
          {[
            [`${scanned30} of ${siteMetrics.length}`, 'sites scanned in the last 30 days'],
            [`${scanned12} of ${siteMetrics.length}`, 'sites scanned in the last 12 months'],
            [fmtDate(lastNetworkScan), 'most recent scan in the network'],
            [t.sitesWithPocAllTime.toLocaleString(), `sites have contributed scans since ${firstPocMonth ? firstPocMonth.slice(0, 4) : 'the start'}`],
          ].map(([v, l]) => (
            <div key={l} role="listitem" className="bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm"><div className="text-xl font-bold text-gray-900 leading-tight">{v}</div><div className="text-xs text-gray-500 mt-0.5">{l}</div></div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Point-of-care scans per month, whole network</h3>
            <p className="text-xs text-gray-500 mb-3">Last 24 months (12 on small screens; the table has all 24). A scan counts when a result was recorded; calibration and test scans are excluded. Hover over or tab to a column for its value.</p>
            <MonthlyBars series={last24} dataAsOf={METRICS.dataAsOf} label="Point-of-care scans per month, last 24 months" />
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Scans by fiscal year</h3>
            <p className="text-xs text-gray-500 mb-4">Health Canada fiscal years run April to March. {METRICS.fiscalYearNow} is in progress.</p>
            <FiscalYearBars byFy={t.pocByFiscalYear} currentFy={METRICS.fiscalYearNow} />
            <p className="text-xs text-gray-500 mt-4 pt-3 border-t border-gray-100">{t.scanRecordsAllTime.toLocaleString()} scan records in all, of which {t.pocAllTime.toLocaleString()} produced a result and count here; {t.labRecordsAllTime.toLocaleString()} further records are from Western's laboratory instruments.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2"><MapPin size={20} className="text-purple-600" aria-hidden="true" />Geographic coverage</h3>
            <p className="text-xs text-gray-500 mb-4">One tile per province or territory; the number is the partner sites there. Hover over or focus a tile for the list.</p>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-full sm:w-[60%] max-w-md"><ProvinceTiles byProv={byProv} devicesByProv={devicesByProv} /></div>
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-1 gap-3 w-full">
                {Object.entries(regions).map(([region, d]) => (
                  <div key={region} className="bg-gray-50 rounded-xl px-3 py-2"><div className="text-xs text-gray-500">{region}</div><div className="text-base font-bold text-gray-900">{d.sites} site{d.sites === 1 ? '' : 's'} <span className="text-xs font-medium text-gray-600">· {d.devices} device{d.devices === 1 ? '' : 's'}</span></div></div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2"><FileText size={20} className="text-purple-600" aria-hidden="true" />Exemption types across signed sites</h3>
            <p className="text-xs text-gray-500 mb-4">Health Canada subsection 56(1) exemptions on file. Sites whose applications are pending are counted under neither type.</p>
            <div className="flex items-center justify-around flex-wrap gap-4">
              <DonutChart data={exemptionData} size={160} />
              <ul className="space-y-3">
                {exemptionData.map((item) => (
                  <li key={item.label} className="flex items-center gap-3"><span aria-hidden="true" className="w-3.5 h-3.5 rounded-sm inline-block flex-shrink-0" style={{ backgroundColor: item.color }}></span><div><div className="text-lg font-bold text-gray-900 leading-tight">{item.value} <span className="text-sm font-medium text-gray-600">site{item.value === 1 ? '' : 's'}</span></div><div className="text-xs text-gray-600">{item.label}</div></div></li>
                ))}
              </ul>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-3 text-center"><Smartphone size={20} className="mx-auto text-blue-700 mb-1" aria-hidden="true" /><div className="text-xl font-bold text-gray-900">{stats.mobileSites.length}</div><div className="text-xs text-blue-800">sites with a mobile exemption</div></div>
              <div className="bg-emerald-50 rounded-xl p-3 text-center"><Building2 size={20} className="mx-auto text-emerald-700 mb-1" aria-hidden="true" /><div className="text-xl font-bold text-gray-900">{stats.nonMobileSites.length}</div><div className="text-xs text-emerald-800">sites with a fixed-site exemption</div></div>
            </div>
          </div>
        </div>
        <DataStamp metrics={METRICS} partners={partnersMeta} className="mt-6" />
      </div>
    </SectionCard>
  );
};

// ─── PWLLE training sessions ─────────────────────────────────────────────────
export const PwlleTrainingSessions = ({ id = 'pwlle-sessions', expandedDefault = false }) => {
  const [isExpanded, setIsExpanded] = useState(expandedDefault);
  const [showTable, setShowTable] = useState(false);
  const S = PWLLE_TRAINING_SESSIONS;
  const completed = S.filter((s) => s.status === 'Complete');
  const toSchedule = S.filter((s) => s.status !== 'Complete');
  const totalAttendants = completed.reduce((a, s) => a + (s.attendants || 0), 0);
  const totalUnique = completed.reduce((a, s) => a + (s.newAttendants || 0), 0);
  const stipendsPaid = completed.reduce((a, s) => a + (s.stipend || 0), 0);
  const stipendsCommitted = S.reduce((a, s) => a + (s.stipend || 0), 0);
  const siteMap = new Map();
  S.forEach((s) => {
    if (!siteMap.has(s.site)) siteMap.set(s.site, { site: s.site, location: s.location, p1Unique: 0, p2Unique: 0, pendingSessions: 0, completeSessions: 0 });
    const e = siteMap.get(s.site);
    if (s.status === 'Complete') { e.completeSessions += 1; if (s.phase === 1) e.p1Unique += s.newAttendants || 0; else e.p2Unique += s.newAttendants || 0; } else e.pendingSessions += 1;
  });
  const siteData = Array.from(siteMap.values()).sort((a, b) => (b.p1Unique + b.p2Unique) - (a.p1Unique + a.p2Unique));
  const maxTotal = Math.max(...siteData.map((s) => s.p1Unique + s.p2Unique), 1);
  const lastSession = completed.map((s) => s.scheduledDate).sort().slice(-1)[0];
  return (
    <SectionCard id={id} icon={Users} title="PWLLE Drug-Checking Peer Training Sessions" subtitle={`${completed.length} of ${S.length} sessions complete · ${totalUnique} unique PWLLE trained · last session ${fmtDate(lastSession)}`} expanded={isExpanded} onToggle={() => setIsExpanded(!isExpanded)}>
      <div className="p-6 bg-gradient-to-br from-white to-purple-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            ['Sessions', S.length, `${completed.length} complete · ${toSchedule.length} to schedule`],
            ['Unique PWLLE', totalUnique, `across ${siteData.filter((s) => s.p1Unique + s.p2Unique > 0).length} sites`],
            ['Total attendants', totalAttendants, 'including repeat participants'],
            ['Stipends', `$${(stipendsPaid / 1000).toFixed(0)}k / $${(stipendsCommitted / 1000).toFixed(0)}k`, 'completed sessions / committed'],
          ].map(([l, v, d]) => (
            <div key={l} className="bg-white rounded-xl p-4 border-2 border-purple-200 shadow-md"><div className="text-xs text-purple-600 font-semibold uppercase tracking-wide mb-1">{l}</div><div className="text-3xl font-bold text-purple-900">{v}</div><div className="text-xs text-gray-600 mt-1">{d}</div></div>
          ))}
        </div>
        <div className="bg-white rounded-xl p-5 border-2 border-purple-200 shadow-md mb-6">
          <h3 className="font-bold text-purple-900 mb-1">Unique PWLLE trained by site</h3>
          <p className="text-xs text-gray-600 mb-4">Phase 1 (Jan–May 2025) and Phase 2 (Mar 2026 onward), completed sessions only.</p>
          <div className="space-y-2">
            {siteData.map((s) => {
              const total = s.p1Unique + s.p2Unique, p1 = (s.p1Unique / maxTotal) * 100, p2 = (s.p2Unique / maxTotal) * 100;
              return (
                <div key={s.site} className="flex items-center gap-3">
                  <div className="w-40 md:w-52 flex-shrink-0 text-right"><div className="text-xs md:text-sm font-semibold text-purple-900 leading-tight truncate">{s.site}</div><div className="text-xs text-gray-500 truncate">{s.location}</div></div>
                  <div className="flex-1 relative h-7 bg-purple-50 rounded-md overflow-hidden border border-purple-100" role="img" aria-label={`${s.site}: ${s.p1Unique} in phase 1, ${s.p2Unique} in phase 2`}>
                    {total > 0 ? (<>
                      <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 to-purple-700 flex items-center justify-end pr-2" style={{ width: `${p1}%` }}>{s.p1Unique > 0 && <span className="text-white text-xs font-bold">{s.p1Unique}</span>}</div>
                      <div className="absolute top-0 h-full bg-gradient-to-r from-teal-400 to-teal-600 flex items-center justify-end pr-2" style={{ left: `${p1}%`, width: `${p2}%` }}>{s.p2Unique > 0 && <span className="text-white text-xs font-bold">{s.p2Unique}</span>}</div>
                    </>) : (<div className="absolute inset-0 flex items-center justify-center"><span className="text-xs font-semibold text-purple-400 italic">{s.pendingSessions > 0 ? `${s.pendingSessions} session${s.pendingSessions > 1 ? 's' : ''} to schedule` : `${s.completeSessions} session${s.completeSessions > 1 ? 's' : ''} complete · attendance to enter`}</span></div>)}
                  </div>
                  <div className="w-10 text-right text-sm font-bold text-purple-900">{total || '—'}</div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-purple-100 text-xs">
            <span className="flex items-center gap-2"><span aria-hidden="true" className="w-4 h-4 rounded bg-gradient-to-r from-purple-500 to-purple-700 inline-block"></span>Phase 1 (2025)</span>
            <span className="flex items-center gap-2"><span aria-hidden="true" className="w-4 h-4 rounded bg-gradient-to-r from-teal-400 to-teal-600 inline-block"></span>Phase 2 (2026)</span>
            <span className="flex items-center gap-2"><span aria-hidden="true" className="w-4 h-4 rounded bg-purple-50 border border-purple-100 inline-block"></span>Upcoming</span>
          </div>
        </div>
        <button type="button" onClick={() => setShowTable(!showTable)} aria-expanded={showTable} className="w-full flex items-center justify-between gap-2 p-3 bg-white rounded-xl border-2 border-purple-200 hover:bg-purple-50 transition-colors shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500">
          <span className="font-semibold text-purple-900 text-sm">{showTable ? 'Hide' : 'Show'} session-by-session details ({S.length} rows)</span>
          {showTable ? <ChevronUp size={18} className="text-purple-700" aria-hidden="true" /> : <ChevronDown size={18} className="text-purple-700" aria-hidden="true" />}
        </button>
        {showTable && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">Drug-Checking Peer training sessions by site</caption>
              <thead><tr className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">{['Phase', 'Site', 'Location', 'Session #', 'Date', 'Purpose', 'Status', 'Attend.', 'Unique', 'Stipend', 'Notes'].map((h) => <th key={h} scope="col" className="border border-purple-300 p-3 text-left">{h}</th>)}</tr></thead>
              <tbody>
                {S.map((s, idx) => (
                  <tr key={s.id} className={idx % 2 === 0 ? 'bg-purple-50' : 'bg-white'}>
                    <td className="border border-purple-200 p-3 text-center"><span className={`px-2 py-1 rounded text-xs font-bold ${s.phase === 1 ? 'bg-purple-200 text-purple-900' : 'bg-teal-200 text-teal-900'}`}>P{s.phase}</span></td>
                    <td className="border border-purple-200 p-3 font-semibold text-purple-900">{s.site}</td>
                    <td className="border border-purple-200 p-3">{s.location}</td>
                    <td className="border border-purple-200 p-3 text-center font-bold">{s.sessionNum}</td>
                    <td className="border border-purple-200 p-3 whitespace-nowrap">{s.scheduledDate ? fmtDate(s.scheduledDate) : 'TBD'}</td>
                    <td className="border border-purple-200 p-3"><span className={`px-2 py-1 rounded text-xs font-medium ${s.purpose === 'Focus Group' ? 'bg-blue-100 text-blue-800' : s.purpose === 'Feedback on Materials' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>{s.purpose}</span></td>
                    <td className="border border-purple-200 p-3 text-center">{s.status === 'Complete' ? <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium inline-flex items-center gap-1"><CheckCircle size={12} aria-hidden="true" />Complete</span> : <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium inline-flex items-center gap-1"><Clock size={12} aria-hidden="true" />To schedule</span>}</td>
                    <td className="border border-purple-200 p-3 text-center font-bold text-purple-700">{s.attendants ?? '—'}</td>
                    <td className="border border-purple-200 p-3 text-center font-medium">{s.newAttendants ?? '—'}</td>
                    <td className="border border-purple-200 p-3 text-right text-gray-700">${s.stipend.toLocaleString()}</td>
                    <td className="border border-purple-200 p-3 text-xs text-gray-600">{s.notes}</td>
                  </tr>
                ))}
                <tr className="bg-purple-100 font-bold"><td colSpan="7" className="border border-purple-300 p-3 text-right text-purple-900">Totals:</td><td className="border border-purple-300 p-3 text-center text-purple-900">{totalAttendants}</td><td className="border border-purple-300 p-3 text-center text-purple-900">{totalUnique}</td><td className="border border-purple-300 p-3 text-right text-purple-900">${stipendsCommitted.toLocaleString()}</td><td className="border border-purple-300 p-3 text-xs text-purple-900">{S.length} sessions</td></tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SectionCard>
  );
};

// ─── Map + table sections (collapsible wrappers) ─────────────────────────────
export const MapSection = ({ id = 'map', expandedDefault = false, showMetrics = false }) => {
  const [open, setOpen] = useState(expandedDefault);
  return (
    <SectionCard id={id} icon={MapPin} title="Interactive Map View of Project Partner Sites" subtitle={`${LISTED_PARTNERS.length} locations · marker colour shows status`} expanded={open} onToggle={() => setOpen(!open)}>
      <div className="p-6 bg-gradient-to-br from-white to-purple-50"><PartnerMap showMetrics={showMetrics} /></div>
    </SectionCard>
  );
};

export const ContactsSection = ({ id = 'table', expandedDefault = false, showMetrics = false, title = 'Project Partner Contact Info' }) => {
  const [open, setOpen] = useState(expandedDefault);
  return (
    <SectionCard id={id} icon={List} title={title} subtitle={`Updated ${fmtDate(partnersMeta.lastUpdated)}`} expanded={open} onToggle={() => setOpen(!open)}
      actions={open && <button type="button" onClick={() => printContactList(LISTED_PARTNERS)} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300" title="Print contact list"><Printer size={18} aria-hidden="true" />Print / Save as PDF</button>}>
      <div className="p-6 bg-gradient-to-br from-white to-purple-50"><PartnerTable showMetrics={showMetrics} /></div>
    </SectionCard>
  );
};

export { ACTIVE_PARTNERS };
