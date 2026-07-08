"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getClientDashboardData() {
  const cookieStore = await cookies();
  const clientId = cookieStore.get("mock_user_id")?.value;
  if (!clientId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: clientId },
    include: {
      bookings: { orderBy: { event_start: "asc" } },
      invoices: { orderBy: { due_date: "asc" } },
      contracts: { orderBy: { created_at: "desc" } },
      rooms: { orderBy: { created_at: "desc" } },
      orders: { orderBy: { created_at: "desc" } },
    },
  });

  if (!user) {
    redirect("/login");
  }

  return { success: true, data: user };
}
