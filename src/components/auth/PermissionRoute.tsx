import { Navigate } from "react-router";
import { usePermissions } from "../../hooks/usePermissions";
import type { PermissionResource, PermissionAction } from "../../types";

interface PermissionRouteProps {
  resource: PermissionResource;
  action: PermissionAction;
  children: React.ReactNode;
}

export default function PermissionRoute({
  resource,
  action,
  children,
}: PermissionRouteProps) {
  const { can } = usePermissions();

  if (!can(resource, action)) {
    return <Navigate to="/no-autizado" replace />;
  }

  return <>{children}</>;
}
