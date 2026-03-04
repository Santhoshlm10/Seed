import  { useState } from "react";
import { useTheme } from "../../ThemeProvider";
import { Parameter } from "../../models/Playground";
import ConfigurationInput from "./ConfigurationInput";
import { ArrowLeft, Check } from "../ui/Icons";

interface ConfigurationViewProps {
    parameter: Parameter;
    onBack: () => void;
    onApply: (configuredParameter: Parameter) => void;
}

function ConfigurationView({ parameter, onBack, onApply }: ConfigurationViewProps) {
    const { theme } = useTheme();
    const {  borderColor, textPrimary, textSecondary } = theme;

    const [configValues, setConfigValues] = useState<Record<string, any>>(() => {
        const initialValues: Record<string, any> = {};
        parameter.options?.forEach((option) => {
            initialValues[option.keyName] = option.value !== undefined
                ? option.value
                : option.defaultValue !== undefined
                    ? option.defaultValue
                    : option.type === "boolean"
                        ? false
                        : option.type === "multiSelect"
                            ? []
                            : option.type === "latlong"
                                ? { lat: "", lng: "" }
                                : "";
        });
        return initialValues;
    });

    const handleValueChange = (keyName: string, value: any) => {
        setConfigValues((prev) => ({
            ...prev,
            [keyName]: value,
        }));
    };

    const handleApply = () => {
        const updatedParameter = {
            ...parameter,
            options: parameter.options?.map((option) => ({
                ...option,
                value: configValues[option.keyName], 
            })),
        };
        onApply(updatedParameter as Parameter);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className={`px-4 py-3 border-b ${borderColor} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className={`${textSecondary} hover:${textPrimary} transition-colors`}
                    >
                        <ArrowLeft />
                    </button>
                    <div>
                        <h2 className={`text-lg font-semibold ${textPrimary}`}>
                            {parameter.parameterName}
                        </h2>
                        {parameter.description && (
                            <p className={`text-xs ${textSecondary}`}>{parameter.description}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Configuration Options */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {parameter.options && parameter.options.length > 0 ? (
                    parameter.options.map((option) => (
                        <ConfigurationInput
                            key={option.keyName}
                            option={option}
                            value={configValues[option.keyName]}
                            onChange={(value) => handleValueChange(option.keyName, value)}
                        />
                    ))
                ) : (
                    <div className={`text-center py-8 ${textSecondary}`}>
                        <p>No configuration options available for this parameter.</p>
                    </div>
                )}
            </div>

            {/* Footer with Apply Button */}
            <div className={`px-4 py-3 border-t ${borderColor}`}>
                <button
                    onClick={handleApply}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <Check />
                    Apply Configuration
                </button>
            </div>
        </div>
    );
}

export default ConfigurationView;
