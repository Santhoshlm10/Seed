import React, { useState } from "react";
import { useTheme } from "../ThemeProvider";
import { Clone, Plus, Trash2, EmptyStateIcon } from "./ui/Icons";
import Header from "./header";
import BottomSheet from "./bottomsheet";
import Menu from "./ui/Menu";
import Forms from "./forms/Forms";

import { Parameter } from "../models/Playground";
import { FormFieldMapping, FormDefinition } from "../models/Forms";
import Footer from "./footer";
import useDataGenerator from "../hooks/useDataGenerator";
import { useToast } from "./hooks/useToast";
import JSZip from "jszip";

interface Field {
  id: string;
  name: string;
  value: any
}

const Seed: React.FC = () => {
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
  console.log("FieldsData", fields)
  
  const [recordCount, setRecordCount] = useState<number>(100);
  const [showBottomSheet, setShowBottomSheet] = useState<boolean>(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [schemaName, setSchemaName] = useState<string>("Untitled Schema");
  const [draggedField, setDraggedField] = useState<string | null>(null);
  const [dragOverField, setDragOverField] = useState<string | null>(null);
  const { generateFile, loading, progress } = useDataGenerator();
  const { showToast, Toast } = useToast();
  const [activeTab, setActiveTab] = useState<'generator' | 'forms'>('generator');
  const [formMappings, setFormMappings] = useState<FormFieldMapping[]>([]);
  const [formName, setFormName] = useState<string>('Untitled Form');
  const [bulkForms, setBulkForms] = useState<FormDefinition[]>([]);

  const handleDownloadAction = (action: string) => {
    // Validate field names
    const emptyFields = fields.filter(f => !f.name.trim());
    if (emptyFields.length > 0) {
      showToast("All fields must have a name", "error");
      return;
    }

    const fileName = `${schemaName}_data`;
    const schema: Parameter[] = fields.map(f => ({ ...f.value, columnName: f.name.replace(/\s+/g, "") }));
    const isCopy = action === 'json-copy';
    const format = isCopy ? 'json' : action;
    
    generateFile(
      null, 
      format, 
      fileName, 
      schema, 
      recordCount, 
      schemaName.replace(/\s+/g, '_'), 
      schemaName.replace(/\s+/g, '_'), 
      isCopy,
      () => {
        showToast(isCopy ? "Copied to clipboard" : "Download started", "success");
      },
      (err) => {
        showToast(err, "error");
      }
    );
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
      setFields(
        fields.map((field) => {
          const cleanedName = (field.name.replace(/\s+/g, "") || data.parameterName.replace(/\s+/g, ""));
          return field.id === activeFieldId
            ? { ...field, value: { ...data, columnName: cleanedName }, name: cleanedName }
            : field;
        }),
      );
      closeBottomSheet();
    }
  };

  const addField = () => {
    const newField: Field = {
      id: Date.now().toString(),
      name: `field_${fields.length + 1}`,
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
        name: fieldToClone.name + "_Clone"
      };
      const index = fields.findIndex((f) => f.id === id);
      const newFields = [...fields];
      newFields.splice(index + 1, 0, newField);
      setFields(newFields);
    }
  };

  const updateField = (id: string, key: keyof Field, value: string) => {
    const processedValue = key === "name" ? value.replace(/\s+/g, "") : value;
    setFields(
      fields.map((field) =>
        field.id === id ? { ...field, [key]: processedValue, value: key === 'name' ? { ...field.value, columnName: processedValue } : field.value } : field,
      ),
    );
  };

  const handleExport = () => {
    const parameters: Parameter[] = fields.map(f => f.value);
    const sanitizedSchemaName = schemaName.replace(/[<>:"/\\|?*]/g, "_");

    const downloadTemplate = {
      data: parameters,
      playgroundName: schemaName,
      count: recordCount.toString(),
    };

    const jsonContent = JSON.stringify(downloadTemplate, null, 2);
    const fileName = `${sanitizedSchemaName}_template.json`;
    const blob = new Blob([jsonContent], { type: "application/json" });

    // @ts-ignore
    const isExtension = typeof chrome !== "undefined" && chrome.downloads;

    if (isExtension) {
      // Use Chrome Downloads API (doesn't close side panel)
      const reader = new FileReader();
      reader.onload = () => {
        // @ts-ignore
        chrome.downloads.download({
          url: reader.result as string,
          filename: fileName,
          saveAs: false
        });
      };
      reader.readAsDataURL(blob);
    } else {
      // Fallback to standard download for web
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(link.href), 100);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.data && Array.isArray(parsed.data)) {
          const importedFields: Field[] = parsed.data.map((param: any) => {
            const sanitizedName = (param.columnName || param.parameterName || "").replace(/\s+/g, "");
            return {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
              name: sanitizedName,
              value: { ...param, columnName: sanitizedName }
            };
          });
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

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        processFile(file);
      }
    };
    input.click();
  };

  // ─── Form export / import ────────────────────────────────────────────────

  const downloadJSON = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    // @ts-ignore
    const isExtension = typeof chrome !== 'undefined' && chrome.downloads;
    if (isExtension) {
      const reader = new FileReader();
      reader.onload = () => {
        // @ts-ignore
        chrome.downloads.download({ url: reader.result as string, filename: fileName, saveAs: false });
      };
      reader.readAsDataURL(blob);
    } else {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(link.href), 100);
    }
  };

  const handleExportForm = () => {
    if (formMappings.length === 0) {
      showToast('No form fields to export', 'error');
      return;
    }
    const sanitized = formName.replace(/[<>:"/\\|?*]/g, '_');
    const content = JSON.stringify({ version: 1, name: formName, mappings: formMappings }, null, 2);
    downloadJSON(content, `${sanitized}_form.json`);
    showToast('Form exported', 'success');
  };

  const handleImportForm = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target?.result as string);
          if (parsed.mappings && Array.isArray(parsed.mappings)) {
            // Re-stamp IDs so they're unique in this session
            const imported: FormFieldMapping[] = parsed.mappings.map((m: FormFieldMapping) => ({
              ...m,
              id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            }));
            setFormMappings(imported);
            if (parsed.name) setFormName(parsed.name);
            setBulkForms([]); // Clear bulk forms when importing a single form
            setActiveTab('forms');
            showToast(`Imported ${imported.length} field${imported.length !== 1 ? 's' : ''}`, 'success');
          } else {
            showToast('Invalid form file', 'error');
          }
        } catch {
          showToast('Could not parse file', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleImportBulkForm = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip,application/zip';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const zip = new JSZip();
        const loadedZip = await zip.loadAsync(file);
        const forms: FormDefinition[] = [];
        
        for (const [filename, zipEntry] of Object.entries(loadedZip.files)) {
          if (!zipEntry.dir && filename.endsWith('.json')) {
            const content = await zipEntry.async("text");
            try {
              const parsed = JSON.parse(content);
              if (parsed.mappings && Array.isArray(parsed.mappings)) {
                forms.push({
                  name: parsed.name || filename.replace('.json', ''),
                  mappings: parsed.mappings.map((m: FormFieldMapping) => ({
                    ...m,
                    id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                  }))
                });
              }
            } catch (err) {
              console.warn(`Skipping invalid JSON file in zip: ${filename}`);
            }
          }
        }
        
        if (forms.length > 0) {
          setBulkForms(forms);
          setActiveTab('forms');
          showToast(`Imported ${forms.length} bulk forms`, 'success');
        } else {
          showToast('No valid forms found in the zip file', 'error');
        }
      } catch (err) {
        showToast('Failed to parse zip file', 'error');
      }
    };
    input.click();
  };

  const handleFieldDragStart = (e: React.DragEvent, fieldId: string) => {
    setDraggedField(fieldId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleFieldDragOver = (e: React.DragEvent, fieldId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedField && draggedField !== fieldId) {
      setDragOverField(fieldId);
    }
  };

  const handleFieldDragLeave = () => {
    setDragOverField(null);
  };

  const handleFieldDrop = (e: React.DragEvent, targetFieldId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedField || draggedField === targetFieldId) {
      setDraggedField(null);
      setDragOverField(null);
      return;
    }

    const draggedIndex = fields.findIndex(f => f.id === draggedField);
    const targetIndex = fields.findIndex(f => f.id === targetFieldId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newFields = [...fields];
      const [removed] = newFields.splice(draggedIndex, 1);
      newFields.splice(targetIndex, 0, removed);
      setFields(newFields);
    }

    setDraggedField(null);
    setDragOverField(null);
  };

  const handleFieldDragEnd = () => {
    setDraggedField(null);
    setDragOverField(null);
  };

  return (
    <div
      className={`w-auto h-full ${bgPrimary} ${textPrimary} flex flex-col relative overflow-hidden`}
    >
      {/* Header */}
      <Header
        activeTab={activeTab}
        onExport={handleExport}
        onImport={handleImport}
        onExportForm={handleExportForm}
        onImportForm={handleImportForm}
        onImportBulkForm={handleImportBulkForm}
      />

      {/* Tab Bar */}
      <div className={`flex border-b ${borderColor} shrink-0`}>
        {(['generator', 'forms'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors capitalize ${
              activeTab === tab
                ? `border-b-2 border-blue-500 text-blue-500`
                : `${textSecondary} hover:${textPrimary}`
            }`}
          >
            {tab === 'generator' ? 'Generator' : 'Forms'}
          </button>
        ))}
      </div>

      {/* Forms tab — full height, own scroll */}
      {activeTab === 'forms' && (
        <div className="flex-1 overflow-hidden">
          <Forms mappings={formMappings} setMappings={setFormMappings} formName={formName} setFormName={setFormName} bulkForms={bulkForms} setBulkForms={setBulkForms} />
        </div>
      )}

      {/* Generator tab */}
      {activeTab === 'generator' && (
        <>
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
                  draggable
                  onDragStart={(e) => handleFieldDragStart(e, field.id)}
                  onDragOver={(e) => handleFieldDragOver(e, field.id)}
                  onDragLeave={handleFieldDragLeave}
                  onDrop={(e) => handleFieldDrop(e, field.id)}
                  onDragEnd={handleFieldDragEnd}
                  className={`${bgSecondary} rounded-lg p-3 space-y-2 cursor-move transition-all ${draggedField === field.id ? 'opacity-50 scale-95' : ''
                    } ${dragOverField === field.id ? 'border-2 border-blue-500 border-dashed' : ''
                    }`}
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

      {/* Footer — generator only */}
      {activeTab === 'generator' && (
        <Footer
          recordCount={recordCount}
          setRecordCount={setRecordCount}
          onDownloadAction={handleDownloadAction}
          loading={loading}
          progress={progress}
        />
      )}

        {/* Bottom Sheet */}
        {showBottomSheet && (
          <BottomSheet
            closeBottomSheet={closeBottomSheet}
            onSelect={onSelect}
            activeField={activeFieldId ? fields.find(f => f.id === activeFieldId) : null}
          />
        )}
        </>
      )}
      <Toast />
    </div>
  );
};

export default Seed;
