import { AgeDistribution, GenderDistribution, Option } from "./types";

export type AgeChartData = {
  age: string;
  [key: `c${number}`]: number;
};

export type GenderChartData = {
  gender: string;
  [key: `c${number}`]: number;
};

export function mapChartData<
  T extends { results: { id: number; count: number }[] },
  U extends Record<string, string | number>
>(
  distribution: T[],
  candidates: Option[],
  labelKey: Exclude<keyof T, "results">
): U[] {
  return distribution.map((group) => {
    const obj: Record<string, string | number> = {
      [labelKey as string]: group[labelKey] as string | number,
    };

    group.results.forEach((result) => {
      const candidate = candidates.find((c) => c.id === result.id);
      if (candidate) {
        obj[`c${result.id}`] = result.count;
      } else {
        console.warn(
          `⚠️ Candidate with id=${result.id} not found in candidates list`
        );
      }
    });

    return obj as U;
  });
}

export function mapAgeChartData(
  ageDistribution: AgeDistribution[],
  candidates: Option[]
): AgeChartData[] {
  return mapChartData<AgeDistribution, AgeChartData>(
    ageDistribution,
    candidates,
    "age"
  );
}

export function mapGenderChartData(
  genderDistribution: GenderDistribution[],
  candidates: Option[]
): GenderChartData[] {
  return mapChartData<GenderDistribution, GenderChartData>(
    genderDistribution,
    candidates,
    "gender"
  );
}
