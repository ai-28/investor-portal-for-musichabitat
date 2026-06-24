/** When true, skip most Continue gates (NDA, docs, signing, funding). Ack pages always require all boxes. */
export function skipProgressGates(): boolean {
  return process.env.NEXT_PUBLIC_SKIP_PROGRESS_GATES === "true";
}
