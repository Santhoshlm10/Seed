import { Dispatch, SetStateAction } from "react";
import { useTheme } from "../../ThemeProvider";
import { Download, FileJson, FileSpreadsheet, Database, ChevronDown, CopyIcon } from "../ui/Icons";
import Menu from "../ui/Menu";

interface IFooter {
    recordCount: number;
    setRecordCount: Dispatch<SetStateAction<number>>;
    onDownloadAction: (action: string) => void;
    loading: boolean;
    progress: number;
}


function Footer({ recordCount, setRecordCount, onDownloadAction, loading, progress }: IFooter) {
    const { theme } = useTheme();
    const {
        bgSecondary,
        borderColor,
        textPrimary,
    } = theme;


    const downloadButton = (
        <button
            disabled={loading}
            className={`w-full text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-all relative overflow-hidden`}
            style={{
                background: loading
                    ? `linear-gradient(90deg, #2563eb ${progress}%, #1e3a8a ${progress}%)`
                    : '#2563eb'
            }}
        >
            <span className="relative z-10 flex items-center gap-2">
                <Download /> Download <ChevronDown />
            </span>
        </button>
    );

    const menuItems = [
        { name: "Excel (.xlsx)", icon: <FileSpreadsheet />, onClick: () => onDownloadAction('excel') },
        { name: "CSV (.csv)", icon: <FileSpreadsheet />, onClick: () => onDownloadAction('csv') },
        { name: "JSON (.json)", icon: <FileJson />, onClick: () => onDownloadAction('json') },
                { name: "Copy to Clipboard (json)", icon: <CopyIcon />, onClick: () => onDownloadAction('json') },
        { name: "SQL Insert", icon: <Database />, onClick: () => onDownloadAction('sql') },
        { name: "MongoDB Insert", icon: <Database />, onClick: () => onDownloadAction('mongo') },
    ];

    return (
        <div className={`p-4 border-t flex flex-col gap-2 ${borderColor}`}>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        value={recordCount}
                        onChange={(e) => setRecordCount(Number(e.target.value))}
                        className={`flex-1 ${bgSecondary} border ${borderColor} rounded px-3 py-2 text-sm ${textPrimary} focus:outline-none focus:border-blue-500`}
                        min="1"
                    />
                </div>
                <div className="w-full relative">
                    <Menu lists={menuItems} trigger={downloadButton} />
                </div>
            </div>
        </div>
    )
}

export default Footer;