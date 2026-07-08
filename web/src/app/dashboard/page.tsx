import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('mock_user_id')?.value;
  
  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      rooms: { orderBy: { created_at: "desc" } },
      orders: { 
        include: { product: true, size: true },
        orderBy: { created_at: "desc" } 
      },
      enquiries: {
        include: { product: true },
        orderBy: { created_at: "desc" }
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-sand-bg text-sand-text pt-24 px-6 md:px-12 pb-24 font-sans selection:bg-yellow-500/30">
      <DashboardClient user={user} />
    </main>
  );
}
