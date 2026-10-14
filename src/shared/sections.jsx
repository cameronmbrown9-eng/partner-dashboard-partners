// Shared dashboard sections (data-driven). Keep identical in both repos.
import React, { useMemo, useState } from 'react';
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
const ProgressRing = ({ progress, size = 120, strokeWidth = 10, color = '#7c3aed' }) => {
  const radius = (size - strokeWidth) / 2, circumference = radius * 2 * Math.PI, offset = circumference - (Math.min(100, progress) / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
    </svg>
  );
};

const DonutChart = ({ data, size = 160 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  const strokeWidth = 24, radius = (size - strokeWidth) / 2, circumference = radius * 2 * Math.PI;
  let currentOffset = 0;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90" role="img" aria-label={data.map((d) => `${d.label}: ${d.value}`).join(', ')}>
        {data.map((item, idx) => {
          const segmentLength = (item.value / total) * circumference, offset = currentOffset;
          currentOffset += segmentLength;
          return <circle key={idx} cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={item.color} strokeWidth={strokeWidth} strokeDasharray={`${segmentLength} ${circumference - segmentLength}`} strokeDashoffset={-offset} />;
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center"><div className="text-center"><div className="text-2xl font-bold text-gray-800">{data.reduce((s, d) => s + d.value, 0)}</div><div className="text-xs text-gray-500">Sites</div></div></div>
    </div>
  );
};

const MiniCanadaMap = ({ activeProvinces }) => {
  const c = (p) => (activeProvinces.includes(p) ? '#7c3aed' : '#e5e7eb');
  return (
    <svg viewBox="0 0 300 200" className="w-full h-auto" role="img" aria-label={`Provinces with partner sites: ${activeProvinces.join(', ')}`}>
      <path d="M20,60 L45,40 L50,80 L55,120 L35,140 L20,100 Z" fill={c('BC')} stroke="#fff" strokeWidth="1" />
      <path d="M50,50 L80,50 L80,120 L50,120 Z" fill={c('AB')} stroke="#fff" strokeWidth="1" />
      <path d="M80,50 L110,50 L110,120 L80,120 Z" fill={c('SK')} stroke="#fff" strokeWidth="1" />
      <path d="M110,50 L140,50 L145,80 L140,120 L110,120 Z" fill={c('MB')} stroke="#fff" strokeWidth="1" />
      <path d="M140,60 L180,50 L200,80 L190,130 L160,140 L140,120 Z" fill={c('ON')} stroke="#fff" strokeWidth="1" />
      <path d="M200,40 L240,30 L260,60 L250,100 L220,120 L200,100 Z" fill={c('QC')} stroke="#fff" strokeWidth="1" />
      <path d="M250,100 L270,95 L275,115 L255,120 Z" fill={c('NB')} stroke="#fff" strokeWidth="1" />
      <path d="M270,110 L290,105 L295,125 L275,130 Z" fill={c('NS')} stroke="#fff" strokeWidth="1" />
      <path d="M25,20 L45,20 L50,45 L30,50 Z" fill={c('YT')} stroke="#fff" strokeWidth="1" />
      <path d="M50,15 L120,15 L120,45 L50,45 Z" fill={c('NT')} stroke="#fff" strokeWidth="1" />
      <path d="M120,10 L200,10 L200,45 L140,50 L120,40 Z" fill={c('NU')} stroke="#fff" strokeWidth="1" />
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

/** Monthly bar chart with month labels (network scans per month). */
const MonthlyBars = ({ series, color = '#7c3aed', label }) => {
  const max = Math.max(1, ...series.map((s) => s.poc));
  const H = 140, W = 720, pad = 34, top = 12, bw = (W - pad) / series.length;
  const ticks = [0, 0.5, 1].map((f) => Math.round(max * f));
  return (
    <svg viewBox={`0 0 ${W} ${H + top + 32}`} className="w-full h-auto" role="img" aria-label={label}>
      {ticks.map((t) => { const y = top + H - (t / max) * H; return <g key={t}><line x1={pad} x2={W} y1={y} y2={y} stroke="#e5e7eb" /><text x={pad - 4} y={y + 4} fontSize="10" textAnchor="end" fill="#6b7280">{t}</text></g>; })}
      {series.map((s, i) => {
        const h = (s.poc / max) * H, x = pad + i * bw;
        return <g key={s.month}><rect x={x + 1} y={top + H - h} width={Math.max(2, bw - 2)} height={h} fill={color} rx="2"><title>{`${fmtMonth(s.month)}: ${s.poc} scans`}</title></rect>
          {(i % 3 === 0 || series.length <= 12) && <text x={x + bw / 2} y={top + H + 14} fontSize="10" textAnchor="middle" fill="#6b7280">{fmtMonth(s.month)}</text>}</g>;
      })}
    </svg>
  );
};

export const NetworkSummary = ({ id = 'metrics', expandedDefault = false }) => {
  const [isExpanded, setIsExpanded] = useState(expandedDefault);
  const stats = networkStats();
  const byProv = sitesByProvince();
  const regions = { Western: { provinces: ['BC', 'AB'], sites: 0, devices: 0 }, Prairies: { provinces: ['SK', 'MB'], sites: 0, devices: 0 }, Central: { provinces: ['ON', 'QC'], sites: 0, devices: 0 }, Atlantic: { provinces: ['NB', 'NS', 'PE', 'NL'], sites: 0, devices: 0 } };
  stats.counted.forEach((site) => { Object.values(regions).forEach((r) => { if (r.provinces.includes(site.prov)) { r.sites++; r.devices += Number(site.devicesAssigned || 0); } }); });
  const both = stats.bothSites.length;
  const exemptionData = [
    { label: 'Non-Mobile only', value: stats.nonMobileSites.length - both, color: '#3b82f6' },
    { label: 'Mobile only', value: stats.mobileSites.length - both, color: '#10b981' },
    { label: 'Both types', value: both, color: '#8b5cf6' },
  ];
  const provinceData = Object.entries(byProv).map(([p, names]) => ({ prov: p, count: names.length, devices: stats.counted.filter((s) => s.prov === p).reduce((n, s) => n + Number(s.devicesAssigned || 0), 0) })).sort((a, b) => b.count - a.count);
  const monthly = METRICS.networkMonthly || [];
  const last12 = monthly.slice(-12), last24 = monthly.slice(-24);
  const deviceProgress = (stats.allocatedDevices / stats.plannedDevicesTotal) * 100;
  const t = METRICS.totals;
  return (
    <SectionCard id={id} icon={Activity} title="Network Summary & Analytics" subtitle={`Scan data as of ${fmtDate(METRICS.dataAsOf)} · partner data updated ${fmtDate(partnersMeta.lastUpdated)}`} expanded={isExpanded} onToggle={() => setIsExpanded(!isExpanded)}>
      <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4"><div className="bg-purple-100 p-3 rounded-xl"><Building2 size={28} className="text-purple-600" aria-hidden="true" /></div><div className="text-right text-xs text-gray-500">{stats.onboarding} onboarding</div></div>
            <div className="text-4xl font-black text-gray-900">{stats.signedPartners}</div>
            <div className="text-sm font-medium text-gray-500 mt-1">Partner organizations with signed agreements</div>
            <div className="text-xs text-gray-500 mt-2">{stats.activeSites - 1} operating sites · {stats.plannedSites} installing Dec 2026 · plus Western's laboratory</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4"><div className="bg-indigo-100 p-3 rounded-xl"><Zap size={28} className="text-indigo-600" aria-hidden="true" /></div><div className="relative"><ProgressRing progress={deviceProgress} size={60} strokeWidth={6} color="#6366f1" /><div className="absolute inset-0 flex items-center justify-center"><span className="text-xs font-bold text-indigo-600">{Math.round(deviceProgress)}%</span></div></div></div>
            <div className="text-4xl font-black text-gray-900">{stats.deployedDevices}<span className="text-lg font-normal text-gray-400"> deployed</span></div>
            <div className="text-sm font-medium text-gray-500 mt-1">{stats.allocatedDevices} allocated of {stats.plannedDevicesTotal} planned spectrometers</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3" aria-hidden="true"><div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${deviceProgress}%` }}></div></div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4"><div className="bg-emerald-100 p-3 rounded-xl"><Globe size={28} className="text-emerald-600" aria-hidden="true" /></div><div className="text-right"><div className="text-xs text-gray-400">Cities</div><div className="text-sm font-bold text-emerald-600">{stats.cities}</div></div></div>
            <div className="text-4xl font-black text-gray-900">{stats.provinces.length}<span className="text-lg font-normal text-gray-400">/13</span></div>
            <div className="text-sm font-medium text-gray-500 mt-1">Provinces & territories</div>
            <div className="flex flex-wrap gap-1 mt-3">{stats.provinces.map((p) => <span key={p} className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-medium">{p}</span>)}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4"><div className="bg-amber-100 p-3 rounded-xl"><Activity size={28} className="text-amber-600" aria-hidden="true" /></div><SparkBars series={last12.map((m) => ({ key: m.month, label: fmtMonth(m.month), value: m.poc }))} color="#f59e0b" label="Point-of-care scans per month, last 12 months" /></div>
            <div className="text-4xl font-black text-gray-900">{t.pocAllTime.toLocaleString()}</div>
            <div className="text-sm font-medium text-gray-500 mt-1">Point-of-care scans since Nov 2022</div>
            <div className="text-xs text-gray-500 mt-2">{t.pocFiscalYearToDate.toLocaleString()} this fiscal year ({METRICS.fiscalYearNow}) · {t.pocLast12Months.toLocaleString()} in the last 12 months</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-1">Point-of-care scans per month, whole network</h3>
          <p className="text-xs text-gray-500 mb-3">Last 24 months. A scan counts when a result was recorded; calibration and test scans are excluded. The current month is partial.</p>
          <MonthlyBars series={last24} label="Point-of-care scans per month, last 24 months" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><MapPin size={20} className="text-purple-600" aria-hidden="true" />Geographic coverage</h3>
            <div className="flex items-center gap-6">
              <div className="flex-1"><MiniCanadaMap activeProvinces={stats.provinces} /></div>
              <div className="flex-1 space-y-3">
                {Object.entries(regions).map(([region, d]) => (
                  <div key={region}>
                    <div className="flex justify-between text-sm mb-1"><span className="font-medium text-gray-700">{region}</span><span className="text-gray-500">{d.sites} site{d.sites === 1 ? '' : 's'} · {d.devices} device{d.devices === 1 ? '' : 's'}</span></div>
                    <div className="w-full bg-gray-200 rounded-full h-2" aria-hidden="true"><div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(d.sites / stats.counted.length) * 100}%` }}></div></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-bold text-gray-800 mb-3">Province by province</h4>
              <div className="flex flex-wrap gap-2">
                {provinceData.map(({ prov, count, devices }) => (
                  <div key={prov} className="bg-gray-50 rounded-lg px-3 py-2 flex items-center gap-2"><span className="text-lg font-black text-purple-700">{prov}</span><span className="text-xs text-gray-600">{count} site{count !== 1 ? 's' : ''} · {devices} device{devices !== 1 ? 's' : ''}</span></div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText size={20} className="text-purple-600" aria-hidden="true" />Exemption types across signed sites</h3>
            <div className="flex items-center justify-around flex-wrap gap-4">
              <DonutChart data={exemptionData} size={160} />
              <ul className="space-y-4">
                {exemptionData.map((item) => (
                  <li key={item.label} className="flex items-center gap-3"><span aria-hidden="true" className="w-4 h-4 rounded-full inline-block" style={{ backgroundColor: item.color }}></span><div><div className="text-sm font-medium text-gray-800">{item.label}</div><div className="text-lg font-bold" style={{ color: item.color }}>{item.value} sites</div></div></li>
                ))}
              </ul>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-3 text-center"><Smartphone size={20} className="mx-auto text-blue-600 mb-1" aria-hidden="true" /><div className="text-xl font-bold text-blue-700">{stats.mobileSites.length}</div><div className="text-xs text-blue-600">Sites with a mobile exemption</div></div>
              <div className="bg-emerald-50 rounded-xl p-3 text-center"><Building2 size={20} className="mx-auto text-emerald-600 mb-1" aria-hidden="true" /><div className="text-xl font-bold text-emerald-700">{stats.nonMobileSites.length}</div><div className="text-xs text-emerald-600">Sites with a fixed-site exemption</div></div>
            </div>
            <p className="text-xs text-gray-500 mt-3">Types shown are those on file; sites whose applications are pending are counted under neither.</p>
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
    if (!siteMap.has(s.site)) siteMap.set(s.site, { site: s.site, location: s.location, p1Unique: 0, p2Unique: 0, pendingSessions: 0 });
    const e = siteMap.get(s.site);
    if (s.status === 'Complete') { if (s.phase === 1) e.p1Unique += s.newAttendants || 0; else e.p2Unique += s.newAttendants || 0; } else e.pendingSessions += 1;
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
            ['Stipends', `$${(stipendsPaid / 1000).toFixed(0)}k / $${(stipendsCommitted / 1000).toFixed(0)}k`, 'paid / committed'],
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
                    </>) : (<div className="absolute inset-0 flex items-center justify-center"><span className="text-xs font-semibold text-purple-400 italic">{s.pendingSessions} session{s.pendingSessions > 1 ? 's' : ''} to schedule</span></div>)}
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
