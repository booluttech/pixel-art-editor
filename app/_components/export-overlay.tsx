"use client";

import { useState } from "react";
import type { ExportData } from "../_lib/types";

interface ExportOverlayProps {
  data: ExportData;
  onClose: () => void;
}

export function ExportOverlay({ data, onClose }: ExportOverlayProps) {
  const [copied, setCopied] = useState(false);
  const ext = data.format === "gif" ? "gif" : "png";
  const label = data.format === "gif" ? "GIF" : "PNG";
  const maxPreview = 384;
  const aspect = data.width / data.height;
  const previewW =
    aspect >= 1
      ? Math.min(data.width, maxPreview)
      : Math.min(data.width, maxPreview * aspect);
  const previewH =
    aspect >= 1
      ? Math.min(data.height, maxPreview / aspect)
      : Math.min(data.height, maxPreview);

  const filename = `manas-${data.width}x${data.height}-${Date.now()}.${ext}`;

  const handleDownload = async () => {
    try {
      let blob: Blob;
      if (data.url.startsWith("data:")) {
        const res = await fetch(data.url);
        blob = await res.blob();
      } else {
        const res = await fetch(data.url);
        blob = await res.blob();
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      // Fallback: open in new tab
      window.open(data.url, "_blank");
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      if (data.format === "gif") {
        // Clipboard API doesn't support GIF; fallback
        setCopied(false);
        return;
      }
      const res = await fetch(data.url);
      const blob = await res.blob();
      const pngBlob = new Blob([await blob.arrayBuffer()], {
        type: "image/png",
      });
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": pngBlob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(4,4,10,0.94)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#10101c",
          border: "1px solid rgba(184,148,44,0.25)",
          borderRadius: 8,
          padding: 28,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          maxWidth: "90vw",
          cursor: "default",
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: 4,
            color: "#d4ac3c",
          }}
        >
          EXPORT PREVIEW
        </div>
        <div
          style={{ fontSize: 12, color: "#7a7a8a", letterSpacing: 2 }}
        >
          {data.width}&times;{data.height} {label} ({data.scale}x)
        </div>

        <div
          style={{
            background:
              "repeating-conic-gradient(#1a1a1a 0% 25%, #111 0% 50%) 0 0 / 12px 12px",
            padding: 8,
            borderRadius: 4,
            border: "1px solid rgba(255,255,255,0.08)",
            maxWidth: "80vw",
            overflow: "auto",
          }}
        >
          <img
            src={data.url}
            alt={`Exported ${label}`}
            style={{
              display: "block",
              width: previewW,
              height: previewH,
              imageRendering: "pixelated",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={handleDownload} style={primaryBtn}>
            DOWNLOAD
          </button>
          {data.format === "png" && (
            <button onClick={handleCopyToClipboard} style={primaryBtn}>
              {copied ? "COPIED!" : "COPY TO CLIPBOARD"}
            </button>
          )}
          <button
            onClick={() => {
              const w = window.open();
              if (w) {
                w.document.write(
                  `<html><body style="margin:0;background:#111;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="${data.url}" style="image-rendering:pixelated;max-width:90vw;max-height:90vh" /></body></html>`
                );
                w.document.title = filename;
              }
            }}
            style={secondaryBtn}
          >
            OPEN IN TAB
          </button>
          <button onClick={onClose} style={secondaryBtn}>
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}

const primaryBtn = {
  padding: "8px 16px",
  borderRadius: 4,
  background: "rgba(184,148,44,0.12)",
  border: "1px solid rgba(184,148,44,0.3)",
  color: "#d4ac3c",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 2,
} as const;

const secondaryBtn = {
  padding: "8px 16px",
  borderRadius: 4,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#8a8a9a",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 2,
} as const;
