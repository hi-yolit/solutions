import { getResources } from "@/actions/resources"
import { ResourcesTable } from "@/components/admin/resources/resources-table"

export default async function ResourcesPage() {
  const { resources, error } = await getResources({})

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          Failed to load resources. Please try again later.
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <ResourcesTable initialResources={resources || []} />
    </div>
  )
}