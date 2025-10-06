import { AgeDistribution, GenderDistribution, Option } from "./types";

export type AgeChartData = {
  age: string;
  [key: `c${number}`]: number;
};

export type GenderChartData = {
  gender: string;
  [key: `c${number}`]: number;
};

export type PieChartData = Option & {
  [key: string]: string | number | undefined;
};

export function mapPieChartData(candidates: Option[]): PieChartData[] {
  return candidates.map((candidate) => ({
    ...candidate,
  }));
}

export function mapChartData<
  T extends { results: { id: number; count: number }[] },
  U extends Record<string, string | number>
>(
  distribution: T[],
  candidates: Option[],
  labelKey: Exclude<keyof T, "results">,
  labelMapper?: (label: string) => string
): U[] {
  return distribution.map((group) => {
    const rawLabel = group[labelKey] as string;
    const mappedLabel = labelMapper ? labelMapper(rawLabel) : rawLabel;

    const obj: Record<string, string | number> = {
      [labelKey as string]: mappedLabel,
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
    "age",
    mapAgeGroup
  );
}

export function mapGenderChartData(
  genderDistribution: GenderDistribution[],
  candidates: Option[]
): GenderChartData[] {
  return mapChartData<GenderDistribution, GenderChartData>(
    genderDistribution,
    candidates,
    "gender",
    mapGender
  );
}

// =============================================
// Enum to Display String Mappers
// =============================================

export const GENDER_MAP: Record<string, string> = {
  male: "남성",
  female: "여성",
  other: "기타",
  unknown: "알 수 없음",
};

export const AGE_GROUP_MAP: Record<string, string> = {
  "10s": "20대 미만",
  "20s": "20대",
  "30s": "30대",
  "40s": "40대",
  "50s": "50대",
  "60s_plus": "60대 이상",
  unknown: "알 수 없음",
};

export const OVERALL_GROUP_MAP: Record<string, string> = {
  "20s male": "20대 남성",
  "20s female": "20대 여성",
  "30s male": "30대 남성",
  "30s female": "30대 여성",
  "40s male": "40대 남성",
  "40s female": "40대 여성",
  "50s male": "50대 남성",
  "50s female": "50대 여성",
  unknown: "알 수 없음",
};

export const mapGender = (gender: string): string => {
  return GENDER_MAP[gender] || gender;
};

export const mapAgeGroup = (ageGroup: string): string => {
  return AGE_GROUP_MAP[ageGroup] || ageGroup;
};

export const mapOverallGroup = (group: string): string => {
  return OVERALL_GROUP_MAP[group] || group;
};
