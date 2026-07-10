import { Test } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("API health", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api");
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("/api/health (GET)", async () => {
    await request(app.getHttpServer()).get("/api/health").expect(200).expect((response) => {
      expect(response.body.status).toBe("ok");
      expect(response.body.service).toBe("buzzystores-api");
    });
  });
});
