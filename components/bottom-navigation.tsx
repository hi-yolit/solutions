"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Gem, Menu } from "lucide-react";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/pricing", icon: Gem, label: "Premium" },
  { href: "/subjects", icon: Menu, label: "More" },
];

const BottomNavigation = () => {
  const pathname = usePathname();

  return (
    <div className="flex justify-around fixed bottom-32 left-4 right-4 p-2 rounded-lg bg-white shadow-md z-50">
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col justify-center items-center gap-2"
          >
            <Icon className={isActive ? "text-blue-600" : "text-gray-600"} />
            <p
              className={`text-xs ${
                isActive ? "text-blue-600" : "text-gray-600"
              }`}
            >
              {label}
            </p>
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNavigation;
