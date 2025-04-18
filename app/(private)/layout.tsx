import React from "react";
import BottomNavigation from "@/components/bottom-navigation";
import { Navbar } from "@/components/layout/navbar";
import SharedLayout from "@/components/layout/layout";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "YAAS Explanations | Home",
  description:
    "Explanations from all the resources used by South African high schools.",
};

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SharedLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="pt-16 pb-16 min-h-screen">
          <Navbar />
          {children}
          <BottomNavigation />
        </section>

      </div>
    </SharedLayout>
  );
};

export default HomeLayout;
