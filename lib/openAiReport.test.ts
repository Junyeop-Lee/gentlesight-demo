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
  changeLevel: "clear_change",
  role: "family",
  language: "ko",
  riskScore: 84,
  baselineComparison: "평소 생활 리듬 범위에서 뚜렷하게 벗어남",
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
      supportingSuggestion: expect.any(String),
      changeSummary: expect.any(String),
      source: "fallback",
      model: DEFAULT_REPORT_MODEL,
      reason: "missing_api_key"
    });
  });

  it("builds a privacy-safe Responses API request", async () => {
    const create = vi.fn(async () => ({
      output_text: JSON.stringify({
        message: "오늘 아침 리듬이 늦어 보여 가볍게 안부를 확인해보세요.",
        supportingSuggestion: "통화가 어렵다면 짧은 메시지를 남겨보세요.",
        changeSummary: "평소보다 뚜렷한 아침 리듬 변화가 요약되었습니다."
      }),
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
    expect(result).toMatchObject({
      message: "오늘 아침 리듬이 늦어 보여 가볍게 안부를 확인해보세요.",
      supportingSuggestion: "통화가 어렵다면 짧은 메시지를 남겨보세요.",
      changeSummary: "평소보다 뚜렷한 아침 리듬 변화가 요약되었습니다."
    });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-5.4-mini",
        store: false,
        max_output_tokens: 220,
        text: expect.objectContaining({
          format: expect.objectContaining({
            type: "json_schema",
            name: "gentlesight_guardian_report",
            strict: true
          })
        })
      })
    );
    expect(create.mock.calls[0]?.[0].input).not.toContain("applianceLabel");
    expect(create.mock.calls[0]?.[0].input).not.toMatch(/\d{1,2}:\d{2}/);
  });

  it("retries once and then discards unsafe generated reports", async () => {
    const client = {
      responses: {
        create: vi
          .fn()
          .mockResolvedValueOnce({
            output_text: JSON.stringify({
              message: "밥솥이 08:12에 켜졌으니 확인하세요.",
              supportingSuggestion: "전화해보세요.",
              changeSummary: "기기 활동이 늦었습니다."
            })
          })
          .mockResolvedValueOnce({
            output_text: JSON.stringify({
              message: "전자레인지 사용이 늦었습니다.",
              supportingSuggestion: "확인해보세요.",
              changeSummary: "기기 변화가 있습니다."
            })
          })
      }
    } as unknown as ReportOpenAiClient;

    const result = await generateOpenAiReportMessage(input, { client });

    expect(client.responses.create).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({
      message: FALLBACK_REPORT_MESSAGE,
      supportingSuggestion: expect.any(String),
      changeSummary: expect.any(String),
      source: "fallback",
      reason: "unsafe_output"
    });
  });

  it("uses the second response when retry output is safe", async () => {
    const client = {
      responses: {
        create: vi
          .fn()
          .mockResolvedValueOnce({
            output_text: JSON.stringify({
              message: "08:12에 생활 신호가 있었습니다.",
              supportingSuggestion: "전화해보세요.",
              changeSummary: "구체 시각이 포함되었습니다."
            })
          })
          .mockResolvedValueOnce({
            output_text: JSON.stringify({
              message: "오늘 아침 리듬이 평소보다 늦어 보여요.",
              supportingSuggestion: "가볍게 안부를 확인해보세요.",
              changeSummary: "뚜렷한 아침 리듬 변화가 요약되었습니다."
            })
          })
      }
    } as unknown as ReportOpenAiClient;

    const result = await generateOpenAiReportMessage(input, { client });

    expect(client.responses.create).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({
      source: "openai",
      message: "오늘 아침 리듬이 평소보다 늦어 보여요.",
      supportingSuggestion: "가볍게 안부를 확인해보세요.",
      changeSummary: "뚜렷한 아침 리듬 변화가 요약되었습니다."
    });
  });
});
