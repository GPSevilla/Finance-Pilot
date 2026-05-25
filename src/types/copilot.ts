export interface CopilotSettings {
  provider: "openai";
  apiKey: string;
  model: string;
  webSearchEnabled: boolean;
}

export interface CopilotSource {
  url: string;
  title?: string;
}

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  sources?: CopilotSource[];
  error?: boolean;
}
