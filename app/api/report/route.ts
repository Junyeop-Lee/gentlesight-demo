import { NextResponse } from "next/server";
import { generateOpenAiReportMessage } from "@/lib/openAiReport";
import {
  findRawKeyPath,
  isPrivacySafeAiInput,
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
    return NextResponse.json(await generateOpenAiReportMessage(body));
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
