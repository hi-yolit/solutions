import type { Metadata } from "next";
import "../globals.css";
import 'katex/dist/katex.min.css'
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: "YAAS Explainer",
  description:
    "Explanations from all the resources used by South African high schools.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="relative">
      <NextTopLoader />
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </section>
  );
}
