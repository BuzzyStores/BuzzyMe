import { Injectable } from "@nestjs/common";
import type { AIOutputType } from "@prisma/client";
import { MockAiProvider } from "@buzzystores/ai";
import { prisma } from "@buzzystores/database";
import { ApprovalStatus, UserRole } from "@buzzystores/types";
import type { CreateAiJobDto } from "./dto/create-ai-job.dto";

@Injectable()
export class AiService {
  private readonly provider = new MockAiProvider();

  async createDraftJob(dto: CreateAiJobDto) {
    return this.runDraftJob({
      agentType: dto.agentType,
      outputType: dto.agentType === "catalogue-builder" ? "LISTING_DRAFT" : "VENDOR_PROFILE",
      sourceInput: dto.sourceInput,
      promptVersion: dto.promptVersion ?? `${dto.agentType}.v1`,
      approvalStatus: ApprovalStatus.DRAFT,
      ...(dto.vendorId ? { vendorId: dto.vendorId } : {})
    });
  }

  async runDraftJob(input: {
    vendorId?: string;
    requestedById?: string;
    agentType: CreateAiJobDto["agentType"];
    outputType: AIOutputType;
    sourceInput: Record<string, unknown>;
    promptVersion: string;
    approvalStatus?: ApprovalStatus;
  }) {
    const result = await this.provider.createDraft({
      agentType: input.agentType,
      sourceInput: input.sourceInput,
      promptVersion: input.promptVersion
    });

    const job = await prisma.aIJob.create({
      data: {
        agentType: input.agentType,
        status: "COMPLETED",
        sourceInput: input.sourceInput,
        provider: result.provider,
        model: result.model,
        promptVersion: input.promptVersion,
        completedAt: new Date(),
        ...(input.vendorId ? { vendorId: input.vendorId } : {}),
        ...(input.requestedById ? { requestedById: input.requestedById } : {})
      }
    });

    const output = await prisma.aIOutput.create({
      data: {
        aiJobId: job.id,
        type: input.outputType,
        output: result.output,
        approvalStatus: input.approvalStatus ?? ApprovalStatus.DRAFT,
        ...(input.vendorId ? { vendorId: input.vendorId } : {}),
        ...(typeof result.confidence === "number" ? { confidence: result.confidence } : {})
      }
    });

    return {
      job,
      output,
      result
    };
  }

  async listOutputs(filters: { vendorId?: string; approvalStatus?: ApprovalStatus } = {}) {
    return prisma.aIOutput.findMany({
      where: {
        ...(filters.vendorId ? { vendorId: filters.vendorId } : {}),
        ...(filters.approvalStatus ? { approvalStatus: filters.approvalStatus } : {})
      },
      include: {
        aiJob: {
          include: {
            vendor: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async getOutput(id: string) {
    return prisma.aIOutput.findUniqueOrThrow({
      where: { id },
      include: {
        aiJob: {
          include: {
            vendor: true
          }
        }
      }
    });
  }

  async approveOutput(id: string, actor: { id: string; role: UserRole }, source: "admin" | "vendor") {
    const output = await prisma.aIOutput.findUniqueOrThrow({
      where: { id },
      include: { aiJob: true }
    });

    const nextStatus = source === "admin" ? ApprovalStatus.ADMIN_APPROVED : ApprovalStatus.VENDOR_APPROVED;

    const updated = await prisma.aIOutput.update({
      where: { id },
      data: {
        approvalStatus: nextStatus,
        approvedById: actor.id,
        approvedAt: new Date(),
        reviewedById: actor.id,
        reviewedAt: new Date()
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        actorRole: actor.role,
        action: source === "admin" ? "ai_output.admin_approved" : "ai_output.vendor_approved",
        entityType: "AIOutput",
        entityId: id,
        before: { approvalStatus: output.approvalStatus },
        after: { approvalStatus: nextStatus },
        metadata: {
          source,
          aiJobId: output.aiJobId,
          outputType: output.type
        },
        ...((output.vendorId ?? output.aiJob.vendorId)
          ? { vendorId: String(output.vendorId ?? output.aiJob.vendorId) }
          : {})
      }
    });

    return updated;
  }

  async rejectOutput(
    id: string,
    actor: { id: string; role: UserRole },
    source: "admin" | "vendor",
    reason?: string,
  ) {
    const output = await prisma.aIOutput.findUniqueOrThrow({
      where: { id },
      include: { aiJob: true }
    });

    const updated = await prisma.aIOutput.update({
      where: { id },
      data: {
        approvalStatus: ApprovalStatus.REJECTED,
        reviewedById: actor.id,
        reviewedAt: new Date(),
        ...(reason ? { reviewNote: reason } : {})
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        actorRole: actor.role,
        action: source === "admin" ? "ai_output.admin_rejected" : "ai_output.vendor_change_requested",
        entityType: "AIOutput",
        entityId: id,
        before: { approvalStatus: output.approvalStatus },
        after: { approvalStatus: ApprovalStatus.REJECTED },
        metadata: {
          source,
          reason: reason ?? null,
          aiJobId: output.aiJobId,
          outputType: output.type
        },
        ...((output.vendorId ?? output.aiJob.vendorId)
          ? { vendorId: String(output.vendorId ?? output.aiJob.vendorId) }
          : {})
      }
    });

    return updated;
  }
}
