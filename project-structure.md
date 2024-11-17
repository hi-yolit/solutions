# Complete Project Structure Documentation

## Overview

This document outlines the comprehensive directory structure for the South African Textbook Solutions platform. The structure is organized to support scalability, maintainability, and clear separation of concerns.

## Root Directory Structure

```
sa-textbook-solutions/
├── .github/
│   └── workflows/
│       ├── deploy.yml
│       └── tests.yml
├── docs/
│   ├── api-docs.md
│   ├── setup-guide.md
│   └── deployment.md
├── backend/
├── frontend/
├── shared/
├── .gitignore
├── README.md
├── docker-compose.yml
└── package.json
```

## Backend Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts        # Database configuration
│   │   ├── aws.ts            # AWS services configuration
│   │   ├── redis.ts          # Redis cache configuration
│   │   └── constants.ts      # Application constants
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts      # Authentication logic
│   │   ├── solution.controller.ts   # Solution management
│   │   ├── expert.controller.ts     # Expert handling
│   │   ├── review.controller.ts     # Review process
│   │   ├── subject.controller.ts    # Subject management
│   │   └── user.controller.ts       # User management
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts       # JWT authentication
│   │   ├── validation.middleware.ts  # Request validation
│   │   ├── error.middleware.ts      # Error handling
│   │   ├── rate-limiter.middleware.ts
│   │   └── logger.middleware.ts
│   │
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── solution.model.ts
│   │   ├── expert.model.ts
│   │   ├── review.model.ts
│   │   ├── subject.model.ts
│   │   └── chapter.model.ts
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── solution.routes.ts
│   │   ├── expert.routes.ts
│   │   ├── review.routes.ts
│   │   ├── subject.routes.ts
│   │   └── index.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── solution.service.ts
│   │   ├── expert.service.ts
│   │   ├── review.service.ts
│   │   ├── email.service.ts
│   │   └── storage.service.ts
│   │
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── validator.ts
│   │   ├── helpers.ts
│   │   └── errors.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── tests/
│   ├── unit/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── solution.test.ts
│   │   └── review.test.ts
│   │
│   └── e2e/
│       ├── setup.ts
│       └── api.test.ts
│
├── .env.example
├── .eslintrc
├── jest.config.js
├── nodemon.json
├── package.json
└── tsconfig.json
```

## Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   └── styles.ts
│   │   │   ├── Input/
│   │   │   └── Modal/
│   │   │
│   │   ├── layout/
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   └── Sidebar/
│   │   │
│   │   ├── solution/
│   │   │   ├── Editor/
│   │   │   ├── Viewer/
│   │   │   └── Review/
│   │   │
│   │   └── expert/
│   │       ├── Dashboard/
│   │       └── Profile/
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   │
│   │   ├── solutions/
│   │   │   ├── index.tsx
│   │   │   ├── [id].tsx
│   │   │   └── create.tsx
│   │   │
│   │   └── expert/
│   │       ├── dashboard.tsx
│   │       └── reviews.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useSolution.ts
│   │   └── useReview.ts
│   │
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── solutions.ts
│   │
│   ├── store/
│   │   ├── slices/
│   │   │   ├── auth.slice.ts
│   │   │   └── solution.slice.ts
│   │   └── index.ts
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   └── theme.ts
│   │
│   ├── utils/
│   │   ├── validators.ts
│   │   └── helpers.ts
│   │
│   └── types/
│       └── index.ts
│
├── public/
│   ├── images/
│   └── icons/
│
├── tests/
│   ├── setup.ts
│   └── utils.ts
│
├── .env.example
├── next.config.js
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

## Shared Directory Structure

```
shared/
├── types/
│   ├── auth.types.ts
│   ├── solution.types.ts
│   └── review.types.ts
│
├── constants/
│   ├── routes.ts
│   ├── api.ts
│   └── common.ts
│
└── utils/
    ├── validation.ts
    └── formatting.ts
```

## Documentation Directory Structure

```
docs/
├── api/
│   ├── auth.md
│   ├── solutions.md
│   └── reviews.md
│
├── setup/
│   ├── development.md
│   └── production.md
│
├── deployment/
│   ├── aws.md
│   └── docker.md
│
└── database/
    ├── schema.md
    └── migrations.md
```

## Key Files Description

### Root Directory
- `docker-compose.yml`: Docker composition for development and production
- `package.json`: Project metadata and scripts
- `.gitignore`: Git ignore patterns

### Backend
- `app.ts`: Express application setup
- `server.ts`: Server initialization
- `tsconfig.json`: TypeScript configuration
- `.env.example`: Environment variable template

### Frontend
- `next.config.js`: Next.js configuration
- `tailwind.config.js`: Tailwind CSS configuration
- `.env.example`: Environment variable template

## Directory Purposes

### Backend
- `config/`: Configuration files for different services
- `controllers/`: Request handlers
- `middleware/`: Custom middleware functions
- `models/`: Database models and schemas
- `routes/`: API route definitions
- `services/`: Business logic implementation
- `utils/`: Helper functions and utilities

### Frontend
- `components/`: Reusable React components
- `pages/`: Next.js pages and routes
- `hooks/`: Custom React hooks
- `services/`: API integration services
- `store/`: State management
- `styles/`: Global styles and theme
- `utils/`: Helper functions and utilities

### Shared
- `types/`: Shared TypeScript interfaces
- `constants/`: Shared constant values
- `utils/`: Shared utility functions

## Notes

1. Keep components small and focused
2. Follow naming conventions consistently
3. Group related functionality together
4. Maintain separation of concerns
5. Keep configuration separate from code
6. Document complex logic and configurations

## Best Practices

1. File Naming:
   - Use kebab-case for files
   - Use PascalCase for components
   - Use camelCase for utilities

2. Directory Structure:
   - Group by feature when possible
   - Keep nesting to a minimum
   - Place tests near their implementation

3. Code Organization:
   - Follow SOLID principles
   - Implement proper error handling
   - Add appropriate logging
   - Include type definitions
