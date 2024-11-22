# South African Textbook Solutions Platform - Database Models & Usage

## Core Models Overview

### 1. User System
```typescript
// User Types
enum UserRole { STUDENT, EXPERT, ADMIN }

// Example User Data
const student = {
  email: "student@school.co.za",
  fullName: "John Smith",
  role: "STUDENT",
  grade: 12,
  school: "St Johns College"
}

const expert = {
  email: "expert@domain.com",
  fullName: "Dr. Jane Doe",
  role: "EXPERT",
  expertProfile: {
    qualifications: [
      { degree: "PhD Mathematics", institution: "UCT" }
    ],
    specializations: ["Mathematics", "Physical Sciences"]
  }
}
```

### 2. Resource System
```typescript
// Resource Types
enum ResourceType { TEXTBOOK, PAST_PAPER, STUDY_GUIDE }
enum CurriculumType { CAPS, IEB }

// Example Resources
const textbook = {
  type: "TEXTBOOK",
  title: "Mind Action Series Mathematics",
  subject: "Mathematics",
  grade: 12,
  publisher: "Mind Action Series",
  curriculum: "CAPS"
}

const pastPaper = {
  type: "PAST_PAPER",
  title: "IEB Physics P1",
  subject: "Physical Sciences",
  grade: 12,
  year: 2023,
  term: 2,
  curriculum: "IEB"
}
```

### 3. Content Organization
```typescript
// Content Hierarchy
Resource -> Chapter -> Topic -> Question -> Solution

// Example Chapter
const chapter = {
  number: 3,
  title: "Calculus",
  topics: [
    { title: "Derivatives" },
    { title: "Applications of Derivatives" }
  ]
}
```

### 4. Question & Solution System
```typescript
// Question Types
enum SolutionType { STRUCTURED, ESSAY, MCQ, DRAWING, PROOF }

// Example Questions & Solutions:

// 1. MCQ Example
const mcqQuestion = {
  type: "MCQ",
  questionNumber: "1.1",
  content: {
    text: "The derivative of x² is:",
    options: [
      { id: "A", text: "2x" },
      { id: "B", text: "x²" },
      { id: "C", text: "x" },
      { id: "D", text: "2" }
    ],
    correctAnswer: "A"
  }
}

const mcqSolution = {
  content: {
    correctAnswer: "A",
    explanation: {
      mainReason: "Using power rule: d/dx(x^n) = nx^(n-1)",
      wrongAnswerExplanations: {
        "B": "This is the original function",
        "C": "This would be derivative of x²/2",
        "D": "This would be derivative of 2x"
      }
    }
  }
}

// 2. Structured Example
const structuredQuestion = {
  type: "STRUCTURED",
  questionNumber: "2.1",
  content: {
    mainQuestion: "Solve: 2x² + 5x - 12 = 0",
    subQuestions: [
      { part: "a", text: "Solve by factorization", marks: 3 },
      { part: "b", text: "Verify your solutions", marks: 2 }
    ]
  }
}

const structuredSolution = {
  content: {
    parts: {
      a: {
        steps: [
          { explanation: "Factor: (2x - 3)(x + 4) = 0" },
          { explanation: "Solve: x = 3/2 or x = -4" }
        ]
      },
      b: {
        steps: [
          { explanation: "Verify x = 3/2: 2(3/2)² + 5(3/2) - 12 = 0 ✓" }
        ]
      }
    }
  }
}
```

## Common Queries

### 1. Finding Solutions
```typescript
// Get all solutions for a textbook chapter
const chapterSolutions = await prisma.solution.findMany({
  where: {
    question: {
      chapter: { id: chapterId }
    }
  }
})

// Get solutions by expert
const expertSolutions = await prisma.solution.findMany({
  where: {
    expertId: expertId
  }
})
```

### 2. Resource Navigation
```typescript
// Get textbook structure
const textbookStructure = await prisma.resource.findUnique({
  where: { id: textbookId },
  include: {
    chapters: {
      include: {
        topics: true
      }
    }
  }
})
```

### 3. User Management
```typescript
// Get expert profile with solutions
const expertProfile = await prisma.user.findUnique({
  where: { id: expertId },
  include: {
    expertProfile: true,
    solutions: true
  }
})
```

## Data Relationships
- Each `Question` belongs to a `Resource` and optionally to a `Chapter` and `Topic`
- Each `Solution` belongs to a `Question` and an `Expert`
- Each `ExpertProfile` belongs to a `User`
- `Resources` contain many `Chapters` which contain many `Topics`

## Common Operations

### 1. Creating a New Solution
```typescript
const newSolution = await prisma.solution.create({
  data: {
    question: { connect: { id: questionId } },
    expert: { connect: { id: expertId } },
    content: solutionContent,
    steps: solutionSteps,
    verificationStatus: "PENDING"
  }
})
```

### 2. Finding Questions by Type
```typescript
const mcqQuestions = await prisma.question.findMany({
  where: {
    type: "MCQ",
    resource: {
      subject: "Mathematics",
      grade: 12
    }
  }
})
```

### 3. Updating Solution Status
```typescript
const verifiedSolution = await prisma.solution.update({
  where: { id: solutionId },
  data: {
    verificationStatus: "VERIFIED"
  }
})
```

## Best Practices
1. Always include error handling for database operations
2. Use transactions for related operations
3. Implement proper validation before database operations
4. Cache frequently accessed data
5. Use pagination for large result sets

Need help with:
1. Additional query examples?
2. More detailed data structures?
3. Specific use cases?
4. Implementation details?
