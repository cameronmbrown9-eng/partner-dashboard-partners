// src/supabaseClient.js
// Single entry point for Supabase calls from the dashboard.
// Credentials come from Vite env vars (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY).
// The anon key is safe to expose in the browser — Row-Level Security in
// supabase_schema.sql is what actually protects the data.

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Fail loud in dev; in production the module will just not connect.
  console.warn(
    '[supabaseClient] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Custody module will render in offline/demo mode.'
  );
}

export const supabase = (url && anonKey)
  ? createClient(url, anonKey, {
      auth: { persistSession: false },  // password-gated module, no user sessions
      db: { schema: 'public' },
    })
  : null;

export const hasSupabaseConfig = Boolean(url && anonKey);

// Thin helpers — keep module boundaries clear.
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
