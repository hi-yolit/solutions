import SharedLayout from "@/components/layout/layout";
import type { Metadata } from "next";
import "../globals.css";
import 'katex/dist/katex.min.css'

export const metadata: Metadata = {
  title: "YAAS Explanations",
  description:
    "Explanations from all the resources used by South African high schools.",
};



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SharedLayout>{children}</SharedLayout>;
}
