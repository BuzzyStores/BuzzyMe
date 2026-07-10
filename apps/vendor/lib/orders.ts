export type VendorOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  requestedPickupTime?: string;
  notes?: string;
  status: string;
  items: Array<{
    title: string;
    quantity: number;
  }>;
};

export async function getVendorOrders(): Promise<VendorOrder[]> {
  return [
    {
      id: "order-sent",
      orderNumber: "BZ-2001",
      customerName: "Sara Lind",
      customerPhone: "+46700001111",
      requestedPickupTime: "Today 18:00",
      notes: "Medium spice please.",
      status: "SENT_TO_VENDOR",
      items: [
        {
          title: "Jollof Rice Lunch Bowl",
          quantity: 2
        }
      ]
    },
    {
      id: "order-ready",
      orderNumber: "BZ-2002",
      customerName: "Daniel Owusu",
      customerPhone: "+46700002222",
      requestedPickupTime: "Today 18:30",
      status: "READY_FOR_PICKUP",
      items: [
        {
          title: "Sobolo",
          quantity: 3
        }
      ]
    }
  ];
}

export async function updateVendorOrder(orderId: string, action: "accept" | "reject" | "ready" | "complete") {
  return {
    orderId,
    action,
    updatedAt: new Date().toISOString()
  };
}
