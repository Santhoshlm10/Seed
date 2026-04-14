import { useState } from "react";
import { useTheme } from "../../ThemeProvider";

interface ConfigurationInputProps {
    option: any;
    configValues: Record<string, any>;
    onChange: (keyName: string, value: any) => void;
}

function ConfigurationInput({ option, configValues, onChange }: ConfigurationInputProps) {
    const { theme } = useTheme();
    const { inputBg, borderColor, textPrimary, textSecondary, bgSecondary } = theme;
    const value = configValues[option.keyName];

    const renderInput = () => {
        switch (option.type) {
            case "string":
                return (
                    <input
                        type="text"
                        value={value || ""}
                        onChange={(e) => onChange(option.keyName, e.target.value)}
                        className={`w-full ${inputBg} border ${borderColor} rounded-lg px-3 py-2 text-sm ${textPrimary} focus:outline-none focus:border-blue-500`}
                        placeholder={option.description || `Enter ${option.name}`}
                    />
                );

            case "number":
                return (
                    <input
                        type="number"
                        value={value || ""}
                        onChange={(e) => onChange(option.keyName, Number(e.target.value))}
                        className={`w-full ${inputBg} border ${borderColor} rounded-lg px-3 py-2 text-sm ${textPrimary} focus:outline-none focus:border-blue-500`}
                        placeholder={option.description || `Enter ${option.name}`}
                    />
                );

            case "date":
                return (
                    <input
                        type="date"
                        value={value || ""}
                        onChange={(e) => onChange(option.keyName, e.target.value)}
                        className={`w-full ${inputBg} border ${borderColor} rounded-lg px-3 py-2 text-sm ${textPrimary} focus:outline-none focus:border-blue-500`}
                    />
                );

            case "boolean":
                return (
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={value || false}
                            onChange={(e) => onChange(option.keyName, e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                );

            case "select":
                return (
                    <select
                        value={value || ""}
                        onChange={(e) => onChange(option.keyName, e.target.value)}
                        className={`w-full ${inputBg} border ${borderColor} rounded-lg px-3 py-2 text-sm ${textPrimary} focus:outline-none focus:border-blue-500`}
                    >
                        <option value="">Select an option</option>
                        {option.selectValues?.map((selectValue: { key: string; label: string }) => (
                            <option key={selectValue.key} value={selectValue.key}>
                                {selectValue.label}
                            </option>
                        ))}
                    </select>
                );

            case "multiSelect":
                const selectedValues = Array.isArray(value) ? value : [];
                return (
                    <div className={`${bgSecondary} border ${borderColor} rounded-lg p-3 max-h-48 overflow-y-auto`}>
                        {option.selectValues?.map((selectValue: { key: string; label: string }) => (
                            <label
                                key={selectValue.key}
                                className="flex items-center gap-2 py-2 cursor-pointer hover:bg-opacity-80"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedValues.includes(selectValue.key)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            onChange(option.keyName, [...selectedValues, selectValue.key]);
                                        } else {
                                            onChange(option.keyName, selectedValues.filter((v: string) => v !== selectValue.key));
                                        }
                                    }}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className={`text-sm ${textPrimary}`}>{selectValue.label}</span>
                            </label>
                        ))}
                    </div>
                );

            case "range":
                const min = option.minRange || 0;
                const max = option.maxRange || 100;
                const currentValue = value || min;
                return (
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className={`text-sm ${textSecondary}`}>{min}</span>
                            <span className={`text-sm font-semibold ${textPrimary}`}>{currentValue}</span>
                            <span className={`text-sm ${textSecondary}`}>{max}</span>
                        </div>
                        <input
                            type="range"
                            min={min}
                            max={max}
                            value={currentValue}
                            onChange={(e) => onChange(option.keyName, Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                    </div>
                );

            case "latlong":
                const latLongValue = value || { lat: "", lng: "" };
                return (
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={`text-xs ${textSecondary} uppercase tracking-wide block mb-1.5`}>
                                Latitude
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={latLongValue.lat || ""}
                                onChange={(e) => onChange(option.keyName, { ...latLongValue, lat: e.target.value })}
                                className={`w-full ${inputBg} border ${borderColor} rounded-lg px-3 py-2 text-sm ${textPrimary} focus:outline-none focus:border-blue-500`}
                                placeholder="Latitude"
                            />
                        </div>
                        <div>
                            <label className={`text-xs ${textSecondary} uppercase tracking-wide block mb-1.5`}>
                                Longitude
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={latLongValue.lng || ""}
                                onChange={(e) => onChange(option.keyName, { ...latLongValue, lng: e.target.value })}
                                className={`w-full ${inputBg} border ${borderColor} rounded-lg px-3 py-2 text-sm ${textPrimary} focus:outline-none focus:border-blue-500`}
                                placeholder="Longitude"
                            />
                        </div>
                    </div>
                );

            case "regex": {
                const [regexError, setRegexError] = useState<string | null>(null);
                const handleRegexChange = (val: string) => {
                    try {
                        new RegExp(val);
                        setRegexError(null);
                    } catch (e: any) {
                        setRegexError(e.message);
                    }
                    onChange(option.keyName, val);
                };
                return (
                    <div className="space-y-1.5">
                        <div className="relative">
                            <input
                                type="text"
                                value={value || ""}
                                onChange={(e) => handleRegexChange(e.target.value)}
                                spellCheck={false}
                                className={`w-full ${inputBg} border ${
                                    regexError
                                        ? "border-red-500 focus:border-red-500"
                                        : value && !regexError
                                        ? "border-green-500 focus:border-green-500"
                                        : borderColor + " focus:border-blue-500"
                                } rounded-lg px-3 py-2 pr-8 text-sm font-mono ${textPrimary} focus:outline-none`}
                                placeholder={option.description || "e.g. [A-Z]{2}[0-9]{4}"}
                            />
                            {value && (
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">
                                    {regexError ? "❌" : "✅"}
                                </span>
                            )}
                        </div>
                        {regexError && (
                            <p className="text-xs text-red-500">{regexError}</p>
                        )}
                        <p className={`text-xs ${textSecondary}`}>
                            Examples: <span className="font-mono">{'[A-Z]{2}[0-9]{4}'}</span> · <span className="font-mono">{'(foo|bar)-\\d+'}</span> · <span className="font-mono">{'\\d{3}-\\d{2}-\\d{4}'}</span>
                        </p>
                    </div>
                );
            }

            case "object":
                return (
                    <div className={`pl-4 border-l-2 ${borderColor} space-y-4 my-2`}>
                        {option.children?.map((child: any) => (
                            <ConfigurationInput
                                key={child.keyName}
                                option={child}
                                configValues={configValues}
                                onChange={onChange}
                            />
                        ))}
                    </div>
                );
            default:
                return (
                    <input
                        type="text"
                        value={value || ""}
                        onChange={(e) => onChange(option.keyName, e.target.value)}
                        className={`w-full ${inputBg} border ${borderColor} rounded-lg px-3 py-2 text-sm ${textPrimary} focus:outline-none focus:border-blue-500`}
                        placeholder={option.description || `Enter ${option.name}`}
                    />
                );
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className={`text-sm font-medium ${textPrimary}`}>
                    {option.name}
                </label>
                {option.description && (
                    <span className={`text-xs ${textSecondary}`} title={option.description}>
                        ℹ️
                    </span>
                )}
            </div>
            {renderInput()}
        </div>
    );
}

export default ConfigurationInput;
