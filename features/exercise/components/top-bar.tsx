'use client';

import React from "react";
import { ArrowLeft, Coins } from "lucide-react";
import { ActionIcon, Group, Text, Badge } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context"; // Adjust the import path if needed

interface TopBarProps {
  questionNumber?: string;
}

const TopBar = ({ questionNumber }: TopBarProps) => {
  const router = useRouter();
  const { profile, isProfileLoading } = useAuth();
  
  const handleGoBack = () => {
    router.back();
  };

  // Credits display logic
  const renderCreditsInfo = () => {
    // If profile is loading or no profile, don't show
    if (isProfileLoading || !profile) {
      return null;
    }

    // If user is subscribed, don't show credits
    if (profile.subscriptionStatus === 'ACTIVE') {
      return null;
    }

    // Show compact credits badge
    return (
      <Badge 
        color="orange" 
        variant="light" 
        size="sm"
        className="px-2 py-1"
        leftSection={<Coins size={12} />}
      >
        {profile.solutionCredits}
      </Badge>
    );
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 sticky top-0 bg-white z-10 border-b py-3">
      <Group justify="space-between" align="center" wrap="nowrap">
        <Group gap="xs" wrap="nowrap">
          <ActionIcon 
            variant="transparent" 
            color="black" 
            aria-label="Go back"
            onClick={handleGoBack}
          >
            <ArrowLeft />
          </ActionIcon>
          
          {questionNumber && (
            <Text fw={500} lineClamp={1}>
              Question {questionNumber}
            </Text>
          )}
        </Group>
        
        {renderCreditsInfo()}
      </Group>
    </section>
  );
};

export default TopBar;