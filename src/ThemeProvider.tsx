import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type ThemeColors = {
  bgPrimary: string;
  bgSecondary: string;
  textPrimary: string;
  textSecondary: string;
  borderColor: string;
  hoverBg: string;
  inputBg: string;
};

type ThemeMode = "light" | "dark";

interface IThemeContext {
  theme: ThemeColors;
  setTheme: () => void;
  isDarkMode: boolean
}


const ThemeContext = createContext<IThemeContext | undefined>(undefined);

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>("light");

  const themeObject: Record<ThemeMode, ThemeColors> = {
    light: {
      bgPrimary: "bg-white",
      bgSecondary: "bg-gray-50",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
      borderColor: "border-gray-200",
      hoverBg: "hover:bg-gray-100",
      inputBg: "bg-white",
    },
    dark: {
      bgPrimary: "bg-slate-900",
      bgSecondary: "bg-slate-800",
      textPrimary: "text-white",
      textSecondary: "text-slate-400",
      borderColor: "border-slate-700",
      hoverBg: "hover:bg-slate-700",
      inputBg: "bg-slate-900",
    },
  };

  const theme = useMemo(() => themeObject[mode], [mode]);

  const setTheme = useCallback(() => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const contextValue = useMemo(
    () => ({
      theme,
      setTheme,
      isDarkMode: mode === "dark" ? true: false
    }),
    [theme, setTheme,mode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
export const useTheme = (): IThemeContext => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeProvider