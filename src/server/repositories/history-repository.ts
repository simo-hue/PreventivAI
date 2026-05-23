import "server-only";

import { demoHistoricalProjects } from "@/src/lib/demo/history";

export async function getSimilarHistoricalProjects() {
  return demoHistoricalProjects;
}
