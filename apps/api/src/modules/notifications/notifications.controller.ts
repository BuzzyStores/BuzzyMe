import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserRole } from "@buzzystores/types";
import { Roles } from "../../common/guards/roles.decorator";
import { SendNotificationDto } from "./dto/send-notification.dto";
import { NotificationsService } from "./notifications.service";

@ApiTags("notifications")
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post("send")
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  send(@Body() dto: SendNotificationDto) {
    return this.notificationsService.send(dto);
  }
}
