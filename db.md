# Database Models Documentation

## Table of Contents
1. [User Models](#user-models)
2. [Content Models](#content-models)
3. [Curriculum Models](#curriculum-models)
4. [Review Models](#review-models)
5. [Analytics Models](#analytics-models)

## User Models

### User
```typescript
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

interface IUser extends Document {
  email: string;
  hashedPassword: string;
  fullName: string;
  role: 'student' | 'expert' | 'admin';
  grade?: number;
  school?: string;
  createdAt: Date;
  lastLogin: Date;
  isActive: boolean;
  permissions: string[];
  preferences: {
    notificationSettings: {
      email: boolean;
      pushNotifications: boolean;
      smsNotifications: boolean;
    };
    displaySettings: {
      theme: string;
      language: string;
      fontSize: number;
    };
  };
  metadata: {
    deviceInfo: string[];
    lastIPAddress: string;
    registrationSource: string;
  };
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['student', 'expert', 'admin'],
    required: true,
  },
  grade: {
    type: Number,
    min: 8,
    max: 12,
  },
  school: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
  permissions: [String],
  preferences: {
    notificationSettings: {
      email: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
    },
    displaySettings: {
      theme: { type: String, default: 'light' },
      language: { type: String, default: 'en' },
      fontSize: { type: Number, default: 14 },
    },
  },
  metadata: {
    deviceInfo: [String],
    lastIPAddress: String,
    registrationSource: String,
  },
});

UserSchema.pre('save', async function(next) {
  if (this.isModified('hashedPassword')) {
    this.hashedPassword = await bcrypt.hash(this.hashedPassword, 12);
  }
  next();
});

export const User = mongoose.model<IUser>('User', UserSchema);
```

### ExpertProfile
```typescript
interface IExpertProfile extends Document {
  userId: Schema.Types.ObjectId;
  bio: string;
  specializations: string[];
  yearsExperience: number;
  qualifications: {
    degree: string;
    institution: string;
    year: number;
    verificationStatus: boolean;
    document: string;
  }[];
  certifications: {
    name: string;
    issuedBy: string;
    validUntil: Date;
  }[];
  verificationMetrics: {
    solutionsSubmitted: number;
    solutionsVerified: number;
    averageRating: number;
    responseTime: number;
    accuracyScore: number;
    rejectionRate: number;
  };
  availability: {
    schedule: {
      day: string;
      hours: {
        start: string;
        end: string;
      }[];
    }[];
    maxReviewsPerDay: number;
  };
  bankDetails: {
    accountHolder: string;
    bankName: string;
    accountNumber: string;
    branchCode: string;
  };
  isVerified: boolean;
  verifiedAt: Date;
  verifiedBy: Schema.Types.ObjectId;
}

const ExpertProfileSchema = new Schema<IExpertProfile>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  bio: String,
  specializations: [String],
  yearsExperience: Number,
  qualifications: [{
    degree: String,
    institution: String,
    year: Number,
    verificationStatus: Boolean,
    document: String,
  }],
  certifications: [{
    name: String,
    issuedBy: String,
    validUntil: Date,
  }],
  verificationMetrics: {
    solutionsSubmitted: { type: Number, default: 0 },
    solutionsVerified: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    responseTime: { type: Number, default: 0 },
    accuracyScore: { type: Number, default: 0 },
    rejectionRate: { type: Number, default: 0 },
  },
  availability: {
    schedule: [{
      day: String,
      hours: [{
        start: String,
        end: String,
      }],
    }],
    maxReviewsPerDay: Number,
  },
  bankDetails: {
    accountHolder: String,
    bankName: String,
    accountNumber: String,
    branchCode: String,
  },
  isVerified: { type: Boolean, default: false },
  verifiedAt: Date,
  verifiedBy: Schema.Types.ObjectId,
});

export const ExpertProfile = mongoose.model<IExpertProfile>('ExpertProfile', ExpertProfileSchema);
```

## Content Models

### Solution
```typescript
interface ISolution extends Document {
  expertId: Schema.Types.ObjectId;
  questionId: Schema.Types.ObjectId;
  metadata: {
    subject: string;
    grade: number;
    chapter: string;
    topic: string;
    textbook: {
      name: string;
      edition: string;
      publisher: string;
      page: number;
      isbn: string;
    };
    difficulty: number;
    estimatedTime: number;
    tags: string[];
  };
  content: {
    question: {
      text: string;
      images: string[];
      mathContent?: string;
    };
    steps: Schema.Types.ObjectId[];
    finalAnswer: string;
  };
  verificationStatus: 'pending' | 'in_review' | 'approved' | 'rejected';
  verificationHistory: {
    status: string;
    reviewerId: Schema.Types.ObjectId;
    timestamp: Date;
    comments: string;
  }[];
  stats: {
    viewCount: number;
    helpfulVotes: number;
    unhelpfulVotes: number;
    reportCount: number;
    averageRating: number;
  };
  flags: {
    isFeature: boolean;
    needsRevision: boolean;
    isArchived: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: Schema.Types.ObjectId;
}

const SolutionSchema = new Schema<ISolution>({
  expertId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questionId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  metadata: {
    subject: String,
    grade: Number,
    chapter: String,
    topic: String,
    textbook: {
      name: String,
      edition: String,
      publisher: String,
      page: Number,
      isbn: String,
    },
    difficulty: {
      type: Number,
      min: 1,
      max: 5,
    },
    estimatedTime: Number,
    tags: [String],
  },
  content: {
    question: {
      text: String,
      images: [String],
      mathContent: String,
    },
    steps: [{
      type: Schema.Types.ObjectId,
      ref: 'SolutionStep',
    }],
    finalAnswer: String,
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'in_review', 'approved', 'rejected'],
    default: 'pending',
  },
  verificationHistory: [{
    status: String,
    reviewerId: Schema.Types.ObjectId,
    timestamp: Date,
    comments: String,
  }],
  stats: {
    viewCount: { type: Number, default: 0 },
    helpfulVotes: { type: Number, default: 0 },
    unhelpfulVotes: { type: Number, default: 0 },
    reportCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
  },
  flags: {
    isFeature: { type: Boolean, default: false },
    needsRevision: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
  },
  lastModifiedBy: Schema.Types.ObjectId,
}, {
  timestamps: true,
});

export const Solution = mongoose.model<ISolution>('Solution', SolutionSchema);
```

### SolutionStep
```typescript
interface ISolutionStep extends Document {
  solutionId: Schema.Types.ObjectId;
  stepNumber: number;
  type: 'explanation' | 'calculation' | 'graph' | 'proof';
  content: {
    explanation: string;
    mathContent?: string;
    images: string[];
    attachments: {
      type: string;
      url: string;
      description: string;
    }[];
  };
  hints: {
    text: string;
    revealOrder: number;
  }[];
  isOptional: boolean;
  difficulty: number;
  prerequisites?: Schema.Types.ObjectId[];
}

const SolutionStepSchema = new Schema<ISolutionStep>({
  solutionId: {
    type: Schema.Types.ObjectId,
    ref: 'Solution',
    required: true,
  },
  stepNumber: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['explanation', 'calculation', 'graph', 'proof'],
    required: true,
  },
  content: {
    explanation: String,
    mathContent: String,
    images: [String],
    attachments: [{
      type: String,
      url: String,
      description: String,
    }],
  },
  hints: [{
    text: String,
    revealOrder: Number,
  }],
  isOptional: {
    type: Boolean,
    default: false,
  },
  difficulty: {
    type: Number,
    min: 1,
    max: 5,
  },
  prerequisites: [{
    type: Schema.Types.ObjectId,
    ref: 'SolutionStep',
  }],
}, {
  timestamps: true,
});

export const SolutionStep = mongoose.model<ISolutionStep>('SolutionStep', SolutionStepSchema);
```

## Curriculum Models

### Subject
```typescript
interface ISubject extends Document {
  name: string;
  code: string;
  grades: number[];
  description: string;
  capsAlignment: {
    curriculum: string;
    year: number;
    version: string;
    alignmentNotes: string;
  };
  metadata: {
    icon: string;
    color: string;
    displayOrder: number;
  };
  stats: {
    totalSolutions: number;
    averageDifficulty: number;
    popularTopics: string[];
  };
  isActive: boolean;
}

const SubjectSchema = new Schema<ISubject>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  grades: [{
    type: Number,
    min: 8,
    max: 12,
  }],
  description: String,
  capsAlignment: {
    curriculum: String,
    year: Number,
    version: String,
    alignmentNotes: String,
  },
  metadata: {
    icon: String,
    color: String,
    displayOrder: Number,
  },
  stats: {
    totalSolutions: { type: Number, default: 0 },
    averageDifficulty: { type: Number, default: 0 },
    popularTopics: [String],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export const Subject = mongoose.model<ISubject>('Subject', SubjectSchema);
```

### Chapter
```typescript
interface IChapter extends Document {
  subjectId: Schema.Types.ObjectId;
  name: string;
  orderIndex: number;
  description: string;
  learningObjectives: string[];
  estimatedHours: number;
  prerequisites: Schema.Types.ObjectId[];
  resources: {
    type: string;
    url: string;
    description: string;
  }[];
  metadata: {
    difficulty: number;
    importance: number;
  };
  stats: {
    completionRate: number;
    averageTime: number;
    challengingConcepts: string[];
  };
}

const ChapterSchema = new Schema<IChapter>({
  subjectId: {
    type: Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  orderIndex: {
    type: Number,
    required: true,
  },
  description: String,
  learningObjectives: [String],
  estimatedHours: Number,
  prerequisites: [{
    type: Schema.Types.ObjectId,
    ref: 'Chapter',
  }],
  resources: [{
    type: String,
    url: String,
    description: String,
  }],
  metadata: {
    difficulty: {
      type: Number,
      min: 1,
      max: 5,
    },
    importance: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  stats: {
    completionRate: Number,
    averageTime: Number,
    challengingConcepts: [String],
  },
}, {
  timestamps: true,
});

export const Chapter = mongoose.model<IChapter>('Chapter', ChapterSchema);
```

## Review Models

### Review
```typescript
interface IReview extends Document {
  solutionId: Schema.Types.ObjectId;
  reviewerId: Schema.Types.ObjectId;
  type: 'primary' | 'secondary' | 'final';
  status: 'pending' | 'completed' | 'escalated';
  checklist: {
    mathematicalAccuracy: boolean;
    explanationClarity: boolean;
    curriculumAlignment: boolean;
    languageQuality: boolean;
    formatConsistency: boolean;
  };
  feedback: {
    generalComments: string;
    specificFeedback: {
      stepNumber: number;
      comment: string;
      severity: 'minor' | 'major' | 'critical';
    }[];
    suggestedImprovements: string[];
  };
  metrics: {
    timeSpent: number;
    qualityScore: number;
    difficultyRating: number;
  };
}

const ReviewSchema = new Schema<IReview>({
  solutionId: {
    type: Schema.Types.ObjectId,
    ref
