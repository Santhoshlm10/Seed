import { useTheme } from "../../ThemeProvider";
import { About, Export, Import, Moon, Sun } from "../ui/Icons";
import Menu from "../ui/Menu";

interface HeaderProps {
    activeTab: 'generator' | 'forms';
    onExport: () => void;
    onImport: () => void;
    onExportForm: () => void;
    onImportForm: () => void;
    onImportBulkForm: () => void;
}

function Header({ activeTab, onExport, onImport, onExportForm, onImportForm, onImportBulkForm }: HeaderProps) {
    const { theme, setTheme, isDarkMode } = useTheme();
    const { borderColor, textPrimary, textSecondary } = theme;

    const menuItems = activeTab === 'generator'
        ? [
            { name: "Import Schema", icon: <Import />, onClick: onImport },
            { name: "Export Schema", icon: <Export />, onClick: onExport },
            { name: "About", icon: <About />, onClick: () => window.open("https://github.com/Santhoshlm10/seed") },
          ]
        : [
            { name: "Import Form", icon: <Import />, onClick: onImportForm },
            { name: "Import Bulk", icon: <Import />, onClick: onImportBulkForm, infoText: "Upload a zip file which includes json of forms" },
            { name: "Export Form", icon: <Export />, onClick: onExportForm },
            { name: "About", icon: <About />, onClick: () => window.open("https://github.com/Santhoshlm10/seed") },
          ];

    return (
        <div className={`flex items-center justify-between p-4 border-b ${borderColor}`}>
            <button
                onClick={setTheme}
                className={`${textSecondary} cursor-pointer hover:${textPrimary} transition-colors`}
            >
                {isDarkMode ? <Sun /> : <Moon />}
            </button>
            <h1 className="text-lg font-semibold">Seed</h1>
            <Menu lists={menuItems} />
        </div>
    );
}

export default Header;