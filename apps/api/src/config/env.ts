import { validateEnv } from "@buzzystores/config";

export function loadEnv() {
  return validateEnv(process.env);
}
