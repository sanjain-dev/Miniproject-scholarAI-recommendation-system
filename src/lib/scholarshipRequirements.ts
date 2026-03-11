interface ScholarshipRequirementsInput {
  country: string;
  fields?: string[];
  tags?: string[];
  targetDegrees?: string[];
  minGpa?: number;
  minIelts?: number;
  amount?: string;
  budgetSupport?: string;
  university?: string;
}

const normalize = (value?: string) => (value || "").trim().toLowerCase();

export const deriveEligibilityRequirements = (scholarship: ScholarshipRequirementsInput) => {
  const requirements: string[] = [];
  const tags = (scholarship.tags || []).map(normalize);
  const degrees = (scholarship.targetDegrees || []).map(normalize);
  const primaryField = scholarship.fields?.[0];

  if (scholarship.country && scholarship.country !== "Global" && scholarship.country !== "Europe") {
    requirements.push(`Must be eligible to study in ${scholarship.country}`);
  }

  if (degrees.includes("master")) {
    requirements.push("Completed 12th / Bachelor's level academic qualification");
  }

  if (degrees.includes("phd") || degrees.includes("research")) {
    requirements.push("Strong academic background with research interest");
  }

  if (primaryField) {
    requirements.push(`Academic background in ${primaryField} or a related discipline`);
  }

  if (typeof scholarship.minGpa === "number") {
    const cgpaOutOfTen = (scholarship.minGpa * 2.5).toFixed(1);
    requirements.push(`Minimum CGPA around ${cgpaOutOfTen} / 10 expected`);
  }

  if (typeof scholarship.minIelts === "number") {
    const toeflEquivalent = Math.round(scholarship.minIelts * 15);
    requirements.push(`English proficiency required: IELTS ${scholarship.minIelts}+ or TOEFL ${toeflEquivalent}+`);
  }

  if (tags.includes("government")) {
    requirements.push("Must satisfy country-specific government scholarship rules");
  }

  if (tags.includes("research")) {
    requirements.push("Research proposal or supervisor interest may be required");
  }

  if (tags.includes("leadership")) {
    requirements.push("Leadership, extracurricular, or community impact profile preferred");
  }

  return requirements.slice(0, 5);
};

export const deriveRequiredDocuments = (scholarship: ScholarshipRequirementsInput) => {
  const documents = ["Academic Transcripts", "Passport / ID Proof"];
  const tags = (scholarship.tags || []).map(normalize);
  const degrees = (scholarship.targetDegrees || []).map(normalize);

  if (degrees.includes("master") || degrees.includes("phd")) {
    documents.push("Statement of Purpose");
  }

  if (tags.includes("research") || degrees.includes("research") || degrees.includes("phd")) {
    documents.push("Research Proposal");
  }

  if (tags.includes("leadership") || tags.includes("government")) {
    documents.push("Recommendation Letters");
  }

  if (typeof scholarship.minIelts === "number") {
    documents.push("IELTS / TOEFL Score Report");
  }

  if (/fully funded/i.test(scholarship.amount || "") || scholarship.budgetSupport === "fully-funded") {
    documents.push("Financial Need / Scholarship Form");
  }

  return Array.from(new Set(documents)).slice(0, 5);
};

export const deriveApplicationSteps = (scholarship: ScholarshipRequirementsInput) => {
  const steps = [
    `Check ${scholarship.university || "scholarship"} eligibility`,
    "Prepare required documents",
    "Complete scholarship application form",
  ];

  const tags = (scholarship.tags || []).map(normalize);
  const degrees = (scholarship.targetDegrees || []).map(normalize);

  if (tags.includes("research") || degrees.includes("phd")) {
    steps.push("Submit research proposal / academic plan");
  }

  steps.push("Track shortlisting and interview updates");

  return steps.slice(0, 5);
};
