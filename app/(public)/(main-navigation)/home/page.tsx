import React from "react";
import { ResourceList } from "@/components/subjects/resource-list";
import { getResources } from "@/actions/resources";
import { ResourceStatus } from "@prisma/client";

const HomePage = async () => {
  const grade = 12;
  const { resources } = (await getResources({
    status: ResourceStatus.LIVE,
    grade: grade ? Number(grade) : undefined,
    limit: 15,
  })) || { resources: [], total: 0, pages: 0 };

  if (!resources) {
    return <div>Failed to load resources</div>
  }
  
  return (
    <section>
      <ResourceList resources={resources} />
    </section>
  );
};

export default HomePage;
