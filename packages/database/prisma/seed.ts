import {
  PrismaClient,
  type AIOutputType,
  type ApprovalStatus,
  type VendorLifecycleStage
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@buzzystores.local" },
    update: {},
    create: {
      email: "admin@buzzystores.local",
      fullName: "BuzzyStores Admin",
      role: "ADMIN",
      marketingOptIn: false
    }
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@example.local" },
    update: {},
    create: {
      email: "customer@example.local",
      fullName: "Sample Customer",
      role: "CONSUMER",
      marketingOptIn: true
    }
  });

  const foodCategory = await prisma.category.upsert({
    where: { slug: "food-and-restaurants" },
    update: {},
    create: {
      name: "Food & Restaurants",
      slug: "food-and-restaurants",
      description: "Local food, packaged groceries, and ready-to-eat meals."
    }
  });

  const repairCategory = await prisma.category.upsert({
    where: { slug: "repair-services" },
    update: {},
    create: {
      name: "Repair Services",
      slug: "repair-services",
      description: "Local repair, maintenance, and appointment-based services."
    }
  });

  const infoVendor = await seedActivationVendor({
    ownerEmail: "owner@nordic-flowers.local",
    ownerName: "Lina Berg",
    ownerPhone: "+46700000010",
    name: "Nordic Flowers",
    slug: "nordic-flowers",
    city: "Stockholm",
    country: "Sweden",
    categoryLabel: "Flowers",
    lifecycleStage: "INFO_COLLECTED",
    approvalStatus: "DRAFT",
    shortCode: "draft-flowers",
    nextAction: "Review AI storefront draft.",
    aiStatus: "DRAFT",
    aiType: "VENDOR_PROFILE",
    output: {
      suggestedStorefrontHeadline: "Nordic Flowers is getting ready on BuzzyStores",
      suggestedShortDescription: "Local flower pickup and event bouquets.",
      suggestedLongDescription:
        "A neighbourhood flower vendor preparing QR ordering for bouquets, pickup, and seasonal campaigns.",
      suggestedCategories: ["Flowers", "Local Commerce"],
      missingFields: ["openingHoursText", "productText"],
      trustFlags: ["PHONE_PROVIDED"],
      recommendedNextAction: "Add opening hours and a first product list.",
      suggestedFirstCampaign: "Weekend bouquet pickup offer"
    },
    timeline: [
      ["LEAD_IDENTIFIED", "INFO_COLLECTED", "Vendor registration submitted."]
    ]
  });

  const draftedVendor = await seedActivationVendor({
    ownerEmail: "owner@repair-hub-solna.local",
    ownerName: "Jonas Ek",
    ownerPhone: "+46700000011",
    name: "Repair Hub Solna",
    slug: "repair-hub-solna",
    city: "Solna",
    country: "Sweden",
    categoryLabel: "Repair",
    lifecycleStage: "STORE_DRAFTED",
    approvalStatus: "AI_GENERATED",
    shortCode: "repairhub",
    nextAction: "Vendor review of AI service listings.",
    aiStatus: "AI_GENERATED",
    aiType: "LISTING_DRAFT",
    output: {
      listings: [
        {
          title: "Phone screen repair",
          listingType: "SERVICE",
          price: 499,
          currency: "SEK",
          shortDescription: "A bookable phone screen repair service.",
          suggestedCategory: "Repair Services",
          tags: ["repair", "booking", "local"],
          approvalStatus: "AI_GENERATED"
        }
      ]
    },
    timeline: [
      ["LEAD_IDENTIFIED", "INFO_COLLECTED", "Vendor info collected."],
      ["INFO_COLLECTED", "STORE_DRAFTED", "AI storefront and service drafts generated."]
    ]
  });

  const pendingVendor = await seedActivationVendor({
    ownerEmail: "owner@circular-closet.local",
    ownerName: "Mira Ali",
    ownerPhone: "+46700000012",
    name: "Circular Closet",
    slug: "circular-closet",
    city: "Gothenburg",
    country: "Sweden",
    categoryLabel: "Circular Commerce",
    lifecycleStage: "PENDING_APPROVAL",
    approvalStatus: "ADMIN_APPROVED",
    shortCode: "circcloset",
    nextAction: "Publish QR storefront.",
    aiStatus: "ADMIN_APPROVED",
    aiType: "VENDOR_PROFILE",
    output: {
      suggestedStorefrontHeadline: "Circular Closet is ready for local pickup",
      suggestedShortDescription: "Curated second-hand fashion drops with QR pickup.",
      suggestedLongDescription:
        "A circular commerce vendor preparing approved product drops, pickup orders, and neighbourhood campaigns.",
      suggestedCategories: ["Circular Commerce"],
      missingFields: [],
      trustFlags: ["PHONE_PROVIDED", "SOCIAL_PROFILE_PROVIDED"],
      recommendedNextAction: "Publish storefront and generate launch kit.",
      suggestedFirstCampaign: "First circular drop weekend"
    },
    timeline: [
      ["LEAD_IDENTIFIED", "INFO_COLLECTED", "Vendor info collected."],
      ["INFO_COLLECTED", "STORE_DRAFTED", "AI storefront draft generated."],
      ["STORE_DRAFTED", "PENDING_APPROVAL", "Admin approved activation draft."]
    ]
  });

  const publishedVendor = await seedActivationVendor({
    ownerEmail: "owner@akwasaba-kitchen.local",
    ownerName: "Ama Mensah",
    ownerPhone: "+46700000001",
    name: "Akwasaba Kitchen",
    slug: "akwasaba-kitchen",
    city: "Stockholm",
    country: "Sweden",
    categoryLabel: "Food",
    lifecycleStage: "PUBLISHED",
    approvalStatus: "PUBLISHED",
    shortCode: "akwasa",
    nextAction: "Deliver printed QR poster and launch first weekend bundle.",
    aiStatus: "VENDOR_APPROVED",
    aiType: "LISTING_DRAFT",
    output: {
      listings: [
        {
          title: "Jollof Rice Lunch Bowl",
          listingType: "FOOD_MENU_ITEM",
          price: 129,
          currency: "SEK",
          tags: ["ghanaian", "lunch", "pickup"],
          approvalStatus: "VENDOR_APPROVED"
        }
      ]
    },
    timeline: [
      ["LEAD_IDENTIFIED", "INFO_COLLECTED", "Vendor info collected."],
      ["INFO_COLLECTED", "STORE_DRAFTED", "Storefront drafted."],
      ["STORE_DRAFTED", "PENDING_APPROVAL", "Admin approved activation draft."],
      ["PENDING_APPROVAL", "PUBLISHED", "Storefront published."]
    ],
    publishedAt: new Date("2026-07-01T12:00:00.000Z")
  });

  const listing = await prisma.listing.upsert({
    where: {
      vendorId_slug: {
        vendorId: publishedVendor.vendor.id,
        slug: "jollof-rice-lunch-bowl"
      }
    },
    update: {
      approvalStatus: "PUBLISHED",
      publishedAt: new Date("2026-07-01T12:15:00.000Z")
    },
    create: {
      vendorId: publishedVendor.vendor.id,
      categoryId: foodCategory.id,
      title: "Jollof Rice Lunch Bowl",
      slug: "jollof-rice-lunch-bowl",
      shortDescription: "Smoky jollof rice with chicken, salad, and house shito.",
      longDescription:
        "A generous lunch bowl with tomato-rich jollof rice, grilled chicken, salad, and spicy house shito.",
      listingType: "FOOD_MENU_ITEM",
      tags: ["ghanaian", "lunch", "pickup", "diaspora"],
      price: "129.00",
      currency: "SEK",
      pickupEnabled: true,
      deliveryEnabled: true,
      diasporaEligible: true,
      preparationMinutes: 25,
      approvalStatus: "PUBLISHED",
      publishedAt: new Date("2026-07-01T12:15:00.000Z")
    }
  });

  await prisma.listing.upsert({
    where: {
      vendorId_slug: {
        vendorId: pendingVendor.vendor.id,
        slug: "curated-denim-jacket"
      }
    },
    update: {
      approvalStatus: "ADMIN_APPROVED"
    },
    create: {
      vendorId: pendingVendor.vendor.id,
      categoryId: foodCategory.id,
      title: "Curated denim jacket",
      slug: "curated-denim-jacket",
      shortDescription: "Approved circular commerce item ready for storefront publishing.",
      listingType: "CIRCULAR_ITEM",
      tags: ["circular", "pickup", "local"],
      price: "350.00",
      currency: "SEK",
      pickupEnabled: true,
      approvalStatus: "ADMIN_APPROVED"
    }
  });

  await prisma.listing.upsert({
    where: {
      vendorId_slug: {
        vendorId: draftedVendor.vendor.id,
        slug: "phone-screen-repair"
      }
    },
    update: {},
    create: {
      vendorId: draftedVendor.vendor.id,
      categoryId: repairCategory.id,
      title: "Phone screen repair",
      slug: "phone-screen-repair",
      shortDescription: "A draft repair service generated from vendor intake.",
      listingType: "SERVICE",
      tags: ["repair", "booking", "local"],
      price: "499.00",
      currency: "SEK",
      pickupEnabled: false,
      bookingEnabled: true,
      approvalStatus: "AI_GENERATED"
    }
  });

  await prisma.campaign.upsert({
    where: {
      vendorId_slug: {
        vendorId: publishedVendor.vendor.id,
        slug: "weekend-family-jollof-bundle"
      }
    },
    update: {},
    create: {
      vendorId: publishedVendor.vendor.id,
      categoryId: foodCategory.id,
      name: "Weekend Family Jollof Bundle",
      slug: "weekend-family-jollof-bundle",
      type: "FAMILY_BUNDLE",
      status: "AI_GENERATED",
      targetAudience: "Families and diaspora customers planning weekend meals.",
      listingIds: [listing.id],
      couponCode: "JOLLOF20",
      discount: {
        type: "percentage",
        value: 20
      },
      startsAt: new Date("2026-07-10T08:00:00.000Z"),
      endsAt: new Date("2026-07-12T20:00:00.000Z"),
      whatsappCopy:
        "Weekend family tray ready for pickup. Use JOLLOF20 for 20% off this weekend.",
      smsCopy: "Akwasaba Kitchen weekend tray: 20% off with JOLLOF20.",
      emailCopy:
        "Bring home a Ghanaian weekend family tray from Akwasaba Kitchen. Use code JOLLOF20.",
      socialCaption: "Weekend jollof plans are handled."
    }
  });

  const sentOrder = await prisma.order.upsert({
    where: { orderNumber: "BZ-2001" },
    update: {},
    create: {
      orderNumber: "BZ-2001",
      vendorId: publishedVendor.vendor.id,
      customerId: customer.id,
      type: "PICKUP",
      status: "SENT_TO_VENDOR",
      subtotal: "258.00",
      total: "258.00",
      customerNotes: "Please keep spice medium.",
      metadata: {
        fulfilmentMethod: "PICKUP",
        paymentStatus: "PAYMENT_NOT_REQUIRED_FOR_PHASE_3"
      },
      items: {
        create: [
          {
            listingId: listing.id,
            titleSnapshot: listing.title,
            quantity: 2,
            unitPrice: "129.00",
            totalPrice: "258.00"
          }
        ]
      }
    }
  });

  const readyOrder = await prisma.order.upsert({
    where: { orderNumber: "BZ-2002" },
    update: {},
    create: {
      orderNumber: "BZ-2002",
      vendorId: publishedVendor.vendor.id,
      customerId: customer.id,
      type: "PICKUP",
      status: "READY_FOR_PICKUP",
      subtotal: "129.00",
      total: "129.00",
      metadata: {
        fulfilmentMethod: "PICKUP",
        paymentStatus: "PAYMENT_NOT_REQUIRED_FOR_PHASE_3"
      },
      items: {
        create: [
          {
            listingId: listing.id,
            titleSnapshot: listing.title,
            quantity: 1,
            unitPrice: "129.00",
            totalPrice: "129.00"
          }
        ]
      }
    }
  });

  const completedOrder = await prisma.order.upsert({
    where: { orderNumber: "BZ-1999" },
    update: {},
    create: {
      orderNumber: "BZ-1999",
      vendorId: publishedVendor.vendor.id,
      customerId: customer.id,
      type: "PICKUP",
      status: "COMPLETED",
      subtotal: "129.00",
      total: "129.00",
      metadata: {
        fulfilmentMethod: "PICKUP",
        paymentStatus: "PAYMENT_NOT_REQUIRED_FOR_PHASE_3"
      },
      items: {
        create: [
          {
            listingId: listing.id,
            titleSnapshot: listing.title,
            quantity: 1,
            unitPrice: "129.00",
            totalPrice: "129.00"
          }
        ]
      }
    }
  });

  await seedOrderNotification(publishedVendor.owner.id, publishedVendor.vendor.id, sentOrder.id, sentOrder.orderNumber, "order.received");
  await seedOrderNotification(customer.id, publishedVendor.vendor.id, readyOrder.id, readyOrder.orderNumber, "order.ready");
  await seedOrderNotification(customer.id, publishedVendor.vendor.id, completedOrder.id, completedOrder.orderNumber, "review.request");

  const publishedQr = await prisma.qRCode.findUnique({
    where: { shortCode: "qr-akwasa" }
  });

  if (publishedQr) {
    await prisma.qRCode.update({
      where: { id: publishedQr.id },
      data: {
        scanCount: {
          increment: 2
        }
      }
    });

    await prisma.qRCodeScan.create({
      data: {
        qrCodeId: publishedQr.id,
        shortCode: "akwasa",
        userAgent: "seed-browser"
      }
    });

    await prisma.platformEvent.create({
      data: {
        type: "QRCodeScanned",
        vendorId: publishedVendor.vendor.id,
        entityType: "QRCode",
        entityId: publishedQr.id,
        payload: {
          shortCode: "akwasa",
          seedPhase: "phase-3"
        }
      }
    });
  }

  await prisma.platformEvent.create({
    data: {
      type: "OrderPlaced",
      vendorId: publishedVendor.vendor.id,
      orderId: sentOrder.id,
      entityType: "Order",
      entityId: sentOrder.id,
      payload: {
        orderNumber: sentOrder.orderNumber,
        seedPhase: "phase-3"
      }
    }
  });

  await prisma.platformEvent.create({
    data: {
      type: "ReviewRequested",
      vendorId: publishedVendor.vendor.id,
      orderId: completedOrder.id,
      entityType: "Order",
      entityId: completedOrder.id,
      payload: {
        orderNumber: completedOrder.orderNumber,
        seedPhase: "phase-3"
      }
    }
  });

  for (const vendor of [infoVendor.vendor, draftedVendor.vendor, pendingVendor.vendor, publishedVendor.vendor]) {
    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorRole: "ADMIN",
        vendorId: vendor.id,
        action: "vendor.seeded",
        entityType: "Vendor",
        entityId: vendor.id,
        after: {
          lifecycleStage: vendor.lifecycleStage,
          activationScore: vendor.activationScore,
          approvalStatus: vendor.approvalStatus
        },
        metadata: {
          seedPhase: "phase-2"
        }
      }
    });
  }
}

