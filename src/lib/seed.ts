import { db } from "../firebase";
import { collection, addDoc, getDocs, query, limit, serverTimestamp } from "firebase/firestore";
import { deriveApplicationSteps, deriveEligibilityRequirements, deriveRequiredDocuments } from "./scholarshipRequirements";

export const MOCK_SCHOLARSHIPS = [
  {
    id: "mock-chevening",
    name: "Chevening Scholarship",
    university: "Various UK Universities",
    country: "United Kingdom",
    amount: "Fully Funded",
    deadline: "Nov 5, 2026",
    matchScore: 98,
    difficulty: "High",
    tags: ["Government", "Master's"],
    fields: ["public policy", "business", "computer science", "international relations", "engineering"],
    targetDegrees: ["Master"],
    minGpa: 3.2,
    minIelts: 6.5,
    budgetSupport: "fully-funded",
    description: "Chevening is the UK government's international awards programme aimed at developing global leaders.",
    eligibility: ["Citizen of Chevening-eligible country", "2 years work experience", "Undergraduate degree"],
    documents: ["Transcripts", "References", "Passport"],
    steps: ["Check eligibility", "Prepare essays", "Submit application"],
    officialLink: "https://www.chevening.org/",
  },
  {
    id: "mock-daad",
    name: "DAAD Scholarship",
    university: "Various German Universities",
    country: "Germany",
    amount: "€1,200/month",
    deadline: "Oct 15, 2026",
    matchScore: 92,
    difficulty: "Medium",
    tags: ["Research", "PhD"],
    fields: ["engineering", "computer science", "data science", "science", "research"],
    targetDegrees: ["PhD", "Research"],
    minGpa: 3.4,
    minIelts: 6.5,
    budgetSupport: "stipend",
    description: "DAAD scholarships offer graduates the opportunity to continue their education in Germany.",
    eligibility: ["Bachelor degree", "Academic excellence", "Language proficiency"],
    documents: ["CV", "Research proposal", "Transcripts"],
    steps: ["Find a supervisor", "Apply to DAAD", "Interview"],
    officialLink: "https://www.daad.de/",
  },
  {
    id: "mock-fulbright",
    name: "Fulbright Program",
    university: "Various US Universities",
    country: "United States",
    amount: "Fully Funded",
    deadline: "Aug 1, 2026",
    matchScore: 85,
    difficulty: "High",
    tags: ["Cultural", "Master's"],
    fields: ["arts", "social science", "public policy", "computer science", "education"],
    targetDegrees: ["Master"],
    minGpa: 3,
    minIelts: 7,
    budgetSupport: "fully-funded",
    description: "The Fulbright Program is the flagship international educational exchange program sponsored by the U.S. government.",
    eligibility: ["U.S. citizen or non-U.S. citizen", "Bachelor degree", "Leadership potential"],
    documents: ["Personal statement", "Study objective", "References"],
    steps: ["Contact local commission", "Submit application", "Interview"],
    officialLink: "https://fulbrightprogram.org/",
  },
  {
    id: "mock-erasmus",
    name: "Erasmus Mundus",
    university: "Consortium of EU Universities",
    country: "Europe",
    amount: "€2,500/month",
    deadline: "Jan 15, 2027",
    matchScore: 78,
    difficulty: "Medium",
    tags: ["Joint Degree", "Master's"],
    fields: ["computer science", "engineering", "business", "economics", "health"],
    targetDegrees: ["Master"],
    minGpa: 3,
    minIelts: 6.5,
    budgetSupport: "stipend",
    description: "Erasmus Mundus Joint Masters are high-level integrated study programmes, at master level.",
    eligibility: ["Bachelor degree", "High academic standing", "Language skills"],
    documents: ["Motivation letter", "CV", "Transcripts"],
    steps: ["Choose a programme", "Apply to consortium", "Selection"],
    officialLink: "https://erasmus-plus.ec.europa.eu/",
  },
  {
    id: "mock-commonwealth",
    name: "Commonwealth Master's Scholarship",
    university: "UK Universities",
    country: "United Kingdom",
    amount: "Fully Funded",
    deadline: "Dec 12, 2026",
    matchScore: 81,
    difficulty: "High",
    tags: ["Government", "Master's"],
    fields: ["computer science", "development studies", "engineering", "public health"],
    targetDegrees: ["Master"],
    minGpa: 3.1,
    minIelts: 6.5,
    budgetSupport: "fully-funded",
    description: "Commonwealth Scholarships support talented students from eligible countries to pursue Master's study in the UK.",
    eligibility: ["Citizen of eligible Commonwealth country", "Strong academic record", "Development impact potential"],
    documents: ["Academic transcripts", "Recommendation letters", "Passport"],
    steps: ["Check eligibility", "Prepare nomination", "Submit online application"],
    officialLink: "https://cscuk.fcdo.gov.uk/scholarships/commonwealth-masters-scholarships/",
  },
  {
    id: "mock-mext",
    name: "MEXT Scholarship",
    university: "Japanese Universities",
    country: "Japan",
    amount: "Fully Funded",
    deadline: "May 30, 2026",
    matchScore: 79,
    difficulty: "Medium",
    tags: ["Government", "Research"],
    fields: ["computer science", "robotics", "engineering", "science"],
    targetDegrees: ["Master", "PhD", "Research"],
    minGpa: 3.0,
    minIelts: 6.0,
    budgetSupport: "fully-funded",
    description: "MEXT scholarships are offered by the Government of Japan for international students pursuing research and postgraduate study.",
    eligibility: ["International student", "Academic excellence", "Meets embassy requirements"],
    documents: ["Research plan", "Transcripts", "Medical certificate"],
    steps: ["Apply through embassy", "Written test/interview", "University placement"],
    officialLink: "https://www.studyinjapan.go.jp/en/planning/scholarships/mext-scholarships/",
  },
  {
    id: "mock-gates",
    name: "Gates Cambridge Scholarship",
    university: "University of Cambridge",
    country: "United Kingdom",
    amount: "Fully Funded",
    deadline: "Oct 10, 2026",
    matchScore: 83,
    difficulty: "High",
    tags: ["Leadership", "PhD"],
    fields: ["computer science", "ai", "public policy", "biosciences"],
    targetDegrees: ["Master", "PhD"],
    minGpa: 3.7,
    minIelts: 7.0,
    budgetSupport: "fully-funded",
    description: "Gates Cambridge funds outstanding applicants from outside the UK to pursue full-time postgraduate study at Cambridge.",
    eligibility: ["Non-UK citizen", "Outstanding academic record", "Leadership capacity"],
    documents: ["Research proposal", "CV", "References"],
    steps: ["Apply to Cambridge", "Complete Gates statement", "Attend interview if shortlisted"],
    officialLink: "https://www.gatescambridge.org/",
  },
  {
    id: "mock-rotary",
    name: "Rotary Peace Fellowship",
    university: "Partner Universities",
    country: "Global",
    amount: "Fully Funded",
    deadline: "May 15, 2026",
    matchScore: 76,
    difficulty: "Medium",
    tags: ["Leadership", "Master's"],
    fields: ["peace studies", "international relations", "public policy", "social science"],
    targetDegrees: ["Master"],
    minGpa: 3.0,
    minIelts: 6.5,
    budgetSupport: "fully-funded",
    description: "Rotary Peace Fellowships train leaders committed to peace and development through academic training and field experience.",
    eligibility: ["Leadership experience", "Commitment to peacebuilding", "Relevant work experience"],
    documents: ["Essays", "Recommendations", "Resume"],
    steps: ["Choose programme", "Submit Rotary application", "Interview"],
    officialLink: "https://www.rotary.org/en/our-programs/peace-fellowships",
  },
  {
    id: "mock-australia-awards",
    name: "Australia Awards Scholarship",
    university: "Australian Universities",
    country: "Australia",
    amount: "Fully Funded",
    deadline: "Apr 29, 2026",
    matchScore: 74,
    difficulty: "Medium",
    tags: ["Government", "Master's"],
    fields: ["engineering", "computer science", "development", "health"],
    targetDegrees: ["Master"],
    minGpa: 3.0,
    minIelts: 6.5,
    budgetSupport: "fully-funded",
    description: "Australia Awards provide full scholarships to students from developing countries for study in Australia.",
    eligibility: ["Citizen of participating country", "Return-to-home-country commitment", "Academic merit"],
    documents: ["Academic records", "Passport", "References"],
    steps: ["Check country profile", "Prepare documentation", "Submit application"],
    officialLink: "https://www.dfat.gov.au/people-to-people/australia-awards",
  },
  {
    id: "mock-oxford-clarendon",
    name: "Clarendon Scholarship",
    university: "University of Oxford",
    country: "United Kingdom",
    amount: "Fully Funded",
    deadline: "Jan 8, 2027",
    matchScore: 80,
    difficulty: "High",
    tags: ["Research", "Master's"],
    fields: ["computer science", "engineering", "economics", "humanities"],
    targetDegrees: ["Master", "PhD"],
    minGpa: 3.6,
    minIelts: 7.0,
    budgetSupport: "fully-funded",
    description: "Clarendon offers academically excellent students fully funded opportunities for graduate study at Oxford.",
    eligibility: ["Exceptional academic merit", "Graduate applicant to Oxford", "Strong research potential"],
    documents: ["Statement of purpose", "References", "Academic transcripts"],
    steps: ["Apply to Oxford course", "Automatic scholarship consideration", "Receive offer"],
    officialLink: "https://www.ox.ac.uk/clarendon",
  }
];

