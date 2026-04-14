import { useState } from 'react';
import { useTheme } from '../../ThemeProvider';
import { FormFieldMapping, SelectorType, SELECTOR_TYPE_LABELS, SELECTOR_TYPE_PLACEHOLDERS } from '../../models/Forms';
import { Trash2, ModifyConfiguration, FileIcon } from '../ui/Icons';

interface FormFieldRowProps {
  mapping: FormFieldMapping;
  onChange: (updated: FormFieldMapping) => void;
  onDelete: () => void;
  onSelectParameter: () => void;
}

const SELECTOR_TYPES: SelectorType[] = ['css', 'id', 'name', 'xpath', 'data-attr'];

function FormFieldRow({ mapping, onChange, onDelete, onSelectParameter }: FormFieldRowProps) {
  const { theme } = useTheme();
  const { inputBg, borderColor, textPrimary, textSecondary, bgSecondary } = theme;

  const [showSelectorHint, setShowSelectorHint] = useState(false);

  const update = (patch: Partial<FormFieldMapping>) => onChange({ ...mapping, ...patch });

  return (
    <div className={`${bgSecondary} rounded-xl p-3 space-y-3 border ${borderColor} transition-all`}>
      {/* Row header: label + delete */}
      <div className="flex items-center justify-between gap-2">
        <input
          type="text"
          value={mapping.label}
          onChange={(e) => update({ label: e.target.value })}
          placeholder="Field label (e.g. Email)"
          className={`flex-1 ${inputBg} border ${borderColor} rounded-lg px-3 py-1.5 text-sm font-medium ${textPrimary} focus:outline-none focus:border-blue-500`}
        />
        <button
          onClick={onDelete}
          className="text-red-400 hover:text-red-500 transition-colors p-1"
          title="Remove field"
        >
          <Trash2 />
        </button>
      </div>

      {/* Selector type + value */}
      <div className="flex gap-2">
        {/* Selector type dropdown */}
        <select
          value={mapping.selectorType}
          onChange={(e) => update({ selectorType: e.target.value as SelectorType, selectorValue: '' })}
          className={`${inputBg} border ${borderColor} rounded-lg px-2 py-1.5 text-xs ${textPrimary} focus:outline-none focus:border-blue-500 shrink-0`}
        >
          {SELECTOR_TYPES.map(t => (
            <option key={t} value={t}>{SELECTOR_TYPE_LABELS[t]}</option>
          ))}
        </select>

        {/* Selector value input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={mapping.selectorValue}
            onChange={(e) => update({ selectorValue: e.target.value })}
            onFocus={() => setShowSelectorHint(true)}
            onBlur={() => setShowSelectorHint(false)}
            placeholder={SELECTOR_TYPE_PLACEHOLDERS[mapping.selectorType]}
            spellCheck={false}
            className={`w-full ${inputBg} border ${borderColor} rounded-lg px-3 py-1.5 text-xs font-mono ${textPrimary} focus:outline-none focus:border-blue-500`}
          />
          {showSelectorHint && (
            <div className={`absolute left-0 top-full mt-1 z-10 ${inputBg} border ${borderColor} rounded-lg px-3 py-2 text-xs ${textSecondary} shadow-lg whitespace-nowrap`}>
              e.g. <span className="font-mono">{SELECTOR_TYPE_PLACEHOLDERS[mapping.selectorType]}</span>
            </div>
          )}
        </div>
      </div>

      {/* Faker parameter picker */}
      <button
        onClick={onSelectParameter}
        className={`w-full flex items-center justify-between gap-2 ${inputBg} border ${borderColor} rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 transition-colors hover:border-blue-400`}
      >
        <span className="flex items-center gap-2">
          <FileIcon />
          <span className={mapping.parameter ? textPrimary : textSecondary}>
            {mapping.parameter?.parameterName ?? 'Pick a data type…'}
          </span>
        </span>
        <ModifyConfiguration />
      </button>
    </div>
  );
}

export default FormFieldRow;