async function seedOrderNotification(
  recipientId: string,
  vendorId: string,
  orderId: string,
  orderNumber: string,
  templateKey: string,
) {
  await prisma.notification.create({
    data: {
      recipientId,
      vendorId,
      channel: "IN_APP",
      templateKey,
      status: "QUEUED",
      subject: `Order ${orderNumber}`,
      body: `Phase 3 seed notification for ${orderNumber}.`,
      metadata: {
        orderId,
        orderNumber,
        seedPhase: "phase-3"
      }
    }
  });
}

async function seedActivationVendor(input: {
  ownerEmail: string;
  ownerName: string;
  ownerPhone: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  categoryLabel: string;
  lifecycleStage: VendorLifecycleStage;
  approvalStatus: ApprovalStatus;
  shortCode: string;
  nextAction: string;
  aiStatus: ApprovalStatus;
  aiType: AIOutputType;
  output: Record<string, unknown>;
  timeline: Array<[VendorLifecycleStage, VendorLifecycleStage, string]>;
  publishedAt?: Date;
}) {
  const owner = await prisma.user.upsert({
    where: { email: input.ownerEmail },
    update: {
      fullName: input.ownerName,
      phone: input.ownerPhone
    },
    create: {
      email: input.ownerEmail,
      phone: input.ownerPhone,
      fullName: input.ownerName,
      role: "VENDOR_OWNER",
      marketingOptIn: true
    }
  });

  const vendor = await prisma.vendor.upsert({
    where: { slug: input.slug },
    update: {
      lifecycleStage: input.lifecycleStage,
      approvalStatus: input.approvalStatus,
      nextAction: input.nextAction,
      city: input.city,
      country: input.country,
      ownerId: owner.id
    },
    create: {
      name: input.name,
      slug: input.slug,
      description: `${input.name} is part of the BuzzyStores activation pipeline.`,
      categoryLabel: input.categoryLabel,
      phone: input.ownerPhone,
      email: input.ownerEmail,
      city: input.city,
      country: input.country,
      source: "phase_2_seed",
      lifecycleStage: input.lifecycleStage,
      approvalStatus: input.approvalStatus,
      nextAction: input.nextAction,
      activationScore: activationScoreFor(input.lifecycleStage),
      healthScore: input.lifecycleStage === "PUBLISHED" ? 78 : 0,
      ownerId: owner.id
    }
  });

  const storefront = await prisma.storefront.upsert({
    where: { slug: input.slug },
    update: {
      shortCode: input.shortCode,
      ...(input.publishedAt ? { publishedAt: input.publishedAt } : {})
    },
    create: {
      vendorId: vendor.id,
      slug: input.slug,
      shortCode: input.shortCode,
      headline: `${input.name} is getting ready on BuzzyStores`,
      shortDescription: `${input.categoryLabel} vendor in ${input.city}.`,
      longDescription: `${input.name} is preparing a QR-ready storefront for local commerce.`,
      ...(input.publishedAt ? { publishedAt: input.publishedAt } : {})
    }
  });

  await prisma.qRCode.upsert({
    where: { shortCode: `qr-${input.shortCode}` },
    update: {
      vendorId: vendor.id,
      storefrontId: storefront.id,
      targetUrl: `http://localhost:3000/v/${input.shortCode}`
    },
    create: {
      vendorId: vendor.id,
      storefrontId: storefront.id,
      shortCode: `qr-${input.shortCode}`,
      targetUrl: `http://localhost:3000/v/${input.shortCode}`,
      imageUrl: `/qr/${input.shortCode}.svg`,
      posterUrl: `/posters/${input.shortCode}.pdf`,
      scanCount: input.lifecycleStage === "PUBLISHED" ? 42 : 0
    }
  });

  for (const [fromStage, toStage, note] of input.timeline) {
    await prisma.vendorLifecycleEvent.create({
      data: {
        vendorId: vendor.id,
        fromStage,
        toStage,
        note,
        nextAction: input.nextAction,
        source: "SYSTEM",
        trigger: "SYSTEM",
        metadata: {
          seedPhase: "phase-2"
        }
      }
    });
  }

  const aiJob = await prisma.aIJob.create({
    data: {
      vendorId: vendor.id,
      requestedById: owner.id,
      agentType: input.aiType === "VENDOR_PROFILE" ? "vendor-intake" : "catalogue-builder",
      status: "COMPLETED",
      sourceInput: {
        vendorName: input.name,
        seedPhase: "phase-2"
      },
      provider: "mock",
      model: "mock-local-draft",
      promptVersion: input.aiType === "VENDOR_PROFILE" ? "vendor-intake.v1" : "catalogue-builder.v1",
      completedAt: new Date()
    }
  });

  await prisma.aIOutput.create({
    data: {
      aiJobId: aiJob.id,
      vendorId: vendor.id,
      type: input.aiType,
      output: input.output,
      confidence: 0.8,
      approvalStatus: input.aiStatus,
      ...(input.aiStatus === "ADMIN_APPROVED" || input.aiStatus === "VENDOR_APPROVED"
        ? {
            approvedById: owner.id,
            approvedAt: new Date(),
            reviewedById: owner.id,
            reviewedAt: new Date()
          }
        : {})
    }
  });

  return {
    owner,
    vendor,
    storefront
  };
}

function activationScoreFor(stage: string) {
  const scores: Record<string, number> = {
    INFO_COLLECTED: 35,
    STORE_DRAFTED: 45,
    PENDING_APPROVAL: 60,
    PUBLISHED: 72
  };

  return scores[stage] ?? 0;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
