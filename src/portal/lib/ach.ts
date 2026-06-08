import { C, FONT_BODY } from "@/portal/tokens";

export function achInput(valid: boolean) {
  return {
    width: "100%",
    background: C.bg,
    border: `1px solid ${valid ? C.line : C.red}`,
    borderRadius: 10,
    padding: "12px 13px",
    color: C.text,
    fontSize: 15,
    outline: "none",
    fontFamily: FONT_BODY,
    boxSizing: "border-box" as const,
  };
}
