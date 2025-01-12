export type ImageAlignment = 'left' | 'center' | 'right';

export interface ImageData {
  url: string;
  caption?: string;
  alignment: ImageAlignment;
  width?: number;
}

export interface ContentBlock {
  type: 'text' | 'image';
  content: string;
  imageData?: ImageData;
}

export interface StepContent {
  blocks: ContentBlock[];
}

export interface Step {
  id: string;
  title: string;
  content: string;
  contentBlocks: ContentBlock[];
  explanation?: string;
  latex?: string;
  tip?: string;
}

export interface Solution {
  id: string;
  questionId: string;
  expertId: string;
  steps: Step[];
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}