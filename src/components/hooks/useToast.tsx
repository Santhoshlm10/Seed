import { useCallback, useEffect, useRef, useState } from "react";

type ToastType = "default" | "success" | "error";

export function useToast() {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState<ToastType>("default");

  const timerRef = useRef<number | null>(null);

  const showToast = useCallback(
    (msg: string, t: ToastType = "default", duration = 2000) => {
      setMessage(msg);
      setType(t);
      setVisible(true);

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      timerRef.current = window.setTimeout(() => {
        setVisible(false);
      }, duration);
    },
    []
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const Toast: React.FC = () => {
    if (!visible) return null;

    return (
      <div
        style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: visible
            ? "translateX(-50%) translateY(0)"
            : "translateX(-50%) translateY(20px)",
          opacity: visible ? 1 : 0,
          pointerEvents: "none",
          padding: "10px 16px",
          borderRadius: 6,
          fontSize: 14,
          color: "#fff",
          background:
            type === "success"
              ? "#16a34a"
              : type === "error"
              ? "#dc2626"
              : "#323232",
          transition: "all 0.25s ease",
          zIndex: 9999,
        }}
      >
        {message}
      </div>
    );
  };

  return { showToast, Toast };
}
