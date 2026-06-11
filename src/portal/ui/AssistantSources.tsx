import { C, FONT_BODY } from "@/portal/tokens";
import type { AssistantSource } from "@/portal/lib/assistant";

type Props = {
  sources: AssistantSource[];
  /** Link accent color — amber for F&F, teal for Private */
  accent: string;
};

export function AssistantSources({ sources, accent }: Props) {
  if (!sources.length) return null;

  return (
    <div
      style={{
        marginTop: 10,
        paddingTop: 8,
        borderTop: `1px solid ${C.line}`,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: C.textFaint,
          marginBottom: 6,
          letterSpacing: 0.3,
        }}
      >
        Sources
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
        {sources.map((s) => {
          const label = s.page != null ? `${s.filename}, p. ${s.page}` : s.filename;
          return (
            <li key={`${s.url}:${s.page ?? ""}`}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 12,
                  lineHeight: 1.4,
                  color: accent,
                  fontFamily: FONT_BODY,
                  textDecoration: "underline",
                  textUnderlineOffset: 2,
                }}
              >
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
