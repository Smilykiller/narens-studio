"use client";

import Link from "next/link";
import { LayoutDashboard, Image as ImageIcon, Store, Users, Camera, Settings, LogOut, Calendar, CheckSquare, Layers, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Services", href: "/admin/services", icon: Sparkles },
  { name: "Clients", href: "/admin/clients", icon: Users },
  { name: "Bookings", href: "/admin/bookings", icon: Calendar },
  { name: "Resources", href: "/admin/resources", icon: Camera },
  { name: "Live Rooms", href: "/admin/rooms", icon: Camera },
  { name: "Client Selections", href: "/admin/selections", icon: CheckSquare },
  { name: "Portfolio", href: "/admin/portfolio", icon: ImageIcon },
  { name: "Packages", href: "/admin/packages", icon: Layers },
  { name: "Shop & Orders", href: "/admin/shop", icon: Store },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-sand-bg text-sand-text flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-sand-border bg-sand-surface flex flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-sand-border">
          <h2 className="text-xl font-serif tracking-widest text-sand-text uppercase">Naren's Studio</h2>
          <p className="text-xs text-sand-muted mt-1">Admin Control Panel</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive ? "bg-black/10 text-sand-text" : "text-sand-muted hover:bg-black/5 hover:text-sand-text"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sand-border space-y-2">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-sand-muted hover:bg-black/5 hover:text-sand-text rounded-xl w-full transition-colors text-sm font-medium">
            <LayoutDashboard className="w-5 h-5" />
            Back to Home
          </Link>
          <button 
            onClick={async () => {
              const { logout } = await import("@/app/actions/auth");
              await logout();
              window.location.href = "/login";
            }}
            className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl w-full transition-colors text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-sand-border bg-sand-surface/60 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
          <h1 className="text-lg font-medium text-sand-text">
            {navItems.find(item => item.href === pathname)?.name || "Admin"}
          </h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center font-bold text-sm">
              N
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
