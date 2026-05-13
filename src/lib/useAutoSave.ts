'use client';

import { useRef, useCallback, useEffect, useState } from 'react';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AutoSaveOptions {
  /** Unique key for localStorage backup */
  storageKey: string;
  /** Initial content from server */
  initialContent: string;
  /** Function that actually persists to the server. Return true on success. */
  saveToServer: (content: string) => Promise<boolean>;
  /** Debounce delay in ms (default 800) */
  debounceMs?: number;
}

interface AutoSaveState {
  content: string;
  status: SaveStatus;
  lastSavedAt: Date | null;
  setContent: (content: string) => void;
  saveNow: () => Promise<void>;
  /** True if content was restored from a localStorage backup */
  restoredFromBackup: boolean;
}

export function useAutoSave({
  storageKey,
  initialContent,
  saveToServer,
  debounceMs = 800,
}: AutoSaveOptions): AutoSaveState {
  const [content, setContentState] = useState(initialContent);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [restoredFromBackup, setRestoredFromBackup] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef(initialContent);
  const saveToServerRef = useRef(saveToServer);
  saveToServerRef.current = saveToServer;

  // On mount: check localStorage for a backup newer than initialContent
  useEffect(() => {
    try {
      const backup = localStorage.getItem(storageKey);
      if (backup) {
        const parsed = JSON.parse(backup);
        // Only restore if the backup has real content
        if (parsed.content && parsed.content !== initialContent) {
          setContentState(parsed.content);
          latestRef.current = parsed.content;
          setRestoredFromBackup(true);
          return;
        }
      }
    } catch {
      // corrupted localStorage entry — clear it
      localStorage.removeItem(storageKey);
    }
    latestRef.current = initialContent;
  }, [storageKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist to localStorage on EVERY change (synchronous safety net)
  const persistLocal = useCallback(
    (val: string) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ content: val, ts: Date.now() }));
      } catch {
        // localStorage full — ignore
      }
    },
    [storageKey]
  );

  // Debounced server sync
  const scheduleSync = useCallback(
    (val: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        setStatus('saving');
        try {
          const ok = await saveToServerRef.current(val);
          if (ok) {
            setStatus('saved');
            setLastSavedAt(new Date());
            // Remove backup — content is safely on server
            localStorage.removeItem(storageKey);
          } else {
            setStatus('error');
          }
        } catch {
          setStatus('error');
        }
      }, debounceMs);
    },
    [debounceMs, storageKey]
  );

  const setContent = useCallback(
    (val: string) => {
      setContentState(val);
      latestRef.current = val;
      persistLocal(val);
      scheduleSync(val);
    },
    [persistLocal, scheduleSync]
  );

  // Immediate save (on blur, before navigate)
  const saveNow = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setStatus('saving');
    try {
      const ok = await saveToServerRef.current(latestRef.current);
      if (ok) {
        setStatus('saved');
        setLastSavedAt(new Date());
        localStorage.removeItem(storageKey);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }, [storageKey]);

  // Cleanup on unmount: flush any pending sync
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      // Fire-and-forget save
      saveToServerRef.current(latestRef.current).catch(() => {});
    };
  }, [storageKey]);

  return { content, status, lastSavedAt, setContent, saveNow, restoredFromBackup };
}
