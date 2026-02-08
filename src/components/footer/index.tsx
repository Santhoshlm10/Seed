import { Dispatch, SetStateAction } from "react";
import { useTheme } from "../../ThemeProvider";

interface IFooter {
    recordCount: number;
    setRecordCount: Dispatch<SetStateAction<number>>;
    onGenerate: () => void;
    loading: boolean;
    progress: number;
}

function Footer({ recordCount, setRecordCount, onGenerate, loading, progress }: IFooter) {

    const { theme } = useTheme();
    const {
        bgSecondary,
        borderColor,
        textPrimary,
    } = theme;

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
                <div className="w-full">
                    <button
                        onClick={onGenerate}
                        disabled={loading}
                        className={`w-full ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors`}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            className="mt-0.5"
                        >
                            <path
                                d="M8 2V14M8 14L4 10M8 14L12 10"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        {loading ? `Generating... ${progress}%` : "Generate & Download"}
                    </button>
                </div>

            </div>

        </div>
    )
}

export default Footer;