import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, Crimson_Text } from "next/font/google";
import "./prague-underground.css";

const cinzel = Cinzel({
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  subsets: ["latin"],
});

const crimsonText = Crimson_Text({
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-crimson",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Beneath Prague | Good Hang",
  description: "A guide to the buried city — its labyrinths, its cellars, its caverns, and its secrets.",
  openGraph: {
    title: "Beneath Prague",
    description: "A guide to the buried city — its labyrinths, its cellars, its caverns, and its secrets.",
    type: "website",
    locale: "en_US",
    url: "https://goodhang.club/prague-underground",
  },
  twitter: {
    card: "summary_large_image",
    title: "Beneath Prague",
    description: "A guide to the buried city — its labyrinths, its cellars, its caverns, and its secrets.",
  },
};

export default function PragueUndergroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${cinzel.variable} ${cormorantGaramond.variable} ${crimsonText.variable} pu-fonts`}>
      {children}
    </div>
  );
}
