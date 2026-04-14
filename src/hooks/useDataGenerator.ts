import { useState, useCallback, useRef, useEffect } from "react";
import { Parameter } from "../models/Playground";

interface WorkerMessage {
    type: "PROGRESS" | "RESULT" | "ERROR" | "DOWNLOAD_RESULT";
    progress?: number;
    data?: any[];
    error?: string;
    content?: any;
    mimeType?: string;
    fileName?: string;
}

interface UseDataGeneratorReturn {
    generateData: (schema: Parameter[], count: number, onComplete?: (data: any[]) => void) => void;
    generateFile: (data: any[] | null, format: string, fileName: string, schema?: Parameter[], count?: number, tableName?: string, collectionName?: string, isCopy?: boolean, onSuccess?: () => void, onError?: (err: string) => void) => void;
    loading: boolean;
    progress: number;
    data: any[] | null;
    error: string | null;
}

const useDataGenerator = (): UseDataGeneratorReturn => {
    const [loading, setLoading] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [data, setData] = useState<any[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
            }
        };
    }, []);

    const generateData = useCallback((schema: Parameter[], count: number, onComplete?: (data: any[]) => void) => {
        setLoading(true);
        setProgress(0);
        setData(null);
        setError(null);

        if (workerRef.current) {
            workerRef.current.terminate();
        }

        workerRef.current = new Worker(new URL('../workers/worker.js', import.meta.url), { type: 'module' });

        workerRef.current.onmessage = (event: MessageEvent<WorkerMessage>) => {
            const { type, progress, data, error } = event.data;

            switch (type) {
                case "PROGRESS":
                    if (typeof progress === 'number') {
                        setProgress(progress);
                    }
                    break;
                case "RESULT":
                    setData(data || []);
                    setLoading(false);
                    setProgress(100);
                    if (onComplete && data) {
                        onComplete(data);
                    }
                    break;
                case "ERROR":
                    setError(error || "Unknown worker error");
                    setLoading(false);
                    break;
                default:
                    break;
            }
        };

        workerRef.current.onerror = (err) => {
            setError(err.message || "Worker error");
            setLoading(false);
        };

        workerRef.current.postMessage({
            type: 'GENERATE',
            schema,
            count
        });
    }, []);

    const generateFile = useCallback((data: any[] | null, format: string, fileName: string, schema?: Parameter[], count?: number, tableName?: string, collectionName?: string, isCopy?: boolean, onSuccess?: () => void, onError?: (err: string) => void) => {
        setLoading(true);
        setProgress(0);
        setError(null);

        if (workerRef.current) {
            workerRef.current.terminate();
        }

        workerRef.current = new Worker(new URL('../workers/worker.js', import.meta.url), { type: 'module' });

        workerRef.current.onmessage = (event: MessageEvent<WorkerMessage>) => {
            const { type, progress, error } = event.data;
            switch (type) {
                case "PROGRESS":
                    if (typeof progress === 'number') setProgress(progress);
                    break;
                case "DOWNLOAD_RESULT":
                    setLoading(false);
                    setProgress(100);
                    const { content, mimeType, fileName: dlFileName } = event.data as any;
                    try {
                        if (isCopy) {
                            if (typeof content === 'string') {
                                navigator.clipboard.writeText(content).then(() => {
                                    if (onSuccess) onSuccess();
                                }).catch(err => {
                                    const errMsg = "Failed to copy to clipboard: " + err;
                                    setError(errMsg);
                                    if (onError) onError(errMsg);
                                });
                            } else {
                                const errMsg = "Cannot copy binary data to clipboard";
                                setError(errMsg);
                                if (onError) onError(errMsg);
                            }
                        } else {
                            const blob = new Blob([content], { type: mimeType });
                            const link = document.createElement("a");
                            link.href = URL.createObjectURL(blob);
                            link.download = dlFileName;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            setTimeout(() => URL.revokeObjectURL(link.href), 100);
                            if (onSuccess) onSuccess();
                        }
                    } catch (e: any) {
                        const errMsg = e.message || "Operation failed";
                        setError(errMsg);
                        if (onError) onError(errMsg);
                    }
                    break;
                case "ERROR":
                    const errMsg = error || "Worker error";
                    setError(errMsg);
                    setLoading(false);
                    if (onError) onError(errMsg);
                    break;
            }
        };

        workerRef.current.postMessage({
            type: 'DOWNLOAD',
            data,
            schema,
            count,
            format,
            fileName,
            tableName,
            collectionName
        });

    }, []);

    return { generateData, generateFile, loading, progress, data, error };
};

export default useDataGenerator;
