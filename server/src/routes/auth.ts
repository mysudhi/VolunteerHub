import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/db.js";
import { hashPassword, verifyPassword } from "../auth/password.js";
import { signToken } from "../auth/jwt.js";
import { exchangeCodeForTokens, fetchGoogleUserInfo, buildGoogleOAuthUrl } from "../auth/google.js";
import { authRequired } from "../middleware/auth.js";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1),
  lastName: z.string().min(1)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

authRouter.post("/register", async (req, res) => {
  try {
    const body = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    });

    if (existingUser) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const passwordHash = await hashPassword(body.password);

    const user = await prisma.user.create({
      data: {
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        passwordHash
      }
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: err.issues });
      return;
    }
    console.error("Registration error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const body = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: body.email }
    });

    if (!user || !user.passwordHash) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const valid = await verifyPassword(body.password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: "Account is deactivated" });
      return;
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: err.issues });
      return;
    }
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

authRouter.get("/google", (_req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL;

  if (!clientId || !redirectUri) {
    res.status(503).json({ error: "Google OAuth is not configured", configured: false });
    return;
  }

  const url = buildGoogleOAuthUrl(clientId, redirectUri);
  res.json({ url, configured: true });
});

authRouter.get("/google/status", (_req, res) => {
  const configured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CALLBACK_URL);
  res.json({ configured });
});

authRouter.get("/google/callback", async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  try {
    const code = req.query.code as string | undefined;
    if (!code) {
      res.redirect(`${frontendUrl}?auth_error=${encodeURIComponent("Missing authorization code")}`);
      return;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_CALLBACK_URL;

    if (!clientId || !clientSecret || !redirectUri) {
      res.redirect(`${frontendUrl}?auth_error=${encodeURIComponent("Google OAuth is not configured")}`);
      return;
    }

    const tokens = await exchangeCodeForTokens(code, clientId, clientSecret, redirectUri);
    const googleUser = await fetchGoogleUserInfo(tokens.access_token);

    let user = await prisma.user.findUnique({
      where: { googleId: googleUser.id }
    });

    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: googleUser.email }
      });

      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: googleUser.id }
        });
      } else {
        user = await prisma.user.create({
          data: {
            email: googleUser.email,
            firstName: googleUser.given_name,
            lastName: googleUser.family_name,
            googleId: googleUser.id
          }
        });
      }
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.redirect(`${frontendUrl}?token=${token}`);
  } catch (err) {
    console.error("Google OAuth error:", err);
    res.redirect(`${frontendUrl}?auth_error=${encodeURIComponent("Google authentication failed")}`);
  }
});

authRouter.get("/me", authRequired, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
        phone: true,
        createdAt: true
      }
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
