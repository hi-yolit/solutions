'use client';

import React from "react";
import { ArrowLeft } from "lucide-react";
import { ActionIcon, Group, Text } from "@mantine/core";
import { useRouter } from "next/navigation";

interface TopBarProps {
  questionNumber?: string;
}

const TopBar = ({ questionNumber }: TopBarProps) => {
  const router = useRouter();
  
  const handleGoBack = () => {
    // Use browser history to go back to the previous page
    router.back();
  };

  return (
    <section className="sticky top-0 bg-white z-10 border-b py-3 px-2">
      <Group gap="xs">
        <ActionIcon 
          variant="transparent" 
          color="black" 
          aria-label="Go back"
          onClick={handleGoBack}
        >
          <ArrowLeft />
        </ActionIcon>
        
        {questionNumber && (
          <Text fw={500}>
            Question {questionNumber}
          </Text>
        )}
      </Group>
    </section>
  );
};

export default TopBar;