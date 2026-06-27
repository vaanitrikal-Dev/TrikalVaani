// app/api/palmistry/order/route.ts
// Creates ₹51 Razorpay order for Hast Rekha Report
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { user_name, gender, language } = await req.json();

    const order = await razorpay.orders.create({
      amount:   5100,        // ₹51 in paise
      currency: 'INR',
      receipt:  `palm_${Date.now()}`,
      notes: {
        product:   'hast_rekha_report',
        user_name: user_name || '',
        gender,
        language,
      },
    });

    return NextResponse.json({ order_id: order.id, amount: order.amount });
  } catch (err: any) {
    console.error('[Palmistry Order]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
