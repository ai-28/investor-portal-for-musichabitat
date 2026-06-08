"use client";

import { useState, useEffect } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";

export function DocuSignMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#FFD54A" />
      <path d="M6 15c2-6 4-6 6 0s4 6 6 0" stroke="#1A1206" strokeWidth="1.8"
        strokeLinecap="round" fill="none" />
    </svg>
  );
}

// BACKEND HOOK: DocuSign (or Adobe Sign) integration.
// Wire getDocusignSigningUrl() to your backend, which should create an envelope
// from the three templates and return an embedded recipient-view URL.
