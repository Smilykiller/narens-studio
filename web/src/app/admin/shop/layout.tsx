import Link from "next/link";
import { Store, ShoppingBag, MessageSquare } from "lucide-react";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-sand-border pb-4">
        <Link href="/admin/shop" className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg hover:bg-black/5 transition-colors">
          <Store className="w-4 h-4" /> Frames
        </Link>
        <Link href="/admin/shop/orders" className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg hover:bg-black/5 transition-colors">
          <ShoppingBag className="w-4 h-4" /> Orders
        </Link>
        <Link href="/admin/shop/enquiries" className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg hover:bg-black/5 transition-colors">
          <MessageSquare className="w-4 h-4" /> Enquiries
        </Link>
      </div>
      {children}
    </div>
  );
}
