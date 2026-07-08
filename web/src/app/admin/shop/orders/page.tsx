"use client";

import { useState, useEffect } from "react";
import { Loader2, Package, MapPin, Phone, MessageCircle, Truck } from "lucide-react";
import { getAdminOrders, updateOrderStatus } from "@/app/actions/adminShop";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingModal, setTrackingModal] = useState<{ isOpen: boolean, orderId: string, status: string, tracking_number: string, tracking_message: string } | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getAdminOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTracking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!trackingModal) return;
    const formData = new FormData(e.currentTarget);
    await updateOrderStatus(
      trackingModal.orderId,
      formData.get('status') as string,
      formData.get('tracking_number') as string,
      formData.get('tracking_message') as string
    );
    setTrackingModal(null);
    fetchOrders();
  };

  const openWhatsApp = (phone: string, orderId: string) => {
    const formattedPhone = phone.replace(/[^0-9]/g, '');
    const message = `Hello! This is Naren's Studio regarding your Order #${orderId.slice(0, 8).toUpperCase()}. `;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif text-sand-text mb-1">Customer Orders</h2>
          <p className="text-sm text-sand-muted">Manage fulfillment and update tracking for shop purchases.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-sand-muted" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orders.map(order => (
            <div key={order.id} className="bg-black/5 border border-sand-border p-6 rounded-xl flex flex-col md:flex-row gap-6">
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-sand-text">Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                  <span className={`text-xs px-2 py-1 rounded-md uppercase font-bold tracking-wider ${
                    order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                    order.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                    order.status === 'shipped' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {order.status}
                  </span>
                  <span className="text-sand-muted text-sm">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-sand-surface rounded border border-sand-border overflow-hidden shrink-0">
                     {order.product?.thumbnail_url ? <img src={order.product.thumbnail_url} className="img-theme w-full h-full object-cover" /> : <Package className="w-6 h-6 m-auto mt-5 text-sand-muted" />}
                  </div>
                  <div>
                    <p className="font-medium">{order.product?.name || "Unknown Product"}</p>
                    <p className="text-sm text-sand-muted">Size: {order.size?.name || "N/A"}</p>
                    <p className="text-sm text-green-400 font-bold">${order.total_amount}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-3 bg-white/60 p-4 rounded-lg border border-sand-border">
                <p className="text-sm font-medium text-sand-text mb-2">Customer Details</p>
                <div className="flex items-center gap-2 text-sm text-sand-muted">
                  <span className="text-sand-text font-medium">{order.client?.full_name || "Guest"}</span>
                  <span>({order.client?.email})</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-sand-muted">
                  <Phone className="w-4 h-4" /> {order.client?.phone || "No phone"}
                </div>
                <div className="flex items-start gap-2 text-sm text-sand-muted">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" /> 
                  <span className="leading-tight">{order.shipping_address}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <button 
                  onClick={() => setTrackingModal({ isOpen: true, orderId: order.id, status: order.status, tracking_number: order.tracking_number || "", tracking_message: order.tracking_message || "" })}
                  className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Truck className="w-4 h-4" /> Update Tracking
                </button>
                {order.client?.phone && (
                  <button 
                    onClick={() => openWhatsApp(order.client.phone!, order.id)}
                    className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp Client
                  </button>
                )}
              </div>

            </div>
          ))}
          {orders.length === 0 && <p className="text-sand-muted text-center py-10">No orders found.</p>}
        </div>
      )}

      {/* Tracking Update Modal */}
      {trackingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-sand-border rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-sand-border">
              <h3 className="text-xl font-serif">Update Tracking</h3>
              <p className="text-sm text-sand-muted">Order #{trackingModal.orderId.slice(0, 8).toUpperCase()}</p>
            </div>
            <form onSubmit={handleUpdateTracking} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">Order Status</label>
                <select name="status" defaultValue={trackingModal.status} className="w-full bg-sand-surface border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:outline-none focus:border-white/30">
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">Tracking Number / Link</label>
                <input name="tracking_number" defaultValue={trackingModal.tracking_number} className="w-full bg-sand-surface border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:outline-none focus:border-white/30" placeholder="e.g. FedEx 1234..." />
              </div>
              <div>
                <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">Message to Client (Optional)</label>
                <textarea name="tracking_message" defaultValue={trackingModal.tracking_message} className="w-full bg-sand-surface border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:outline-none focus:border-white/30 h-24" placeholder="Hi, your frame is out for delivery..." />
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setTrackingModal(null)} className="flex-1 py-3 bg-black/5 text-sand-text font-bold rounded-xl hover:bg-black/10">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-sand-surface text-sand-text font-bold rounded-xl hover:bg-gray-200">Save Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
