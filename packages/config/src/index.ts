import { z } from "zod";

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  API_BASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(24),
  AI_PROVIDER: z.string().default("mock"),
  EMAIL_PROVIDER: z.string().default("mock"),
  SMS_PROVIDER: z.string().default("mock"),
  WHATSAPP_PROVIDER: z.string().default("mock")
});

export type AppEnv = z.infer<typeof envSchema>;

export function validateEnv(input: NodeJS.ProcessEnv): AppEnv {
  return envSchema.parse(input);
}
