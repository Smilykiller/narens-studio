"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Camera, Package, User, LogOut, ArrowLeft, Layers, Clock, ChevronRight } from "lucide-react";
import ProfileEditor from "./ProfileEditor";
import OrderCard from "./OrderCard";

type Tab = "overview" | "galleries" | "orders" | "profile";

export default function DashboardClient({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const recentGalleries = user.rooms.slice(0, 3);
  const recentOrders = user.orders.slice(0, 2);

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] w-full max-w-7xl mx-auto gap-8 pt-8">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0 space-y-6">
        <div className="bg-black/5 border border-sand-border rounded-3xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-sand-border">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-yellow-900/20 border border-yellow-500/30 rounded-full flex items-center justify-center text-yellow-500 font-serif text-xl">
              {user.full_name ? user.full_name[0].toUpperCase() : user.email[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h2 className="font-serif text-lg text-sand-text truncate capitalize">{user.full_name || "client"}</h2>
              <p className="text-xs text-sand-muted truncate lowercase">{user.email}</p>
            </div>
          </div>

          <nav className="space-y-2">
            <Link href="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sand-muted hover:text-sand-text hover:bg-black/5 transition-colors border border-transparent hover:border-sand-border">
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>

            {[
              { id: "overview", label: "Overview", icon: LayoutDashboard },
              { id: "galleries", label: "My Galleries", icon: Camera },
              { id: "orders", label: "Orders & Enquiries", icon: Package },
              { id: "profile", label: "Profile Settings", icon: User },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? "bg-sand-surface text-sand-text font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                      : "text-sand-muted hover:text-sand-text hover:bg-black/5"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}

            <div className="pt-2">
              <form action="/auth/signout" method="post" className="w-full">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20">
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </form>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 pb-24">
        
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-3xl md:text-5xl font-serif text-sand-text tracking-tight">Welcome back{user.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}.</h1>
              <p className="text-sand-muted mt-2">Here is a quick overview of your studio activities.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quick Galleries Stats */}
              <div className="bg-gradient-to-br from-white/5 to-white/0 border border-sand-border rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                  <Camera className="w-24 h-24 text-sand-text" />
                </div>
                <h3 className="text-sand-muted font-medium mb-1">Total Galleries</h3>
                <p className="text-4xl font-serif text-sand-text mb-6">{user.rooms.length}</p>
                <button onClick={() => setActiveTab("galleries")} className="text-sm font-bold tracking-widest uppercase text-sand-text flex items-center gap-2 hover:gap-3 transition-all">
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Orders Stats */}
              <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-900/5 border border-yellow-500/20 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Package className="w-24 h-24 text-yellow-500" />
                </div>
                <h3 className="text-yellow-500/80 font-medium mb-1">Active Orders</h3>
                <p className="text-4xl font-serif text-yellow-500 mb-6">{user.orders.filter((o: any) => o.status !== 'delivered').length}</p>
                <button onClick={() => setActiveTab("orders")} className="text-sm font-bold tracking-widest uppercase text-yellow-500 flex items-center gap-2 hover:gap-3 transition-all">
                  Track Orders <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {recentGalleries.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-serif text-sand-text mb-4">Recent Galleries</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recentGalleries.map((room: any) => (
                    <Link 
                      key={room.id} 
                      href={`/${room.type}/${room.id}`}
                      className="group flex items-center gap-4 bg-black/5 border border-sand-border p-4 rounded-2xl hover:bg-black/10 hover:border-sand-border transition-all"
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${room.type === 'live' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                        {room.type === 'live' ? <Camera className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sand-text truncate capitalize">{room.name}</h4>
                        <p className="text-xs text-sand-muted uppercase tracking-wider">{room.type === 'live' ? 'Live Event' : 'Selection Room'}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-sand-muted group-hover:text-sand-text transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* GALLERIES TAB */}
        {activeTab === "galleries" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 border-b border-sand-border pb-6">
              <div className="w-12 h-12 bg-black/10 rounded-xl flex items-center justify-center">
                <Camera className="w-6 h-6 text-sand-text" />
              </div>
              <div>
                <h1 className="text-3xl font-serif text-sand-text">My Galleries</h1>
                <p className="text-sand-muted text-sm">Access your live event photos and selection rooms.</p>
              </div>
            </div>

            {user.rooms.length === 0 ? (
              <div className="bg-black/5 border border-sand-border rounded-3xl p-12 text-center flex flex-col items-center">
                <Camera className="w-16 h-16 text-gray-700 mb-4" />
                <h3 className="text-xl font-medium text-sand-text mb-2">No galleries found</h3>
                <p className="text-sand-muted text-sm max-w-md">You don't have any galleries assigned to your account right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {user.rooms.map((room: any) => (
                  <Link 
                    key={room.id} 
                    href={`/${room.type}/${room.id}`}
                    className="group relative overflow-hidden rounded-3xl aspect-[4/3] bg-sand-surface border border-sand-border p-6 flex flex-col justify-between hover:border-white/30 hover:shadow-[0_10px_40px_rgba(255,255,255,0.05)] transition-all"
                  >
                    <div className="relative z-20">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${room.type === 'live' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                        {room.type === 'live' ? <Camera className="w-6 h-6" /> : <Layers className="w-6 h-6" />}
                      </div>
                      <span className="text-xs font-bold tracking-widest uppercase text-sand-muted">
                        {room.type === 'live' ? 'Live Event' : 'Selection Room'}
                      </span>
                      <h3 className="text-2xl font-serif text-sand-text mt-2 line-clamp-2">{room.name}</h3>
                    </div>
                    <div className="relative z-20 flex justify-end">
                      <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-white group-hover:text-sand-text transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 border-b border-sand-border pb-6">
              <div className="w-12 h-12 bg-black/10 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-sand-text" />
              </div>
              <div>
                <h1 className="text-3xl font-serif text-sand-text">Orders & Enquiries</h1>
                <p className="text-sand-muted text-sm">Track your frames, albums, and custom requests.</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-serif text-sand-text">Frame Orders</h2>
              {user.orders.length === 0 ? (
                <div className="bg-black/5 border border-sand-border rounded-3xl p-12 text-center flex flex-col items-center">
                  <Package className="w-16 h-16 text-gray-700 mb-4" />
                  <h3 className="text-xl font-medium text-sand-text mb-2">No orders placed yet</h3>
                  <p className="text-sand-muted text-sm max-w-md mb-6">When you order frames or prints, you'll be able to track their production timeline here.</p>
                  <Link href="/shop" className="bg-sand-surface text-sand-text px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">
                    Head to Frame Shop
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {user.orders.map((order: any) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </div>

            {user.enquiries.length > 0 && (
              <div className="space-y-6 pt-6 border-t border-sand-border">
                <h2 className="text-xl font-serif text-sand-text">Custom Enquiries</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {user.enquiries.map((enq: any) => (
                    <div key={enq.id} className="bg-sand-surface border border-sand-border rounded-3xl p-6 hover:border-sand-border transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center text-sand-text">
                          <Clock className="w-5 h-5" />
                        </div>
                        <span className={`text-xs px-2 py-1 rounded font-bold uppercase tracking-wider ${
                          enq.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-400'
                        }`}>
                          {enq.status}
                        </span>
                      </div>
                      <h4 className="font-serif text-lg text-sand-text mb-1">{enq.product?.name || "Product Request"}</h4>
                      <p className="text-sm text-sand-muted">Dimensions: {enq.dimensions}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 border-b border-sand-border pb-6">
              <div className="w-12 h-12 bg-black/10 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-sand-text" />
              </div>
              <div>
                <h1 className="text-3xl font-serif text-sand-text">Profile Settings</h1>
                <p className="text-sand-muted text-sm">Manage your personal information and contact details.</p>
              </div>
            </div>

            <div className="bg-sand-surface border border-sand-border rounded-3xl p-1 md:p-4">
              <ProfileEditor user={user} />
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
