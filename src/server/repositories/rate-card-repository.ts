import "server-only";

import { officialRateCards } from "@/src/lib/demo/rate-card";

export async function getActiveRateCards() {
  return officialRateCards;
}
