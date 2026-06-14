import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://schoolerp.local";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login"],
      disallow: ["/api/", "/super-admin/", "/school-admin/", "/teacher/", "/student/", "/parent/"]
    },
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
