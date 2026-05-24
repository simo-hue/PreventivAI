/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  PricedModule,
  PricedRoleBreakdown,
  PricedScenario,
  PricedTask,
  QuoteScenarioFromAi,
  RateCard,
  RoleEffort,
  ScenarioTotals,
} from "./types";

export type PricingInput = {
  scenarios: QuoteScenarioFromAi[];
  rateCards: RateCard[];
  pmPercentage: number;
  riskBufferPercentage?: number;
  moduleInclusionOverrides?: Record<string, boolean>;
};

export class PricingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PricingError";
  }
}

export function normalizeRoleKey(roleName: string, seniority: string) {
  return `${roleName.trim().toLowerCase()}|${seniority.trim().toLowerCase()}`;
}

export function priceScenarios(input: PricingInput): PricedScenario[] {
  const rateMap = buildRateCardMap(input.rateCards);

  return input.scenarios.map((scenario: any) => {
    const modules = scenario.modules.map((module: any, moduleIndex: number) => {
      const moduleId = module.id || `${scenario.slug}:${moduleIndex}:${slugify(module.name)}`;
      const isIncluded =
        input.moduleInclusionOverrides?.[moduleId] ??
        (!module.isOptional || module.isIncludedByDefault);
      const tasks = module.tasks.map((task: any) => {
        const pricedTask = priceTask(task, rateMap);
        return { ...pricedTask, id: task.id || pricedTask.id };
      });
      const subtotalEur = roundMoney(
        tasks.reduce((sum: any, task: any) => sum + task.subtotalEur, 0),
      );

      return {
        ...module,
        id: moduleId,
        isIncluded,
        tasks,
        subtotalEur,
      } as PricedModule;
    });

    const totals = calculateScenarioTotals({
      modules,
      rateCards: input.rateCards,
      pmPercentage: input.pmPercentage,
      riskBufferPercentage: input.riskBufferPercentage ?? 0,
    });

    return {
      ...scenario,
      id: scenario.id || scenario.slug,
      modules,
      totals,
      roleBreakdown: calculateRoleBreakdown(modules),
    } satisfies PricedScenario;
  });
}

export function recalculateScenario(
  scenario: PricedScenario,
  rateCards: RateCard[],
  pmPercentage: number,
  moduleInclusionOverrides: Record<string, boolean>,
  riskBufferPercentage = 0,
): PricedScenario {
  const repriced = priceScenarios({
    scenarios: [
      {
        ...scenario,
        id: scenario.id,
        modules: scenario.modules.map((module) => ({
          id: module.id,
          name: module.name,
          description: module.description,
          complexity: module.complexity,
          isOptional: module.isOptional,
          isIncludedByDefault: module.isIncludedByDefault,
          dependencyNotes: module.dependencyNotes,
          riskNotes: module.riskNotes,
          tasks: module.tasks.map((task) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            userStory: task.userStory,
            acceptanceCriteria: task.acceptanceCriteria,
            efforts: task.efforts.map((effort) => ({
              id: effort.id,
              roleRateCardId: effort.roleRateCardId,
              roleName: effort.roleName,
              seniority: effort.seniority,
              hourlyRateEur: effort.hourlyRateEur,
              estimatedHoursMin: effort.estimatedHoursMin,
              estimatedHoursExpected: effort.estimatedHoursExpected,
              estimatedHoursMax: effort.estimatedHoursMax,
              rationale: effort.rationale,
            })),
          })),
        })),
      } as any,
    ],
    rateCards,
    pmPercentage,
    moduleInclusionOverrides,
    riskBufferPercentage,
  });

  const newScenario = repriced[0] ?? scenario;

  if (scenario.isApproved) {
    // Preserve the original sell prices if the scenario is approved
    newScenario.totals = { ...scenario.totals };
    
    // Preserve module subtotals
    newScenario.modules = newScenario.modules.map(newMod => {
      const origMod = scenario.modules.find(m => m.id === newMod.id);
      if (origMod) {
        newMod.subtotalEur = origMod.subtotalEur;
      }
      return newMod;
    });
  }

  return newScenario;
}

function buildRateCardMap(rateCards: RateCard[]) {
  const rateMap = new Map<string, RateCard>();

  for (const rateCard of rateCards) {
    if (rateCard.hourlyRateEur < 0) {
      throw new PricingError(
        `Negative hourly rate for ${rateCard.roleName} ${rateCard.seniority}.`,
      );
    }

    rateMap.set(
      normalizeRoleKey(rateCard.roleName, rateCard.seniority),
      rateCard,
    );
  }

  return rateMap;
}

