import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module";
import { OrdersModule } from "../orders/orders.module";
import { VendorPortalController } from "./vendor-portal.controller";
import { VendorPortalService } from "./vendor-portal.service";

@Module({
  imports: [AiModule, OrdersModule],
  controllers: [VendorPortalController],
  providers: [VendorPortalService]
})
export class VendorPortalModule {}
