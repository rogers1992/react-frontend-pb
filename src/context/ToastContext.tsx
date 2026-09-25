import { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

interface ToastContextValue {
  toasts: ToastMessage[];
  showToast: (options: { type: ToastType; message: string; duration?: number }) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let toastCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, message, duration = 3000 }: { type: ToastType; message: string; duration?: number }) => {
      const id = `toast-${++toastCounter}`;
      const toast: ToastMessage = { id, type, message, duration };

      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast],
  );

  const value = useMemo(
    () => ({ toasts, showToast, removeToast }),
    [toasts, showToast, removeToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
