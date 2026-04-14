import React, { useCallback, useState } from "react";
import { useTheme } from "../../ThemeProvider";
import Accordion from "../ui/Accordion";
import data from "./../../resources/data.json";
import { DataSource, Group, Parameter } from "../../models/Playground";
import { FileIcon } from "../ui/Icons";
import ConfigurationView from "./ConfigurationView";

interface IBottomSheet {
  closeBottomSheet: () => void;
  onSelect: (data: any) => void;
  activeField?: { id: string; name: string; value: any } | null;
}

function BottomSheet({ closeBottomSheet, onSelect, activeField: _activeField }: IBottomSheet) {
  const { theme, isDarkMode } = useTheme();
  const { bgSecondary, borderColor, textPrimary, inputBg, textSecondary } = theme;

  const [dataSrc, setDataSrc] = React.useState<DataSource>(data as any);
  const [searchValue, setSearchValue] = useState<string>("");

  const [view, setView] = useState<'selection' | 'configuration'>('selection');
  const [selectedParameter, setSelectedParameter] = useState<Parameter | null>(null);

  const returnTitle = useCallback(
    (item: string) => {
      return `${item} (${dataSrc[item]["groupValue"].length})`;
    },
    [dataSrc]
  );

  function searchJSON(data: DataSource, searchKey: string) {
    const lowerCaseSearchKey = searchKey.toLowerCase();
    const result: { [key: string]: Group } = {};
    for (const [groupName, group] of Object.entries(data)) {
      const filteredGroupValue = (group as Group).groupValue.filter(
        (item: Parameter) => {
          const parameterNameMatch = item.parameterName
            .toLowerCase()
            .includes(lowerCaseSearchKey);
          const searchQueryMatch = item.searchQueries.some((query: string) =>
            query.toLowerCase().includes(lowerCaseSearchKey)
          );
          return parameterNameMatch || searchQueryMatch;
        }
      );
      if (filteredGroupValue.length > 0) {
        result[groupName] = {
          ...(typeof group === "object" ? group : {}),
          groupValue: filteredGroupValue,
          groupName: groupName,
        };
      }
    }
    return result;
  }

  const handleParameterSelect = (parameter: Parameter) => {
    const hasOptions = parameter.options && parameter.options.length > 0;
    const isObject = parameter.returnType.type === 'object';

    if (!hasOptions && !isObject) {
      onSelect(parameter);
      closeBottomSheet();
      return;
    }
    setSelectedParameter(parameter);
    setView('configuration');
  };

  const handleBackToSelection = () => {
    setView('selection');
    setSelectedParameter(null);
  };

  const handleApplyConfiguration = (configuredParameter: Parameter) => {
    onSelect(configuredParameter);
    closeBottomSheet();
  };

  const renderOptions = useCallback(
    (item: string) => {
      const { groupValue } = dataSrc[item];

      return (
        <div className="flex flex-col gap-2">
          {groupValue.map((group: Parameter, index: number) => {
            return (
              <div
                title={group?.description}
                onClick={() => handleParameterSelect(groupValue[index])}
                key={index}
              >
                <div
                  key={index}
                  className="flex flex-row items-center gap-[5px] m-[7px] hover:font-semibold hover:cursor-pointer"
                >
                  <FileIcon />
                  <div className="flex items-center gap-[1px]">
                    {group.parameterName}
                  </div>
                </div>
                <hr className="border border-gray-100 w-full" />
              </div>
            );
          })}
        </div>
      );
    },
    [dataSrc]
  );

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let text = e.target.value;
    let filter = searchJSON(data as any, text);
    setDataSrc(filter)
    setSearchValue(text);
  }, []);


  return (
    <>
      <div
        className="absolute inset-0 bg-black bg-opacity-50 z-40"
        onClick={closeBottomSheet}
      ></div>

      <div className={`absolute bottom-0 left-0 right-0 ${bgSecondary} rounded-t-2xl z-50 h-[35rem] overflow-hidden flex flex-col shadow-2xl`}>
        {view === 'selection' ? (
          <>
            <div className="flex justify-center py-3">
              <div className={`w-10 h-1 ${isDarkMode ? 'bg-slate-600' : 'bg-gray-300'} rounded-full`}></div>
            </div>

            <div className={`px-4 pb-3 border-b ${borderColor}`}>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={textSecondary}
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>

                <input
                  type="text"
                  value={searchValue}
                  onChange={handleSearch}
                  className={`w-full ${inputBg} border ${borderColor} rounded-lg pl-10 pr-3 py-2 text-sm font-semibold ${textPrimary} focus:outline-none focus:border-blue-500`}
                  placeholder="Search"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {dataSrc &&
                Object.keys(dataSrc).sort((a, b) => a.localeCompare(b)).map((item, index) => {
                  return (
                    <Accordion
                      title={returnTitle(item)}
                      children={renderOptions(item)}
                      key={index}
                      titleKey={item}
                    />
                  );
                })}
            </div>
          </>
        ) : (
          selectedParameter  && (
            <ConfigurationView
              parameter={selectedParameter}
              onBack={handleBackToSelection}
              onApply={handleApplyConfiguration}
            />
          )
        )}
      </div>
    </>
  )
}
export default BottomSheet;