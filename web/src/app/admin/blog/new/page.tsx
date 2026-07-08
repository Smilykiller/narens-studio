"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { createPost } from "@/app/actions/blog";

export default function NewBlogPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    cover_image: "",
    content: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Auto-generate slug if empty
    let finalSlug = formData.slug.trim();
    if (!finalSlug) {
      finalSlug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const res = await createPost({
      ...formData,
      slug: finalSlug
    });

    if (res.success) {
      router.push("/blog");
    } else {
      alert(res.error);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-black/10 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-serif text-sand-text">Create New Post</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass p-8 rounded-2xl border border-sand-border space-y-6">
        <div>
          <label className="block text-sm text-sand-muted uppercase tracking-wider mb-2">Title</label>
          <input 
            type="text" required
            value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
            className="w-full bg-white/60 border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:border-[#FF6B00]/50 outline-none transition-colors"
            placeholder="e.g. The Art of Cinematic Lighting"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-sand-muted uppercase tracking-wider mb-2">Slug (Optional)</label>
            <input 
              type="text" 
              value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})}
              className="w-full bg-white/60 border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:border-[#FF6B00]/50 outline-none transition-colors"
              placeholder="e.g. art-of-lighting"
            />
          </div>
          <div>
            <label className="block text-sm text-sand-muted uppercase tracking-wider mb-2">Cover Image URL (Optional)</label>
            <input 
              type="text" 
              value={formData.cover_image} onChange={e => setFormData({...formData, cover_image: e.target.value})}
              className="w-full bg-white/60 border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:border-[#FF6B00]/50 outline-none transition-colors"
              placeholder="https://images.unsplash.com/..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-sand-muted uppercase tracking-wider mb-2">Content (Markdown Supported)</label>
          <textarea 
            required rows={15}
            value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
            className="w-full bg-white/60 border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:border-[#FF6B00]/50 outline-none transition-colors resize-y font-mono text-sm"
            placeholder="# Your story starts here..."
          />
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-[#FF6B00] text-sand-text rounded-xl font-bold hover:bg-[#ff8533] transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Publish Post
          </button>
        </div>
      </form>
    </div>
  );
}
