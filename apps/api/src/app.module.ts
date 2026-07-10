import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { RolesGuard } from "./common/guards/roles.guard";
import { AdminModule } from "./modules/admin/admin.module";
import { AiModule } from "./modules/ai/ai.module";
import { AuditModule } from "./modules/audit/audit.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CampaignsModule } from "./modules/campaigns/campaigns.module";
import { CatalogModule } from "./modules/catalog/catalog.module";
import { EventsModule } from "./modules/events/events.module";
import { HealthModule } from "./modules/health/health.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { QrModule } from "./modules/qr/qr.module";
import { StorefrontsModule } from "./modules/storefronts/storefronts.module";
import { UsersModule } from "./modules/users/users.module";
import { VendorPortalModule } from "./modules/vendor-portal/vendor-portal.module";
import { VendorLifecycleModule } from "./modules/vendor-lifecycle/vendor-lifecycle.module";
import { VendorsModule } from "./modules/vendors/vendors.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    AuthModule,
    UsersModule,
    VendorsModule,
    VendorPortalModule,
    VendorLifecycleModule,
    CatalogModule,
    OrdersModule,
    CampaignsModule,
    EventsModule,
    AiModule,
    QrModule,
    StorefrontsModule,
    NotificationsModule,
    AuditModule,
    AdminModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ]
})
export class AppModule {}
