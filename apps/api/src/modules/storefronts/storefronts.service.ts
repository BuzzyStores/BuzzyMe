import { Injectable } from "@nestjs/common";
import { prisma } from "@buzzystores/database";
import { ApprovalStatus, CampaignStatus, VendorLifecycleStage } from "@buzzystores/types";

@Injectable()
export class StorefrontsService {
  async getPublicStorefrontByVendorSlug(vendorSlug: string) {
    const vendor = await prisma.vendor.findUnique({
      where: { slug: vendorSlug },
      include: {
        storefront: true,
        qrCodes: true,
        listings: {
          where: {
            approvalStatus: {
              in: [ApprovalStatus.ADMIN_APPROVED, ApprovalStatus.PUBLISHED]
            },
            publishedAt: {
              not: null
            }
          },
          orderBy: { title: "asc" }
        },
        campaigns: {
          where: { status: CampaignStatus.ACTIVE },
          orderBy: { updatedAt: "desc" },
          take: 3
        },
        reviews: {
          where: { approved: true },
          orderBy: { createdAt: "desc" },
          take: 5
        }
      }
    });

    return toPublicStorefront(vendor);
  }

  async getPublicStorefrontByShortCode(shortCode: string) {
    const storefront = await prisma.storefront.findUnique({
      where: { shortCode },
      include: {
        qrCodes: true,
        vendor: {
          include: {
            listings: {
              where: {
                approvalStatus: {
                  in: [ApprovalStatus.ADMIN_APPROVED, ApprovalStatus.PUBLISHED]
                },
                publishedAt: {
                  not: null
                }
              },
              orderBy: { title: "asc" }
            }
          }
        },
        campaigns: {
          where: { status: CampaignStatus.ACTIVE },
          orderBy: { updatedAt: "desc" },
          take: 3
        },
        reviews: {
          where: { approved: true },
          orderBy: { createdAt: "desc" },
          take: 5
        }
      }
    });

    if (!storefront) {
      return null;
    }

    return toPublicStorefront({
      ...storefront.vendor,
      storefront,
      qrCodes: storefront.qrCodes
    });
  }
}

function toPublicStorefront(vendor: unknown) {
  if (!isRecord(vendor)) {
    return null;
  }

  const storefront = isRecord(vendor.storefront) ? vendor.storefront : null;
  const isPublished =
    vendor.lifecycleStage === VendorLifecycleStage.PUBLISHED &&
    storefront?.publishedAt instanceof Date;

  if (!isPublished || !storefront) {
    return {
      vendorId: String(vendor.id),
      vendorName: String(vendor.name),
      slug: String(vendor.slug),
      shortCode: storefront ? String(storefront.shortCode) : null,
      published: false,
      status: String(vendor.lifecycleStage),
      message: "This storefront is not yet published.",
      listings: []
    };
  }

  const listings = Array.isArray(vendor.listings) ? vendor.listings : [];
  const activeCampaigns = Array.isArray(vendor.campaigns) ? vendor.campaigns : [];
  const reviews = Array.isArray(vendor.reviews) ? vendor.reviews : [];

  return {
    vendorId: String(vendor.id),
    vendorName: String(vendor.name),
    slug: String(vendor.slug),
    shortCode: String(storefront.shortCode),
    published: true,
    status: String(vendor.lifecycleStage),
    verificationBadge: true,
    headline: String(storefront.headline),
    description: String(storefront.longDescription ?? storefront.shortDescription ?? ""),
    city: typeof vendor.city === "string" ? vendor.city : null,
    country: typeof vendor.country === "string" ? vendor.country : null,
    openingHours: storefront.openingHours ?? null,
    pickupEnabled: listings.some((listing) => isRecord(listing) && listing.pickupEnabled === true),
    deliveryEnabled: listings.some((listing) => isRecord(listing) && listing.deliveryEnabled === true),
    averageRating: Number(vendor.averageRating ?? 0),
    reviewCount: Number(vendor.reviewCount ?? 0),
    activeCampaigns: activeCampaigns.filter(isRecord).map((campaign) => ({
      id: String(campaign.id),
      title: String(campaign.title ?? campaign.name),
      offerText: typeof campaign.offerText === "string" ? campaign.offerText : null,
      description: typeof campaign.description === "string" ? campaign.description : null,
      couponCode: typeof campaign.couponCode === "string" ? campaign.couponCode : null,
      campaignUrl: typeof campaign.campaignUrl === "string" ? campaign.campaignUrl : `/campaigns/${campaign.qrShortCode ?? campaign.id}`,
      selectedListingIds: Array.isArray(campaign.selectedListingIds)
        ? campaign.selectedListingIds.map(String)
        : Array.isArray(campaign.listingIds)
          ? campaign.listingIds.map(String)
          : []
    })),
    reviews: reviews.filter(isRecord).map((review) => ({
      id: String(review.id),
      rating: Number(review.rating),
      comment: typeof review.comment === "string" ? review.comment : null,
      createdAt: review.createdAt instanceof Date ? review.createdAt.toISOString() : String(review.createdAt)
    })),
    listings: listings.filter(isRecord).map((listing) => ({
      id: String(listing.id),
      title: String(listing.title),
      price: Number(listing.price),
      currency: String(listing.currency),
      shortDescription: String(listing.shortDescription ?? ""),
      pickupEnabled: Boolean(listing.pickupEnabled),
      deliveryEnabled: Boolean(listing.deliveryEnabled)
    }))
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
