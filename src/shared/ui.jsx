// Shared UI primitives for the partner and research dashboards.
// Keep this file identical in both repos (copied by _scripts/sync_shared.sh).
import React, { useId } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import L from 'leaflet';

/** Accessible expand/collapse control. The button's hit area is stretched over
 *  the whole header (after:absolute after:inset-0), so the header stays a single
 *  big click target while the semantics live on one real <button>. Any other
 *  controls placed in the header need `relative z-10`. */
export const ExpandToggle = ({ expanded, onToggle, controls, label }) => (
  <button
    type="button"
    aria-expanded={expanded}
    aria-controls={controls}
    aria-label={label ? `${expanded ? 'Collapse' : 'Expand'} ${label}` : undefined}
    onClick={onToggle}
    className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 after:absolute after:inset-0 after:content-['']"
  >
    <span className="text-sm font-medium">{expanded ? 'Collapse' : 'Expand'}</span>
    {expanded ? <ChevronUp size={28} strokeWidth={2.5} aria-hidden="true" /> : <ChevronDown size={28} strokeWidth={2.5} aria-hidden="true" />}
  </button>
);

/** Collapsible section card used across both dashboards.
 *  props: id, icon, title, subtitle, expanded, onToggle, actions (extra header
 *  controls, already wrapped in `relative z-10`), children */
export const SectionCard = ({ id, icon: Icon, title, subtitle, expanded, onToggle, actions = null, children, className = '' }) => {
  const panelId = useId();
  return (
    <section id={id} aria-labelledby={`${panelId}-h`} className={`bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden scroll-mt-4 ${className}`}>
      <div className="relative bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4 flex items-center justify-between gap-3">
        <div>
          <h2 id={`${panelId}-h`} className="flex items-center gap-2 font-bold text-2xl">{Icon && <Icon size={28} aria-hidden="true" />}{title}</h2>
          {subtitle && <p className="text-purple-200 text-sm mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions && <div className="relative z-10 flex items-center gap-2">{actions}</div>}
          <ExpandToggle expanded={expanded} onToggle={onToggle} controls={`${panelId}-p`} label={title} />
        </div>
      </div>
      {expanded && <div id={`${panelId}-p`}>{children}</div>}
    </section>
  );
};

export const STATUS_META = {
  active: { label: 'Active', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: '#059669' },
  'planned-install': { label: 'Install Dec 2026', cls: 'bg-amber-100 text-amber-800 border-amber-300', dot: '#d97706' },
  onboarding: { label: 'Onboarding', cls: 'bg-gray-100 text-gray-700 border-gray-300', dot: '#6b7280' },
  closed: { label: 'Closed', cls: 'bg-red-100 text-red-800 border-red-300', dot: '#b91c1c' },
};

export const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META.active;
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold border ${m.cls}`}>{m.label}</span>;
};

/** Leaflet marker icon coloured by partner status. */
const iconCache = {};
export const statusMarkerIcon = (status) => {
  const key = status || 'active';
  if (!iconCache[key]) {
    const color = (STATUS_META[key] || STATUS_META.active).dot;
    iconCache[key] = L.divIcon({
      className: '',
      html: `<span style="display:block;width:18px;height:18px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.5)"></span>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
      popupAnchor: [0, -10],
      tooltipAnchor: [0, -10],
    });
  }
  return iconCache[key];
};

export const fmtDate = (iso, opts = { month: 'short', day: 'numeric', year: 'numeric' }) => {
  if (!iso) return '—';
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return String(iso);
  return new Date(y, m - 1, d).toLocaleDateString('en-CA', opts);
};

export const fmtMonth = (ym) => {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-CA', { month: 'short', year: '2-digit' });
};

/** "Data as of" stamp shown under section titles and in the footer. */
export const DataStamp = ({ metrics, partners, className = '' }) => (
  <p className={`text-xs text-gray-500 ${className}`}>
    Scan data as of {fmtDate(metrics.dataAsOf)} (scatr.ca pull {fmtDate(metrics.pullTimestamp)}) · Partner, exemption and document data updated {fmtDate(partners.lastUpdated)}
  </p>
);

export const SkipLink = () => (
  <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[2000] focus:bg-yellow-300 focus:text-purple-900 focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold">Skip to content</a>
);

/** Tiny inline bar chart (one bar per month). Values are plain numbers. */
export const SparkBars = ({ series, height = 36, color = '#7c3aed', label }) => {
  const max = Math.max(1, ...series.map((s) => s.value));
  const w = 6, gap = 2, width = series.length * (w + gap);
  return (
    <svg width={width} height={height} role="img" aria-label={label || 'monthly values'} className="overflow-visible">
      {series.map((s, i) => {
        const h = Math.max(1, Math.round((s.value / max) * (height - 2)));
        return <rect key={s.key || i} x={i * (w + gap)} y={height - h} width={w} height={h} rx="1" fill={color} opacity={s.value === 0 ? 0.25 : 1}><title>{`${s.label}: ${s.value}`}</title></rect>;
      })}
    </svg>
  );
};

/** Simple line sparkline for a numeric series. */
export const Sparkline = ({ data, color = '#7c3aed', height = 40, label }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1, width = 100;
  const points = data.map((val, i) => `${(i / (data.length - 1)) * width},${height - ((val - min) / range) * (height - 4) - 2}`).join(' ');
  return (
    <svg width={width} height={height} className="overflow-visible" role="img" aria-label={label || 'trend'}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={width} cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2} r="3" fill={color} />
    </svg>
  );
};
