import React, { useState } from "react";
import { useTheme } from "../ThemeProvider";
import { Clone, ModifyConfiguration, Plus, Trash2, EmptyStateIcon } from "./ui/Icons";
import Header from "./header";
import BottomSheet from "./bottomsheet";
import Menu from "./ui/Menu";

import DownloadManager from "../utils/download-manager";
import { Parameter } from "../models/Playground";
import Footer from "./footer";
import useDataGenerator from "../hooks/useDataGenerator";

interface Field {
  id: string;
  name: string;
  value: any
}

const PaperTiger: React.FC = () => {
  const { theme } = useTheme();
  const {
    bgPrimary,
    bgSecondary,
    borderColor,
    hoverBg,
    inputBg,
    textPrimary,
    textSecondary,
  } = theme;

  const [fields, setFields] = useState<Field[]>([]);

  const [recordCount, setRecordCount] = useState<number>(100);
  const [showBottomSheet, setShowBottomSheet] = useState<boolean>(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [schemaName, setSchemaName] = useState<string>("Untitled Schema");

  const { generateData, loading, progress } = useDataGenerator();

  const handleGenerate = () => {
    if (fields.length === 0) {
      alert("Please add at least one field to generate data.");
      return;
    }

    // Map fields to Schema (Parameter[])
    const schema: Parameter[] = fields.map(f => f.value);
    generateData(schema, recordCount, (generatedData) => {
      DownloadManager.saveAsJSON({ data: generatedData }, `${schemaName}_data`);
    });
  };

  const openBottomSheet = (fieldId: string) => {
    setActiveFieldId(fieldId);
    setShowBottomSheet(true);
  };

  const closeBottomSheet = () => {
    setShowBottomSheet(false);
    setActiveFieldId(null);
  };

  const onSelect = (data: any) => {
    if (activeFieldId) {
      updateField(activeFieldId, "value", data);
      closeBottomSheet();
    }
  };

  const addField = () => {
    const newField: Field = {
      id: Date.now().toString(),
      name: "",
      value: {}
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter((field) => field.id !== id));
  };

  const cloneField = (id: string) => {
    const fieldToClone = fields.find((f) => f.id === id);
    if (fieldToClone) {
      const newField = {
        ...fieldToClone,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        name: fieldToClone.name + " - Clone"
      };
      const index = fields.findIndex((f) => f.id === id);
      const newFields = [...fields];
      newFields.splice(index + 1, 0, newField);
      setFields(newFields);
    }
  };

  const updateField = (id: string, key: keyof Field, value: string) => {
    setFields(
      fields.map((field) =>
        field.id === id ? { ...field, [key]: value } : field,
      ),
    );
  };

  const handleExport = () => {
    // Transform fields to match Parameter type if needed, or cast if they are compatible
    // The current Field value seems to hold the Parameter structure based on usage
    // We might need to map it correctly.
    // Based on `field.value.parameterName`, `field.value` seems to be the Parameter object.
    const parameters: Parameter[] = fields.map(f => f.value);
    DownloadManager.saveTemplate(parameters, schemaName, recordCount.toString());
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const content = event.target?.result as string;
            const parsed = JSON.parse(content);
            if (parsed.data && Array.isArray(parsed.data)) {
              // Map back to Field structure
              const importedFields: Field[] = parsed.data.map((param: any) => ({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                name: param.parameterName || "", // Or use existing logic if name is stored differently
                value: param
              }));
              setFields(importedFields);
              if (parsed.playgroundName) setSchemaName(parsed.playgroundName);
              if (parsed.count) setRecordCount(Number(parsed.count));
            } else {
              alert("Invalid template file format.");
            }
          } catch (error) {
            console.error("Error parsing JSON:", error);
            alert("Error parsing JSON file.");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div
      className={`w-auto h-full ${bgPrimary} ${textPrimary} flex flex-col relative overflow-hidden`}
    >
      {/* Header */}
      <Header onExport={handleExport} onImport={handleImport} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <input
              type="text"
              value={schemaName}
              onChange={(e) => setSchemaName(e.target.value)}
              className={`w-48 ${inputBg} border ${borderColor} rounded-lg px-3 py-2 text-sm font-semibold ${textPrimary} focus:outline-none focus:border-blue-500`}
              placeholder="Untitled Schema"
            />
            <button
              onClick={addField}
              className="text-blue-400 text-sm font-medium hover:text-blue-300 flex items-center gap-1"
            >
              <Plus />
              Add Field
            </button>
          </div>

          {/* Fields */}
          <div className="flex-1 flex flex-col space-y-3">
            {fields.length === 0 ? (
              <div
                className={`flex-1 w-full flex flex-col items-center justify-center p-8 text-center rounded-lg border-2 border-dashed ${borderColor} bg-opacity-50`}
              >
                <div className={`${textSecondary} mb-2`}>
                  <EmptyStateIcon />
                </div>
                <p className={`text-sm ${textSecondary}`}>
                  Please add fields to generate data
                </p>
              </div>
            ) : (
              fields.map((field) => (
                <div
                  key={field.id}
                  className={`${bgSecondary} rounded-lg p-3 space-y-2`}
                >
                  <div>
                    <div className="flex flex-row items-center justify-between">
                      <label
                        className={`text-xs ${textSecondary} uppercase tracking-wide block mb-1.5`}
                      >
                        Field Name
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) =>
                          updateField(field.id, "name", e.target.value)
                        }
                        className={`flex-1 ${inputBg} border ${borderColor} rounded px-3 py-2 text-sm ${textPrimary} focus:outline-none focus:border-blue-500`}
                        placeholder="Enter field name"
                      />
                      <div>
                        <Menu
                          lists={[
                            { name: "Clone Item", icon: <Clone />, onClick: () => cloneField(field.id) },
                            { name: "Delete Item", icon: <Trash2 />, onClick: () => removeField(field.id) },
                            { name: "Configuration", icon: <ModifyConfiguration />, onClick: () => openBottomSheet(field.id) },
                          ]}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      className={`text-xs ${textSecondary} uppercase tracking-wide block mb-1.5`}
                    >
                      Type
                    </label>
                    <button
                      onClick={() => openBottomSheet(field.id)}
                      className={`w-full ${inputBg} border ${borderColor} rounded px-3 py-2 text-sm ${textPrimary} text-left focus:outline-none focus:border-blue-500 ${hoverBg.replace("hover:", "")} flex items-center justify-between`}
                    >
                      <span>{field.value.parameterName}</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer
        recordCount={recordCount}
        setRecordCount={setRecordCount}
        onGenerate={handleGenerate}
        loading={loading}
        progress={progress}
      />

      {/* Bottom Sheet */}
      {showBottomSheet && (
        <BottomSheet
          closeBottomSheet={closeBottomSheet}
          onSelect={onSelect}
        />
      )}
    </div>
  );
};

export default PaperTiger;
