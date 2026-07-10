export type PickupOrderInput = {
  vendorId: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  items: Array<{
    listingId: string;
    quantity: number;
  }>;
  couponCode?: string;
  customerNote?: string;
  requestedPickupTime?: string;
};

export type OrderTracking = {
  orderId: string;
  orderNumber: string;
  vendorName: string;
  status: string;
  fulfilmentMethod: "PICKUP";
  items: Array<{
    title: string;
    quantity: number;
    lineTotal: number;
  }>;
  subtotalAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  currency: string;
  couponCode?: string | null;
  canReview?: boolean;
  reviewSubmitted?: boolean;
  customerNote?: string;
  requestedPickupTime?: string;
  createdAt: string;
  updatedAt: string;
};

export async function placePickupOrder(input: PickupOrderInput) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    return {
      orderId: `mock-${Date.now()}`,
      orderNumber: "BZ-MOCK",
      status: "SENT_TO_VENDOR",
      discountAmount: 0,
      totalAmount: 0,
      currency: "SEK",
      trackingUrl: "/orders/mock-order"
    };
  }

  const response = await fetch(`${baseUrl}/api/orders`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      ...input,
      fulfilmentMethod: "PICKUP"
    })
  });

  if (!response.ok) {
    throw new Error("Unable to place order.");
  }

  return response.json() as Promise<{
    orderId: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    currency: string;
    trackingUrl: string;
  }>;
}

export async function getOrderTracking(id: string): Promise<OrderTracking> {
  const baseUrl = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (baseUrl) {
    try {
      const response = await fetch(`${baseUrl}/api/orders/${id}/track`, { cache: "no-store" });

      if (response.ok) {
        return (await response.json()) as OrderTracking;
      }
    } catch {
      // Fall through to the mock tracking shape.
    }
  }

  return {
    orderId: id,
    orderNumber: id === "mock-order" ? "BZ-MOCK" : "BZ-1001",
    vendorName: "Akwasaba Kitchen",
    status: "READY_FOR_PICKUP",
    fulfilmentMethod: "PICKUP",
    items: [
      {
        title: "Jollof Rice Lunch Bowl",
        quantity: 1,
        lineTotal: 129
      }
    ],
    totalAmount: 129,
    currency: "SEK",
    discountAmount: 0,
    couponCode: null,
    canReview: true,
    reviewSubmitted: false,
    customerNote: "Please keep spice medium.",
    requestedPickupTime: "2026-07-09T18:00:00.000Z",
    createdAt: "2026-07-09T15:30:00.000Z",
    updatedAt: "2026-07-09T16:00:00.000Z"
  };
}

export async function submitOrderReview(orderId: string, input: { rating: number; comment?: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    return {
      id: `review-${orderId}`,
      orderId,
      rating: input.rating,
      comment: input.comment ?? null,
      approved: true,
      createdAt: new Date().toISOString()
    };
  }

  const response = await fetch(`${baseUrl}/api/orders/${orderId}/review`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    throw new Error("Unable to submit review.");
  }

  return response.json();
}
