import React from "react";
import BottomNavigation from "@/components/bottom-navigation";
import { Navbar } from "@/components/layout/navbar";

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="pt-16 pb-16 min-h-screen">
      <Navbar />
      {children}
      <BottomNavigation />
    </section>
  );
};

export default HomeLayout;
