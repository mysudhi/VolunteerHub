export const roles = ["SuperAdmin", "OrgAdmin", "Volunteer"] as const;
export type Role = (typeof roles)[number];
