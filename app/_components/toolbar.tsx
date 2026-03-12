"use client";

import { TOOLS } from "../_lib/constants";
import { S } from "../_lib/styles";
import type { Tool } from "../_lib/types";
import { Tip } from "./tip";

interface ToolbarProps {
  tool: Tool;
  onToolChange: (tool: Tool) => void;
}

export function Toolbar({ tool, onToolChange }: ToolbarProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 3,
      }}
    >
      {TOOLS.map(({ k, l, s }) => (
        <Tip
          key={k}
          label={`${k.charAt(0).toUpperCase() + k.slice(1)} (${s})`}
        >
          <button
            onClick={() => onToolChange(k)}
            style={{
              ...S.toolBtn(tool === k),
              fontSize: 11,
              padding: "6px 2px",
              letterSpacing: 0,
              fontWeight: 800,
            }}
          >
            {l}
          </button>
        </Tip>
      ))}
    </div>
  );
}
