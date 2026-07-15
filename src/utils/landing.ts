import type { PermissionResource, PermissionAction } from "../types";

type Permissions = Record<string, string[]>;

const PRIORITY: {
  path: string;
  resource?: PermissionResource;
  action?: PermissionAction;
}[] = [
  { path: "/dashboard", resource: "reports", action: "read" },
  { path: "/sales", resource: "sales", action: "read" },
  { path: "/inventory", resource: "inventory", action: "read" },
  { path: "/products", resource: "products", action: "read" },
  { path: "/customers", resource: "customers", action: "read" },
  { path: "/purchases", resource: "purchases", action: "read" },
  { path: "/notifications" },
  { path: "/profile" },
];

export function resolveLandingPath(
  permissions: Permissions | undefined | null,
): string {
  const perms = permissions ?? {};
  for (const candidate of PRIORITY) {
    if (!candidate.resource || !candidate.action) return candidate.path;
    const allowed = perms[candidate.resource];
    if (Array.isArray(allowed) && allowed.includes(candidate.action)) {
      return candidate.path;
    }
  }
  return "/notifications";
}