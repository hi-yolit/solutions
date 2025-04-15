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
      <section className="pt-16 pb-16 min-h-screen">
        <Navbar />
        {children}
        <BottomNavigation />
      </section>
    </SharedLayout>
  );
};

export default HomeLayout;
