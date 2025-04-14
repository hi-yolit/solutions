'use client'

import React from "react";
import { Navbar } from "@/components/layout/navbar";

const ResourceLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <section>
      <Navbar />
      {/* Adding padding-top to compensate for the fixed navbar */}
      <div className="pt-16">
        {children}
      </div>
    </section>
  );
};

export default ResourceLayout;