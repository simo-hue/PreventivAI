import { NextResponse } from "next/server";
import { getActiveRateCards, updateRateCards } from "@/src/server/repositories/rate-card-repository";

export async function GET() {
  try {
    const rateCards = await getActiveRateCards();
    return NextResponse.json(rateCards);
  } catch (error) {
    return NextResponse.json(
      { error: "Errore durante il recupero dei rate card." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cards = await request.json();
    if (!Array.isArray(cards)) {
      return NextResponse.json({ error: "Payload non valido" }, { status: 400 });
    }
    
    await updateRateCards(cards);
    
    // Ritorna le impostazioni aggiornate dal DB per sincronizzare lo stato
    const updatedCards = await getActiveRateCards();
    return NextResponse.json(updatedCards);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Errore durante il salvataggio." },
      { status: 500 }
    );
  }
}