const universityPrefixes = ["Global", "International", "National", "Advanced", "Future", "Premier", "Innovation", "Frontier", "World"];
const universitySuffixes = ["University", "Institute of Technology", "Graduate School", "Research Academy", "Science University"];
const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador",
  "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
  "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar",
  "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
  "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal",
  "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan",
  "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania",
  "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal",
  "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea",
  "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan",
  "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela",
  "Vietnam", "Yemen", "Zambia", "Zimbabwe",
];
const fields = [
  "computer science", "engineering", "data science", "business", "public policy", "economics", "arts", "medicine", "ai", "robotics",
  "international relations", "health", "education", "biotechnology", "cybersecurity", "environmental science", "design", "law", "psychology", "media studies",
];
const tagsPool = [
  ["Master's", "Government"],
  ["PhD", "Research"],
  ["Leadership", "Master's"],
  ["Innovation", "STEM"],
  ["Women in Tech", "Master's"],
  ["Public Policy", "Fellowship"],
  ["Joint Degree", "Master's"],
  ["AI", "Research"],
];

const nextDate = (offset: number) => {
  const date = new Date("2026-04-01T00:00:00Z");
  date.setDate(date.getDate() + offset);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
};

export const GENERATED_SCHOLARSHIP_POOL = (() => {
  const generated = [...MOCK_SCHOLARSHIPS];
  const total = 120000;

  for (let i = 0; i < total; i += 1) {
    const country = countries[i % countries.length];
    const field = fields[i % fields.length];
    const tags = tagsPool[i % tagsPool.length];
    const targetDegrees = tags.includes("PhD") || tags.includes("Research") ? ["PhD", "Research"] : ["Master"];
    const fullyFunded = i % 3 === 0;

    generated.push({
      id: `generated-${i + 1}`,
      name: `${field.replace(/\b\w/g, (char) => char.toUpperCase())} Excellence Scholarship ${i + 1}`,
      university: `${universityPrefixes[i % universityPrefixes.length]} ${country.split(" ")[0]} ${universitySuffixes[i % universitySuffixes.length]}`,
      country,
      amount: fullyFunded ? "Fully Funded" : `$${8000 + (i % 12) * 2500}/year`,
      deadline: nextDate((i % 330) + 20),
      matchScore: 60 + (i % 30),
      difficulty: i % 4 === 0 ? "High" : "Medium",
      tags,
      fields: [
        field,
        fields[(i + 3) % fields.length],
        fields[(i + 7) % fields.length],
      ],
      targetDegrees,
      minGpa: 2.8 + (i % 8) * 0.15,
      minIelts: 6 + (i % 4) * 0.5,
      budgetSupport: fullyFunded ? "fully-funded" : "partial",
      description: `A competitive scholarship for ${field} students seeking study opportunities in ${country}.`,
      eligibility: deriveEligibilityRequirements({
        country,
        fields: [
          field,
          fields[(i + 3) % fields.length],
          fields[(i + 7) % fields.length],
        ],
        tags,
        targetDegrees,
        minGpa: 2.8 + (i % 8) * 0.15,
        minIelts: 6 + (i % 4) * 0.5,
        amount: fullyFunded ? "Fully Funded" : `$${8000 + (i % 12) * 2500}/year`,
        budgetSupport: fullyFunded ? "fully-funded" : "partial",
        university: `${universityPrefixes[i % universityPrefixes.length]} ${country.split(" ")[0]} ${universitySuffixes[i % universitySuffixes.length]}`,
      }),
      documents: deriveRequiredDocuments({
        country,
        tags,
        targetDegrees,
        minIelts: 6 + (i % 4) * 0.5,
        amount: fullyFunded ? "Fully Funded" : `$${8000 + (i % 12) * 2500}/year`,
        budgetSupport: fullyFunded ? "fully-funded" : "partial",
      }),
      steps: deriveApplicationSteps({
        country,
        tags,
        targetDegrees,
        university: `${universityPrefixes[i % universityPrefixes.length]} ${country.split(" ")[0]} ${universitySuffixes[i % universitySuffixes.length]}`,
      }),
      officialLink: `https://example.org/scholarships/generated-${i + 1}`,
    });
  }

  return generated;
})();

export async function seedScholarships() {
  const q = query(collection(db, "scholarships"), limit(1));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    console.log("Seeding scholarships...");
    for (const s of MOCK_SCHOLARSHIPS) {
      await addDoc(collection(db, "scholarships"), {
        ...s,
        id: undefined,
        createdAt: serverTimestamp(),
      });
    }
    console.log("Seeding complete.");
  } else {
    console.log("Scholarships already exist, skipping seed.");
  }
}
