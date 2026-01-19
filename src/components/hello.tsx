import React, { useState } from 'react';
import { useTheme } from '../ThemeProvider';
import { Plus, Trash2 } from './ui/Icons';
import Header from './header';
import BottomSheet from './bottomsheet';

interface Field {
  id: string;
  name: string;
  type: string;
}

const DataGenerator: React.FC = () => {

  const { theme } = useTheme();
  const { bgPrimary, bgSecondary, borderColor, hoverBg, inputBg, textPrimary, textSecondary } = theme;


  const [fields, setFields] = useState<Field[]>([
    { id: '1', name: 'id', type: 'Datatype > UUID' },
    { id: '2', name: 'fullName', type: 'Person > Full Name' },
    { id: '3', name: 'email', type: 'Internet > Email' }
  ]);
  const [recordCount, setRecordCount] = useState<number>(100);
  const [showBottomSheet, setShowBottomSheet] = useState<boolean>(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [schemaName, setSchemaName] = useState<string>('Untitled Schema');



  const openBottomSheet = (fieldId: string) => {
    setActiveFieldId(fieldId);
    setShowBottomSheet(true);
  };

  const closeBottomSheet = () => {
    setShowBottomSheet(false);
    setActiveFieldId(null);
  };

  const selectType = (category: string, option: string) => {
    if (activeFieldId) {
      updateField(activeFieldId, 'type', `${category} > ${option}`);
      closeBottomSheet();
    }
  };

  const addField = () => {
    const newField: Field = {
      id: Date.now().toString(),
      name: '',
      type: 'Select Type'
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const updateField = (id: string, key: keyof Field, value: string) => {
    setFields(fields.map(field =>
      field.id === id ? { ...field, [key]: value } : field
    ));
  };



  return (
    <div className={`w-auto h-screen ${bgPrimary} ${textPrimary} flex flex-col relative overflow-hidden`}>
      {/* Header */}
      <Header />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        <div>
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
          <div className="space-y-3">
            {fields.map((field) => (
              <div key={field.id} className={`${bgSecondary} rounded-lg p-3 space-y-2`}>
                <div>
                  <label className={`text-xs ${textSecondary} uppercase tracking-wide block mb-1.5`}>
                    Field Name
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateField(field.id, 'name', e.target.value)}
                      className={`flex-1 ${inputBg} border ${borderColor} rounded px-3 py-2 text-sm ${textPrimary} focus:outline-none focus:border-blue-500`}
                      placeholder="Enter field name"
                    />
                    <button
                      onClick={() => removeField(field.id)}
                      className={`${textSecondary} hover:text-red-400`}
                    >
                      <Trash2 />
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`text-xs ${textSecondary} uppercase tracking-wide block mb-1.5`}>
                    Type
                  </label>
                  <button
                    onClick={() => openBottomSheet(field.id)}
                    className={`w-full ${inputBg} border ${borderColor} rounded px-3 py-2 text-sm ${textPrimary} text-left focus:outline-none focus:border-blue-500 ${hoverBg.replace('hover:', '')} flex items-center justify-between`}
                  >
                    <span>{field.type}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Output Settings */}
        
      </div>

      {/* Generate Button */}
      <div className={`p-4 border-t flex flex-col gap-2 ${borderColor}`}>
        <div>
          <div >
            <label className={`text-xs ${textSecondary} block mb-2`}>
              Number of Records
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={recordCount}
                onChange={(e) => setRecordCount(Number(e.target.value))}
                className={`flex-1 ${bgSecondary} border ${borderColor} rounded px-3 py-2 text-sm ${textPrimary} focus:outline-none focus:border-blue-500`}
                min="1"
              />
            
            </div>
          </div>
        </div>
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5">
            <path d="M8 2V14M8 14L4 10M8 14L12 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Generate & Download
        </button>
      </div>

      {/* Bottom Sheet */}
      {showBottomSheet && (
       <BottomSheet closeBottomSheet={closeBottomSheet} selectType={selectType}/>
      )}
    </div>
  );
};

export default DataGenerator;