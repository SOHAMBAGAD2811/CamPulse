import type { Metadata } from "next";
import React from "react";
import { Analytics } from "@vercel/analytics/react";
import Providers from "./providers";
import "./globals.css";

const BASE_URL = "https://cam-pulse.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "CamPulse — Campus Life, Coordinated",
    template: "%s | CamPulse",
  },
  description:
    "CamPulse is the all-in-one platform for students and staff to coordinate extracurriculars, manage campus events, track activity logs, and sync college life seamlessly.",
  keywords: [
    "CamPulse",
    "campus management",
    "student portal",
    "extracurricular management",
    "college event management",
    "KKW college",
    "student activities",
    "staff portal",
    "HOD approvals",
    "college platform",
  ],
  authors: [{ name: "CamPulse", url: BASE_URL }],
  creator: "CamPulse",
  publisher: "CamPulse",
  applicationName: "CamPulse",
  generator: "Next.js",

  alternates: {
    canonical: BASE_URL,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "CamPulse",
    title: "CamPulse — Campus Life, Coordinated",
    description:
      "The all-in-one platform for students and staff to coordinate extracurriculars, manage campus events, and sync college life.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CamPulse — Campus Life, Coordinated",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "CamPulse — Campus Life, Coordinated",
    description:
      "The all-in-one platform for students and staff to coordinate extracurriculars, manage campus events, and sync college life.",
    images: ["/og-image.png"],
    creator: "@campulse",
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },

  category: "education",

  verification: {
    google: "4hGTqM0yOuh2Wi9TJnLeIRFT9cXOnSfrju-F4AIOfwg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}