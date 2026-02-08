import { useState } from "react";
import { useTheme } from "../../ThemeProvider";
import { MoreVertical } from "./Icons";
import { IMenuList } from "../../types/types";



function Menu({ lists, trigger, position }: IMenuList) {
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const { theme } = useTheme();
  const { bgSecondary, borderColor, hoverBg, textPrimary, textSecondary } =
    theme;
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const pos = position || (trigger ? 'top' : 'bottom');
  const posClass = pos === 'top' ? 'bottom-full mb-2' : 'top-8';

  return (
    <>
      <div className={`relative ${trigger ? 'w-full' : 'w-auto'}`}>
        <div onClick={toggleMenu} className="cursor-pointer">
          {trigger ? trigger : (
            <button
              className={`${textSecondary} cursor-pointer hover:${textPrimary} transition-colors`}
            >
              <MoreVertical />
            </button>
          )}
        </div>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setShowMenu(false)}
            ></div>
            <div
              className={`absolute right-0 ${posClass} ${bgSecondary} ${borderColor} border rounded-lg shadow-lg z-40 w-full min-w-48 py-1`}
            >
              {lists.map((i, index) => (
                <div key={index}>
                  <button
                    className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm ${textPrimary} ${hoverBg} transition-colors`}
                    onClick={() => {
                      i.onClick(i);
                      setShowMenu(false);
                    }}
                  >
                    {i.icon}  {i.name}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Menu;
