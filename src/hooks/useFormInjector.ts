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
        columnName: m.id, // use field id as key so we can match it back
      }));
  }, [mappings]);

  // Send the generated record to the content script in the active tab
  const sendRecord = useCallback((record: Record<string, any>): Promise<string[]> => {
    return new Promise((resolve) => {
      // @ts-ignore
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (!tab?.id) {
          resolve(['No active tab found. Make sure a page is open.']);
          return;
        }

        // @ts-ignore
        chrome.tabs.sendMessage(tab.id, {
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
            // @ts-ignore
            resolve([`Could not reach the page. Try reloading the tab after installing the extension.`]);
            return;
          }
          resolve(response?.errors ?? []);
        });
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
        setStatus(errs.length > 0 ? 'error' : 'done');
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
