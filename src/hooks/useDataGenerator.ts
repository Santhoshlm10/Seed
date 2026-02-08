import { useState, useCallback, useRef, useEffect } from "react";
import { Parameter } from "../models/Playground";

interface WorkerMessage {
    type: "PROGRESS" | "RESULT" | "ERROR";
    progress?: number;
    data?: any[];
    error?: string;
}

interface UseDataGeneratorReturn {
    generateData: (schema: Parameter[], count: number, onComplete?: (data: any[]) => void) => void;
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

    // Use a ref to store the worker instance so it persists across renders
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        // Cleanup worker on unmount
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

        // Terminate existing worker if any
        if (workerRef.current) {
            workerRef.current.terminate();
        }

        // Initialize new worker
        // Note: We're using a relative path that Vite should resolve correctly
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
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    setError(error || "Unknown worker error");
                    setLoading(false);
                    break;
                default:
                    break;
            }
        };

        workerRef.current.onerror = (err) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            setError(err.message || "Worker error");
            setLoading(false);
        };

        // Send start message
        workerRef.current.postMessage({
            type: 'GENERATE',
            schema,
            count
        });

    }, []);

    return { generateData, loading, progress, data, error };
};

export default useDataGenerator;
