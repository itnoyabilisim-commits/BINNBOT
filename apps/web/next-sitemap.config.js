// apps/web/next-sitemap.config.js
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.binnbot.com";

module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  changefreq: "weekly",
  priority: 0.7,
  sitemapSize: 7000,
  exclude: ["/_next/*"],
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/" }],
    additionalSitemaps: [`${SITE_URL}/sitemap.xml`],
  },
};
