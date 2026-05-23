import "server-only";

const SUPPORTED_AUDIO_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/m4a",
]);

export function validateAudioFile(file: File) {
  const maxBytes = 25 * 1024 * 1024;

  if (!SUPPORTED_AUDIO_TYPES.has(file.type)) {
    throw new Error("Formato audio non supportato. Usa mp3, wav o m4a.");
  }

  if (file.size > maxBytes) {
    throw new Error("File troppo grande. Limite demo: 25 MB.");
  }
}

export async function transcribeWithElevenLabs(file: File) {
  validateAudioFile(file);

  if (!process.env.ELEVENLABS_API_KEY) {
    return {
      transcript:
        "Trascrizione demo: vogliamo una piattaforma MVP per delivery di cibo per animali con abbonamenti, pagamenti ricorrenti, dashboard consegne e una possibile sezione social.",
      provider: "demo",
    };
  }

  const formData = new FormData();
  formData.set("file", file);
  formData.set("model_id", process.env.ELEVENLABS_STT_MODEL ?? "scribe_v2");

  const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs STT failed with status ${response.status}.`);
  }

  const data = (await response.json()) as { text?: string };
  if (!data.text) {
    throw new Error("ElevenLabs STT returned an empty transcript.");
  }

  return {
    transcript: data.text,
    provider: "elevenlabs",
  };
}
