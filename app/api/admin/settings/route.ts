import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/src/lib/auth/require-user";
import { getAppSettings, updateAppSettings } from "@/src/server/repositories/settings-repository";

const SettingsUpdateSchema = z.object({
  pmPercentage: z.number().min(0).max(1),
  currency: z.string().min(1),
  riskBufferPercentage: z.number().min(0).max(1),
});

export async function GET() {
  try {
    const user = await requireUser();
    const settings = await getAppSettings(user.organizationId);
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossibile recuperare i parametri di pricing.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    
    // Solo gli amministratori possono aggiornare le impostazioni dell'organizzazione
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Permessi insufficienti. Solo gli amministratori possono modificare le impostazioni." },
        { status: 403 },
      );
    }

    const payload = await request.json();
    const parsed = SettingsUpdateSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const updated = await updateAppSettings(user.organizationId, parsed.data);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossibile aggiornare i parametri di pricing.",
      },
      { status: 500 },
    );
  }
}
