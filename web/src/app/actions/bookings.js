"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Calculate distance between two coordinates in kilometers using Haversine formula
function getDistanceInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Check if a resource can be assigned based on existing assignments and distance
export async function checkFeasibility(
  resourceId,
  eventStart,
  eventEnd,
  targetLat,
  targetLng,
) {
  // Get all assignments for this resource on the same day
  const startOfDay = new Date(eventStart);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(eventStart);
  endOfDay.setHours(23, 59, 59, 999);

  const assignments = await prisma.resourceAssignment.findMany({
    where: {
      resource_id: resourceId,
      buffer_end: { gte: startOfDay },
      buffer_start: { lte: endOfDay },
    },
    include: { booking: true },
  });

  const MIN_SPEED_KMH = 30; // Assume 30 km/h average city driving speed
  const BASE_BUFFER_MINS = 30; // 30 mins base buffer for setup/packup

  for (const assignment of assignments) {
    const existingStart = assignment.buffer_start;
    const existingEnd = assignment.buffer_end;
    const existingLat = assignment.booking.venue_lat;
    const existingLng = assignment.booking.venue_lng;

    // Check strict time overlap first
    if (eventStart < existingEnd && eventEnd > existingStart) {
      return {
        feasible: false,
        reason: `Time overlap with booking: ${assignment.booking.title}`,
      };
    }

    // Check geofence distance if events are consecutive
    const distKm = getDistanceInKm(
      targetLat,
      targetLng,
      existingLat,
      existingLng,
    );
    const travelTimeMins = (distKm / MIN_SPEED_KMH) * 60;
    const requiredBufferMins = BASE_BUFFER_MINS + travelTimeMins;

    // Is the new event AFTER the existing one?
    if (eventStart >= existingEnd) {
      const gapMins =
        (eventStart.getTime() - existingEnd.getTime()) / (1000 * 60);
      if (gapMins < requiredBufferMins) {
        return {
          feasible: false,
          reason: `Insufficient travel time. Requires ${Math.ceil(requiredBufferMins)} mins buffer from ${assignment.booking.title} (${distKm.toFixed(1)} km away).`,
        };
      }
    }

    // Is the new event BEFORE the existing one?
    if (eventEnd <= existingStart) {
      const gapMins =
        (existingStart.getTime() - eventEnd.getTime()) / (1000 * 60);
      if (gapMins < requiredBufferMins) {
        return {
          feasible: false,
          reason: `Insufficient travel time to next event. Requires ${Math.ceil(requiredBufferMins)} mins buffer before ${assignment.booking.title} (${distKm.toFixed(1)} km away).`,
        };
      }
    }
  }

  return { feasible: true, reason: "Resource is available." };
}

export async function createBooking(data) {
  try {
    if (!data.forceOverride && data.resource_ids) {
      // Check feasibility for each resource
      for (const resourceId of data.resource_ids) {
        const check = await checkFeasibility(
          resourceId,
          data.event_start,
          data.event_end,
          data.venue_lat,
          data.venue_lng,
        );
        if (!check.feasible) {
          const resource = await prisma.resource.findUnique({
            where: { id: resourceId },
          });
          return {
            success: false,
            error: `${resource?.name}: ${check.reason}`,
          };
        }
      }
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        client_id: data.client_id,
        title: data.title,
        event_start: data.event_start,
        event_end: data.event_end,
        venue_lat: data.venue_lat,
        venue_lng: data.venue_lng,
        venue_address: data.venue_address,
        notes: data.notes,
      },
    });

    // Create resource assignments if specified
    if (data.resource_ids && data.resource_ids.length > 0) {
      // Simple 30 min buffer calculation for assignment row
      const bufferStart = new Date(data.event_start.getTime() - 30 * 60000);
      const bufferEnd = new Date(data.event_end.getTime() + 30 * 60000);

      const assignments = data.resource_ids.map((rid) => ({
        booking_id: booking.id,
        resource_id: rid,
        buffer_start: bufferStart,
        buffer_end: bufferEnd,
      }));

      await prisma.resourceAssignment.createMany({
        data: assignments,
      });
    }

    revalidatePath("/admin/bookings");
    return { success: true, booking };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function getBookings() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        client: { select: { email: true, full_name: true } },
        assignments: {
          include: { resource: true },
        },
      },
      orderBy: { event_start: "asc" },
    });
    return { success: true, bookings };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
