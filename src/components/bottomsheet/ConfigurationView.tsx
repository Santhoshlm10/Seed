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

    const [selectedReturnTypeKey, setSelectedReturnTypeKey] = useState<string | undefined>(
        parameter.returnType.selectedValue
    );

    const [configValues, setConfigValues] = useState<Record<string, any>>(() => {
        const initialValues: Record<string, any> = {};
        
        const collectValues = (options: any[]) => {
            options.forEach((option) => {
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
                
                if (option.children && option.children.length > 0) {
                    collectValues(option.children);
                }
            });
        };

        if (parameter.options) {
            collectValues(parameter.options);
        }
        
        return initialValues;
    });

    const handleValueChange = (keyName: string, value: any) => {
        setConfigValues((prev) => ({
            ...prev,
            [keyName]: value,
        }));
    };

    const handleApply = () => {
        const updateOptionsWithValues = (options: any[]): any[] => {
            return options.map((option) => {
                const updatedOption = {
                    ...option,
                    value: configValues[option.keyName],
                };
                if (option.children && option.children.length > 0) {
                    updatedOption.children = updateOptionsWithValues(option.children);
                }
                return updatedOption;
            });
        };

        const updatedParameter = {
            ...parameter,
            returnType: {
                ...parameter.returnType,
                selectedValue: selectedReturnTypeKey
            },
            options: parameter.options ? updateOptionsWithValues(parameter.options) : parameter.options,
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
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Configuration Options */}
                {parameter.options && parameter.options.length > 0 ? (
                    <div className="space-y-4">
                        <label className={`text-sm font-semibold ${textPrimary} block mb-1`}>
                            Options
                        </label>
                        {parameter.options.map((option) => (
                            <ConfigurationInput
                                key={option.keyName}
                                option={option}
                                configValues={configValues}
                                onChange={handleValueChange}
                            />
                        ))}
                    </div>
                ) : (
                    parameter.returnType.type !== "object" && (
                        <div className={`text-center py-8 ${textSecondary}`}>
                            <p>No configuration options available for this parameter.</p>
                        </div>
                    )
                )}

                {/* Return Field Selection for Objects */}
                {parameter.returnType.type === "object" && parameter.returnType.values && parameter.returnType.values.length > 0 && (
                    <div className="space-y-3">
                         <div className="flex items-center gap-2">
                             <div className={`h-px flex-1 ${borderColor.replace("border-", "bg-")} opacity-20`}></div>
                             <label className={`text-sm font-semibold ${textPrimary} whitespace-nowrap`}>
                                 Return Field
                             </label>
                             <div className={`h-px flex-1 ${borderColor.replace("border-", "bg-")} opacity-20`}></div>
                         </div>
                        
                        <div className={`grid grid-cols-2 gap-2`}>
                            <button
                                onClick={() => setSelectedReturnTypeKey(undefined)}
                                className={`px-3 py-2 rounded-lg text-sm border transition-all ${!selectedReturnTypeKey
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm font-medium'
                                        : `${borderColor} ${textSecondary} hover:${borderColor.replace("border-", "bg-")}`
                                    }`}
                            >
                                Entire Object
                            </button>
                            {parameter.returnType.values.map((val) => (
                                <button
                                    key={val.key}
                                    onClick={() => setSelectedReturnTypeKey(val.key)}
                                    className={`px-3 py-2 rounded-lg text-sm border transition-all ${selectedReturnTypeKey === val.key
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm font-medium'
                                            : `${borderColor} ${textSecondary} hover:${borderColor.replace("border-", "bg-")}`
                                        }`}
                                >
                                    {val.name}
                                </button>
                            ))}
                        </div>
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
