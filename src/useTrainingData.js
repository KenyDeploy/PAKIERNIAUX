import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";
import { normalizeData } from "./training";

const cacheKey = id => `pakiernia.v2.${id || "local"}`;
function readCache(id) {
  try { return JSON.parse(localStorage.getItem(cacheKey(id)) || "null"); } catch { return null; }
}
export function useTrainingData(defaults) {
  const [data, setData] = useState(() => normalizeData(!supabase ? readCache(null)?.data : {}, defaults));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [ready, setReady] = useState(!supabase);
  const [status, setStatus] = useState(supabase ? "Łączenie…" : "Zapis na tym urządzeniu");
  const [retry, setRetry] = useState(0);
  const owner = useRef(null), generation = useRef(0), dirty = useRef(false);
  const hydrated = useRef(!supabase);
  const latest = useRef(data), revision = useRef(0), queue = useRef(Promise.resolve());
  const updateData = useCallback(transform => {
    if (!hydrated.current) return false;
    const next = transform(latest.current);
    try {
      localStorage.setItem(cacheKey(owner.current), JSON.stringify({ data: next, pending: true }));
      setStatus(supabase ? "Zapisano lokalnie · oczekuje na synchronizację" : "Zapis na tym urządzeniu");
    }
    catch { setStatus("Brak miejsca na zapis lokalny. Zmiany nie zostały zapisane."); return false; }
    dirty.current = true; revision.current++;
    latest.current = next;
    setData(next);
    return true;
  }, []);
  const update = useCallback((key, value) => { updateData(current => ({ ...current,
    [key]: typeof value === "function" ? value(current[key]) : value })); }, [updateData]);
  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    let request;
    const accept = async session => {
      const id = session?.user?.id || null;
      if (!alive || (owner.current === id && id && request)) return;
      owner.current = id; const token = ++generation.current;
      hydrated.current = false;
      dirty.current = false; setReady(false); setLoading(Boolean(id)); setUser(session?.user || null);
      setData(normalizeData({}, defaults));
      if (!id) { setData(normalizeData({}, defaults)); setLoading(false); return; }
      setStatus("Wczytywanie danych…");
      request = true;
      try {
        const { data: row, error } = await supabase.from("user_data").select("data").eq("user_id", id).maybeSingle().abortSignal(AbortSignal.timeout(10000));
        if (error) throw error;
        if (!alive || token !== generation.current) return;
        const cached = readCache(id);
        const saved = normalizeData(cached?.pending ? cached.data : row?.data || {}, defaults);
        latest.current = saved; setData(saved); dirty.current = Boolean(cached?.pending);
        hydrated.current = true;
        setReady(true); setStatus(dirty.current ? "Oczekuje na synchronizację" : "Zsynchronizowano");
      } catch {
        if (alive && token === generation.current) setStatus("Nie udało się wczytać danych. Spróbuj ponownie.");
      } finally { if (alive && token === generation.current) setLoading(false); }
    };
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) { if (alive) { setStatus("Nie udało się sprawdzić sesji."); setLoading(false); } return; }
      accept(data.session);
    }).catch(() => { if (alive) { setStatus("Nie udało się sprawdzić sesji."); setLoading(false); } });
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      // Never await another Supabase operation inside the auth callback.
      if (event === "TOKEN_REFRESHED") return;
      setTimeout(() => { if (alive) accept(session); }, 0);
    });
    return () => { alive = false; generation.current++; listener.subscription.unsubscribe(); };
  }, [defaults, retry]);
  const flush = useCallback(() => {
    const id = owner.current, token = generation.current, rev = revision.current, snapshot = latest.current;
    if (!hydrated.current || !supabase || !id || !dirty.current) return queue.current;
    setStatus("Zapisywanie…");
    queue.current = queue.current.catch(() => {}).then(async () => {
      if (!hydrated.current || token !== generation.current || id !== owner.current) return;
      let error;
      try {
        ({ error } = await supabase.from("user_data").upsert({ user_id: id, data: snapshot, updated_at: new Date().toISOString() }).abortSignal(AbortSignal.timeout(10000)));
      } catch (cause) { error = cause; }
      if (token !== generation.current) return;
      if (error) { setStatus("Zapisano lokalnie · ponów synchronizację"); throw error; }
      if (revision.current === rev) {
        dirty.current = false;
        try { localStorage.setItem(cacheKey(id), JSON.stringify({ data: snapshot, pending: false })); } catch { /* cloud copy is durable */ }
        setStatus("Zsynchronizowano");
      }
    });
    return queue.current;
  }, []);
  useEffect(() => {
    if (!ready || !dirty.current) return;
    if (!supabase) { setStatus("Zapis na tym urządzeniu"); return; }
    const timer = setTimeout(() => { flush().catch(() => {}); }, 450);
    return () => clearTimeout(timer);
  }, [data, ready, flush]);
  useEffect(() => {
    const save = () => { if (ready) flush().catch(() => {}); };
    window.addEventListener("online", save);
    const hide = () => { if (document.visibilityState === "hidden") save(); };
    document.addEventListener("visibilitychange", hide);
    return () => { window.removeEventListener("online", save); document.removeEventListener("visibilitychange", hide); };
  }, [ready, flush]);
  return { data, update, updateData, authUser: user, authLoading: loading, cloudHydrated: ready, syncStatus: status,
    retrySync: () => ready ? flush().catch(() => {}) : setRetry(n => n + 1),
    signOut: async () => { try { await flush(); await supabase.auth.signOut(); } catch { setStatus("Najpierw zsynchronizuj dane przed wylogowaniem."); } } };
}
