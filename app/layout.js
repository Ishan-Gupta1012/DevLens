import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: "DevLens - Architecture Diagram & Code Intelligence",
  description:
    "Turn architecture diagrams and code into interactive visual models, README documentation, and system bottleneck analyses.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="bg-background text-white font-sans antialiased selection:bg-teal/30 selection:text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
