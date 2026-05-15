import OpenAI from "openai";
import {
  buildReportPrompt,
  FALLBACK_REPORT_MESSAGE,
  type PrivacySafeAiInput,
  type PrivacySafeReportResponse
} from "@/lib/privacySafeAi";

export const DEFAULT_REPORT_MODEL = "gpt-5.4-mini";

export type ReportOpenAiClient = Pick<OpenAI, "responses">;

type GenerateReportMessageOptions = {
  apiKey?: string;
  model?: string;
  client?: ReportOpenAiClient;
};

const reportInstructions = [
  "You write guardian-facing GentleSight report messages.",
  "Use only the privacy-preserving summary fields supplied by the application.",
  "Do not infer, invent, or reveal raw appliance names, timestamps, wattage, waveforms, durations, event logs, or surveillance-like details.",
  "Generate only the message body. The application already owns title, severity, tone, CTA, and notification badge."
].join(" ");

const unsafeOutputPatterns = [
  /\b\d{1,2}:\d{2}\b/,
  /watt|watts|waveform|timestamp|appliance|event log/i,
  /조명|선풍기|전자레인지|냉장고|밥솥|전력|파형|타임스탬프/,
  /\b(light|fan|microwave|fridge|rice cooker)\b/i
];

export async function generateOpenAiReportMessage(
  input: PrivacySafeAiInput,
  options: GenerateReportMessageOptions = {}
): Promise<PrivacySafeReportResponse> {
  const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
  const model =
    options.model ?? process.env.OPENAI_REPORT_MODEL ?? DEFAULT_REPORT_MODEL;

  if (!apiKey && !options.client) {
    return {
      message: FALLBACK_REPORT_MESSAGE,
      source: "fallback",
      model,
      reason: "missing_api_key"
    };
  }

  try {
    const client = options.client ?? new OpenAI({ apiKey });
    const response = await client.responses.create({
      model,
      instructions: reportInstructions,
      input: buildReportPrompt(input),
      max_output_tokens: 120,
      store: false
    });

    const message = response.output_text?.trim() ?? "";

    if (!message || findUnsafeGeneratedMessageReason(message)) {
      return {
        message: FALLBACK_REPORT_MESSAGE,
        source: "fallback",
        model,
        reason: "unsafe_output",
        usage: normalizeUsage(response.usage)
      };
    }

    return {
      message,
      source: "openai",
      model,
      usage: normalizeUsage(response.usage)
    };
  } catch {
    return {
      message: FALLBACK_REPORT_MESSAGE,
      source: "fallback",
      model,
      reason: "provider_error"
    };
  }
}

export function findUnsafeGeneratedMessageReason(message: string) {
  return unsafeOutputPatterns.find((pattern) => pattern.test(message)) ?? null;
}

function normalizeUsage(usage: unknown): PrivacySafeReportResponse["usage"] {
  if (!usage || typeof usage !== "object") {
    return undefined;
  }

  const maybeUsage = usage as {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
  };

  return {
    inputTokens: maybeUsage.input_tokens,
    outputTokens: maybeUsage.output_tokens,
    totalTokens: maybeUsage.total_tokens
  };
}
