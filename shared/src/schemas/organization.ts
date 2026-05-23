import { z } from "zod";

export const organizationThemeSchema = z.object({
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/).default("#2563eb"),
  fontFamily: z.string().min(1).default("Inter")
});

export type OrganizationTheme = z.infer<typeof organizationThemeSchema>;
