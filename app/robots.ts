/**
 * TRIKAL VAANI — trikalvaani.com
 * Chief Vedic Architect: Rohiit Gupta
 * FILE TO PASTE → app/robots.ts
 * Version: v1.1 — Updated AI crawler list (Feb 2026 agents)
 * Purpose: Allow ALL crawlers — Google, Bing, AI bots, social bots
 */
import { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ── Google — all bots ───────────────────────────────
      { userAgent: "Googlebot", allow: "/" },
      { userAgent: "Googlebot-Image", allow: "/" },
      { userAgent: "Googlebot-Video", allow: "/" },
      { userAgent: "Googlebot-News", allow: "/" },
      { userAgent: "Google-InspectionTool", allow: "/" },
      { userAgent: "GoogleOther", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },        // Gemini training
      { userAgent: "Google-NotebookLM", allow: "/" },       // NotebookLM
      { userAgent: "Google-CloudVertexBot", allow: "/" },   // Vertex AI

      // ── Bing & Microsoft (Copilot) ──────────────────────
      { userAgent: "Bingbot", allow: "/" },
      { userAgent: "msnbot", allow: "/" },
      { userAgent: "msnbot-media", allow: "/" },
      { userAgent: "BingPreview", allow: "/" },

      // ── OpenAI (ChatGPT) ────────────────────────────────
      { userAgent: "GPTBot", allow: "/" },                  // training
      { userAgent: "OAI-SearchBot", allow: "/" },           // search index
      { userAgent: "ChatGPT-User", allow: "/" },            // live user fetch

      // ── Anthropic (Claude) — CURRENT agents ─────────────
      { userAgent: "ClaudeBot", allow: "/" },               // chat citation fetch
      { userAgent: "Claude-User", allow: "/" },             // live user fetch
      { userAgent: "Claude-SearchBot", allow: "/" },        // search index
      { userAgent: "anthropic-ai", allow: "/" },            // legacy training
      { userAgent: "Claude-Web", allow: "/" },              // legacy

      // ── Perplexity ──────────────────────────────────────
      { userAgent: "PerplexityBot", allow: "/" },           // index builder
      { userAgent: "Perplexity-User", allow: "/" },         // live user fetch

      // ── Apple (Spotlight + AI) ──────────────────────────
      { userAgent: "Applebot", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },       // Apple Intelligence

      // ── Amazon, Meta, Mistral, DuckDuckGo AI, others ────
      { userAgent: "Amazonbot", allow: "/" },
      { userAgent: "Meta-ExternalAgent", allow: "/" },
      { userAgent: "Meta-ExternalFetcher", allow: "/" },
      { userAgent: "FacebookBot", allow: "/" },
      { userAgent: "MistralAI-User", allow: "/" },
      { userAgent: "DuckAssistBot", allow: "/" },
      { userAgent: "cohere-ai", allow: "/" },
      { userAgent: "Bytespider", allow: "/" },              // ByteDance / TikTok AI
      { userAgent: "CCBot", allow: "/" },                   // Common Crawl
      { userAgent: "AwarioRssBot", allow: "/" },

      // ── Social Media Crawlers ───────────────────────────
      { userAgent: "Twitterbot", allow: "/" },
      { userAgent: "facebookexternalhit", allow: "/" },
      { userAgent: "LinkedInBot", allow: "/" },
      { userAgent: "WhatsApp", allow: "/" },
      { userAgent: "Slackbot", allow: "/" },
      { userAgent: "TelegramBot", allow: "/" },

      // ── Other major search engines ──────────────────────
      { userAgent: "Slurp", allow: "/" },           // Yahoo
      { userAgent: "DuckDuckBot", allow: "/" },
      { userAgent: "Baiduspider", allow: "/" },
      { userAgent: "YandexBot", allow: "/" },
      { userAgent: "Sogou", allow: "/" },

      // ── Catch-all — everyone else ───────────────────────
      { userAgent: "*", allow: "/" },
    ],
    sitemap: "https://trikalvaani.com/sitemap.xml",
    host: "https://trikalvaani.com",
  };
}
