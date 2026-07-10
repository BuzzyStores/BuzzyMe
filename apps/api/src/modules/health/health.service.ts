import { Injectable } from "@nestjs/common";
import { checkDatabaseConnection } from "@buzzystores/database";
import type { ApiHealth } from "@buzzystores/types";

@Injectable()
export class HealthService {
  getHealth(): ApiHealth {
    return {
      status: "ok",
      service: "buzzystores-api",
      timestamp: new Date().toISOString()
    };
  }

  async getDatabaseHealth() {
    return checkDatabaseConnection();
  }
}
