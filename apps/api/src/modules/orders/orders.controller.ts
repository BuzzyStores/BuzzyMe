import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrdersService } from "./orders.service";

@ApiTags("orders")
@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get(":id/track")
  trackOrder(@Param("id") id: string) {
    return this.ordersService.trackOrder(id);
  }

  @Post()
  createOrder(@Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(dto);
  }
}
