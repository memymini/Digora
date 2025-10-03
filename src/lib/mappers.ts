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
  U extends { [key: string]: any }
>(distribution: T[], candidates: Option[], labelKey: keyof T): U[] {
  return distribution.map((group) => {
    const obj: any = { [labelKey]: group[labelKey] };

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

    return obj;
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
