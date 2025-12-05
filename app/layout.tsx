// src/app/layout.tsx

import type { Metadata } from "next";
import "./globals.css"; // فایل استایل Tailwind
import { SettingsProvider } from "@/components/SettingsContext";
import { AuthProvider } from "@/components/AuthContext";
import { SaveProvider } from "@/components/SaveContext";
import { FollowProvider } from "@/components/FollowContext";
import { ExploreProvider } from "@/components/ExploreContext";
import { StoryProvider } from "@/components/StoryContext";

export const metadata: Metadata = {
  title: "روایات | شهدای ۱۲ روزه",
  description: "وب‌اپلیکیشن روایت: معرفی شهدای جنگ ۱۲ روزه و روایت‌های حماسی آن‌ها.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 1. اضافه کردن dir="rtl" برای راست-چین کردن کل سایت
    <html lang="fa" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* 2. اضافه کردن لینک CDN فونت وزیر */}
        <link 
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" 
          rel="stylesheet" 
          type="text/css"
        />
      </head>
      
      {/* 3. اضافه کردن کلاس font-vazir به body تا فونت پیش‌فرض باشد */}
      <body className="font-vazir"> 
        <AuthProvider>
          <SaveProvider>
            <FollowProvider>
              <ExploreProvider>
                <StoryProvider>
                  <SettingsProvider>
                    {children}
                  </SettingsProvider>
                </StoryProvider>
              </ExploreProvider>
            </FollowProvider>
          </SaveProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
