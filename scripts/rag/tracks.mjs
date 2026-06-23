/** Offering folders under public/assets/docs — must match doc-config.ts */
export const RAG_TRACK_FOLDERS = {
  ff: "F & F",
  private: "Private Offering",
};

/** @param {string} relativePath path under public/assets/docs */
export function trackForSourceFile(relativePath) {
  for (const [track, folder] of Object.entries(RAG_TRACK_FOLDERS)) {
    if (relativePath === folder || relativePath.startsWith(`${folder}/`)) {
      return track;
    }
  }
  return null;
}

export function sourceUrl(relativePath) {
  return `/assets/docs/${relativePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
}
