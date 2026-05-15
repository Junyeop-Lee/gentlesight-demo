import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_REPORT_MODEL,
  generateOpenAiReportMessage,
  type ReportOpenAiClient
} from "@/lib/openAiReport";
import { FALLBACK_REPORT_MESSAGE, type PrivacySafeAiInput } from "@/lib/privacySafeAi";

const input: PrivacySafeAiInput = {
  routineState: "아침 식사 준비 중",
  confidence: 91,
  severity: "caution",
  role: "family",
  language: "ko",
  riskScore: 84,
  baselineComparison: "개인 기준선 07:50-08:20",
  reasonSummary: "오전 생활 리듬이 늦게 요약되었습니다.",
  trendSummary: "확인 필요",
  recommendedAction: "전화하기",
  privacyPolicyMarker: "PRIVACY_SAFE_SUMMARY_ONLY"
};

describe("OpenAI report generation", () => {
  it("falls back without an API key", async () => {
    const result = await generateOpenAiReportMessage(input, { apiKey: "" });

    expect(result).toMatchObject({
      message: FALLBACK_REPORT_MESSAGE,
      source: "fallback",
      model: DEFAULT_REPORT_MODEL,
      reason: "missing_api_key"
    });
  });

  it("builds a privacy-safe Responses API request", async () => {
    const create = vi.fn(async () => ({
      output_text: "오늘 아침 리듬이 늦어 보여 가볍게 안부를 확인해보세요.",
      usage: {
        input_tokens: 120,
        output_tokens: 24,
        total_tokens: 144
      }
    }));
    const client = {
      responses: { create }
    } as unknown as ReportOpenAiClient;

    const result = await generateOpenAiReportMessage(input, {
      client,
      model: "gpt-5.4-mini"
    });

    expect(result.source).toBe("openai");
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-5.4-mini",
        store: false,
        max_output_tokens: 120
      })
    );
    expect(create.mock.calls[0]?.[0].input).not.toContain("applianceLabel");
  });

  it("discards unsafe generated messages", async () => {
    const client = {
      responses: {
        create: vi.fn(async () => ({
          output_text: "밥솥이 08:12에 켜졌으니 확인하세요."
        }))
      }
    } as unknown as ReportOpenAiClient;

    const result = await generateOpenAiReportMessage(input, { client });

    expect(result).toMatchObject({
      message: FALLBACK_REPORT_MESSAGE,
      source: "fallback",
      reason: "unsafe_output"
    });
  });
});
