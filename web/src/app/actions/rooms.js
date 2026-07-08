"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const STUDIO_ROOM_ID = "studio-live";

export async function getStudioLiveRoom() {
  try {
    let room = await prisma.room.findUnique({
      where: { id: STUDIO_ROOM_ID },
    });

    if (!room) {
      room = await prisma.room.create({
        data: {
          id: STUDIO_ROOM_ID,
          name: "Studio Live Room",
          type: "live",
          status: "archived", // Start archived until they click "Start"
        },
      });
    }
    return { success: true, room };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function toggleStudioSession(action) {
  try {
    const statusMap = {
      start: "active",
      pause: "paused",
      end: "archived",
    };

    const newStatus = statusMap[action];

    // Update room status
    const room = await prisma.room.update({
      where: { id: STUDIO_ROOM_ID },
      data: { status: newStatus },
    });

    // Only clear photos when starting a new live session; preserve them on end/pause so they remain available in the future
    if (action === "start") {
      await prisma.roomPhoto.deleteMany({
        where: { room_id: STUDIO_ROOM_ID },
      });
    }

    revalidatePath("/admin/rooms");
    revalidatePath(`/live/studio`);
    revalidatePath(`/live/${STUDIO_ROOM_ID}`);
    return { success: true, room };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateRoomStatus(roomId, status) {
  try {
    await prisma.room.update({
      where: { id: roomId },
      data: { status },
    });
    revalidatePath("/admin/rooms");
    revalidatePath(`/admin/selections/${roomId}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
