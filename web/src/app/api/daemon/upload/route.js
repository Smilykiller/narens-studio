import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadImageBuffer } from "@/lib/cloudinary";

export async function POST(req) {
  try {
    const secret = req.headers.get("x-daemon-secret");
    if (secret !== process.env.DAEMON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const roomId = formData.get("roomId");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    // Upload to Cloudinary instead of local disk for Vercel compatibility
    const url = await uploadImageBuffer(buffer, "live_shoots");

    // If roomId is provided, attach to room
    if (roomId) {
      const room = await prisma.room.findUnique({ where: { id: roomId } });
      if (room) {
        // Create Photo
        const photo = await prisma.photo.create({
          data: {
            title: file.name,
            url: url,
            is_public: false, // Live shoot photos are private
          },
        });
        // Link Photo to Room
        await prisma.roomPhoto.create({
          data: {
            room_id: room.id,
            photo_id: photo.id,
          },
        });
      }
    }

    return NextResponse.json({ success: true, url });
  } catch (err) {
    console.error("Daemon upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
