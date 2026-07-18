import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/lgu-path";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/super-admin/", "/login/", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
