import { checkDatabaseConnection } from "./index";

describe("database connection", () => {
  it("runs a simple query against the provided Prisma-compatible client", async () => {
    const queryRaw = jest.fn().mockResolvedValue([{ value: 1 }]);

    await expect(checkDatabaseConnection({ $queryRaw: queryRaw } as never)).resolves.toEqual({
      connected: true,
      provider: "postgresql"
    });

    expect(queryRaw).toHaveBeenCalledTimes(1);
  });
});
