"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Gem, Menu } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

const BottomNavigation = () => {
  const pathname = usePathname();
  const { profile } = useAuth();
  
  // Check if user has an active subscription
  const isSubscribed = profile?.subscriptionStatus === 'ACTIVE';
  
  // Filter out Premium tab for subscribed users
  const navItems = [
    { href: "/home", icon: Home, label: "Home" },
    { href: "/search", icon: Search, label: "Search" },
    ...(!isSubscribed ? [{ href: "/premium", icon: Gem, label: "Premium" }] : []),
    { href: "/more", icon: Menu, label: "More" },
  ];

  return (
    <nav
      aria-label="Bottom navigation"
      className="flex justify-around fixed bottom-0 left-0 right-0 p-2 bg-white shadow-md z-50 safe-area-inset-bottom"
    >
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            aria-label={label}
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
    </nav>
  );
};

export default BottomNavigation;