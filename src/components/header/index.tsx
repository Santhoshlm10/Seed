import { useTheme } from "../../ThemeProvider";
import { useToast } from "../hooks/useToast";
import { About, Export, Import, Moon, Sun } from "../ui/Icons";
import Menu from "../ui/Menu";

function Header() {

    const { theme, setTheme, isDarkMode } = useTheme();
    const { borderColor, textPrimary, textSecondary } = theme;

    const {showToast,Toast} = useToast();

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
            <h1 className="text-lg font-semibold" onClick={() => showToast("Hello","error")}>Paper Tiger</h1>
            <Menu
                lists={[
                    { name: "Export Schema", icon: <Export/>, onClick: () => { } },
                    { name: "Import Schema", icon: <Import/>, onClick: () => { } },
                    { name: "About", icon: <About/>, onClick: () => { } },
                ]}
            />
            <Toast/>
        </div>
    )
}
export default Header;