interface ScholarshipLinkInput {
  name?: string;
  country?: string;
  university?: string;
  officialLink?: string;
}

export const getScholarshipApplyLink = (scholarship: ScholarshipLinkInput) => {
  const link = scholarship.officialLink?.trim();

  if (link && !link.includes("example.org")) {
    return link;
  }

  const query = [scholarship.name, scholarship.university, scholarship.country, "scholarship official application"]
    .filter(Boolean)
    .join(" ");

  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
};
