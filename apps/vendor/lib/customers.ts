export type VendorCustomer = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  orderCount: number;
  totalSpend: number;
  lastOrderDate?: string | null;
  tags: string[];
  notes?: string | null;
};

export type RetentionSuggestions = {
  groups: {
    repeat: VendorCustomer[];
    inactive: VendorCustomer[];
    highValue: VendorCustomer[];
    firstTime: VendorCustomer[];
  };
  suggestedActions: Array<{
    segment: string;
    customerIds: string[];
    suggestedActions: string[];
    messageDrafts: string[];
  }>;
};

const fallbackCustomers: VendorCustomer[] = [
  {
    id: "customer-repeat",
    name: "Sara Lind",
    phone: "+46700001111",
    email: "sara@example.local",
    orderCount: 4,
    totalSpend: 760,
    lastOrderDate: "2026-07-09T18:00:00.000Z",
    tags: ["repeat", "lunch"]
  },
  {
    id: "customer-inactive",
    name: "Daniel Owusu",
    phone: "+46700002222",
    orderCount: 2,
    totalSpend: 258,
    lastOrderDate: "2026-05-25T12:00:00.000Z",
    tags: ["inactive"]
  },
  {
    id: "customer-first",
    name: "Maya Chen",
    phone: "+46700003333",
    orderCount: 1,
    totalSpend: 129,
    lastOrderDate: "2026-07-09T12:10:00.000Z",
    tags: ["first-time"]
  }
];

export async function getVendorCustomers(): Promise<VendorCustomer[]> {
  return fetchVendorData("/vendor/customers", fallbackCustomers);
}

export async function getVendorCustomer(id: string): Promise<VendorCustomer> {
  const fallback = fallbackCustomers.find((customer) => customer.id === id) ?? fallbackCustomers[0];
  return fetchVendorData(`/vendor/customers/${id}`, fallback);
}

export async function getRetentionSuggestions(): Promise<RetentionSuggestions> {
  return fetchVendorData("/vendor/customers/retention-suggestions", {
    groups: {
      repeat: fallbackCustomers.filter((customer) => customer.orderCount >= 2),
      inactive: fallbackCustomers.filter((customer) => customer.tags.includes("inactive")),
      highValue: fallbackCustomers.filter((customer) => customer.totalSpend >= 500),
      firstTime: fallbackCustomers.filter((customer) => customer.orderCount <= 1)
    },
    suggestedActions: [
      {
        segment: "repeat",
        customerIds: ["customer-repeat"],
        suggestedActions: ["Send repeat customers a weekend QR offer."],
        messageDrafts: ["Sara, your weekend pickup offer is ready."]
      }
    ]
  });
}

async function fetchVendorData<T>(path: string, fallback: T): Promise<T> {
  const baseUrl = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    return fallback;
  }

  try {
    const response = await fetch(`${baseUrl}/api${path}`, { cache: "no-store" });

    if (response.ok) {
      return (await response.json()) as T;
    }
  } catch {
    // Fall back to mock data for local UI-only preview.
  }

  return fallback;
}
