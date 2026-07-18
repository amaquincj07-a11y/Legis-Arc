import type { MetadataRoute } from "next";
import {
  LGU_PUBLIC_SECTIONS,
  buildLguPath,
  getSiteUrl,
} from "@/lib/lgu-path";
import { fetchPublicLgusAction } from "@/lib/public-lgu-actions";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  const result = await fetchPublicLgusAction();
  if (!result.success) {
    return entries;
  }

  for (const lgu of result.data) {
    for (const section of LGU_PUBLIC_SECTIONS) {
      const path = buildLguPath(lgu.province, lgu.municipality, section);
      entries.push({
        url: `${siteUrl}${path}`,
        lastModified: now,
        changeFrequency: section === "" ? "weekly" : "daily",
        priority: section === "" ? 0.9 : 0.7,
      });
    }
  }

  return entries;
}
