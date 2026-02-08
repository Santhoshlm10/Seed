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
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const { generateFile, loading, progress } = useDataGenerator();

  const handleDownloadAction = (action: string) => {
    const fileName = `${schemaName}_data`;
    const schema: Parameter[] = fields.map(f => f.value);
    generateFile(null, action, fileName, schema, recordCount, schemaName.replace(/\s+/g, '_'), schemaName.replace(/\s+/g, '_'));
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
    const parameters: Parameter[] = fields.map(f => f.value);
    DownloadManager.saveTemplate(parameters, schemaName, recordCount.toString());
  };

  const processFile = (file: File) => {
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

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/json") {
      processFile(file);
    } else if (file) {
      alert("Please drop a valid JSON file.");
    }
  };

  return (
    <div
      className={`w-auto h-full ${bgPrimary} ${textPrimary} flex flex-col relative overflow-hidden`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-blue-500 bg-opacity-20 backdrop-blur-sm border-4 border-blue-500 border-dashed m-4 rounded-lg flex items-center justify-center pointer-events-none">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl flex flex-col items-center">
            <div className="text-blue-500 mb-2">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">Drop template to import</p>
          </div>
        </div>
      )}

      {/* Header */}
      <Header onExport={handleExport} />

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
                  Please add fields or drag and drop a template to generate data
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
                      className={`w-full ${inputBg} border ${borderColor} rounded px-3 py-2 text-sm text-left focus:outline-none focus:border-blue-500 ${hoverBg.replace("hover:", "")} flex items-center justify-between ${field.value?.parameterName ? textPrimary : textSecondary}`}
                    >
                      <span>{field.value?.parameterName || "Select Type"}</span>
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
        onDownloadAction={handleDownloadAction}
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
