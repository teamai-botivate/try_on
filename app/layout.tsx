import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Virtual Jewellery Try-On",
  description: "Test jewellery try-on quality before integration",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: "cover",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#1f2937" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Try-On" />
        {/* Safe area support for notched devices */}
        <meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1, user-scalable=yes" />
      </head>
      <body className="bg-white text-gray-900 w-full overflow-x-hidden">
        <div className="w-full min-h-dvh overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
