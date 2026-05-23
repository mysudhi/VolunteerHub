import type { Request, Response, NextFunction } from "express";

export interface TenantContext {
  organizationId?: string;
  userId?: string;
}

declare module "express-serve-static-core" {
  interface Request {
    tenant?: TenantContext;
  }
}

export function tenantContextMiddleware(req: Request, _res: Response, next: NextFunction) {
  const organizationId = req.header("x-org-id");
  const userId = req.header("x-user-id");

  req.tenant = {
    organizationId: organizationId ?? undefined,
    userId: userId ?? undefined
  };
  next();
}
