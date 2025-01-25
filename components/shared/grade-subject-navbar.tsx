"use client";
import React, { useState } from "react";
import { Selection } from "@heroui/react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import { ChevronDown } from "lucide-react";
import { GRADES, SUBJECTS } from "@/lib/constants";

export default function GradeDropdown() {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(
    new Set(["Gr12"])
  );

  const selectedValue = React.useMemo(
    () => Array.from(selectedKeys).join(", "),
    [selectedKeys]
  );

  const [selectedSubject, setSelectedSubject] = useState<string>("Mathematics");

  const activeSubject = SUBJECTS.find((subject) => subject === selectedSubject);

  function handleSubjectChange(subject: string) {
    setSelectedSubject(subject);
  }

  return (
    <section className="flex items-center gap-2 py-4 w-full">
      <Dropdown>
        <DropdownTrigger>
          <Button
            className="capitalize"
            variant="solid"
            color="primary"
            radius="full"
            endContent={<ChevronDown />}
          >
            {selectedValue}
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          disallowEmptySelection
          aria-label="Grade selection"
          selectedKeys={selectedKeys}
          selectionMode="single"
          variant="flat"
          onSelectionChange={setSelectedKeys}
          items={GRADES}
        >
          {(item) => <DropdownItem key={item.key}>{item.label}</DropdownItem>}
        </DropdownMenu>
      </Dropdown>

      <div className="flex gap-2 w-fit overflow-x-auto scrollbar-hide whitespace-nowrap scroll-smooth">
        {SUBJECTS.map((subject: string) => (
          <Button
            className="shrink-0 min-w-[100px]"
            key={subject}
            color={activeSubject == subject ? "primary" : "default"}
            radius="full"
            onPress={() => handleSubjectChange(subject)}
          >
            {subject}
          </Button>
        ))}
      </div>
    </section>
  );
}
