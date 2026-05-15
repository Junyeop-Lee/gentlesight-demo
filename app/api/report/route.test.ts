import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/report/route";
import { FALLBACK_REPORT_MESSAGE, type PrivacySafeAiInput } from "@/lib/privacySafeAi";

const validInput: PrivacySafeAiInput = {
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

const originalApiKey = process.env.OPENAI_API_KEY;

function requestWithBody(body: unknown) {
  return new Request("http://localhost/api/report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

describe("POST /api/report", () => {
  beforeEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  afterEach(() => {
    process.env.OPENAI_API_KEY = originalApiKey;
  });

  it("rejects raw fields even when nested", async () => {
    const response = await POST(
      requestWithBody({
        ...validInput,
        nested: { events: [] }
      })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.field).toBe("nested.events");
  });

  it("accepts valid privacy-safe input and falls back when no API key exists", async () => {
    const response = await POST(requestWithBody(validInput));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      message: FALLBACK_REPORT_MESSAGE,
      source: "fallback",
      reason: "missing_api_key"
    });
  });

  it("rejects incomplete summaries", async () => {
    const response = await POST(
      requestWithBody({
        ...validInput,
        language: undefined
      })
    );

    expect(response.status).toBe(422);
  });
});
