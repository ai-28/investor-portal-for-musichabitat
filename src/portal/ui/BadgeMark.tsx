"use client";

import { useState, useEffect } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";

export function BadgeMark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="goldMini" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F4D98A" /><stop offset="100%" stopColor="#9A7B2E" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="94" fill="#0A0A0C" stroke="url(#goldMini)" strokeWidth="6" />
      <circle cx="100" cy="100" r="74" fill="none" stroke="url(#goldMini)" strokeWidth="3" />
      <g transform="translate(100,86)">
        <rect x="-30" y="-4" width="7" height="12" rx="2" fill={C.teal} />
        <rect x="-18" y="-14" width="7" height="32" rx="2" fill="url(#goldMini)" />
        <rect x="-5" y="-24" width="11" height="52" rx="3" fill="#EDEDF0" />
        <rect x="12" y="-14" width="7" height="32" rx="2" fill="url(#goldMini)" />
        <rect x="24" y="-4" width="7" height="12" rx="2" fill={C.teal} />
      </g>
      <rect x="58" y="120" width="84" height="26" rx="4" fill="#1A1206" stroke="url(#goldMini)" strokeWidth="2" />
      <text x="100" y="138" textAnchor="middle" fill="url(#goldMini)" fontSize="15"
        letterSpacing="2" fontFamily={FONT_DISPLAY} fontWeight="700">XXXV</text>
    </svg>
  );
}

// =============================================================================
// CONTENT — drafted, founder will edit
// =============================================================================

// Embedded headshot of Brandon Beard (Founder & CEO), bundled as base64 so it
// renders with no hosting/network. Used by the Page 3 video poster and as a
// fallback. PHOTO_* team headshots are spliced in just below.
