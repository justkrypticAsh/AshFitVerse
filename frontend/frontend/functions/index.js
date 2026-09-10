// functions/index.js — AshFitVerse Cloud Functions
// ─────────────────────────────────────────────────────────────────────────────
// Functions:
//   1. generatePlan   — AI/rule-based workout + diet plan
//   2. createOrder    — Razorpay order banao (server side)
//   3. verifyPayment  — Signature verify karo + Firestore plan update karo
// ─────────────────────────────────────────────────────────────────────────────

import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import axios from "axios";
import RazorpayPackage from "razorpay";
import crypto from "crypto";

const Razorpay = RazorpayPackage.default || RazorpayPackage;

initializeApp();
const db = getFirestore();

const RAZORPAY_KEY_ID     = defineSecret("RAZORPAY_KEY_ID");
const RAZORPAY_KEY_SECRET = defineSecret("RAZORPAY_KEY_SECRET");
const CLAUDE_API_KEY      = defineSecret("CLAUDE_API_KEY");

const PLAN_PRICES = {
  lite: { monthly: 19900, yearly: 169900 },
  pro:  { monthly: 49900, yearly: 399900 },
};

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTION 1: generatePlan
// ─────────────────────────────────────────────────────────────────────────────
export const generatePlan = onRequest(
  { cors: true, secrets: [CLAUDE_API_KEY] },
  async (req, res) => {
    if (req.method === "OPTIONS") return res.status(204).send("");

    const { goal, equipment, activityLevel, calorieTarget, sex, level, days, mode } = req.body || {};

    if (mode === "rule-based") {
      return res.status(200).json({ success: true, msg: "Triggering frontend local arrays." });
    }

    try {
      const systemPrompt = `You are the ultimate fitness intelligence matrix for AshFitVerse.
Generate a highly personalized workout split and precise macro-accurate diet plan based on the user's profile.
CRITICAL: You must reply ONLY with a valid JSON object. No conversational filler, no markdown wrapping, no text outside the JSON.

JSON Template Schema:
{
  "workoutPlan": [
    { "day": "String", "name": "String", "color": "HexCode", "exercises": ["String"] }
  ],
  "dietPlan": [
    {
      "day": "String", "type": "String", "typeColor": "HexCode",
      "total": { "cal": Number, "protein": Number, "carbs": Number, "fats": Number },
      "meals": [
        { "time": "String", "name": "String", "emoji": "String", "items": ["String"], "cal": Number, "protein": Number, "carbs": Number, "fats": Number }
      ]
    }
  ]
}`;

      const userPrompt = `User Profile Matrix:
- Goal: ${goal}
- Weekly Frequency: ${days} days
- Level: ${level}
- Equipment: ${equipment}
- Target Calories: ${calorieTarget || 2400} kcal
- Sex: ${sex || "male"}`;

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "anthropic/claude-3-haiku",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user",   content: userPrompt   },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.CLAUDE_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 12000,
        }
      );

      const aiData = JSON.parse(response.data.choices[0].message.content);
      return res.status(200).json({
        success:     true,
        workoutPlan: aiData.workoutPlan,
        dietPlan:    aiData.dietPlan,
      });

    } catch (error) {
      console.error("generatePlan error:", error.message);
      return res.status(200).json({
        success: false,
        msg: "Token exhausted or error. Triggering frontend local arrays.",
      });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTION 2: createOrder
// FIX: receipt max 40 chars — `rcpt_${timestamp}` = 18 chars ✅
// ─────────────────────────────────────────────────────────────────────────────
export const createOrder = onRequest(
  { cors: true, secrets: [RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET] },
  async (req, res) => {
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { planId, billing, userId } = req.body || {};

    if (!planId || !billing || !userId) {
      return res.status(400).json({ error: "planId, billing aur userId required hain" });
    }
    if (!PLAN_PRICES[planId]) {
      return res.status(400).json({ error: "Invalid planId" });
    }
    if (!["monthly", "yearly"].includes(billing)) {
      return res.status(400).json({ error: "Invalid billing type" });
    }

    const amount = PLAN_PRICES[planId][billing];

    try {
      const keyId     = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!keyId || !keySecret) {
        throw new Error("Razorpay keys not found in environment");
      }

      const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

      // ✅ FIX: receipt sirf 18 chars — well within 40 char limit
      const receipt = `rcpt_${Date.now()}`;

      const order = await razorpay.orders.create({
        amount,
        currency: "INR",
        receipt,
        notes: { userId, planId, billing },
      });

      console.log(`Order created: ${order.id} | user: ${userId} | plan: ${planId} | receipt: ${receipt}`);

      return res.status(200).json({
        success:  true,
        orderId:  order.id,
        amount:   order.amount,
        currency: order.currency,
        keyId,
      });

    } catch (error) {
      console.error("createOrder failed:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Order creation failed",
      });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTION 3: verifyPayment
// ─────────────────────────────────────────────────────────────────────────────
export const verifyPayment = onRequest(
  { cors: true, secrets: [RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET] },
  async (req, res) => {
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      planId,
      billing,
    } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId || !planId || !billing) {
      return res.status(400).json({ error: "Missing required payment verification fields" });
    }

    try {
      const body     = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

      if (expected !== razorpay_signature) {
        console.error(`Signature mismatch for user ${userId}`);
        return res.status(400).json({
          success: false,
          error:   "Payment verification failed — signature mismatch",
        });
      }

      const now       = new Date();
      const expiresAt = billing === "yearly"
        ? new Date(new Date(now).setFullYear(now.getFullYear() + 1))
        : new Date(new Date(now).setMonth(now.getMonth() + 1));

      await db.collection("users").doc(userId).update({
        plan:            planId,
        planBilling:     billing,
        planActivatedAt: new Date(),
        planExpiresAt:   expiresAt,
        lastPaymentId:   razorpay_payment_id,
        lastOrderId:     razorpay_order_id,
        updatedAt:       new Date(),
      });

      await db.collection("payments").add({
        userId,
        planId,
        billing,
        orderId:   razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount:    PLAN_PRICES[planId][billing],
        currency:  "INR",
        status:    "success",
        createdAt: new Date(),
      });

      console.log(`Payment verified: user=${userId} plan=${planId} billing=${billing}`);

      return res.status(200).json({
        success: true,
        message: `Plan ${planId} successfully activated!`,
        planId,
        billing,
      });

    } catch (error) {
      console.error("verifyPayment error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Payment verification failed",
      });
    }
  }
);