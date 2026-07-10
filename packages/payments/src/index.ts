export type PaymentIntentRequest = {
  orderId: string;
  vendorId: string;
  amountMinor: number;
  currency: string;
  customerId?: string;
};

export type PaymentIntentResult = {
  provider: string;
  providerIntentId: string;
  status: "requires_payment_method" | "requires_action" | "succeeded" | "failed";
  clientSecret?: string;
};

export interface PaymentProvider {
  readonly name: string;
  createPaymentIntent(request: PaymentIntentRequest): Promise<PaymentIntentResult>;
}

export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";

  async createPaymentIntent(request: PaymentIntentRequest): Promise<PaymentIntentResult> {
    return {
      provider: this.name,
      providerIntentId: `mock_pi_${request.orderId}`,
      status: "succeeded"
    };
  }
}
