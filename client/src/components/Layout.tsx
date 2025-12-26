import { Link, useLocation } from "wouter";
import { Home, Play, MessageSquare, BookOpen, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/today", icon: Play, label: "Today" },
    { href: "/catch-up", icon: BookOpen, label: "Journal" },
    { href: "/chat", icon: MessageSquare, label: "Chat" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row max-w-md mx-auto md:max-w-2xl lg:max-w-5xl border-x border-border shadow-2xl relative">
      {/* Desktop Sidebar (Hidden on Mobile and Tablet) */}
      <aside className="hidden lg:flex w-56 flex-col border-r border-border p-5 shrink-0 bg-background/95 backdrop-blur-sm">
        <h1 className="text-xl font-display font-bold mb-6 text-primary tracking-widest">STORYFLIX</h1>
        <nav className="space-y-3">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors cursor-pointer text-sm",
                  location === item.href
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
            </Link>
          ))}
          <Link href="/admin">
             <div className="flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors cursor-pointer text-muted-foreground hover:bg-muted hover:text-foreground mt-6 text-sm">
                <Settings className="w-4 h-4" />
                <span>Admin</span>
             </div>
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 pb-20 lg:pb-0 w-full">
        {children}
      </main>

      {/* Mobile & Tablet Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border z-50 px-4 py-3 flex justify-around max-w-2xl mx-auto md:rounded-t-xl">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={cn(
                "flex flex-col items-center gap-1 cursor-pointer",
                location === item.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
}
