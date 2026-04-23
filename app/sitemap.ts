import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://trikalvaani.com";
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/services`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/founder`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/services/ex-back-reading`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/services/toxic-boss-radar`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/services/career-pivot`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/services/property-yog`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/services/compatibility`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/services/child-destiny`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/services/wealth-reading`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/services/spiritual-purpose`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/refund`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];
}