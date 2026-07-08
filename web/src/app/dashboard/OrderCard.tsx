"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Package, MapPin, CreditCard, Banknote, Clock } from "lucide-react";

export default function OrderCard({ order }: { order: any }) {
  const [expanded, setExpanded] = useState(false);

  const STAGES = [
    { key: "pending", label: "NEW" },
    { key: "processing", label: "IN PRODUCTION" },
    { key: "shipped", label: "READY" },
    { key: "delivered", label: "DELIVERED" }
  ];

  const currentStageIndex = STAGES.findIndex(s => s.key === order.status);

  // Payment Badge Logic
  let paymentBadge = null;
  if (order.payment_status === "paid") {
    paymentBadge = (
      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 font-bold uppercase">
        <CreditCard className="w-3 h-3" /> Paid
      </span>
    );
  } else if (order.payment_method === "cash") {
    paymentBadge = (
      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-500 font-bold uppercase">
        <Banknote className="w-3 h-3" /> Cash pending at studio
      </span>
    );
  } else {
    paymentBadge = (
      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 font-bold uppercase">
        <Clock className="w-3 h-3" /> Awaiting Payment Link
      </span>
    );
  }

  return (
    <div className="bg-sand-surface border border-sand-border rounded-2xl overflow-hidden transition-all duration-300">
      {/* Header - Always visible */}
      <div 
        className="p-6 flex flex-col md:flex-row gap-6 cursor-pointer hover:bg-black/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-20 h-20 bg-[#111] rounded-lg shrink-0 overflow-hidden border border-sand-border">
          {order.product?.thumbnail_url ? (
            <img src={order.product.thumbnail_url} className="img-theme w-full h-full object-cover" />
          ) : (
            <Package className="w-8 h-8 text-gray-700 m-auto mt-6" />
          )}
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-bold text-lg">{order.product?.name || "Product"}</h4>
              <p className="text-sm text-sand-muted">Order #{order.id.split('-')[0].toUpperCase()}</p>
            </div>
            <div className="text-right flex flex-col items-end gap-2">
              <span className="font-serif text-xl text-yellow-500">${order.total_amount}</span>
              {paymentBadge}
            </div>
          </div>
          <div className="text-sm text-sand-muted flex items-center justify-between">
            <span>Size: {order.size?.name || "N/A"}</span>
            <div className="flex items-center gap-1">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-sand-border p-6 bg-white/[0.02]">
          
          {/* Timeline */}
          <div className="mb-8">
            <h5 className="text-xs tracking-widest text-sand-muted font-bold uppercase mb-4">Production Timeline</h5>
            <div className="relative flex justify-between items-center">
              {/* Connecting Line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-black/10 -z-10 -translate-y-1/2" />
              <div 
                className="absolute top-1/2 left-0 h-0.5 bg-yellow-500 -z-10 -translate-y-1/2 transition-all duration-500" 
                style={{ width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%` }}
              />

              {/* Dots */}
              {STAGES.map((stage, index) => {
                const isCompleted = index <= currentStageIndex;
                const isCurrent = index === currentStageIndex;
                const isDelivered = order.status === 'delivered';
                
                let dotColor = "bg-sand-surface border-sand-border";
                if (isCompleted && !isDelivered) dotColor = "bg-yellow-500 border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]";
                if (isDelivered) dotColor = "bg-green-500 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]";

                return (
                  <div key={stage.key} className="flex flex-col items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border-2 transition-colors duration-300 ${dotColor}`} />
                    <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-sand-text' : 'text-sand-muted'}`}>
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Details */}
            <div>
              <h5 className="text-xs tracking-widest text-sand-muted font-bold uppercase mb-2">Order Details</h5>
              <div className="space-y-1 text-sm text-gray-700">
                <p>Placed on: {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                {order.photo_url ? (
                  <p className="flex items-center gap-2">
                    Source: <a href={order.photo_url} target="_blank" rel="noreferrer" className="text-yellow-500 hover:underline">View Photo</a>
                  </p>
                ) : (
                  <p>Source: Studio Provided</p>
                )}
              </div>
            </div>

            {/* Shipping */}
            <div>
              <h5 className="text-xs tracking-widest text-sand-muted font-bold uppercase mb-2 flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Shipping Address
              </h5>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.shipping_address}</p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
