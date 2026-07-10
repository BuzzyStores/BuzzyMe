import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserRole } from "@buzzystores/types";
import { CurrentActor, type CurrentActor as CurrentActorValue } from "../../common/guards/current-actor.decorator";
import { Roles } from "../../common/guards/roles.decorator";
import { AdminService } from "./admin.service";
import { RejectAiOutputDto } from "./dto/reject-ai-output.dto";
import { RejectListingDto } from "./dto/reject-listing.dto";

@ApiTags("admin")
@Controller("admin")
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("ai-outputs")
  listAiOutputs() {
    return this.adminService.listAiOutputs();
  }

  @Get("ai-outputs/:id")
  getAiOutput(@Param("id") id: string) {
    return this.adminService.getAiOutput(id);
  }

  @Post("ai-outputs/:id/approve")
  approveAiOutput(@Param("id") id: string, @CurrentActor() actor: CurrentActorValue) {
    return this.adminService.approveAiOutput(id, actor);
  }

  @Post("ai-outputs/:id/reject")
  rejectAiOutput(
    @Param("id") id: string,
    @Body() dto: RejectAiOutputDto,
    @CurrentActor() actor: CurrentActorValue,
  ) {
    return this.adminService.rejectAiOutput(id, actor, dto.reason);
  }

  @Post("vendors/:id/approve")
  approveVendor(@Param("id") id: string, @CurrentActor() actor: CurrentActorValue) {
    return this.adminService.approveVendor(id, actor);
  }

  @Post("vendors/:id/publish")
  publishVendor(@Param("id") id: string, @CurrentActor() actor: CurrentActorValue) {
    return this.adminService.publishVendor(id, actor);
  }

  @Get("listings")
  listListings(@Query("status") status?: string) {
    return this.adminService.listListings(status);
  }

  @Post("listings/:id/approve")
  approveListing(@Param("id") id: string, @CurrentActor() actor: CurrentActorValue) {
    return this.adminService.approveListing(id, actor);
  }

  @Post("listings/:id/reject")
  rejectListing(
    @Param("id") id: string,
    @Body() dto: RejectListingDto,
    @CurrentActor() actor: CurrentActorValue,
  ) {
    return this.adminService.rejectListing(id, actor, dto.reason);
  }

  @Get("orders")
  listOrders() {
    return this.adminService.listOrders();
  }
}
