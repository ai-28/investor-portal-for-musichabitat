import { NextResponse } from "next/server";
import {
  getStripePublishableKey,
  isStripeConfigured,
  isWireConfigured,
} from "@/lib/payments/config";

export async function GET() {
  return NextResponse.json({
    achEnabled: isStripeConfigured(),
    wireEnabled: isWireConfigured(),
    publishableKey: getStripePublishableKey(),
  });
}
