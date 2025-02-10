import { ResourceStatus } from "@prisma/client";
import { getResources } from "@/actions/resources";


interface UseResourcesProps {
  status?: ResourceStatus;
  grade?: number;
  limit?: number;
}

export const useResources = async ({
  status,
  grade,
  limit,
}: UseResourcesProps = {}) => {
  const {
    resources = [],
    total = 0,
    pages = 0,
  } = (await getResources({
    status,
    grade: grade ? Number(grade) : undefined,
    limit,
  })) || {};

  return { resources, total, pages };
};
