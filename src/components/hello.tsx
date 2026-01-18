import React, { useState } from 'react';

// SVG Icons
const Plus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const Trash2 = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const Sun = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const Moon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const MoreVertical = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="12" cy="5" r="1"></circle>
    <circle cx="12" cy="19" r="1"></circle>
  </svg>
);

interface Field {
  id: string;
  name: string;
  type: string;
}

const DataGenerator: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([
    { id: '1', name: 'id', type: 'Datatype > UUID' },
    { id: '2', name: 'fullName', type: 'Person > Full Name' },
    { id: '3', name: 'email', type: 'Internet > Email' }
  ]);
  const [recordCount, setRecordCount] = useState<number>(100);
  const [showBottomSheet, setShowBottomSheet] = useState<boolean>(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [schemaName, setSchemaName] = useState<string>('Untitled Schema');

  const dataTypes = [
    { category: 'Datatype', options: ['UUID', 'Boolean', 'JSON'] },
    { category: 'Person', options: ['Full Name', 'First Name', 'Last Name', 'Gender', 'Job Title'] },
    { category: 'Internet', options: ['Email', 'URL', 'Username', 'IP Address', 'Domain'] },
    { category: 'Number', options: ['Integer', 'Float', 'Decimal'] },
    { category: 'Date', options: ['Past', 'Future', 'Recent', 'Soon', 'Birthdate'] },
    { category: 'Address', options: ['Street', 'City', 'State', 'Country', 'Zip Code'] },
    { category: 'Company', options: ['Name', 'Industry', 'Catch Phrase'] },
    { category: 'Lorem', options: ['Word', 'Sentence', 'Paragraph', 'Text'] }
  ];

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

  const setQuickCount = (count: number) => {
    setRecordCount(count);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  // Theme classes
  const bgPrimary = isDarkMode ? 'bg-slate-900' : 'bg-white';
  const bgSecondary = isDarkMode ? 'bg-slate-800' : 'bg-gray-50';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-slate-400' : 'text-gray-600';
  const borderColor = isDarkMode ? 'border-slate-700' : 'border-gray-200';
  const hoverBg = isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100';
  const inputBg = isDarkMode ? 'bg-slate-900' : 'bg-white';

  return (
    <div className={`w-80 h-screen ${bgPrimary} ${textPrimary} flex flex-col relative overflow-hidden`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${borderColor}`}>
        <button 
          onClick={toggleTheme}
          className={`${textSecondary} cursor-pointer hover:${textPrimary} transition-colors`}
        >
          {isDarkMode ? <Sun /> : <Moon />}
        </button>
        <h1 className="text-lg font-semibold">Data Generator</h1>
        <div className="relative">
          <button 
            onClick={toggleMenu}
            className={`${textSecondary} cursor-pointer hover:${textPrimary} transition-colors`}
          >
            <MoreVertical />
          </button>
          
          {/* Menu Dropdown */}
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-30"
                onClick={() => setShowMenu(false)}
              ></div>
              <div className={`absolute right-0 top-8 ${bgSecondary} ${borderColor} border rounded-lg shadow-lg z-40 w-48 py-1`}>
                <button className={`w-full text-left px-4 py-2 text-sm ${textPrimary} ${hoverBg} transition-colors`}>
                  Export Schema
                </button>
                <button className={`w-full text-left px-4 py-2 text-sm ${textPrimary} ${hoverBg} transition-colors`}>
                  Import Schema
                </button>
                <button className={`w-full text-left px-4 py-2 text-sm ${textPrimary} ${hoverBg} transition-colors`}>
                  Settings
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Schema Name Input */}
        <div>
          <input
            type="text"
            value={schemaName}
            onChange={(e) => setSchemaName(e.target.value)}
            className={`w-full ${inputBg} border ${borderColor} rounded-lg px-3 py-2 text-base font-semibold ${textPrimary} focus:outline-none focus:border-blue-500`}
            placeholder="Untitled Schema"
          />
        </div>

        {/* Fields Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className={`text-sm font-medium ${textSecondary}`}>Fields</h2>
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
        <div>
          <h2 className={`text-sm font-medium ${textSecondary} mb-3`}>Output Settings</h2>
          
          <div>
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
              <button
                onClick={() => setQuickCount(10)}
                className={`px-3 py-2 text-sm rounded ${
                  recordCount === 10 
                    ? 'bg-blue-600 text-white' 
                    : `${bgSecondary} ${textSecondary} ${hoverBg}`
                }`}
              >
                10
              </button>
              <button
                onClick={() => setQuickCount(100)}
                className={`px-3 py-2 text-sm rounded ${
                  recordCount === 100 
                    ? 'bg-blue-600 text-white' 
                    : `${bgSecondary} ${textSecondary} ${hoverBg}`
                }`}
              >
                100
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className={`p-4 border-t ${borderColor}`}>
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5">
            <path d="M8 2V14M8 14L4 10M8 14L12 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Generate & Download
        </button>
      </div>

      {/* Bottom Sheet */}
      {showBottomSheet && (
        <>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeBottomSheet}
          ></div>

          {/* Bottom Sheet Content */}
          <div className={`absolute bottom-0 left-0 right-0 ${bgSecondary} rounded-t-2xl z-50 max-h-96 overflow-hidden flex flex-col shadow-2xl`}>
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className={`w-10 h-1 ${isDarkMode ? 'bg-slate-600' : 'bg-gray-300'} rounded-full`}></div>
            </div>

            {/* Header */}
            <div className={`px-4 pb-3 border-b ${borderColor}`}>
              <h3 className={`text-base font-semibold ${textPrimary}`}>Select Data Type</h3>
            </div>

            {/* Options List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {dataTypes.map((category) => (
                <div key={category.category}>
                  <h4 className={`text-xs font-medium ${textSecondary} uppercase tracking-wide mb-2`}>
                    {category.category}
                  </h4>
                  <div className="space-y-1">
                    {category.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => selectType(category.category, option)}
                        className={`w-full text-left px-3 py-2.5 text-sm ${textPrimary} ${hoverBg} rounded transition-colors`}
                      >
                        {category.category} &gt; {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DataGenerator;