import { Module } from "@nestjs/common";
import { EventsModule } from "../events/events.module";
import { VendorLifecycleModule } from "../vendor-lifecycle/vendor-lifecycle.module";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";

@Module({
  imports: [EventsModule, VendorLifecycleModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService]
})
export class OrdersModule {}
