import { useTheme } from "../../ThemeProvider";
import { Moon, Sun } from "../ui/Icons";
import Menu from "../ui/Menu";

function Header() {

    const { theme, setTheme, isDarkMode } = useTheme();
    const { borderColor, textPrimary, textSecondary } = theme;

    const toggleTheme = () => {
        setTheme()
    };
    return (
        <div className={`flex items-center justify-between p-4 border-b ${borderColor}`}>
            <button
                onClick={toggleTheme}
                className={`${textSecondary} cursor-pointer hover:${textPrimary} transition-colors`}
            >
                {isDarkMode ? <Sun /> : <Moon />}
            </button>
            <h1 className="text-lg font-semibold">Paper Tiger</h1>
            <Menu />
        </div>
    )
}
export default Header;