// Single entry point for dashboard data. Everything the dashboards display comes
// from src/data/*.json (edited by hand or regenerated) — never from inline arrays.
// Keep this file identical in both repos (copied by _scripts/sync_shared.sh).
import partnersJson from '../data/partners.json';
import newsJson from '../data/news.json';
import trainingJson from '../data/training_sessions.json';
import documentsJson from '../data/documents.json';
import linksJson from '../data/links.json';
import metricsJson from '../data/metrics.json';
import exemptionsJson from '../data/exemptions.json';

export const partnersMeta = partnersJson;
export const ALL_PARTNERS = partnersJson.partners;
export const NEWS_UPDATES = newsJson.items;
export const PWLLE_TRAINING_SESSIONS = trainingJson.sessions;
export const DOCUMENT_GROUPS = documentsJson.groups;
export const LINKS = linksJson.links;
export const METRICS = metricsJson;
export const EXEMPTIONS = exemptionsJson.exemptions;
export const PLANNED_DEVICES_TOTAL = partnersJson.plannedDevicesTotal;

/** Sites shown on the map and in the contact table: everything except closed. */
export const LISTED_PARTNERS = ALL_PARTNERS.filter((p) => p.status !== 'closed');
/** Sites with a device on site today (used by the chain-of-custody module). */
export const ACTIVE_PARTNERS = ALL_PARTNERS.filter((p) => p.status === 'active');
/** Signed partner organizations (agreement executed), excluding Western. */
export const SIGNED_PARTNERS = ALL_PARTNERS.filter((p) => !p.isLead && (p.status === 'active' || p.status === 'planned-install'));
export const ONBOARDING_PARTNERS = ALL_PARTNERS.filter((p) => p.status === 'onboarding');

const metricsBySite = Object.fromEntries((METRICS.sites || []).map((s) => [s.username, s]));
export const metricsFor = (partner) => (partner && partner.username ? metricsBySite[partner.username] : undefined);

export const hasMobile = (p) => p.exemptionType1 === 'Mobile' || p.exemptionType2 === 'Mobile';
export const hasFixed = (p) => p.exemptionType1 === 'Non-Mobile' || p.exemptionType2 === 'Non-Mobile';

export const networkStats = () => {
  const signed = SIGNED_PARTNERS;
  const active = ALL_PARTNERS.filter((p) => p.status === 'active');
  const planned = ALL_PARTNERS.filter((p) => p.status === 'planned-install');
  const counted = ALL_PARTNERS.filter((p) => p.status === 'active' || p.status === 'planned-install');
  const provinces = [...new Set(counted.map((p) => p.prov))].sort();
  const cities = new Set(counted.map((p) => `${p.city}|${p.prov}`)).size;
  const deployedDevices = active.reduce((n, p) => n + Number(p.devicesAssigned || 0), 0);
  const allocatedDevices = counted.reduce((n, p) => n + Number(p.devicesAssigned || 0), 0);
  return {
    signedPartners: signed.length,
    onboarding: ONBOARDING_PARTNERS.length,
    activeSites: active.length,            // includes Western
    plannedSites: planned.length,
    provinces,
    cities,
    deployedDevices,
    allocatedDevices,
    plannedDevicesTotal: PLANNED_DEVICES_TOTAL,
    mobileSites: counted.filter(hasMobile),
    nonMobileSites: counted.filter(hasFixed),
    bothSites: counted.filter((p) => hasMobile(p) && hasFixed(p)),
    counted,
  };
};

export const sitesByProvince = (list = SIGNED_PARTNERS.concat(ALL_PARTNERS.filter((p) => p.isLead))) => {
  const by = {};
  list.forEach((p) => { (by[p.prov] = by[p.prov] || []).push(p.nameOrganization); });
  return by;
};

/** Training roll-up from the sessions table. */
export const trainingSummary = () => {
  const complete = PWLLE_TRAINING_SESSIONS.filter((s) => s.status === 'Complete');
  const bySite = {};
  complete.forEach((s) => {
    const e = (bySite[s.site] = bySite[s.site] || { site: s.site, sessions: 0, unique: 0, attendants: 0, lastDate: null, certified: false });
    e.sessions += 1; e.unique += s.newAttendants || 0; e.attendants += s.attendants || 0;
    if (!e.lastDate || s.scheduledDate > e.lastDate) e.lastDate = s.scheduledDate;
    if (s.purpose === 'DCP Certification') e.certified = true;
  });
  return {
    sessionsComplete: complete.length,
    sessionsTotal: PWLLE_TRAINING_SESSIONS.length,
    uniquePwlle: complete.reduce((n, s) => n + (s.newAttendants || 0), 0),
    attendants: complete.reduce((n, s) => n + (s.attendants || 0), 0),
    stipendsPaid: complete.reduce((n, s) => n + (s.stipend || 0), 0),
    bySite,
  };
};

/** Exemption roll-up. */
export const exemptionSummary = () => {
  const today = new Date().toISOString().slice(0, 10);
  const active = EXEMPTIONS.filter((e) => e.status === 'active' && (!e.validTo || e.validTo >= today));
  const expiringSoon = active.filter((e) => e.validTo && daysUntil(e.validTo) <= 90);
  const sitesWithActive = new Set(active.filter((e) => e.partnerKey).map((e) => e.partnerKey));
  return { active, expiringSoon, sitesWithActive, pending: EXEMPTIONS.filter((e) => e.status === 'pending'), toConfirm: EXEMPTIONS.filter((e) => e.status === 'to-confirm'), expired: EXEMPTIONS.filter((e) => e.status.startsWith('expired')) };
};

export const daysUntil = (iso) => {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const t = new Date(); t.setHours(0, 0, 0, 0);
  return Math.round((new Date(y, m - 1, d) - t) / 86400000);
};
