"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPosts() {
  try {
    const posts = await prisma.post.findMany({
      where: { is_published: true },
      orderBy: { created_at: "desc" },
    });
    return posts;
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return [];
  }
}

export async function getPostBySlug(slug) {
  try {
    const post = await prisma.post.findUnique({
      where: { slug },
    });
    return post;
  } catch (error) {
    console.error("Failed to fetch post:", error);
    return null;
  }
}

export async function createPost(data) {
  try {
    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        cover_image: data.cover_image,
        is_published: true,
      },
    });
    revalidatePath("/blog");
    return { success: true, post };
  } catch (error) {
    console.error("Failed to create post:", error);
    return { success: false, error: "Failed to create post" };
  }
}
