import "server-only";

/**
 * Allowed file extensions (lowercase, with leading dot).
 * We validate primarily by extension because browsers report inconsistent
 * MIME types for the same format depending on OS/browser combination.
 * E.g. `.m4a` → audio/mp4 | audio/x-m4a | audio/x-aac | "" (empty).
 */
const SUPPORTED_EXTENSIONS = new Set([".mp3", ".m4a", ".wav"]);

/**
 * Fallback: accepted MIME types for cases where the extension cannot be
 * determined (e.g. Blob without a name). Kept broad to cover all known
 * browser/OS variations.
 */
const SUPPORTED_MIME_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/x-aac",
  "audio/aac",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
]);

const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB

/**
 * Extracts the lowercase file extension including the leading dot.
 * Returns an empty string when no extension is found.
 */
function getFileExtension(filename: string): string {
  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex === -1 || dotIndex === filename.length - 1) return "";
  return filename.slice(dotIndex).toLowerCase();
}

export function validateAudioFile(file: File) {
  const extension = getFileExtension(file.name);
  const mime = file.type.toLowerCase().trim();

  // Primary check: extension (reliable across all browsers/OS).
  // Fallback: MIME type (for edge-cases like programmatic Blob uploads).
  const hasValidExtension = extension !== "" && SUPPORTED_EXTENSIONS.has(extension);
  const hasValidMime = mime !== "" && SUPPORTED_MIME_TYPES.has(mime);

  if (!hasValidExtension && !hasValidMime) {
    throw new Error(
      `Formato audio non supportato. Formati accettati: ${[...SUPPORTED_EXTENSIONS].map((e) => e.replace(".", "").toUpperCase()).join(", ")}.`,
    );
  }

  if (file.size > MAX_FILE_BYTES) {
    throw new Error("File troppo grande. Limite: 25 MB.");
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
