"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import ColorPanel from "./ColorPanel";

type ToastType = "success" | "error";
type Toast = { id: number; message: string; type: ToastType };

type EditContextValue = {
  isEditor: boolean;
  editMode: boolean;
  setEditMode: (v: boolean) => void;
  toast: (message: string, type?: ToastType) => void;
};

const EditContext = createContext<EditContextValue | null>(null);

export function useEdit(): EditContextValue {
  const ctx = useContext(EditContext);
  if (!ctx) {
    // Rendered outside the provider (shouldn't happen) — safe no-op fallback.
    return {
      isEditor: false,
      editMode: false,
      setEditMode: () => {},
      toast: () => {},
    };
  }
  return ctx;
}

export default function EditProvider({
  isEditor,
  children,
}: {
  isEditor: boolean;
  children: ReactNode;
}) {
  const [editMode, setEditMode] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <EditContext.Provider value={{ isEditor, editMode, setEditMode, toast }}>
      {children}
      {isEditor && <EditToolbar editMode={editMode} setEditMode={setEditMode} toast={toast} />}
      <ToastStack toasts={toasts} />
    </EditContext.Provider>
  );
}

function EditToolbar({
  editMode,
  setEditMode,
  toast,
}: {
  editMode: boolean;
  setEditMode: (v: boolean) => void;
  toast: (m: string, t?: ToastType) => void;
}) {
  const [loggingOut, setLoggingOut] = useState(false);
  const [colorPanelOpen, setColorPanelOpen] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch {
      toast("Couldn't log out. Try again.", "error");
      setLoggingOut(false);
    }
  }

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-[70] flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2 rounded-full border border-cream/15 bg-forest-deep/95 px-2 py-2 text-cream shadow-lg backdrop-blur-md">
          <span className="hidden px-2 text-[0.7rem] uppercase tracking-[0.14em] text-cream/60 sm:inline">
            {editMode ? "Editing" : "Admin"}
          </span>
          <button
            type="button"
            onClick={() => {
              setEditMode(!editMode);
              toast(editMode ? "Edit mode off" : "Edit mode on — tap any text or photo");
            }}
            className={`rounded-full px-4 py-2.5 text-[0.72rem] font-medium uppercase tracking-[0.14em] transition-colors ${
              editMode ? "bg-blush text-forest-deep" : "bg-sage text-forest-deep hover:bg-sage/90"
            }`}
          >
            {editMode ? "Done editing" : "Edit site"}
          </button>
          {editMode && (
            <button
              type="button"
              onClick={() => setColorPanelOpen(true)}
              className="rounded-full bg-cream/10 px-4 py-2.5 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-cream transition-colors hover:bg-cream/20"
            >
              Colors
            </button>
          )}
          <button
            type="button"
            onClick={logout}
            disabled={loggingOut}
            className="rounded-full px-4 py-2.5 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-cream/80 transition-colors hover:text-cream disabled:opacity-50"
          >
            {loggingOut ? "…" : "Log out"}
          </button>
        </div>
      </div>
      {editMode && (
        <ColorPanel
          open={colorPanelOpen}
          onClose={() => setColorPanelOpen(false)}
          toast={toast}
        />
      )}
    </>
  );
}

function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed left-1/2 top-4 z-[80] flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`rounded-full px-5 py-2.5 text-sm font-medium shadow-lg ${
            t.type === "error"
              ? "bg-[#8a2d2d] text-cream"
              : "bg-forest-deep text-cream"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
