import { Fragment } from "react";

/** Render assistant text with basic markdown (bold via **). */
export function AssistantMessageBody({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <>
      {lines.map((line, lineIdx) => (
        <Fragment key={lineIdx}>
          {lineIdx > 0 && <br />}
          {renderBoldSegments(line)}
        </Fragment>
      ))}
    </>
  );
}

function renderBoldSegments(line: string) {
  const parts = line.split(/(\*\*[^*]+?\*\*)/g);
  if (parts.length === 1) return line;

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
