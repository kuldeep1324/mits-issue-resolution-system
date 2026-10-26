import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MITS Issue Resolution System | Campus Grievance Portal",
  description:
    "Unified campus issue reporting, tracking, and resolution platform for Madhav Institute of Technology & Science.",
  keywords: ["MITS", "Issue Resolution", "Campus Grievance", "Student Portal", "Maintenance"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
