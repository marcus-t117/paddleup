import { STORAGE_KEYS } from './constants';

const SYNC_CODE_KEY = 'paddleup_sync_code';

// Generate a short, memorable sync code
export function generateSyncCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I, O, 0, 1
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function getSyncCode(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SYNC_CODE_KEY);
}

export function setSyncCode(code: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SYNC_CODE_KEY, code.toUpperCase());
}

export function clearSyncCode(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SYNC_CODE_KEY);
}

// Collect all app state into a single object for syncing
function collectState(): Record<string, unknown> | null {
  if (typeof window === 'undefined') return null;
  const state: Record<string, unknown> = {};
  for (const key of Object.values(STORAGE_KEYS)) {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        state[key] = JSON.parse(raw);
      } catch {
        state[key] = raw;
      }
    }
  }
  return state;
}

// Restore all app state from a synced object
function restoreState(state: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  for (const [key, value] of Object.entries(state)) {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  }
}

// Push current state to server (fire-and-forget, non-blocking)
export function pushToServer(): void {
  const code = getSyncCode();
  if (!code) return;

  const state = collectState();
  if (!state) return;

  fetch('/api/sync', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, data: state }),
  }).catch(() => {
    // Silent fail — localStorage is the primary store
  });
}

export type PullResult =
  | { ok: true }
  | {
      ok: false;
      reason: 'timeout' | 'network' | 'not_found' | 'server' | 'bad_response';
      status?: number;
      detail?: string;
    };

// Pull state from server and restore to localStorage
export async function pullFromServer(code: string): Promise<PullResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  let res: Response;
  try {
    res = await fetch(`/api/sync?code=${encodeURIComponent(code)}`, {
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    const reason = err instanceof DOMException && err.name === 'AbortError' ? 'timeout' : 'network';
    const detail = err instanceof Error ? err.message : String(err);
    console.warn('[paddleup sync] pull failed', reason, detail);
    return { ok: false, reason, detail };
  }
  clearTimeout(timeoutId);

  const bodyText = await res.text().catch(() => '');

  if (!res.ok) {
    const reason: 'not_found' | 'server' = res.status === 404 ? 'not_found' : 'server';
    console.warn('[paddleup sync] pull failed', reason, res.status, bodyText);
    return { ok: false, reason, status: res.status, detail: bodyText };
  }

  let state: unknown;
  try {
    state = JSON.parse(bodyText);
  } catch {
    console.warn('[paddleup sync] pull failed', 'bad_response', res.status, bodyText.slice(0, 200));
    return { ok: false, reason: 'bad_response', status: res.status, detail: 'Non-JSON response' };
  }

  if (!state || typeof state !== 'object') {
    console.warn('[paddleup sync] pull failed', 'bad_response', res.status, typeof state);
    return { ok: false, reason: 'bad_response', status: res.status, detail: 'Empty or non-object state' };
  }

  restoreState(state as Record<string, unknown>);
  setSyncCode(code.toUpperCase());
  return { ok: true };
}
