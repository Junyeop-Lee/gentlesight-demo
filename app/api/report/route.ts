import { NextResponse } from "next/server";
import {
  buildReportPrompt,
  findRawKeyPath,
  type PrivacySafeAiInput
} from "@/lib/privacySafeAi";

export async function POST(request: Request) {
  let body: Partial<PrivacySafeAiInput> & Record<string, unknown>;

  try {
    body = (await request.json()) as Partial<PrivacySafeAiInput> &
      Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "JSON 형식의 프라이버시 요약만 전송할 수 있습니다." },
      { status: 400 }
    );
  }

  const rawKeyPath = findRawKeyPath(body);
  if (rawKeyPath) {
    return NextResponse.json(
      {
        error:
          "원천 생활 기록 필드는 전송할 수 없습니다. 익명 루틴 요약만 보내주세요.",
        field: rawKeyPath
      },
      { status: 400 }
    );
  }

  if (!isPrivacySafeAiInput(body)) {
    return NextResponse.json(
      { error: "루틴 상태, 변화 정도, 권장 조치가 포함된 요약이 필요합니다." },
      { status: 422 }
    );
  }

  try {
    return NextResponse.json({
      prompt: buildReportPrompt(body),
      message:
        "AI API 연결 전까지는 프라이버시 보호 요약만 검증합니다. 실제 생성 모델 연결 시에도 원천 데이터는 전송하지 않습니다."
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "현재 리포트를 생성하지 못했습니다. 감지된 생활 변화 요약을 확인해주세요."
      },
      { status: 500 }
    );
  }
}

function isPrivacySafeAiInput(
  value: Partial<PrivacySafeAiInput>
): value is PrivacySafeAiInput {
  return (
    typeof value.routineState === "string" &&
    typeof value.confidence === "number" &&
    typeof value.severity === "string" &&
    (value.role === "family" || value.role === "socialWorker") &&
    typeof value.riskScore === "number" &&
    typeof value.baselineComparison === "string" &&
    typeof value.reasonSummary === "string" &&
    typeof value.trendSummary === "string" &&
    typeof value.recommendedAction === "string" &&
    typeof value.privacyPolicyMarker === "string"
  );
}
