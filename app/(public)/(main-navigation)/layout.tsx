import React from "react";
import BottomNavigation from "@/components/bottom-navigation";
import { Navbar } from "@/components/layout/navbar";

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <section>
      <Navbar />
      {children}
      <BottomNavigation />
    </section>
  );
};

export default HomeLayout;
