import { HealthService } from "../health.service";

describe("HealthService", () => {
  it("returns the API health status", () => {
    const service = new HealthService();
    const response = service.getHealth();

    expect(response.status).toBe("ok");
    expect(response.service).toBe("buzzystores-api");
    expect(typeof response.timestamp).toBe("string");
  });
});
