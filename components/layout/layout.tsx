// app/layouts/SharedLayout.tsx
import React from "react";
import NextTopLoader from "nextjs-toploader";

const SharedLayout = ({ children }: { children: React.ReactNode }) => {
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
};

export default SharedLayout;
