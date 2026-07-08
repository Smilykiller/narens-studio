import { getPosts } from "@/app/actions/blog";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <main className="min-h-screen bg-sand-bg text-sand-text font-sans pt-24 pb-12 px-6">
      <Navbar />
      
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 text-center">
          <h2 className="text-sm font-bold tracking-widest text-sand-muted uppercase mb-4">Editorial</h2>
          <h1 className="text-4xl md:text-6xl font-serif mb-4">The Studio Journal</h1>
          <p className="text-sand-muted text-lg max-w-2xl mx-auto">Behind the scenes, artistic insights, and stories from our most memorable shoots.</p>
        </header>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post: any) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group relative block bg-[#0a0a0a] rounded-2xl overflow-hidden border border-sand-border hover:border-white/30 transition-all flex flex-col h-full">
                <div className="aspect-[4/3] overflow-hidden bg-white/60 relative">
                  {post.cover_image ? (
                    <img src={post.cover_image} alt={post.title} className="img-theme w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-700 font-serif text-xl italic">
                      Naren's Studio
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-80" />
                </div>
                
                <div className="p-6 md:p-8 flex-1 flex flex-col">
                  <time className="text-xs tracking-widest text-sand-muted uppercase font-bold mb-3 block">
                    {new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </time>
                  <h3 className="text-2xl font-serif mb-4 group-hover:text-gray-700 transition-colors line-clamp-2">{post.title}</h3>
                  <p className="text-sand-muted font-light line-clamp-3 mb-6 flex-1 text-sm md:text-base">
                    {post.content.replace(/[#*`_]/g, '')}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase mt-auto">
                    <span className="border-b border-white pb-1 group-hover:border-gray-400 transition-colors">Read Story</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 text-sand-muted border border-dashed border-sand-border rounded-2xl">
            No editorial pieces have been published yet.
          </div>
        )}
      </div>
    </main>
  );
}
