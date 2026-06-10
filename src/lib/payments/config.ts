export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  );
}

export function isWireConfigured(): boolean {
  return Boolean(
    process.env.WIRE_ROUTING_NUMBER &&
      process.env.WIRE_ACCOUNT_NUMBER &&
      process.env.WIRE_BANK_NAME,
  );
}

export function getWireConfig() {
  return {
    bankName: process.env.WIRE_BANK_NAME ?? "",
    routingNumber: process.env.WIRE_ROUTING_NUMBER ?? "",
    accountNumber: process.env.WIRE_ACCOUNT_NUMBER ?? "",
    beneficiary: process.env.WIRE_BENEFICIARY ?? "Music Habitat, Inc.",
    address: process.env.WIRE_ADDRESS ?? "",
    swift: process.env.WIRE_SWIFT ?? "",
  };
}

export function getStripePublishableKey(): string | null {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null;
}
