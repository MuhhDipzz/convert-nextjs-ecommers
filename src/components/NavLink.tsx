"use client";

import Link from "next/link";
import { forwardRef } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps {
  href: string;
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
  children: React.ReactNode;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  (
    {
      className,
      activeClassName,
      pendingClassName,
      href,
      children,
      ...props
    },
    ref,
  ) => {
    const pathname = usePathname();

    const isActive = pathname === href;

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          className,
          isActive && activeClassName,
          pendingClassName,
        )}
        {...props}
      >
        {children}
      </Link>
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
