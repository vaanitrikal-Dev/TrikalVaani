/**
 * TRIKAL VAANI — trikalvaani.com
 * Chief Vedic Architect: Rohiit Gupta
 * FILE TO PASTE → app/robots.ts
 * Purpose: Allow ALL crawlers — Google, Bing, AI bots, social bots
 */

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Google — all bots
      { userAgent: "Googlebot", allow: "/" },
      { userAgent: "Googlebot-Image", allow: "/" },
      { userAgent: "Googlebot-Video", allow: "/" },
      { userAgent: "Googlebot-News", allow: "/" },
      { userAgent: "Google-InspectionTool", allow: "/" },
      { userAgent: "GoogleOther", allow: "/" },

      // Bing & Microsoft
      { userAgent: "Bingbot", allow: "/" },
      { userAgent: "msnbot", allow: "/" },
      { userAgent: "msnbot-media", allow: "/" },
      { userAgent: "BingPreview", allow: "/" },

      // AI Search Crawlers — ChatGPT, Perplexity, Gemini, Claude
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Applebot", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "Claude-Web", allow: "/" },
      { userAgent: "Gemini", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "Meta-ExternalAgent", allow: "/" },
      { userAgent: "Meta-ExternalFetcher", allow: "/" },
      { userAgent: "cohere-ai", allow: "/" },
      { userAgent: "AwarioRssBot", allow: "/" },

      // Social Media Crawlers
      { userAgent: "Twitterbot", allow: "/" },
      { userAgent: "facebookexternalhit", allow: "/" },
      { userAgent: "LinkedInBot", allow: "/" },
      { userAgent: "WhatsApp", allow: "/" },
      { userAgent: "Slackbot", allow: "/" },
      { userAgent: "TelegramBot", allow: "/" },

      // Other major search engines
      { userAgent: "Slurp", allow: "/" },           // Yahoo
      { userAgent: "DuckDuckBot", allow: "/" },
      { userAgent: "Baiduspider", allow: "/" },
      { userAgent: "YandexBot", allow: "/" },
      { userAgent: "Sogou", allow: "/" },

      // Catch-all — everyone else
      { userAgent: "*", allow: "/" },
    ],
    sitemap: "https://trikalvaani.com/sitemap.xml",
    host: "https://trikalvaani.com",
  };
}