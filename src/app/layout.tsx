import type { Metadata } from "next";
import classNames from "classnames";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";
import { getServerCookieFlags } from "../cookies/server";

export const metadata: Metadata = {
    title: "Sevgi",
    description: "Sevgi SVG editor",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const flags = await getServerCookieFlags();
    return (
        <html lang="en" className={classNames(flags)}>
            <body suppressHydrationWarning>{children}</body>
            <Analytics />
            <SpeedInsights />
        </html>
    );
}
