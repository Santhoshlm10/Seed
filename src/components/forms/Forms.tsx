import { useState, useCallback } from 'react';
import { useTheme } from '../../ThemeProvider';
import { FormFieldMapping } from '../../models/Forms';
import { Parameter } from '../../models/Playground';
import FormFieldRow from './FormFieldRow';
import BottomSheet from '../bottomsheet';
import useFormInjector from '../../hooks/useFormInjector';
import { Plus } from '../ui/Icons';

let idCounter = 0;
const newId = () => `field_${Date.now()}_${idCounter++}`;

interface FormsProps {
  mappings: FormFieldMapping[];
  setMappings: React.Dispatch<React.SetStateAction<FormFieldMapping[]>>;
  formName: string;
  setFormName: React.Dispatch<React.SetStateAction<string>>;
}

function Forms({ mappings, setMappings, formName, setFormName }: FormsProps) {
  const { theme } = useTheme();
  const { bgPrimary, bgSecondary, borderColor, textPrimary, textSecondary, inputBg } = theme;

  const [pickingForId, setPickingForId] = useState<string | null>(null);

  const { inject, status, errors } = useFormInjector(mappings);

  // ─── Mapping helpers ───────────────────────────────────────────────────────

  const addField = () => {
    setMappings(prev => [...prev, {
      id: newId(),
      label: `Field ${prev.length + 1}`,
      selectorType: 'css',
      selectorValue: '',
      parameter: null,
    }]);
  };

  const updateMapping = useCallback((updated: FormFieldMapping) => {
    setMappings(prev => prev.map(m => (m.id === updated.id ? updated : m)));
  }, [setMappings]);

  const deleteMapping = useCallback((id: string) => {
    setMappings(prev => prev.filter(m => m.id !== id));
  }, [setMappings]);

  const handleParameterSelected = useCallback((param: Parameter) => {
    if (!pickingForId) return;
    setMappings(prev =>
      prev.map(m => m.id === pickingForId ? { ...m, parameter: param } : m)
    );
    setPickingForId(null);
  }, [pickingForId, setMappings]);

  // ─── Derived state ─────────────────────────────────────────────────────────

  const readyCount = mappings.filter(m => m.selectorValue.trim() && m.parameter).length;
  const canInject  = readyCount > 0 && status !== 'generating' && status !== 'injecting';

  // ─── Inject button ─────────────────────────────────────────────────────────

  const renderButton = () => {
    const busy = status === 'generating' || status === 'injecting';
    const label = status === 'generating' ? 'Generating data…' : status === 'injecting' ? 'Injecting…' : 'Inject into form';

    return (
      <button
        onClick={inject}
        disabled={!canInject || busy}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
          canInject && !busy
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : `${bgSecondary} ${textSecondary} border ${borderColor} cursor-not-allowed opacity-70`
        }`}
      >
        {busy && (
          <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
        )}
        {busy ? label : canInject ? 'Inject into form' : mappings.length === 0 ? 'Add fields to get started' : `${readyCount} of ${mappings.length} fields ready`}
      </button>
    );
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={`w-full h-full flex flex-col ${bgPrimary} ${textPrimary}`}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            className={`w-48 ${inputBg} border ${borderColor} rounded-lg px-3 py-2 text-sm font-semibold ${textPrimary} focus:outline-none focus:border-blue-500`}
            placeholder="Untitled Form"
          />
          <button
            onClick={addField}
            className="text-blue-400 text-sm font-medium hover:text-blue-300 flex items-center gap-1 shrink-0"
          >
            <Plus />
            Add Field
          </button>
        </div>

        {/* Empty state */}
        {mappings.length === 0 && (
          <div className={`flex flex-col items-center justify-center py-14 rounded-xl border-2 border-dashed ${borderColor} ${textSecondary} text-center gap-3`}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M3 9h18M9 21V9"/>
            </svg>
            <div>
              <p className="text-sm font-medium">No fields yet</p>
              <p className="text-xs mt-1 opacity-70">Add a field, choose a selector and a data type</p>
            </div>
            <button
              onClick={addField}
              className="mt-1 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus />
              Add first field
            </button>
          </div>
        )}

        {/* Field rows */}
        {mappings.map(mapping => (
          <FormFieldRow
            key={mapping.id}
            mapping={mapping}
            onChange={updateMapping}
            onDelete={() => deleteMapping(mapping.id)}
            onSelectParameter={() => setPickingForId(mapping.id)}
          />
        ))}

        {/* Errors */}
        {errors.length > 0 && (
          <div className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-900/20 p-3 space-y-1">
            <p className="text-xs font-semibold text-red-600">Issues:</p>
            {errors.map((e, i) => (
              <p key={i} className="text-xs text-red-500">{e}</p>
            ))}
          </div>
        )}
      </div>

      {/* Sticky footer */}
      {mappings.length > 0 && (
        <div className={`p-4 border-t ${borderColor}`}>
          {renderButton()}
        </div>
      )}

      {/* Parameter picker */}
      {pickingForId !== null && (
        <BottomSheet
          closeBottomSheet={() => setPickingForId(null)}
          onSelect={handleParameterSelected}
        />
      )}
    </div>
  );
}

export default Forms;
