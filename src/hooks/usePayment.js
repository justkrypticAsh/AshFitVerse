// src/hooks/usePayment.js — AshFitVerse
// ─────────────────────────────────────────────────────────────────────────────
// Full Razorpay payment flow (Gen 2 Cloud Functions Production URLs Strict Route)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";
import { auth } from "../firebase";   

// Strict URL Definitions (Removed trailing slashes completely)
const CREATE_ORDER_URL = "https://createorder-dri4ey4meq-uc.a.run.app";
const VERIFY_PAYMENT_URL = "https://verifypayment-dri4ey4meq-uc.a.run.app";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script    = document.createElement("script");
    script.src      = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload   = () => resolve(true);
    script.onerror  = () => resolve(false);
    document.body.appendChild(script);
  });

export default function usePayment() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const startPayment = useCallback(async ({
    planId,        
    billing,       
    planName,      
    userEmail,     
    userName,      
    userPhone,     
    onSuccess,     
    onFailure,     
  }) => {
    setLoading(true);
    setError(null);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Razorpay load nahi hua. Internet check karo.");

      const user = auth.currentUser;
      if (!user) throw new Error("Login karo pehle");
      const userId = user.uid;

      // ⚡ URL sanitization to completely prevent automatic trailing slashes injection
      const cleanOrderUrl = CREATE_ORDER_URL.replace(/\/$/, "");

      const orderRes = await fetch(cleanOrderUrl, {
        method:  "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ planId, billing, userId }),
      });
      
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.error || "Order create nahi hua");

      const { orderId, amount, currency, keyId } = orderData;

      await new Promise((resolve, reject) => {
        const options = {
          key:         keyId, 
          amount,
          currency,
          name:        "AshFitVerse",
          description: `${planName} Plan — ${billing === "yearly" ? "Yearly" : "Monthly"}`,
          image:       "/logo.png",           
          order_id:    orderId,

          prefill: {
            name:    userName  || "",
            email:   userEmail || "",
            contact: userPhone || "",
          },

          theme: { color: planId === "pro" ? "#ff9f0a" : "#bf5af2" },

          handler: async (response) => {
            try {
              const cleanVerifyUrl = VERIFY_PAYMENT_URL.replace(/\/$/, "");

              const verifyRes = await fetch(cleanVerifyUrl, {
                method:  "POST",
                headers: { 
                  "Content-Type": "application/json",
                  "Accept": "application/json"
                },
                body:    JSON.stringify({
                  razorpay_order_id:   response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature:  response.razorpay_signature,
                  userId,
                  planId,
                  billing,
                }),
              });
              const verifyData = await verifyRes.json();

              if (verifyData.success) {
                resolve();
                onSuccess && onSuccess(planId, billing);
              } else {
                reject(new Error(verifyData.error || "Payment verify nahi hua"));
              }
            } catch (err) {
              reject(err);
            }
          },

          modal: {
            ondismiss: () => {
              reject(new Error("Payment cancel kiya"));
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (response) => {
          reject(new Error(response.error.description || "Payment fail ho gayi"));
        });
        rzp.open();
      });

    } catch (err) {
      const msg = err.message || "Kuch gadbad ho gayi";
      setError(msg);
      onFailure && onFailure(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return { startPayment, loading, error };
}