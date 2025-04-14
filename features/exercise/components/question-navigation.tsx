'use client';

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from 'next/navigation';
import { getQuestionsForContentNav, getNextContentId, getPreviousContentId, getFirstQuestionId, getLastQuestionId } from '@/actions/questions';

interface QuestionNavigationProps {
  contentId: string;
  currentQuestionId: string;
}

// Updated interface to match the server response type
interface Question {
  id: string;
  questionNumber: string;
  exerciseNumber: number | null;
}

interface AdjacentContent {
  contentId: string | null;
  firstQuestionId: string | null;
  lastQuestionId: string | null;
}

const QuestionNavigation = ({ contentId, currentQuestionId }: QuestionNavigationProps) => {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [nextContent, setNextContent] = useState<AdjacentContent>({ contentId: null, firstQuestionId: null, lastQuestionId: null });
  const [prevContent, setPrevContent] = useState<AdjacentContent>({ contentId: null, firstQuestionId: null, lastQuestionId: null });
  const [loadingAdjacentContent, setLoadingAdjacentContent] = useState(false);

  // Fetch questions for current content
  useEffect(() => {
    console.log("QuestionNavigation mounted with:", { contentId, currentQuestionId });
    
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        console.log("Fetching questions for contentId:", contentId);
        
        // Use the server action to fetch questions
        const data = await getQuestionsForContentNav(contentId);
        console.log("Questions data received:", data);
        
        // Type assertion to ensure data is treated as Question[]
        const typedData = data as Question[];
        setQuestions(typedData || []);
        
        // Find the index of current question
        const index = typedData?.findIndex(q => q.id === currentQuestionId) ?? -1;
        console.log("Current question index:", index, "for id:", currentQuestionId);
        setCurrentIndex(index !== -1 ? index : 0);
        
        // If there's only one question or this is the first/last question,
        // we should check for adjacent content sections
        if (typedData.length <= 1 || index === 0 || index === typedData.length - 1) {
          setLoadingAdjacentContent(true);
          
          try {
            // Fetch the next and previous content IDs
            const [nextId, prevId] = await Promise.all([
              getNextContentId(contentId).catch(() => null),
              getPreviousContentId(contentId).catch(() => null)
            ]);
            
            // If we have adjacent content IDs, get their first/last question IDs
            const [nextFirstQuestion, prevLastQuestion] = await Promise.all([
              nextId ? getFirstQuestionId(nextId).catch(() => null) : Promise.resolve(null),
              prevId ? getLastQuestionId(prevId).catch(() => null) : Promise.resolve(null)
            ]);
            
            setNextContent({
              contentId: nextId,
              firstQuestionId: nextFirstQuestion,
              lastQuestionId: null
            });
            
            setPrevContent({
              contentId: prevId,
              firstQuestionId: null,
              lastQuestionId: prevLastQuestion
            });
            
            console.log("Adjacent content data:", { 
              next: { contentId: nextId, firstQuestionId: nextFirstQuestion },
              prev: { contentId: prevId, lastQuestionId: prevLastQuestion }
            });
          } catch (error) {
            console.error("Error fetching adjacent content:", error);
          } finally {
            setLoadingAdjacentContent(false);
          }
        }
      } catch (err) {
        console.error('Error fetching questions:', err);
      } finally {
        setLoading(false);
      }
    };

    if (contentId && currentQuestionId) {
      fetchQuestions();
    }
  }, [contentId, currentQuestionId]);

  // Navigate to previous question in the same content
  const navigateToPrevious = () => {
    if (currentIndex > 0) {
      // We have a previous question in this content
      const previousQuestion = questions[currentIndex - 1];
      console.log("Navigating to previous question:", previousQuestion.id);
      router.push(`/exercises/${contentId}/${previousQuestion.id}`);
    } else if (prevContent.contentId && prevContent.lastQuestionId) {
      // We need to go to the last question of the previous content
      console.log("Navigating to last question of previous content:", prevContent.lastQuestionId);
      router.push(`/exercises/${prevContent.contentId}/${prevContent.lastQuestionId}`);
    } else if (prevContent.contentId) {
      // If we don't have the last question ID, just go to the content
      console.log("Navigating to previous content:", prevContent.contentId);
      router.push(`/resources/${prevContent.contentId}`);
    }
  };

  // Navigate to next question in the same content
  const navigateToNext = () => {
    if (currentIndex < questions.length - 1) {
      // We have a next question in this content
      const nextQuestion = questions[currentIndex + 1];
      console.log("Navigating to next question:", nextQuestion.id);
      router.push(`/exercises/${contentId}/${nextQuestion.id}`);
    } else if (nextContent.contentId && nextContent.firstQuestionId) {
      // We need to go to the first question of the next content
      console.log("Navigating to first question of next content:", nextContent.firstQuestionId);
      router.push(`/exercises/${nextContent.contentId}/${nextContent.firstQuestionId}`);
    } else if (nextContent.contentId) {
      // If we don't have the first question ID, just go to the content
      console.log("Navigating to next content:", nextContent.contentId);
      router.push(`/resources/${nextContent.contentId}`);
    }
  };

  // Don't show navigation when loading
  if (loading || loadingAdjacentContent) {
    return (
      <div className="text-center py-2 text-gray-500 text-sm">
        Loading navigation...
      </div>
    );
  }

  // Don't render if there's no navigation possible
  // (single question and no adjacent content)
  const canGoBack = currentIndex > 0 || (prevContent.contentId !== null && prevContent.lastQuestionId !== null);
  const canGoForward = currentIndex < questions.length - 1 || (nextContent.contentId !== null && nextContent.firstQuestionId !== null);
  
  if (!canGoBack && !canGoForward) {
    return null;
  }

  return (
    <div className="flex items-center justify-between py-4">
      <Button
        variant="outline"
        onClick={navigateToPrevious}
        disabled={!canGoBack}
        className="flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Previous
      </Button>
      
      <div className="text-sm text-muted-foreground">
        {questions.length > 0 ? `Question ${currentIndex + 1} of ${questions.length}` : ""}
      </div>
      
      <Button
        variant="outline"
        onClick={navigateToNext}
        disabled={!canGoForward}
        className="flex items-center gap-2"
      >
        Next
        <ArrowRight size={16} />
      </Button>
    </div>
  );
};

export default QuestionNavigation;