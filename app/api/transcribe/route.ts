import { NextResponse } from "next/server";
import { transcribeWithElevenLabs } from "@/src/lib/audio/elevenlabs-client";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Carica un file audio valido." },
        { status: 400 },
      );
    }

    const result = await transcribeWithElevenLabs(file);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Trascrizione non riuscita.",
      },
      { status: 400 },
    );
  }
}
