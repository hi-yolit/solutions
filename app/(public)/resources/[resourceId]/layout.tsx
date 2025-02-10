import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const ResourceLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <section>
      <nav aria-label="Back navigation" className="w-full py-4">
        <Link
          href="/home"
          className="inline-flex items-center gap-2 hover:text-primary"
          aria-label="Back to home"
        >
          <ArrowLeft aria-hidden="true" />
        </Link>
      </nav>
      {children}
    </section>
  );
};

export default ResourceLayout;
