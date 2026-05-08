"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignInButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Moon, Sun, PenLine, Search } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { SearchDialog } from "@/components/SearchDialog";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}

function AdminLink() {
  const me = useQuery(api.users.getMe);
  if (me?.role !== "admin" && me?.role !== "author") return null;
  return (
    <Link href="/admin">
      <Button variant="ghost" size="sm" className="gap-1.5">
        <PenLine className="h-4 w-4" />
        <span className="hidden sm:inline">Écrire</span>
      </Button>
    </Link>
  );
}

const navLinks = [
  { href: "/", label: "Articles" },
  { href: "/about", label: "À propos" },
];

export function Navbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-base tracking-tight shrink-0">
            keil-enzo
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "text-sm px-3 py-1.5 rounded-md transition-colors",
                  pathname === href
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-muted-foreground hidden sm:flex"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-4 w-4" />
            <span className="text-xs">Rechercher</span>
            <kbd className="hidden md:inline-flex h-4 items-center gap-0.5 rounded border bg-muted px-1 text-[10px]">
              ⌘K
            </kbd>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 sm:hidden"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-4 w-4" />
          </Button>
          <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
          <ThemeToggle />
          <Authenticated>
            <AdminLink />
            <UserButton />
          </Authenticated>
          <Unauthenticated>
            <SignInButton mode="modal">
              <Button variant="outline" size="sm">
                Connexion
              </Button>
            </SignInButton>
          </Unauthenticated>
        </div>
      </div>
    </header>
  );
}
