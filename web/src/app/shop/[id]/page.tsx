"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Play, Ruler, ShoppingCart, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import { getProductById, submitEnquiry, createOrder } from "@/app/actions/shop";
import { getAuthState } from "@/app/actions/auth";
import Script from "next/script";

export default function ShopDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Selection States
  const [activeMedia, setActiveMedia] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<any>(null);
  
  // Custom Size Enquiry State
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquiryDims, setEnquiryDims] = useState("");
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  // Auth / Checkout State
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"checkout" | "enquiry" | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [prodData, authState] = await Promise.all([
          getProductById(id),
          getAuthState()
        ]);
        
        if (prodData) {
          setProduct(prodData);
          if (prodData.media.length > 0) setActiveMedia(prodData.media[0]);
          if (prodData.sizes.length > 0) setSelectedSize(prodData.sizes[0]);
        }
        setUser(authState.user);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const handleCheckoutClick = () => {
    if (!user) {
      setPendingAction("checkout");
      setShowAuthModal(true);
    } else {
      processCheckout();
    }
  };

  const handleEnquiryClick = () => {
    if (!user) {
      setPendingAction("enquiry");
      setShowAuthModal(true);
    } else {
      setShowEnquiryModal(true);
    }
  };

  const onAuthSuccess = async (authResult: any) => {
    setUser(authResult.user);
    setShowAuthModal(false);
    
    // Resume action after login
    if (pendingAction === "checkout") {
      await processCheckout(authResult.user);
    } else if (pendingAction === "enquiry") {
      setShowEnquiryModal(true);
    }
    setPendingAction(null);
  };

  const processCheckout = async (currentUser = user) => {
    if (!selectedSize || !currentUser) return;
    
    try {
      // 1. Create a "pending" Prisma Order first
      const orderResult = await createOrder({
        client_id: currentUser.id,
        product_id: product.id,
        size_id: selectedSize.id,
        total_amount: selectedSize.price,
        shipping_address: currentUser.address || "Address pending...",
      });

      if (!orderResult.success) {
        alert(orderResult.error);
        return;
      }

      const orderId = orderResult.orderId;

      // 2. Create Razorpay order
      const rzpResponse = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: selectedSize.price, orderId })
      });
      const rzpData = await rzpResponse.json();

      if (!rzpData.success) {
        alert("Failed to initialize payment gateway.");
        return;
      }

      // 3. Open Razorpay Checkout Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_fallback",
        amount: rzpData.order.amount,
        currency: "INR",
        name: "Naren's Studio",
        description: `Order: ${product.name} (${selectedSize.name})`,
        order_id: rzpData.order.id,
        handler: async function (response: any) {
          // 4. Verify Payment on success
          const verifyResponse = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId
            })
          });
          const verifyData = await verifyResponse.json();
          if (verifyData.success) {
            setOrderSuccess(true);
          } else {
            alert("Payment verification failed.");
          }
        },
        prefill: {
          name: currentUser.full_name,
          email: currentUser.email,
          contact: currentUser.phone || ""
        },
        theme: {
          color: "#000000"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert("Payment failed: " + response.error.description);
      });
      rzp.open();

    } catch (err: any) {
      console.error(err);
      alert("Something went wrong during checkout.");
    }
  };

  const submitCustomEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !enquiryDims) return;
    
    const result = await submitEnquiry({
      client_id: user.id,
      product_id: product.id,
      dimensions: enquiryDims
    });

    if (result.success) {
      setEnquirySuccess(true);
      setShowEnquiryModal(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-sand-surface flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-sand-text" /></div>;
  if (!product) return <div className="min-h-screen bg-sand-surface text-sand-text flex items-center justify-center flex-col gap-4"><h2>Frame not found</h2><Link href="/shop" className="text-sand-muted">Back to Shop</Link></div>;

  return (
    <main className="min-h-screen bg-sand-bg text-sand-text pt-24 px-4 pb-24">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Navbar />
      
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 mt-8">
        
        {/* Left Side: Media Gallery (Amazon Style) */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 h-[600px]">
          {/* Thumbnails */}
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar w-full md:w-24 shrink-0 order-2 md:order-1">
            {product.thumbnail_url && (
              <button 
                onClick={() => setActiveMedia({ url: product.thumbnail_url, type: 'image' })}
                className={`w-20 h-20 shrink-0 bg-sand-surface rounded-lg border-2 overflow-hidden ${activeMedia?.url === product.thumbnail_url ? 'border-yellow-500' : 'border-sand-border'}`}
              >
                <img src={product.thumbnail_url} className="img-theme w-full h-full object-cover" />
              </button>
            )}
            {product.media.map((m: any) => (
              <button 
                key={m.id} 
                onClick={() => setActiveMedia(m)}
                className={`w-20 h-20 shrink-0 bg-sand-surface rounded-lg border-2 overflow-hidden relative ${activeMedia?.id === m.id ? 'border-yellow-500' : 'border-sand-border'}`}
              >
                {m.type === 'image' ? (
                  <img src={m.url} className="img-theme w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-sand-text"><Play className="w-6 h-6 text-sand-text" /></div>
                )}
              </button>
            ))}
          </div>

          {/* Main Display */}
          <div className="flex-1 bg-sand-surface border border-sand-border rounded-2xl overflow-hidden relative flex items-center justify-center order-1 md:order-2">
            {!activeMedia ? (
               <ImageIcon className="w-16 h-16 text-gray-800" />
            ) : activeMedia.type === 'image' ? (
              <img src={activeMedia.url} className="img-theme w-full h-full object-contain" />
            ) : (
              <video src={activeMedia.url} controls className="w-full h-full object-contain" autoPlay muted loop />
            )}
          </div>
        </div>

        {/* Right Side: Details & Purchasing */}
        <div className="w-full lg:w-[450px] shrink-0 flex flex-col">
          <Link href="/shop" className="inline-flex items-center gap-2 text-sand-muted hover:text-sand-text mb-6 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>

          <h1 className="text-4xl font-serif mb-2 capitalize lowercase">{product.name}</h1>
          <p className="text-sand-muted mb-8 capitalize lowercase">{product.description}</p>

          <div className="bg-black/5 border border-sand-border rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2"><Ruler className="w-5 h-5" /> Select Dimensions</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {product.sizes.map((size: any) => (
                <button
                  key={size.id}
                  onClick={() => setSelectedSize(size)}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    selectedSize?.id === size.id ? 'border-yellow-500 bg-yellow-500/10' : 'border-sand-border hover:border-white/30'
                  }`}
                >
                  <div className="font-bold">{size.name}</div>
                </button>
              ))}
            </div>

            {selectedSize ? (
              <div className="flex items-center justify-between mb-6 pt-4 border-t border-sand-border">
                <span className="text-sand-muted">Total Price</span>
                <span className="text-3xl font-serif text-sand-text">${selectedSize.price}</span>
              </div>
            ) : (
              <p className="text-sm text-sand-muted text-center mb-6">Please select a size to view pricing.</p>
            )}

            {orderSuccess ? (
              <div className="bg-green-500/20 border border-green-500/30 text-green-400 p-4 rounded-xl text-center">
                <h4 className="font-bold mb-1">Order Placed Successfully!</h4>
                <p className="text-sm">You can track your order in your Dashboard.</p>
                <Link href="/dashboard" className="inline-block mt-3 bg-green-500 text-sand-text px-4 py-2 rounded-lg text-sm font-bold">Go to Dashboard</Link>
              </div>
            ) : (
              <button 
                onClick={handleCheckoutClick}
                disabled={!selectedSize}
                className="w-full py-4 bg-sand-surface text-sand-text font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" /> Pay & Order Frame
              </button>
            )}
          </div>

          <div className="bg-sand-surface border border-sand-border p-6 rounded-2xl text-center">
            <p className="text-sand-muted mb-3 text-sm">Need a specific size that isn't listed?</p>
            <button 
              onClick={handleEnquiryClick}
              className="text-sand-text underline underline-offset-4 font-medium hover:text-gray-700"
            >
              Request Custom Size
            </button>
          </div>

          {enquirySuccess && (
            <p className="text-green-400 text-sm mt-4 text-center">Enquiry sent! We will contact you soon.</p>
          )}

        </div>
      </div>

      {/* Custom Size Modal */}
      {showEnquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-sand-border rounded-2xl w-full max-w-md p-8">
            <h3 className="text-2xl font-serif mb-2">Custom Dimensions</h3>
            <p className="text-sand-muted mb-6 text-sm">Enter the exact dimensions you need for {product.name}. Our team will review it and reply with a quote via your dashboard and WhatsApp.</p>
            
            <form onSubmit={submitCustomEnquiry}>
              <input 
                required
                value={enquiryDims}
                onChange={(e) => setEnquiryDims(e.target.value)}
                placeholder="e.g. 24 x 36 inches"
                className="w-full bg-sand-surface border border-sand-border rounded-xl px-4 py-4 text-sand-text focus:outline-none focus:border-yellow-500/50 mb-6"
              />
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowEnquiryModal(false)} className="flex-1 py-3 text-sand-muted hover:text-sand-text transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-sand-surface text-sand-text font-bold rounded-xl hover:bg-gray-200">Request Quote</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auth Guard Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={onAuthSuccess} 
      />

    </main>
  );
}
