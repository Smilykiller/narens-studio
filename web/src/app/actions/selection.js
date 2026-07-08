"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

import { sendEmail } from "@/lib/email";

export async function getSelectionRoom(roomId) {
  try {
    const cookieStore = await cookies();
    const clientId = cookieStore.get("mock_user_id")?.value;
    const role = cookieStore.get("mock_role")?.value;
    if (!clientId) {
      return { success: false, error: "Authentication required" };
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });
    if (!room) {
      return { success: false, error: "Room not found" };
    }

    if (room.client_id !== clientId && role !== "admin") {
      return { success: false, error: "Unauthorized access to this room" };
    }

    const roomPhotos = await prisma.roomPhoto.findMany({
      where: { room_id: roomId },
      include: { photo: true },
      orderBy: { uploaded_at: "asc" },
    });

    let selectionsMap = {};
    const userSelections = await prisma.selection.findMany({
      where: { room_id: roomId, client_id: room.client_id || clientId },
    });
    userSelections.forEach((s) => {
      selectionsMap[s.photo_id] = { status: s.status, notes: s.notes };
    });

    return {
      success: true,
      room,
      photos: roomPhotos.map((rp) => ({
        ...rp.photo,
        selection_status: selectionsMap[rp.photo_id]?.status || "pending",
        selection_notes: selectionsMap[rp.photo_id]?.notes || "",
      })),
    };
  } catch (err) {
    console.error("Error fetching selection room:", err);
    return { success: false, error: "An error occurred fetching the room" };
  }
}

export async function updatePhotoSelection(roomId, photoId, status, notes) {
  try {
    const cookieStore = await cookies();
    const clientId = cookieStore.get("mock_user_id")?.value;
    if (!clientId) {
      return {
        success: false,
        error: "Authentication required to save selections.",
      };
    }

    await prisma.selection.upsert({
      where: {
        room_id_client_id_photo_id: {
          room_id: roomId,
          client_id: clientId,
          photo_id: photoId,
        },
      },
      update: { status, notes },
      create: {
        room_id: roomId,
        client_id: clientId,
        photo_id: photoId,
        status,
        notes,
      },
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message || "An error occurred" };
  }
}

export async function finalizeSelection(roomId) {
  try {
    const cookieStore = await cookies();
    const clientId = cookieStore.get("mock_user_id")?.value;
    if (!clientId) {
      return { success: false, error: "Authentication required to finalize." };
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { client: true },
    });

    if (
      !room ||
      (room.client_id !== clientId &&
        cookieStore.get("mock_role")?.value !== "admin")
    ) {
      return { success: false, error: "Unauthorized" };
    }

    // Update room status to finalized instead of archived
    await prisma.room.update({
      where: { id: roomId },
      data: { is_finalized: true },
    });

    // Notify Admin
    const adminEmail = process.env.ADMIN_EMAIL || "admin@narensstudio.com";
    await sendEmail({
      to: adminEmail,
      subject: `Client Selections Finalized - ${room.name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #FF6B00;">Selections Finalized!</h2>
          <p>The client <strong>${room.client?.full_name || "Unknown"}</strong> has finalized their photo selections for the room: <strong>${room.name}</strong>.</p>
          <p>Please log in to the admin dashboard to review their choices and begin post-processing.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/selection/${room.id}" style="display:inline-block; padding:12px 24px; background:#FF6B00; color:#fff; text-decoration:none; border-radius:4px; margin:16px 0;">View Selections</a>
          <p>Best,<br/>Naren's Studio System</p>
        </div>
      `,
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message || "An error occurred" };
  }
}
