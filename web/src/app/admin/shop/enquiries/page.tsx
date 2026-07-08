"use client";

import { useState, useEffect } from "react";
import { Loader2, Ruler, Phone, MessageCircle, CheckCircle2 } from "lucide-react";
import { getAdminEnquiries, updateEnquiryStatus } from "@/app/actions/adminShop";

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const data = await getAdminEnquiries();
      setEnquiries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReplied = async (id: string) => {
    await updateEnquiryStatus(id, "replied");
    fetchEnquiries();
  };

  const openWhatsApp = (phone: string, enquiryId: string, product: string, dims: string) => {
    const formattedPhone = phone.replace(/[^0-9]/g, '');
    const message = `Hello! This is Naren's Studio regarding your custom frame size request.\n\nFrame: ${product}\nRequested Dimensions: ${dims}\n\nHere is your custom quote: `;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif text-sand-text mb-1">Custom Size Enquiries</h2>
          <p className="text-sm text-sand-muted">Respond to customer requests for custom frame dimensions.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-sand-muted" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {enquiries.map(enq => (
            <div key={enq.id} className="bg-black/5 border border-sand-border p-6 rounded-xl flex flex-col md:flex-row gap-6">
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-sand-text">Enquiry #{enq.id.slice(0, 8).toUpperCase()}</h3>
                  <span className={`text-xs px-2 py-1 rounded-md uppercase font-bold tracking-wider ${
                    enq.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {enq.status}
                  </span>
                  <span className="text-sand-muted text-sm">{new Date(enq.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/60 border border-sand-border rounded-lg">
                  <Ruler className="w-6 h-6 shrink-0 mt-1 text-sand-muted" />
                  <div>
                    <p className="font-medium text-sand-text">Requested Size: <span className="text-blue-400">{enq.dimensions}</span></p>
                    <p className="text-sm text-sand-muted mt-1">For Product: {enq.product?.name || "Unknown Product"}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-3 bg-white/60 p-4 rounded-lg border border-sand-border">
                <p className="text-sm font-medium text-sand-text mb-2">Customer Details</p>
                <div className="flex items-center gap-2 text-sm text-sand-muted">
                  <span className="text-sand-text font-medium">{enq.client?.full_name || "Guest"}</span>
                  <span>({enq.client?.email})</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-sand-muted">
                  <Phone className="w-4 h-4" /> {enq.client?.phone || "No phone"}
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                {enq.client?.phone && (
                  <button 
                    onClick={() => openWhatsApp(enq.client.phone, enq.id, enq.product?.name || "Unknown", enq.dimensions)}
                    className="px-4 py-3 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" /> Send Quote via WhatsApp
                  </button>
                )}
                {enq.status === 'pending' && (
                  <button 
                    onClick={() => handleMarkReplied(enq.id)}
                    className="px-4 py-2 bg-black/5 hover:bg-black/10 text-sand-text rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Mark as Replied
                  </button>
                )}
              </div>

            </div>
          ))}
          {enquiries.length === 0 && <p className="text-sand-muted text-center py-10">No enquiries found.</p>}
        </div>
      )}

    </div>
  );
}
