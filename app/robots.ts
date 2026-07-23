import type { MetadataRoute } from "next";

const BASE_URL = "https://cam-pulse.vercel.app";

/**
 * Generates the robots.txt for CamPulse.
 *
 * - The public landing page (/) is open to all crawlers.
 * - All authenticated routes and API endpoints are disallowed
 *   to prevent accidental indexing of private user data.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/student/",
          "/staff/",
          "/hod/",
          "/admin/",
          "/api/",
          "/actions/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
