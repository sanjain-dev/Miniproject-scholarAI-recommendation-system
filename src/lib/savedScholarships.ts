const getKey = (uid: string) => `scholarai.saved.${uid}`;

export const getSavedScholarships = <T,>(uid: string): T[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(getKey(uid));
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
};

export const saveScholarshipToLocal = <T extends { id: string }>(uid: string, scholarship: T) => {
  const existing = getSavedScholarships<T>(uid);
  const next = [...existing.filter((item) => item.id !== scholarship.id), scholarship];
  window.localStorage.setItem(getKey(uid), JSON.stringify(next));
};

export const removeScholarshipFromLocal = (uid: string, scholarshipId: string) => {
  const existing = getSavedScholarships<{ id: string }>(uid);
  const next = existing.filter((item) => item.id !== scholarshipId);
  window.localStorage.setItem(getKey(uid), JSON.stringify(next));
};

export const isScholarshipSavedLocal = (uid: string, scholarshipId: string) =>
  getSavedScholarships<{ id: string }>(uid).some((item) => item.id === scholarshipId);
