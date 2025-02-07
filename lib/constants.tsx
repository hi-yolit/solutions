interface Grade {
  key: string;
  label: string;
}

export const GRADES: Grade[] = [
  { key: "Gr12", label: "Gr12" },
  { key: "Gr11", label: "Gr11" },
  { key: "Gr10", label: "Gr10" },
];

export const SUBJECTS: string[] = ["Mathematics", "Science", "Accounting", "Life Sciences"];

export enum ResourceTypeEnum {
  Textbook = "Textbook",
  PastPaper = "Past Paper",
  StudyGuide = "Study Guide",
}
export const RESOURCE_TYPES: ResourceTypeEnum[] = Object.values(ResourceTypeEnum);

export const subjectEmojis: { [subject: string]: string } = {
  Mathematics: "➗",
  "Mathematical Literacy": "📊",
  English: "🇬🇧",
  Afrikaans: "🇿🇦",
  isiZulu: "🇿🇦",
  isiXhosa: "🇿🇦",
  "Life Sciences": "🌿",
  "Physical Sciences": "🧪",
  "Computer Applications Technology": "💻",
  "Information Technology": "👨‍💻",
  Accounting: "🧾",
  "Business Studies": "🏢",
  Economics: "💸",
  "Visual Arts": "🎨",
  Music: "🎵",
  Geography: "🌍",
  History: "📜",
};