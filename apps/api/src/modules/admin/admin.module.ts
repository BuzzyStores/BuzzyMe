import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module";
import { CampaignsModule } from "../campaigns/campaigns.module";
import { EventsModule } from "../events/events.module";
import { VendorLifecycleModule } from "../vendor-lifecycle/vendor-lifecycle.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

@Module({
  imports: [AiModule, CampaignsModule, EventsModule, VendorLifecycleModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService]
})
export class AdminModule {}
