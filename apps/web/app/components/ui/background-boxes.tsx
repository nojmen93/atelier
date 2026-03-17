"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BoxesCore = ({ className, ...rest }: { className?: string }) => {
  const rows = new Array(150).fill(1);
  const cols = new Array(100).fill(1);

  const colors = [
    "rgb(125 211 252)",
    "rgb(249 168 212)",
    "rgb(134 239 172)",
    "rgb(253 224 71)",
    "rgb(252 165 165)",
    "rgb(216 180 254)",
    "rgb(147 197 253)",
    "rgb(165 180 252)",
    "rgb(196 181 253)",
  ];

  const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

  const borderColor = "rgba(100, 116, 139, 0.2)";

  return (
    <div
      // Fixed full-viewport container — pointer-events: none so it never blocks content,
      // but descendant cells keep default pointer-events: auto (CSS spec allows this)
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        zIndex: 0,
        pointerEvents: "none",
      }}
      className={cn(className)}
      {...rest}
    >
      {/* Inner grid with the skew/scale transform */}
      <div
        style={{
          transform: `translate(-40%,-60%) skewX(-48deg) skewY(14deg) scale(0.675) rotate(0deg) translateZ(0)`,
          position: "absolute",
          left: "25%",
          top: "-25%",
          padding: "1rem",
          display: "flex",
          width: "100%",
          height: "100%",
        }}
      >
        {rows.map((_, i) => (
          <motion.div
            key={`row` + i}
            style={{
              width: 64,
              height: 32,
              borderLeft: `1px solid ${borderColor}`,
              position: "relative",
              flexShrink: 0,
              pointerEvents: "auto",
            }}
          >
            {cols.map((_, j) => (
              <motion.div
                whileHover={{
                  backgroundColor: getRandomColor(),
                  transition: { duration: 0 },
                }}
                animate={{ transition: { duration: 2 } }}
                key={`col` + j}
                style={{
                  width: 64,
                  height: 32,
                  borderRight: `1px solid ${borderColor}`,
                  borderTop: `1px solid ${borderColor}`,
                  position: "relative",
                  pointerEvents: "auto",
                }}
              >
                {j % 2 === 0 && i % 2 === 0 ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    style={{
                      position: "absolute",
                      height: 24,
                      width: 40,
                      top: -14,
                      left: -22,
                      color: "rgba(100, 116, 139, 0.18)",
                      strokeWidth: 1,
                      pointerEvents: "none",
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v12m6-6H6"
                    />
                  </svg>
                ) : null}
              </motion.div>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export const Boxes = React.memo(BoxesCore);
