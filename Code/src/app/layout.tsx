import "../styles/globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mundoko Maps",
  description:
    "Maps of the World of Mundoko – a sword and sorcery setting for fantasy roleplaying adventure games",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
