// app/subjects/[subjectName]/page.tsx
import { getResources } from "@/actions/resources";
import { ResourceType, CurriculumType , Resource} from "@prisma/client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image"; // Import Image component

interface PageProps {
  params: {
    subjectName: string;
  };
  searchParams: {
    page?: string;
    grade?: string;
    curriculum?: string;
    type?: string; // Add type to the props
  };
}

const ResourceDetailsList = ({ resources }: { resources: Resource[] }) => {
  return (
    <ul className="space-y-4">
      {resources.map((resource) => (
        <li
          key={resource.id}
          className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between"
        >
          {/* Mobile-first: Stacked layout, then horizontal on small screens */}
          <div className="mb-2 sm:mb-0 flex items-center">
            {/* Image Placeholder */}
            <div className="w-20 h-24 mr-4 rounded-md overflow-hidden">
              <Image
                src="/placeholder-book.png" // Replace with actual image URL or import
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
  const page = Number(searchParams.page) || 1;
  const grade = searchParams.grade;
  const curriculum = searchParams.curriculum;
  const type = searchParams.type as ResourceType | undefined; // Get the type from searchParams

  const { resources, pages } = (await getResources({
    status: "LIVE",
    subject: decodeURIComponent(params.subjectName),
    grade: grade ? Number(grade) : undefined,
    curriculum: curriculum as CurriculumType,
    type: type, // Pass the type to getResources
    page: page,
    limit: 15,
  })) || { resources: [], total: 0, pages: 0 };

  const subjectName = decodeURIComponent(params.subjectName);

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
        <ResourceDetailsList resources={resources} />

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
