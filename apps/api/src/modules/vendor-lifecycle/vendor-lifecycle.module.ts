import { Module } from "@nestjs/common";
import { VendorLifecycleController } from "./vendor-lifecycle.controller";
import { VendorLifecycleService } from "./vendor-lifecycle.service";

@Module({
  controllers: [VendorLifecycleController],
  providers: [VendorLifecycleService],
  exports: [VendorLifecycleService]
})
export class VendorLifecycleModule {}