function priceTask(
  task: any,
  rateMap: Map<string, RateCard>,
): PricedTask {
  const efforts = task.efforts.map((effort: any) => {
    assertEffortBounds(effort);
    const rateCard = rateMap.get(
      normalizeRoleKey(effort.roleName, effort.seniority),
    );

    if (!rateCard && effort.hourlyRateEur == null) {
      throw new PricingError(
        `Unmapped role: ${effort.roleName} | ${effort.seniority}.`,
      );
    }

    const hourlyRate = effort.hourlyRateEur ?? rateCard!.hourlyRateEur;
    const roleRateCardId = effort.roleRateCardId ?? rateCard!.id;

    return {
      ...effort,
      id: effort.id,
      roleRateCardId,
      hourlyRateEur: hourlyRate,
      costEur: roundMoney(effort.estimatedHoursExpected * hourlyRate),
    };
  });

  return {
    ...task,
    id: task.id,
    efforts,
    subtotalEur: roundMoney(
      efforts.reduce((sum: any, effort: any) => sum + effort.costEur, 0),
    ),
  };
}

function calculateScenarioTotals(args: {
  modules: PricedModule[];
  rateCards: RateCard[];
  pmPercentage: number;
  riskBufferPercentage: number;
}): ScenarioTotals {
  const includedModules = args.modules.filter((module) => module.isIncluded);
  const subtotalEur = roundMoney(
    includedModules.reduce((sum, module) => sum + module.subtotalEur, 0),
  );
  const pmRate = findPmRate(args.rateCards);
  const nonPmHours = roundHours(
    includedModules.reduce(
      (sum, module) =>
        sum +
        module.tasks.reduce(
          (taskSum, task) =>
            taskSum +
            task.efforts
              .filter((effort) => !isPmEffort(effort.roleName))
              .reduce(
                (effortSum, effort) =>
                  effortSum + effort.estimatedHoursExpected,
                0,
              ),
          0,
        ),
      0,
    ),
  );
  const pmHours = Math.ceil(nonPmHours * args.pmPercentage);
  const pmCostEur = roundMoney(pmHours * pmRate.hourlyRateEur);
  const riskBufferEur = roundMoney(subtotalEur * args.riskBufferPercentage);

  return {
    subtotalEur,
    nonPmHours,
    pmHours,
    pmCostEur,
    riskBufferEur,
    totalEur: roundMoney(subtotalEur + pmCostEur + riskBufferEur),
  };
}

function calculateRoleBreakdown(modules: PricedModule[]): PricedRoleBreakdown[] {
  const rows = new Map<string, PricedRoleBreakdown>();

  for (const quoteModule of modules.filter((item) => item.isIncluded)) {
    for (const task of quoteModule.tasks) {
      for (const effort of task.efforts) {
        const key = normalizeRoleKey(effort.roleName, effort.seniority);
        const existing = rows.get(key);
        const hours = effort.estimatedHoursExpected;
        const costEur = effort.costEur;

        if (existing) {
          existing.hours = roundHours(existing.hours + hours);
          existing.costEur = roundMoney(existing.costEur + costEur);
        } else {
          rows.set(key, {
            roleRateCardId: effort.roleRateCardId,
            roleName: effort.roleName,
            seniority: effort.seniority,
            hours,
            hourlyRateEur: effort.hourlyRateEur,
            costEur,
          });
        }
      }
    }
  }

  return [...rows.values()].sort((a, b) => b.costEur - a.costEur);
}

function findPmRate(rateCards: RateCard[]) {
  const pmRate = rateCards.find((rateCard) =>
    isPmEffort(rateCard.roleName),
  );

  if (!pmRate) {
    throw new PricingError(
      "Missing Product Manager / Agile Coach rate card for PM percentage.",
    );
  }

  return pmRate;
}

function isPmEffort(roleName: string) {
  return roleName.trim().toLowerCase().includes("product manager");
}

function assertEffortBounds(effort: RoleEffort) {
  if (
    effort.estimatedHoursMin < 0 ||
    effort.estimatedHoursExpected < 0 ||
    effort.estimatedHoursMax < 0
  ) {
    throw new PricingError(`Negative hours for role ${effort.roleName}.`);
  }

  if (
    effort.estimatedHoursMin > effort.estimatedHoursExpected ||
    effort.estimatedHoursExpected > effort.estimatedHoursMax
  ) {
    throw new PricingError(
      `Invalid effort bounds for ${effort.roleName}: min <= expected <= max is required.`,
    );
  }
}

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function roundHours(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
