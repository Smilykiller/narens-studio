import { getClients } from "@/app/actions/clients";
import ClientTable from "./ClientTable";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif mb-2 flex items-center gap-3">
          <Users className="w-8 h-8 text-yellow-500" />
          Client Management
        </h1>
        <p className="text-sand-muted">View and invite clients to the studio platform.</p>
      </div>

      <ClientTable clients={clients} />
    </div>
  );
}
