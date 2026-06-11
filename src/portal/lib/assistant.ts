export type AssistantTrack = "ff" | "private";

export type AssistantSource = {
  filename: string;
  page?: number;
  url: string;
};

export type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: AssistantSource[];
};

export type AskAssistantResult = {
  text: string;
  sources: AssistantSource[];
};

export function messagesForApi(
  messages: { role: "user" | "assistant"; content: string; sources?: AssistantSource[] }[],
): { role: "user" | "assistant"; content: string }[] {
  return messages.map((m) => ({ role: m.role, content: m.content }));
}

export async function askAssistant(
  track: AssistantTrack,
  messages: { role: "user" | "assistant"; content: string }[],
): Promise<AskAssistantResult> {
  const res = await fetch("/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ track, messages: messagesForApi(messages) }),
  });

  const data = (await res.json()) as {
    text?: string;
    sources?: AssistantSource[];
    error?: string;
  };

  if (!res.ok) {
    throw new Error(data.error || "Assistant request failed");
  }

  return {
    text:
      data.text ||
      "I wasn't able to generate a response just now. Please try again, or email brandon@musichabitat.com.",
    sources: data.sources ?? [],
  };
}