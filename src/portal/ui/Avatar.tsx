"use client";

import { useState, useEffect } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";

import { PHOTO_MAP, PHOTO_BASE, PHOTO_BRANDON } from "@/portal/data/photos";

export function Avatar({ name, img, selected, size = 54, flat }) {
  const [failed, setFailed] = useState(false);
  const initials = name.split(" ").map((x) => x[0]).join("").slice(0, 2);
  const ring = selected ? `2px solid ${C.amber}` : `1px solid ${C.line}`;
  const m = flat ? 0 : "0 auto 10px";
  // Resolve the image source: embedded team photo > data/URL as-is > hosted.
  const resolveSrc = () => {
    if (!img) return "";
    if (PHOTO_MAP[img]) return PHOTO_MAP[img];
    if (img === "brandon.jpg" || /brandon/i.test(img)) return PHOTO_BRANDON;
    if (/^(data:|https?:)/.test(img)) return img;
    return PHOTO_BASE + img;
  };
  const src = resolveSrc();
  if (src && !failed) {
    return (
      <img src={src} alt={name} onError={() => setFailed(true)} style={{
        width: size, height: size, borderRadius: "50%", objectFit: "cover",
        margin: m, display: "block", border: ring, flexShrink: 0,
      }} />
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", margin: m, flexShrink: 0,
      background: `linear-gradient(135deg, ${C.tealDim}, ${C.amberDim})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: size * 0.33, color: "#fff",
      border: selected ? `2px solid ${C.amber}` : "none" }}>
      {initials}
    </div>
  );
}


// Executive Summary — verbatim structure from MusicHabitat_Executive_Summary_FF.pdf (May 2026)
