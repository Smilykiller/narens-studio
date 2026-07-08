import { getPostBySlug } from "@/app/actions/blog";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

export const dynamic = "force-dynamic";

export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-sand-bg text-sand-text font-sans pt-24 pb-24">
      <Navbar />

      <article className="max-w-4xl mx-auto px-6">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sand-muted hover:text-sand-text transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" />
          Back to Journal
        </Link>

        <header className="mb-12 md:mb-16 text-center">
          <time className="text-sm font-bold tracking-widest text-sand-muted uppercase mb-6 block">
            {new Date(post.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </time>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif leading-tight mb-8">
            {post.title}
          </h1>
        </header>

        {post.cover_image && (
          <div className="w-full aspect-video md:aspect-[21/9] mb-16 rounded-2xl overflow-hidden border border-sand-border relative">
            <img src={post.cover_image} alt={post.title} className="img-theme w-full h-full object-cover grayscale" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent opacity-50" />
          </div>
        )}

        <div className="prose prose-invert prose-lg max-w-3xl mx-auto prose-headings:font-serif prose-headings:font-normal prose-p:font-light prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-sand-text prose-a:decoration-white/30 hover:prose-a:decoration-white prose-hr:border-sand-border">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
        
        <div className="max-w-3xl mx-auto mt-24 pt-12 border-t border-sand-border text-center">
          <p className="text-sand-muted font-serif italic text-xl mb-6">Want to tell your own story?</p>
          <Link href="/book" className="inline-flex px-8 py-4 bg-sand-surface text-sand-text text-sm font-bold uppercase tracking-widest rounded-full hover:bg-gray-200 transition-colors">
            Book a Session
          </Link>
        </div>
      </article>
    </main>
  );
}
