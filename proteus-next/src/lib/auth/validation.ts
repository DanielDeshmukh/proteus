import { z } from "zod";

// ─── Email validation ──────────────────────────────────
export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(255, "Email must be under 255 characters")
  .email("Enter a valid email address")
  .refine(
    (e) => !/[<>"'`;\\]/.test(e),
    "Email contains invalid characters"
  );

// ─── Password validation ───────────────────────────────
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be under 128 characters")
  .refine((p) => /[A-Z]/.test(p), "Include at least one uppercase letter")
  .refine((p) => /[a-z]/.test(p), "Include at least one lowercase letter")
  .refine((p) => /[0-9]/.test(p), "Include at least one number")
  .refine(
    (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(p),
    "Include at least one special character"
  )
  .refine(
    (p) => !/[<>'";`\\]/.test(p),
    "Password contains disallowed characters"
  );

// ─── Name validation ───────────────────────────────────
export const nameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must be under 100 characters")
  .refine(
    (n) => /^[a-zA-ZÀ-ÿ0-9\s'-]+$/.test(n),
    "Name contains invalid characters"
  );

// ─── Compound schemas ──────────────────────────────────
export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const signinSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// ─── Password strength indicator ───────────────────────
export function getPasswordStrength(pw: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pw)) score++;

  if (score <= 2) return { score, label: "Weak", color: "#ef4444" };
  if (score <= 3) return { score, label: "Fair", color: "#f59e0b" };
  if (score <= 4) return { score, label: "Good", color: "#c9a962" };
  return { score, label: "Strong", color: "#22c55e" };
}

// ─── Sanitize input (defense-in-depth) ─────────────────
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "")
    .replace(/['";`\\]/g, "")
    .trim();
}
