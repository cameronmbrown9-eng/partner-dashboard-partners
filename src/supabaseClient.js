// src/supabaseClient.js
// Single entry point for Supabase calls from the dashboard.
// Credentials come from Vite env vars (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY).
// The anon key is safe to expose in the browser — Row-Level Security protects data.

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn(
    '[supabaseClient] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Custody module will render in offline/demo mode.'
  );
}

export const supabase = (url && anonKey)
  ? createClient(url, anonKey, {
      auth: { persistSession: false },
      db: { schema: 'public' },
    })
  : null;

export const hasSupabaseConfig = Boolean(url && anonKey);

// ─── Shipments (batches) ──────────────────────────────────────────────────
export async function listShipments() {
  if (!supabase) return { data: [], error: null };
  return supabase
    .from('shipments')
    .select('*')
    .order('created_at', { ascending: false });
}

export async function insertShipment(payload) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  return supabase.from('shipments').insert(payload).select().single();
}

export async function updateShipment(id, patch) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  return supabase.from('shipments').update(patch).eq('id', id).select().single();
}

// ─── Custody events (append-only audit log) ───────────────────────────────
export async function logCustodyEvent(event) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  return supabase.from('custody_events').insert(event).select().single();
}

export async function listCustodyEvents(shipmentId) {
  if (!supabase) return { data: [], error: null };
  return supabase
    .from('custody_events')
    .select('*')
    .eq('shipment_id', shipmentId)
    .order('occurred_at', { ascending: true });
}

// ─── Sample Queue (per-sample, pre-batch) ─────────────────────────────────
export async function listQueuedSamples(siteId = null) {
  if (!supabase) return { data: [], error: null };
  let q = supabase.from('sample_queue').select('*').order('entered_at', { ascending: false });
  if (siteId) q = q.eq('scs_site_id', siteId);
  return q;
}

export async function listUnbatchedSamples(siteId) {
  if (!supabase) return { data: [], error: null };
  return supabase
    .from('sample_queue')
    .select('*')
    .eq('scs_site_id', siteId)
    .eq('queue_status', 'queued')
    .is('batch_id', null)
    .order('entered_at', { ascending: true });
}

export async function listBatchSamples(batchId) {
  if (!supabase) return { data: [], error: null };
  return supabase
    .from('sample_queue')
    .select('*')
    .eq('batch_id', batchId)
    .order('entered_at', { ascending: true });
}

export async function insertQueuedSample(payload) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  return supabase.from('sample_queue').insert(payload).select().single();
}

export async function deleteQueuedSample(id) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  return supabase.from('sample_queue').delete().eq('id', id);
}

export async function attachSamplesToBatch(sampleIds, batchId) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  return supabase
    .from('sample_queue')
    .update({ batch_id: batchId, queue_status: 'batched' })
    .in('id', sampleIds)
    .select();
}

// ─── Tier-1 edit support ─────────────────────────────────────────────────
// Patch a queued sample AND record the change in its `edits` JSONB history.
// kind: 'edit'  = field correction (sample_id, client_code, description)
//       'resign' = session signature correction (entered_by_name)
// `currentRow` is the row's state BEFORE the change — used to compute the diff.
export async function updateQueuedSample(id, patch, { currentRow, actor, fingerprint, kind = 'edit', reason } = {}) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  if (!currentRow) return { data: null, error: new Error('currentRow required for audit trail') };

  // Compute field-level diff against the supplied current row.
  const trackedFields = ['sample_id', 'client_code', 'description', 'entered_by_name'];
  const changes = trackedFields
    .filter((f) => f in patch && (patch[f] ?? null) !== (currentRow[f] ?? null))
    .map((f) => ({ field: f, from: currentRow[f] ?? null, to: patch[f] ?? null }));

  if (changes.length === 0) {
    return { data: currentRow, error: null };   // no-op — nothing to log or patch
  }

  const entry = {
    ts: new Date().toISOString(),
    by: actor || null,
    fp: fingerprint || null,
    kind,
    changes,
    ...(reason ? { reason } : {}),
  };
  const newEdits = [entry, ...((currentRow.edits) || [])];

  return supabase
    .from('sample_queue')
    .update({ ...patch, edits: newEdits })
    .eq('id', id)
    .select()
    .single();
}
