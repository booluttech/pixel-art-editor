import { useEffect, useRef, useState, useCallback } from "react";
import { saveProject, loadProject, type ProjectState } from "./storage";

const DEBOUNCE_MS = 800;

type SaveableState = Omit<ProjectState, "savedAt">;

export function useProjectStorage(
  state: SaveableState | null,
  stateVersion: number
) {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedState, setLoadedState] = useState<ProjectState | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const lastSavedVersionRef = useRef(-1);

  useEffect(() => {
    mountedRef.current = true;
    loadProject()
      .then((saved) => {
        if (mountedRef.current) {
          setLoadedState(saved);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (mountedRef.current) setIsLoading(false);
      });
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!state || isLoading) return;

    if (stateVersion === lastSavedVersionRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setIsSaving(true);
      const projectState: ProjectState = {
        ...state,
        savedAt: Date.now(),
      };
      saveProject(projectState)
        .then(() => {
          if (mountedRef.current) {
            lastSavedVersionRef.current = stateVersion;
          }
        })
        .catch((err) => {
          console.error("[PixelArt] Failed to save:", err);
        })
        .finally(() => {
          if (mountedRef.current) setIsSaving(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state, isLoading, stateVersion]);

  const forceSave = useCallback(async () => {
    if (!state) return;
    setIsSaving(true);
    try {
      await saveProject({ ...state, savedAt: Date.now() });
      lastSavedVersionRef.current = stateVersion;
    } catch (err) {
      console.error("[PixelArt] Failed to save:", err);
    } finally {
      if (mountedRef.current) setIsSaving(false);
    }
  }, [state, stateVersion]);

  return { isSaving, isLoading, loadedState, forceSave };
}
