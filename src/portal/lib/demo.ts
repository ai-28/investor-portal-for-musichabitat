/** When true, Continue buttons skip NDA/signing/ack/doc gates (demo walkthrough). */
export function skipProgressGates(): boolean {
  return process.env.NEXT_PUBLIC_SKIP_PROGRESS_GATES === "true";
}
