import { getPackages } from "@/app/actions/packages";
import PackageGrid from "./PackageGrid";
import { Layers } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PackagesPage() {
  const packages = await getPackages();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif mb-2 flex items-center gap-3">
          <Layers className="w-8 h-8 text-yellow-500" />
          Packages & Pricing
        </h1>
        <p className="text-sand-muted">Manage photography packages, tiers, and limits.</p>
      </div>

      <PackageGrid packages={packages} />
    </div>
  );
}
