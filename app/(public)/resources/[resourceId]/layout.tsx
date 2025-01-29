import React from "react";
import { ArrowLeft } from "lucide-react";

const ResourceLayout = ({ children }: { children: React.ReactNode }) => {
    return (
    <section>
      <div className="w-full py-4">
        <ArrowLeft />
      </div>
      {children}
    </section>
  );
};

export default ResourceLayout;
