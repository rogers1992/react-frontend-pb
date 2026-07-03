import { useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import type { PermissionResource, PermissionAction } from "../types";

interface UsePermissions {
  can: (resource: PermissionResource, action: PermissionAction) => boolean;
  canAny: (
    resource: PermissionResource,
    actions: PermissionAction[],
  ) => boolean;
  hasRole: (name: string) => boolean;
  isAuthenticated: boolean;
  user: ReturnType<typeof useAuth>["user"];
}

export function usePermissions(): UsePermissions {
  const { user, isAuthenticated } = useAuth();

  const permissions = useMemo(
    () => user?.role?.permissions ?? {},
    [user?.role?.permissions],
  );

  const can = useCallback(
    (resource: PermissionResource, action: PermissionAction): boolean => {
      const allowed = permissions[resource];
      return Array.isArray(allowed) && allowed.includes(action);
    },
    [permissions],
  );

  const canAny = useCallback(
    (
      resource: PermissionResource,
      actions: PermissionAction[],
    ): boolean => {
      const allowed = permissions[resource];
      if (!Array.isArray(allowed)) return false;
      return actions.some((a) => allowed.includes(a));
    },
    [permissions],
  );

  const hasRole = useCallback(
    (name: string): boolean => user?.role?.name === name,
    [user?.role?.name],
  );

  return useMemo(
    () => ({ can, canAny, hasRole, isAuthenticated, user }),
    [can, canAny, hasRole, isAuthenticated, user],
  );
}
