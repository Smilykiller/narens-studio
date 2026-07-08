import { getBookings } from "@/app/actions/bookings";
import { prisma } from "@/lib/prisma";
import BookingCalendar from "./BookingCalendar";
import { Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const { bookings } = await getBookings();
  const resources = await prisma.resource.findMany({ where: { is_active: true }});
  const clients = await prisma.user.findMany({ where: { role: "client" }, orderBy: { created_at: "desc" }});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif mb-2 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-green-500" />
          Booking Calendar
        </h1>
        <p className="text-sand-muted">Manage studio schedule, geofencing checks, and resource assignments.</p>
      </div>

      <BookingCalendar bookings={bookings || []} resources={resources} clients={clients} />
    </div>
  );
}
