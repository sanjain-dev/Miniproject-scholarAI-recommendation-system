export interface UserProfileInput {
  name?: string;
  country?: string;
  degree?: string;
  field?: string;
  skills?: string;
  gpa?: number;
  ielts?: number | string;
  toefl?: number | string;
  budget?: number;
  preferredCountries?: string;
}

export interface ScholarshipInput {
  id: string;
  name: string;
  university: string;
  country: string;
  amount: string;
  deadline: string;
  matchScore?: number;
  difficulty: string;
  tags: string[];
  fields?: string[];
  targetDegrees?: string[];
  minGpa?: number;
  minIelts?: number;
  budgetSupport?: string;
  description?: string;
}

export interface RecommendationResult extends ScholarshipInput {
  matchScore: number;
  reasons: string[];
}

const normalize = (value?: string | number | null) => String(value ?? "").trim().toLowerCase();
const normalizeCgpaToFourScale = (value: number) => (value > 4 ? value / 2.5 : value);
const normalizeEnglishScore = (ielts: number, toefl: number) => {
  if (ielts > 0) {
    return ielts;
  }

  if (toefl > 0) {
    return toefl / 15;
  }

  return 0;
};

const nextDegreeMap: Record<string, string[]> = {
  "10th": ["12th", "diploma"],
  "12th": ["bachelor", "diploma", "foundation"],
  diploma: ["bachelor", "master"],
  bachelor: ["master", "master's"],
  master: ["phd", "research"],
  phd: ["research", "fellowship"],
};

export const getRecommendationReasons = (
  profile: UserProfileInput | null | undefined,
  scholarship: ScholarshipInput
) => {
  const reasons: string[] = [];
  const preferredCountries = normalize(profile?.preferredCountries);
  const field = normalize(profile?.field);
  const skills = normalize(profile?.skills);
  const degree = normalize(profile?.degree);
  const gpa = normalizeCgpaToFourScale(Number(profile?.gpa ?? 0));
  const ielts = Number(profile?.ielts ?? 0);
  const toefl = Number(profile?.toefl ?? 0);
  const englishScore = normalizeEnglishScore(ielts, toefl);
  const budget = Number(profile?.budget ?? 0);

  if (preferredCountries && preferredCountries.includes(normalize(scholarship.country))) {
    reasons.push(`Matches your preferred country choice (${scholarship.country})`);
  }

  if (field && scholarship.fields?.some((item) => normalize(item).includes(field) || field.includes(normalize(item)))) {
    reasons.push(`Strong fit for your ${profile?.field} background`);
  }

  if (skills && scholarship.fields?.some((item) => skills.includes(normalize(item)))) {
    reasons.push(`Your skills align with this scholarship focus`);
  }

  const targetDegrees = scholarship.targetDegrees?.map(normalize) ?? [];
  const nextDegrees = nextDegreeMap[degree] ?? [];
  if (nextDegrees.some((item) => targetDegrees.includes(item))) {
    reasons.push(`Aligned with your next study goal after ${profile?.degree}`);
  }

  if (gpa > 0 && scholarship.minGpa && gpa >= scholarship.minGpa) {
    reasons.push(`Your CGPA clears the usual requirement`);
  }

  if (englishScore > 0 && scholarship.minIelts && englishScore >= scholarship.minIelts) {
    reasons.push(`Your IELTS/TOEFL score is competitive here`);
  }

  if (budget > 0) {
    if (/fully funded/i.test(scholarship.amount) || scholarship.budgetSupport === "fully-funded") {
      reasons.push("Funding support is strong for your budget preference");
    } else if (/month/i.test(scholarship.amount) || scholarship.budgetSupport === "stipend") {
      reasons.push("Monthly stipend can reduce your study cost");
    }
  }

  if (reasons.length === 0) {
    reasons.push("General fit based on your profile and scholarship requirements");
  }

  return reasons.slice(0, 3);
};

export const scoreScholarship = (
  profile: UserProfileInput | null | undefined,
  scholarship: ScholarshipInput
): RecommendationResult => {
  let score = 45;
  const reasons = getRecommendationReasons(profile, scholarship);
  const preferredCountries = normalize(profile?.preferredCountries);
  const field = normalize(profile?.field);
  const skills = normalize(profile?.skills);
  const degree = normalize(profile?.degree);
  const gpa = normalizeCgpaToFourScale(Number(profile?.gpa ?? 0));
  const ielts = Number(profile?.ielts ?? 0);
  const toefl = Number(profile?.toefl ?? 0);
  const englishScore = normalizeEnglishScore(ielts, toefl);
  const budget = Number(profile?.budget ?? 0);

  if (preferredCountries && preferredCountries.includes(normalize(scholarship.country))) {
    score += 20;
  }

  if (field && scholarship.fields?.some((item) => normalize(item).includes(field) || field.includes(normalize(item)))) {
    score += 18;
  }

  if (skills && scholarship.fields?.some((item) => skills.includes(normalize(item)))) {
    score += 12;
  }

  const targetDegrees = scholarship.targetDegrees?.map(normalize) ?? [];
  const nextDegrees = nextDegreeMap[degree] ?? [];
  if (nextDegrees.some((item) => targetDegrees.includes(item))) {
    score += 16;
  }

  if (gpa > 0 && scholarship.minGpa) {
    score += gpa >= scholarship.minGpa ? 10 : -8;
  }

  if (englishScore > 0 && scholarship.minIelts) {
    score += englishScore >= scholarship.minIelts ? 8 : -6;
  }

  if (budget > 0) {
    if (/fully funded/i.test(scholarship.amount) || scholarship.budgetSupport === "fully-funded") {
      score += 10;
    } else if (/month/i.test(scholarship.amount) || scholarship.budgetSupport === "stipend") {
      score += 6;
    }
  }

  if (normalize(profile?.country) === normalize(scholarship.country)) {
    score -= 8;
  }

  score = Math.max(52, Math.min(98, Math.round(score)));

  return {
    ...scholarship,
    matchScore: score,
    reasons,
  };
};

export const getTopRecommendations = (
  profile: UserProfileInput | null | undefined,
  scholarships: ScholarshipInput[],
  limit = 10
) => {
  const top: RecommendationResult[] = [];

  for (const scholarship of scholarships) {
    const scored = scoreScholarship(profile, scholarship);

    if (top.length < limit) {
      top.push(scored);
      top.sort((a, b) => b.matchScore - a.matchScore);
      continue;
    }

    if (scored.matchScore > top[top.length - 1].matchScore) {
      top[top.length - 1] = scored;
      top.sort((a, b) => b.matchScore - a.matchScore);
    }
  }

  return top;
};
