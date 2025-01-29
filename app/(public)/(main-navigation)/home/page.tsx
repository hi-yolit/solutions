import React from "react";
import { ResourceList } from "@/components/subjects/resource-list";
import { getResources } from "@/actions/resources";

const HomePage = async () => {
  const grade = 12;
  const { resources } = (await getResources({
    status: "LIVE", //TODO: Make it an enum
    grade: grade ? Number(grade) : undefined,
    limit: 15,
  })) || { resources: [], total: 0, pages: 0 };

  return (
    <section>
      <ResourceList resources={resources} />
    </section>
  );
};

export default HomePage;
