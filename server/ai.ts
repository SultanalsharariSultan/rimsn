import { invokeLLM, type Message as LLMMessage } from "./_core/llm";
import { ENV } from "./_core/env";

export type Provider = "orbit-auto" | "openai" | "claude" | "gemini";
export type ChatInput = { role: "user" | "assistant" | "system"; content: string };

const MODEL_DEFAULTS: Record<Provider, string> = {
  "orbit-auto": "gpt-5-mini",
  openai: process.env.OPENAI_MODEL ?? "gpt-5-mini",
  claude: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6",
  gemini: process.env.GEMINI_MODEL ?? "gemini-3-flash-preview",
};

function textFromContent(content: string | Array<{ type: string; text?: string }>) {
  if (typeof content === "string") return content;
  return content.map((part) => part.text ?? "").join("");
}

async function orbitCompletion(messages: ChatInput[], model: string) {
  const response = await invokeLLM({
    model,
    messages: messages as LLMMessage[],
    maxTokens: 3000,
    ...(model.startsWith("gpt-") ? { reasoning: { effort: "low" } } : {}),
    ...(model.startsWith("claude-") ? { thinking: { type: "enabled", budget_tokens: 1024 } } : {}),
  });
  return { text: textFromContent(response.choices[0]?.message?.content ?? ""), model: response.model || model };
}

async function openAICompletion(messages: ChatInput[], model: string, apiKey: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, max_completion_tokens: 3000 }),
  });
  if (!response.ok) throw new Error(`OpenAI API error ${response.status}: ${await response.text()}`);
  const json = (await response.json()) as { choices?: Array<{ message?: { content?: string } }>; model?: string };
  return { text: json.choices?.[0]?.message?.content ?? "", model: json.model ?? model };
}

async function claudeCompletion(messages: ChatInput[], model: string, apiKey: string) {
  const system = messages.find((message) => message.role === "system")?.content;
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model, max_tokens: 3000, ...(system ? { system } : {}), messages: messages.filter((message) => message.role !== "system") }),
  });
  if (!response.ok) throw new Error(`Claude API error ${response.status}: ${await response.text()}`);
  const json = (await response.json()) as { content?: Array<{ type?: string; text?: string }>; model?: string };
  return { text: json.content?.map((part) => part.text ?? "").join("") ?? "", model: json.model ?? model };
}

async function geminiCompletion(messages: ChatInput[], model: string, apiKey: string) {
  const contents = messages.filter((message) => message.role !== "system").map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));
  const system = messages.find((message) => message.role === "system")?.content;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}), contents, generationConfig: { maxOutputTokens: 3000 } }),
  });
  if (!response.ok) throw new Error(`Gemini API error ${response.status}: ${await response.text()}`);
  const json = (await response.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  return { text: json.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "", model };
}

export async function completeChat(provider: Provider, messages: ChatInput[]) {
  const model = MODEL_DEFAULTS[provider];
  if (provider === "openai" && process.env.OPENAI_API_KEY) return openAICompletion(messages, model, process.env.OPENAI_API_KEY);
  if (provider === "claude" && process.env.ANTHROPIC_API_KEY) return claudeCompletion(messages, model, process.env.ANTHROPIC_API_KEY);
  if (provider === "gemini" && process.env.GEMINI_API_KEY) return geminiCompletion(messages, model, process.env.GEMINI_API_KEY);
  if (ENV.forgeApiKey) return orbitCompletion(messages, model);
  throw new Error(`لا يوجد مفتاح مهيأ لمزود ${provider}. أضف المفتاح في متغيرات البيئة على الاستضافة.`);
}

export const providerCatalog = [
  { id: "orbit-auto" as const, name: "مدار تلقائي", description: "يختار نموذجًا مدمجًا سريعًا ومناسبًا", model: MODEL_DEFAULTS["orbit-auto"], color: "teal" },
  { id: "openai" as const, name: "OpenAI", description: "نماذج GPT عبر مفتاحك الرسمي", model: MODEL_DEFAULTS.openai, color: "mint" },
  { id: "claude" as const, name: "Claude", description: "نماذج Anthropic عبر مفتاحك الرسمي", model: MODEL_DEFAULTS.claude, color: "amber" },
  { id: "gemini" as const, name: "Gemini", description: "نماذج Google عبر مفتاحك الرسمي", model: MODEL_DEFAULTS.gemini, color: "violet" },
];
