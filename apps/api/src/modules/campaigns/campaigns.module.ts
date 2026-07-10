import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module";
import { EventsModule } from "../events/events.module";
import { VendorLifecycleModule } from "../vendor-lifecycle/vendor-lifecycle.module";
import { CampaignsController } from "./campaigns.controller";
import { CampaignsService } from "./campaigns.service";

@Module({
  imports: [AiModule, EventsModule, VendorLifecycleModule],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService]
})
export class CampaignsModule {}
