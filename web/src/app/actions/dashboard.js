"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  try {
    // Top Stats
    const activeRooms = await prisma.room.count({
      where: { status: "active", type: "live" },
    });

    const pendingSelections = await prisma.selection.count({
      where: { status: "waitlist" },
    });

    const totalClients = await prisma.user.count({
      where: { role: "client" },
    });

    const orders = await prisma.order.findMany({
      where: { status: { not: "cancelled" } },
      select: { total_amount: true },
    });
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.total_amount,
      0,
    );

    // Upcoming Bookings
    const upcomingBookings = await prisma.booking.findMany({
      where: { event_start: { gte: new Date() }, status: "confirmed" },
      orderBy: { event_start: "asc" },
      take: 5,
      include: { client: { select: { full_name: true, email: true } } },
    });

    // Recent Enquiries
    const recentEnquiries = await prisma.enquiry.findMany({
      orderBy: { created_at: "desc" },
      take: 5,
      include: {
        client: { select: { full_name: true } },
        product: { select: { name: true } },
      },
    });

    // Recent Activity Log
    const recentOrders = await prisma.order.findMany({
      orderBy: { created_at: "desc" },
      take: 3,
      include: { client: true },
    });

    const activity = recentOrders.map((order) => ({
      action: `New frame order from ${order.client?.full_name || "Client"}`,
      time: order.created_at.toLocaleString(),
    }));

    return {
      success: true,
      stats: {
        activeRooms,
        pendingSelections,
        totalClients,
        totalRevenue,
      },
      upcomingBookings,
      recentEnquiries,
      activity,
    };
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return { success: false, error: error.message };
  }
}
