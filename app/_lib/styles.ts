import type { CSSProperties } from "react";

export const S = {
  root: {
    minHeight: "100vh",
    background: "#08080e",
    display: "flex",
    fontFamily: "'Courier New', Consolas, monospace",
    color: "#9a9aaa",
    overflow: "hidden",
  } satisfies CSSProperties,

  sidebar: {
    width: 260,
    minWidth: 260,
    background: "#0c0c16",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    padding: "12px 10px",
    display: "flex",
    flexDirection: "column",
    gap: 2,
    overflowY: "auto",
    maxHeight: "100vh",
  } satisfies CSSProperties,

  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    overflow: "auto",
  } satisfies CSSProperties,

  section: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.04)",
    borderRadius: 4,
    padding: "8px 8px 10px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  } satisfies CSSProperties,

  label: {
    fontSize: 11,
    letterSpacing: 3,
    color: "#6a6a7a",
    marginBottom: 2,
    display: "block",
    userSelect: "none",
    fontWeight: 600,
  } satisfies CSSProperties,

  toolBtn: (active: boolean): CSSProperties => ({
    flex: 1,
    padding: "6px 4px",
    background: active
      ? "rgba(184,148,44,0.14)"
      : "rgba(255,255,255,0.03)",
    border: `1px solid ${
      active ? "rgba(184,148,44,0.35)" : "rgba(255,255,255,0.07)"
    }`,
    color: active ? "#d4ac3c" : "#7a7a8a",
    borderRadius: 3,
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 1,
  }),

  smallBtn: {
    padding: "5px 8px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    color: "#8a8a9a",
    borderRadius: 3,
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 12,
    letterSpacing: 1,
  } satisfies CSSProperties,

  toggle: (active: boolean): CSSProperties => ({
    fontSize: 13,
    color: active ? "#d4ac3c" : "#7a7a8a",
    display: "flex",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
    padding: "5px 8px",
    background: active ? "rgba(184,148,44,0.1)" : "rgba(255,255,255,0.02)",
    border: `1px solid ${
      active ? "rgba(184,148,44,0.25)" : "rgba(255,255,255,0.06)"
    }`,
    borderRadius: 3,
    fontWeight: active ? 700 : 400,
  }),

  divider: {
    height: 1,
    background: "rgba(255,255,255,0.04)",
    margin: "4px 0",
    border: "none",
  } satisfies CSSProperties,
};
