import { useState, useCallback, useRef, useEffect } from 'react';
import { Parameter } from '../models/Playground';
import { FormFieldMapping } from '../models/Forms';

export type InjectionStatus = 'idle' | 'generating' | 'injecting' | 'done' | 'error';

interface UseFormInjectorReturn {
  inject: () => void;
  reset: () => void;
  status: InjectionStatus;
  errors: string[];
}

// ─── Chrome helpers ────────────────────────────────────────────────────────────

/**
 * Checks whether the Seed content script is already running in `tabId`
 * by sending a PING and expecting a PONG back.
 */
function pingTab(tabId: number): Promise<boolean> {
  return new Promise((resolve) => {
    // @ts-ignore
    chrome.tabs.sendMessage(tabId, { type: 'SEED_PING' }, (response) => {
      // @ts-ignore
      if (chrome.runtime.lastError || !response) {
        resolve(false);
      } else {
        resolve(response.type === 'SEED_PONG');
      }
    });
  });
}

/**
 * Injects content.js into the given tab if it hasn't been injected yet.
 * Using scripting.executeScript (on-demand) instead of auto content_scripts
 * avoids the need for content scripts running on every page load.
 */
function ensureContentScript(tabId: number): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const alive = await pingTab(tabId);
    if (alive) {
      resolve();
      return;
    }

    // @ts-ignore
    chrome.scripting.executeScript(
      { target: { tabId }, files: ['content.js'] },
      () => {
        // @ts-ignore
        if (chrome.runtime.lastError) {
          reject(new Error(
            // @ts-ignore
            chrome.runtime.lastError.message ??
            'Could not inject content script. The page may be a Chrome system page (chrome://, devtools, etc.) where injection is not allowed.'
          ));
        } else {
          // Small delay so the content script's listener registration completes
          setTimeout(resolve, 80);
        }
      }
    );
  });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

const useFormInjector = (mappings: FormFieldMapping[]): UseFormInjectorReturn => {
  const [status, setStatus] = useState<InjectionStatus>('idle');
  const [errors, setErrors]  = useState<string[]>([]);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => { workerRef.current?.terminate(); };
  }, []);

  // Build a single-record schema from the current mappings
  const buildSchema = useCallback((): Parameter[] => {
    return mappings
      .filter(m => m.parameter !== null && m.selectorValue.trim() !== '')
      .map(m => ({
        ...(m.parameter as Parameter),
        columnName: m.id,
      }));
  }, [mappings]);

  // Get the active tab id
  const getActiveTabId = (): Promise<number | null> => {
    return new Promise((resolve) => {
      // @ts-ignore
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        resolve(tabs[0]?.id ?? null);
      });
    });
  };

  // Send the generated record to the content script in the active tab
  const sendRecord = useCallback(async (record: Record<string, any>): Promise<string[]> => {
    const tabId = await getActiveTabId();
    if (!tabId) return ['No active tab found. Make sure a page is open.'];

    // Ensure content script is injected before messaging
    try {
      await ensureContentScript(tabId);
    } catch (e: any) {
      return [e.message ?? 'Failed to inject content script.'];
    }

    return new Promise((resolve) => {
      // @ts-ignore
      chrome.tabs.sendMessage(tabId, {
        type: 'SEED_INJECT_RECORD',
        record,
        mappings: mappings.map(m => ({
          fieldId: m.id,
          selectorType: m.selectorType,
          selectorValue: m.selectorValue,
        })),
      }, (response: { errors?: string[] } | undefined) => {
        // @ts-ignore
        if (chrome.runtime.lastError) {
          resolve([`Could not reach the page content script. Try reloading the tab.`]);
          return;
        }
        resolve(response?.errors ?? []);
      });
    });
  }, [mappings]);

  const inject = useCallback(() => {
    const schema = buildSchema();
    if (schema.length === 0) {
      setErrors(['Add at least one field with a selector and data type.']);
      setStatus('error');
      return;
    }

    setStatus('generating');
    setErrors([]);
    workerRef.current?.terminate();
    workerRef.current = new Worker(
      new URL('../workers/worker.js', import.meta.url),
      { type: 'module' }
    );

    workerRef.current.onmessage = async (e) => {
      const { type, data, error } = e.data;
      if (type === 'RESULT' && data?.[0]) {
        setStatus('injecting');
        const errs = await sendRecord(data[0]);
        setErrors(errs);
        setStatus(errs.length > 0 ? 'error' : 'idle');
      }
      if (type === 'ERROR') {
        setErrors([error ?? 'Data generation failed']);
        setStatus('error');
      }
    };

    workerRef.current.onerror = (err) => {
      setErrors([err.message ?? 'Worker error']);
      setStatus('error');
    };

    workerRef.current.postMessage({ type: 'GENERATE', schema, count: 1 });
  }, [buildSchema, sendRecord]);

  const reset = useCallback(() => {
    workerRef.current?.terminate();
    setStatus('idle');
    setErrors([]);
  }, []);

  return { inject, reset, status, errors };
};

export default useFormInjector;
