// app/subjects/[subjectName]/page.tsx
import { getResources } from "@/actions/resources";
import { ResourceType, CurriculumType, Resource } from "@prisma/client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

interface PageProps {
  params: Promise<{
    subjectName: string;
  }>;
  searchParams: Promise<{
    page?: string;
    grade?: string;
    curriculum?: string;
    type?: string;
  }>;
}

const ResourceDetailsList = ({ resources }: { resources: Resource[] }) => {
  return (
    <ul className="space-y-4">
      {resources.map((resource) => (
        <li
          key={resource.id}
          className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between"
        >
          <div className="mb-2 sm:mb-0 flex items-center">
            <div className="w-20 h-24 mr-4 rounded-md overflow-hidden">
              <Image
                src="/placeholder-book.png"
                alt={resource.title}
                width={80}
                height={96}
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{resource.title}</h3>
              <p className="text-gray-500 text-sm">
                Grade: {resource.grade}, Curriculum: {resource.curriculum}
              </p>
            </div>
          </div>
          <Link
            href={`/resources/${resource.id}`}
            className="text-blue-500 hover:underline"
          >
            View Details
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default async function SubjectPage({
  params,
  searchParams,
}: Readonly<PageProps>) {
  // Await the params and searchParams directly as suggested in StackOverflow
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  // Now extract values safely
  const subjectName = decodeURIComponent(resolvedParams.subjectName);
  
  const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page, 10) : 1;
  const grade = resolvedSearchParams.grade ? parseInt(resolvedSearchParams.grade, 10) : undefined;
  const curriculum = resolvedSearchParams.curriculum as CurriculumType | undefined;
  const type = resolvedSearchParams.type as ResourceType | undefined;

  // Fetch resources
  const result = await getResources({
    status: "LIVE",
    subject: subjectName,
    grade: grade,
    curriculum: curriculum,
    type: type,
    page: page,
    limit: 15,
  });

  const resources = result?.resources || [];
  const pages = result?.pages || 0;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar with Back Button */}
      <div className="bg-white shadow-md py-4 px-6">
        <Link href="/home" className="flex items-center space-x-2">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
          <span className="text-gray-700 font-medium">Back to Home</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4">
        <h2 className="text-2xl font-semibold mb-4">
          All {type ? type.toLowerCase() : "Resources"} for {subjectName}
        </h2>

        {/* Resource List with Details */}
        {resources.length > 0 ? (
          <ResourceDetailsList resources={resources} />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">No resources found for this subject.</p>
          </div>
        )}

        {/* Pagination (if needed) */}

        {pages > 1 && (
          <div className="mt-4">
            {/* You might need to adjust the Pagination component to fit this context */}
            {/* For example, remove the baseUrl since we're already on the subject page */}
            {/* <Pagination
              currentPage={page}
              totalPages={pages}
              baseUrl={`/subjects/${params.subjectName}`}
              searchParams={searchParams}
            /> */}
          </div>
        )}
      </div>
    </div>
  );
}