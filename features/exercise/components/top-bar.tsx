import React from "react";
import { ArrowLeft } from "lucide-react";
import { ActionIcon, Text } from "@mantine/core";
import Link from "next/link";

const ExerciseTopBar = ({ exerciseNumber }: { exerciseNumber: number }) => {
  return (
    <section className="flex items-center gap-4 justify-start py-3">
      <Link href="/home" passHref>
        <ActionIcon variant="transparent" color="black" aria-label="Back">
          <ArrowLeft />
        </ActionIcon>
      </Link>
      {exerciseNumber && <Text>Exercise {exerciseNumber}</Text>}
    </section>
  );
};

export default ExerciseTopBar;
