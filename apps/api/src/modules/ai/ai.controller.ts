import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserRole } from "@buzzystores/types";
import { Roles } from "../../common/guards/roles.decorator";
import { AiService } from "./ai.service";
import { CreateAiJobDto } from "./dto/create-ai-job.dto";

@ApiTags("ai")
@Controller("ai")
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("jobs")
  @Roles(UserRole.VENDOR_OWNER, UserRole.VENDOR_STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  createDraftJob(@Body() dto: CreateAiJobDto) {
    return this.aiService.createDraftJob(dto);
  }
}
