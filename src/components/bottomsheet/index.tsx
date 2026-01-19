import React, { useCallback, useState } from "react";
import { useTheme } from "../../ThemeProvider";
import Accordion from "../ui/Accordion";
import data from "./../../resources/data.json";
import { DataSource, Parameter } from "../../models/Playground";
import { FileIcon } from "../ui/Icons";

interface IBottomSheet{
    closeBottomSheet: () => void;
    selectType: (data:any,type:any) => void;
}

function BottomSheet({closeBottomSheet}:IBottomSheet){
  const { theme, isDarkMode } = useTheme();
  const {  bgSecondary, borderColor, textPrimary,inputBg } = theme;

    const [dataSrc, setDataSrc] = React.useState<DataSource>(data as any);


  const [searchValue,setSearchValue] = useState<string>("");
  const returnTitle = useCallback(
    (item: string) => {
      return `${item} (${dataSrc[item]["groupValue"].length})`;
    },
    [dataSrc]
  );

   const renderOptions = useCallback(
    (item: string) => {
      const { groupValue } = dataSrc[item];
      return (
        <div className="flex flex-col gap-2">
          {groupValue.map((group: Parameter, index: number) => {
            return (
              <div
                title={group?.description}
                onClick={() => alert(group)}
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
                <hr className="border border-gray-300 w-full" />
              </div>
            );
          })}
        </div>
      );
    },
    [dataSrc]
  );


    return (
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
              <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className={`w-48 ${inputBg} border ${borderColor} rounded-lg px-3 py-2 text-sm font-semibold ${textPrimary} focus:outline-none focus:border-blue-500`}
              placeholder="Untitled Schema"
            />
            </div>
 
            {/* Options List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {dataSrc &&
                Object.keys(dataSrc).map((item, index) => {
                  return (
                    <Accordion
                      title={returnTitle(item)}
                      children={renderOptions(item)}
                      key={index}
                    />
                  );
                })}
            </div>
          </div>
        </>
    )
}
export default BottomSheet;