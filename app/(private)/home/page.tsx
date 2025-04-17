import React from "react";
import { ResourceList } from "@/components/subjects/resource-list";
import { getResources } from "@/actions/resources";
import { ResourceStatus } from "@prisma/client";
import { GRADES } from "@/lib/constants";

const HomePage = async () => {
  const defaultGrade = GRADES[0].key;
  const grade = defaultGrade;

  const { resources } = (await getResources({
    status: ResourceStatus.LIVE,
    limit: 15,
  })) || { resources: [], total: 0, pages: 0 };

  // Add this in your HomePage component after fetching resources
  console.log("Resources loaded:", resources.map(r => ({
    id: r.id,
    title: r.title,
    type: r.type
  })));

  if (!resources) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-md">
        <h2 className="font-semibold">Unable to load resources</h2>
        <p>Please try refreshing the page or contact support if the issue persists.</p>
      </div>
    )
  }


  return (
    <section>
      <ResourceList resources={resources} />
    </section>
  );
};

export default HomePage;
