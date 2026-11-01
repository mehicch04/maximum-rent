"use client";

import { motion, useReducedMotion } from "framer-motion";
import { RoadSign, type SignKind } from "./RoadSign";

export function SwingSign({ kind, className = "", delay = 0 }: { kind: SignKind; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      initial={reduce ? false : { rotate: -16, y: -8, opacity: 0 }}
      whileInView={{ rotate: 0, y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ rotate: { type: "spring", stiffness: 220, damping: 8, delay }, y: { type: "spring", stiffness: 260, damping: 14, delay }, opacity: { duration: 0.25, delay } }}
      className={`block origin-top ${className}`}
    >
      <span className="block h-full w-full origin-top group-hover:animate-[sign-wobble_0.8s_ease-in-out]">
        <RoadSign kind={kind} className="h-full w-full" />
      </span>
    </motion.span>
  );
}
