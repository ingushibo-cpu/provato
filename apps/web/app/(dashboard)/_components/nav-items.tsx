"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FolderOpen, Users, FileText, ShieldCheck,
} from "lucide-react";
import { cn } from "@provato/ui";

type Role = "TALENT" | "CLIENT" | "ADMIN";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const talentNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/projects", label: "Projekte", icon: FolderOpen },
  { href: "/dashboard/applications", label: "Meine Bewerbungen", icon: FileText },
];

const clientNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/my-projects", label: "Meine Projekte", icon: FolderOpen },
  { href: "/dashboard/talents", label: "Talente", icon: Users },
];

const adminNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/projects", label: "Projekte", icon: FolderOpen },
  { href: "/dashboard/talents", label: "Talente", icon: Users },
  { href: "/dashboard/my-projects", label: "Meine Projekte", icon: FileText },
  { href: "/dashboard/admin", label: "Admin", icon: ShieldCheck },
];

const navByRole: Record<Role, NavItem[]> = {
  TALENT: talentNav,
  CLIENT: clientNav,
  ADMIN: adminNav,
};

export function NavItems({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = navByRole[role];

  return (
    <>
      {items.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
