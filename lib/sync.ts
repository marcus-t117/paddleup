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

// Pull state from server and restore to localStorage
export async function pullFromServer(code: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/sync?code=${encodeURIComponent(code)}`);
    if (!res.ok) return false;

    const state = await res.json();
    if (!state || typeof state !== 'object') return false;

    restoreState(state as Record<string, unknown>);
    setSyncCode(code.toUpperCase());
    return true;
  } catch {
    return false;
  }
}
