import type { NextFunction, Request, Response } from "express";

const hits = new Map<string, { count: number; resetAt: number }>();
const windowMs = 60_000;
const maxRequests = 900;

export function apiSecurity(req: Request, res: Response, next: NextFunction) {
  res.setHeader("x-content-type-options", "nosniff");
  res.setHeader("x-frame-options", "DENY");
  res.setHeader("referrer-policy", "no-referrer");
  res.setHeader("permissions-policy", "camera=(), microphone=(), geolocation=()");

  const key = req.ip ?? "unknown";
  const now = Date.now();
  const current = hits.get(key);
  const bucket = current && current.resetAt > now ? current : { count: 0, resetAt: now + windowMs };
  bucket.count += 1;
  hits.set(key, bucket);

  res.setHeader("x-ratelimit-limit", String(maxRequests));
  res.setHeader("x-ratelimit-remaining", String(Math.max(0, maxRequests - bucket.count)));
  if (bucket.count > maxRequests) {
    return res.status(429).json({ success: false, error: { code: "RATE_LIMITED", message: "Too many requests." }, meta: { requestId: res.locals.requestId } });
  }

  const suspicious = ["../", "%2e%2e", "<script", " union select "];
  const target = `${req.originalUrl} ${JSON.stringify(req.body ?? {})}`.toLowerCase();
  if (suspicious.some((pattern) => target.includes(pattern))) {
    return res.status(400).json({ success: false, error: { code: "REQUEST_BLOCKED", message: "Request blocked by API security rules." }, meta: { requestId: res.locals.requestId } });
  }

  next();
}
