import OpenAI from "openai";
import {
  buildFallbackReportResponse,
  buildReportPrompt,
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

type GeneratedReportFields = Pick<
  PrivacySafeReportResponse,
  "message" | "supportingSuggestion" | "changeSummary"
>;

const reportInstructions = [
  "You write guardian-facing GentleSight report messages.",
  "Use only the privacy-preserving summary fields supplied by the application.",
  "Do not infer, invent, or reveal raw appliance names, timestamps, wattage, waveforms, durations, event logs, or surveillance-like details.",
  "Generate only message, supportingSuggestion, and changeSummary. The application already owns title, severity, score, tone, CTA, and notification badge."
].join(" ");

const reportTextFormat = {
  type: "json_schema",
  name: "gentlesight_guardian_report",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["message", "supportingSuggestion", "changeSummary"],
    properties: {
      message: {
        type: "string",
        minLength: 1,
        maxLength: 180
      },
      supportingSuggestion: {
        type: "string",
        minLength: 1,
        maxLength: 120
      },
      changeSummary: {
        type: "string",
        minLength: 1,
        maxLength: 120
      }
    }
  }
} as const;

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
    return buildFallbackReportResponse(input, {
      model,
      reason: "missing_api_key"
    });
  }

  try {
    const client = options.client ?? new OpenAI({ apiKey });

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const response = await client.responses.create({
        model,
        instructions: reportInstructions,
        input: buildReportPrompt(input),
        max_output_tokens: 220,
        store: false,
        text: {
          format: reportTextFormat
        }
      });

      const generatedReport = parseGeneratedReport(response);
      const unsafeReason = generatedReport
        ? findUnsafeGeneratedReportReason(generatedReport)
        : "invalid_output";

      if (generatedReport && !unsafeReason) {
        return {
          message: generatedReport.message,
          supportingSuggestion: generatedReport.supportingSuggestion,
          changeSummary: generatedReport.changeSummary,
          source: "openai",
          model,
          usage: normalizeUsage(response.usage)
        };
      }

      if (attempt === 1) {
        return buildFallbackReportResponse(input, {
          model,
          reason: unsafeReason === "invalid_output" ? "invalid_output" : "unsafe_output",
          usage: normalizeUsage(response.usage)
        });
      }
    }
  } catch {
    return buildFallbackReportResponse(input, {
      model,
      reason: "provider_error"
    });
  }

  return buildFallbackReportResponse(input, {
    model,
    reason: "provider_error"
  });
}

export function findUnsafeGeneratedMessageReason(message: string) {
  return unsafeOutputPatterns.find((pattern) => pattern.test(message)) ?? null;
}

export function findUnsafeGeneratedReportReason(
  report: GeneratedReportFields
) {
  return (
    findUnsafeGeneratedMessageReason(report.message) ??
    findUnsafeGeneratedMessageReason(report.supportingSuggestion) ??
    findUnsafeGeneratedMessageReason(report.changeSummary)
  );
}

function parseGeneratedReport(response: unknown): GeneratedReportFields | null {
  const outputText = (response as { output_text?: string }).output_text?.trim();
  if (!outputText) {
    return null;
  }

  try {
    const parsed = JSON.parse(outputText) as Partial<GeneratedReportFields>;

    if (
      typeof parsed.message !== "string" ||
      typeof parsed.supportingSuggestion !== "string" ||
      typeof parsed.changeSummary !== "string"
    ) {
      return null;
    }

    const generatedReport = {
      message: parsed.message.trim(),
      supportingSuggestion: parsed.supportingSuggestion.trim(),
      changeSummary: parsed.changeSummary.trim()
    };

    return generatedReport.message &&
      generatedReport.supportingSuggestion &&
      generatedReport.changeSummary
      ? generatedReport
      : null;
  } catch {
    return null;
  }
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
