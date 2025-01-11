"use client";

import React from "react";
import Link from "next/link";
import { useMediaQuery } from "@uidotdev/usehooks";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ResourceBreadcrumbProps {
  resource: {
    subject: string;
    title: string;
  };
}

interface BreadcrumbItem {
  href: string;
  label: string;
  current?: boolean;
}

const ITEMS_TO_DISPLAY = 3;

const ResponsiveBreadcrumb = ({ resource }: ResourceBreadcrumbProps) => {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Create breadcrumb items from resource data with guaranteed hrefs
  const items: BreadcrumbItem[] = [
    { href: "/", label: "Home" },
    {
      href: `/subjects/${resource.subject}`,
      label:
        resource.subject.charAt(0).toUpperCase() + resource.subject.slice(1),
    },
    { href: "#", label: resource.title, current: true },
  ];

  return (
    <div className="border-b text-slate-500">
      <div className="container mx-auto px-3 sm:px-4 max-w-4xl">
        <div className="py-3 sm:py-4">
          <Breadcrumb>
            <BreadcrumbList className="text-xs sm:text-sm flex flex-wrap items-center">
              <BreadcrumbItem>
                <BreadcrumbLink
                  asChild
                  className="text-slate-500 hover:text-slate-500 transition-colors"
                >
                  <Link href={items[0].href}>{items[0].label}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />

              {items.length > ITEMS_TO_DISPLAY ? (
                <>
                  <BreadcrumbItem>
                    {isDesktop ? (
                      <DropdownMenu open={open} onOpenChange={setOpen}>
                        <DropdownMenuTrigger
                          className="flex items-center gap-1 text-slate-500"
                          aria-label="Toggle menu"
                        >
                          <BreadcrumbEllipsis className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {items.slice(1, -2).map((item, index) => (
                            <DropdownMenuItem key={index}>
                              <Link href={item.href} className="w-full">
                                {item.label}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Drawer open={open} onOpenChange={setOpen}>
                        <DrawerTrigger
                          aria-label="Toggle Menu"
                          className="text-slate-500"
                        >
                          <BreadcrumbEllipsis className="h-4 w-4" />
                        </DrawerTrigger>
                        <DrawerContent>
                          <DrawerHeader className="text-left">
                            <DrawerTitle>Navigate to</DrawerTitle>
                            <DrawerDescription>
                              Select a page to navigate to.
                            </DrawerDescription>
                          </DrawerHeader>
                          <div className="grid gap-1 px-4">
                            {items.slice(1, -2).map((item, index) => (
                              <Link
                                key={index}
                                href={item.href}
                                className="py-1 text-sm text-foreground/70 hover:text-foreground transition-colors"
                              >
                                {item.label}
                              </Link>
                            ))}
                          </div>
                          <DrawerFooter className="pt-4">
                            <DrawerClose asChild>
                              <Button variant="outline">Close</Button>
                            </DrawerClose>
                          </DrawerFooter>
                        </DrawerContent>
                      </Drawer>
                    )}
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              ) : null}

              {items.slice(-ITEMS_TO_DISPLAY + 1).map((item, index) => (
                <BreadcrumbItem key={index}>
                  {!item.current ? (
                    <>
                      <BreadcrumbLink
                        asChild
                        className="text-slate-500/70 hover:text-slate-500 transition-colors max-w-20 truncate md:max-w-none"
                      >
                        <Link href={item.href}>{item.label}</Link>
                      </BreadcrumbLink>
                      <BreadcrumbSeparator />
                    </>
                  ) : (
                    <BreadcrumbPage className="text-slate-500 max-w-20 truncate md:max-w-none">
                      {item.label}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveBreadcrumb;
