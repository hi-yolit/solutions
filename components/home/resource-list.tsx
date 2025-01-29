import React from "react";
import { RESOURCE_TYPES, ResourceTypeEnum } from "@/lib/constants";


const resourceTypeLabels: Record<ResourceType, string> = {
  TEXTBOOK: "Textbook",
  PAST_PAPER: "Past Paper",
  STUDY_GUIDE: "Study Guide",
};

export const dummyResources = [
  // Textbooks
  {
    type: ResourceTypeEnum.Textbook,
    title: "Mathematics Grade 12 CAPS",
    content:
      "Official CAPS-aligned textbook covering algebra, calculus, and analytical geometry. Includes practice exercises and exam preparation.",
    author: "Department of Basic Education",
    publisher: "Pearson South Africa",
  },
  {
    type: ResourceTypeEnum.Textbook,
    title: "Physical Sciences Grade 12",
    content:
      "Comprehensive guide for Physics and Chemistry with CAPS-aligned content. Includes practical experiments and problem sets.",
    author: "Dr. J. Bransby et al.",
    publisher: "Oxford University Press",
  },
  {
    type: ResourceTypeEnum.Textbook,
    title: "Via Afrika Life Sciences Grade 12",
    content:
      "Detailed coverage of DNA, genetics, and environmental studies. Aligned with CAPS requirements.",
    publisher: "Via Afrika",
  },

  // Past Papers
  {
    type: ResourceTypeEnum.PastPaper,
    title: "2023 NSC Mathematics Paper 1",
    content:
      "National Senior Certificate examination paper with memorandum. Algebra and Calculus focus.",
    year: 2023,
    subject: "Mathematics",
    paperNumber: 1,
  },
  {
    type: ResourceTypeEnum.PastPaper,
    title: "2022 Physical Sciences Paper 2 (Chemistry)",
    content:
      "Final exam paper covering chemical change, organic chemistry, and electrochemistry.",
    year: 2022,
    subject: "Physical Sciences",
    paperNumber: 2,
  },
  {
    type: ResourceTypeEnum.PastPaper,
    title: "2023 English HL Paper 3",
    content: "Home Language exam focusing on essay writing and comprehension.",
    year: 2023,
    subject: "English",
  },

  // Study Guides
  {
    type: ResourceTypeEnum.StudyGuide,
    title: "The Answer Series: Accounting Grade 12",
    content:
      "Simplified study guide with worked examples and practice exams. CAPS-aligned.",
    subject: "Accounting",
    edition: "3rd",
    pages: 216,
  },
  {
    type: ResourceTypeEnum.StudyGuide,
    title: "X-kit Achieve! Geography Grade 12",
    content:
      "Essential exam preparation guide covering climatology, geomorphology, and SA geography.",
    subject: "Geography",
    features: ["Exam tips", "Summaries", "Practice questions"],
  },
  {
    type: ResourceTypeEnum.StudyGuide,
    title: "Mind the Gap History Grade 12",
    content:
      "CAPS-aligned study guide focusing on Cold War, Civil Society protests, and SA heritage.",
    publisher: "Department of Basic Education",
    pages: 189,
  },
];


const ResourceList = () => {
  return (
    <div className="bg-slate-400">
      <p>Resource List Grid</p>
    </div>
  );
};

export default ResourceList;
