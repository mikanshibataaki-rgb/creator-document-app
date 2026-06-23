type OpenAiRequest = {
  prompt: string;
};

export async function requestOpenAiText({ prompt }: OpenAiRequest): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY が未設定です。.env.local にAPIキーを設定してください。");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5.2",
      input: prompt
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI APIでエラーが起きました: ${detail}`);
  }

  const data = await response.json();
  return extractOutputText(data);
}

function extractOutputText(data: unknown): string {
  if (isRecord(data) && typeof data.output_text === "string") {
    return data.output_text;
  }

  if (isRecord(data) && Array.isArray(data.output)) {
    const texts: string[] = [];
    for (const item of data.output) {
      if (!isRecord(item) || !Array.isArray(item.content)) {
        continue;
      }
      for (const content of item.content) {
        if (isRecord(content) && typeof content.text === "string") {
          texts.push(content.text);
        }
      }
    }
    return texts.join("\n").trim();
  }

  return "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
