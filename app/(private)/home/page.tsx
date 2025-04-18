export const dynamic = "force-dynamic";

import React from "react";
import { ResourceList } from "@/components/subjects/resource-list";
import { getResources } from "@/actions/resources";
import { ResourceStatus } from "@prisma/client";

const HomePage = async () => {

  const { resources } = (await getResources({
    status: ResourceStatus.LIVE,
    limit: 15,
  })) || { resources: [], total: 0, pages: 0 };

  if (!resources) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-red-600 bg-red-50 rounded-md">
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
