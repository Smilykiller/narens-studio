"use server";

import { prisma } from "@/lib/prisma";

export async function getLiveRoomPhotos(roomId) {
  try {
    const roomPhotos = await prisma.roomPhoto.findMany({
      where: { room_id: roomId },
      include: { photo: true },
      orderBy: { uploaded_at: "desc" },
    });
    return {
      success: true,
      photos: roomPhotos.map((rp) => rp.photo),
    };
  } catch (err) {
    console.error("Error fetching live photos:", err);
    return { success: false, error: err.message, photos: [] };
  }
}

export async function getRoomDetails(roomId) {
  try {
    return await prisma.room.findUnique({
      where: { id: roomId },
      select: { name: true, status: true, type: true },
    });
  } catch (err) {
    return null;
  }
}
