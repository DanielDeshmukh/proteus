import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

interface ModelRole {
  description: string;
  current: string;
  fallbacks: string[];
  testPrompt: string;
  testModel: string;
  type?: "embedding";
}

interface ModelsConfig {
  roles: Record<string, ModelRole>;
  lastHealthCheck: string | null;
  lastHealthyModels: Record<string, string>;
}

const CONFIG_PATH = join(process.cwd(), "models.json");

function loadConfig(): ModelsConfig {
  if (!existsSync(CONFIG_PATH)) {
    throw new Error(`models.json not found at ${CONFIG_PATH}`);
  }
  return JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
}

export function getModelForRole(role: string): string {
  const config = loadConfig();
  const roleConfig = config.roles[role];
  if (!roleConfig) {
    throw new Error(`Unknown model role: ${role}. Available: ${Object.keys(config.roles).join(", ")}`);
  }
  return roleConfig.current;
}

export function getEmbeddingModel(): string {
  return getModelForRole("gap-analyzer");
}

export function updateModelForRole(role: string, newModel: string): void {
  const config = loadConfig();
  if (!config.roles[role]) {
    throw new Error(`Unknown model role: ${role}`);
  }
  config.roles[role].current = newModel;
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n");
}

export function recordHealthCheck(healthyModels: Record<string, string>): void {
  const config = loadConfig();
  config.lastHealthCheck = new Date().toISOString();
  config.lastHealthyModels = healthyModels;
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n");
}

export function getAllRoles(): Record<string, ModelRole> {
  return loadConfig().roles;
}

export type { ModelRole, ModelsConfig };
