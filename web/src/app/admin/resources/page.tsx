import { getResources } from "@/app/actions/resources";
import ResourceGrid from "./ResourceGrid";
import { Camera } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const { resources } = await getResources();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif mb-2 flex items-center gap-3">
          <Camera className="w-8 h-8 text-blue-500" />
          Studio Resources
        </h1>
        <p className="text-sand-muted">Manage photographers, drones, and equipment for booking assignments.</p>
      </div>

      <ResourceGrid resources={resources || []} />
    </div>
  );
}
