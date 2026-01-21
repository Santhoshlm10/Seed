import { useState } from "react";
import { useTheme } from "../../ThemeProvider";
import { MoreVertical } from "./Icons";

function Menu() {
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const { theme } = useTheme();
  const { bgSecondary, borderColor, hoverBg, textPrimary, textSecondary } =
    theme;
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };
  return (
    <>
      <div className="relative">
        <button
          onClick={toggleMenu}
          className={`${textSecondary} cursor-pointer hover:${textPrimary} transition-colors`}
        >
          <MoreVertical />
        </button>
        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setShowMenu(false)}
            ></div>
            <div
              className={`absolute right-0 top-8 ${bgSecondary} ${borderColor} border rounded-lg shadow-lg z-40 w-48 py-1`}
            >
              <button
                className={`w-full text-left px-4 py-2 text-sm ${textPrimary} ${hoverBg} transition-colors`}
              >
                Export Schema
              </button>
              <button
                className={`w-full text-left px-4 py-2 text-sm ${textPrimary} ${hoverBg} transition-colors`}
              >
                Import Schema
              </button>
              <a
                href="https://github.com/Santhoshlm10/paper-tiger"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button
                  className={`w-full text-left px-4 py-2 text-sm ${textPrimary} ${hoverBg} transition-colors`}
                >
                  About
                </button>
              </a>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Menu;
