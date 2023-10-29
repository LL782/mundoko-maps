import "../styles/globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mundoko Maps",
  description:
    "Maps of the World of Mundoko – a sword and sorcery setting for fantasy roleplaying adventure games",
  robots: "index, follow",
};

interface Props {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
