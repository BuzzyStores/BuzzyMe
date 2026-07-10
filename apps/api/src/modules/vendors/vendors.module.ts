import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module";
import { VendorLifecycleModule } from "../vendor-lifecycle/vendor-lifecycle.module";
import { VendorsController } from "./vendors.controller";
import { VendorsService } from "./vendors.service";

@Module({
  imports: [AiModule, VendorLifecycleModule],
  controllers: [VendorsController],
  providers: [VendorsService],
  exports: [VendorsService]
})
export class VendorsModule {}
