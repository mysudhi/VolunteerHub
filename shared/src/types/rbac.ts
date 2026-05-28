export const roles = ["SuperAdmin", "OrgAdmin", "Contributor"] as const;
export type Role = (typeof roles)[number];
