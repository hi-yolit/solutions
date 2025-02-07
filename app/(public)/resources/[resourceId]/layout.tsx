import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const ResourceLayout = ({ children }: { children: React.ReactNode }) => {
    return (
      <section>
        <div className="w-full py-4 cursor-pointer">
          <Link href="/home">
            <ArrowLeft />
          </Link>
        </div>
        {children}
      </section>
    );
};

export default ResourceLayout;
