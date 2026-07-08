"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSelectionRooms() {
  try {
    const rooms = await prisma.room.findMany({
      where: { type: "selection" },
      include: {
        client: true,
        room_photos: true,
        selections: true,
      },
      orderBy: { created_at: "desc" },
    });

    // Map to nice format
    const formatted = rooms.map((room) => {
      const totalPhotos = room.room_photos.length;
      const selectedCount = room.selections.filter(
        (s) => s.status === "liked",
      ).length;
      let status = "pending";
      if (selectedCount > 0) status = "in-progress";
      // We assume completed if the room is finalized
      if (room.is_finalized) status = "completed";

      return {
        id: room.id,
        clientName:
          room.client?.full_name || room.client?.email || "Unknown Client",
        email: room.client?.email,
        eventName: room.name,
        status,
        totalPhotos,
        selectedCount,
        updatedAt: room.created_at.toLocaleDateString(),
      };
    });

    return { success: true, rooms: formatted };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function getSelectionDetails(roomId) {
  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        client: true,
        room_photos: {
          include: { photo: true },
        },
        selections: {
          include: { photo: true },
        },
      },
    });
    if (!room) return { success: false, error: "Room not found" };
    return { success: true, room };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function createSelectionRoom(name) {
  try {
    const room = await prisma.room.create({
      data: {
        name,
        type: "selection",
        status: "active",
      },
    });
    revalidatePath("/admin/selections");
    return { success: true, room };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
