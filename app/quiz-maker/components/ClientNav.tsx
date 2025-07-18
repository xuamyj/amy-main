"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ClientNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/quiz-maker") {
      // Home page is active for exact match or play routes
      return pathname === "/quiz-maker" || pathname.startsWith("/quiz-maker/play");
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="self-start flex justify-start gap-2">
      <Link 
        href="/quiz-maker" 
        className={`quiz-nav-button ${isActive("/quiz-maker") ? "active" : ""}`}
      >
        Home / Play
      </Link>
      <Link 
        href="/quiz-maker/generate" 
        className={`quiz-nav-button ${isActive("/quiz-maker/generate") ? "active" : ""}`}
      >
        Generate Quiz
      </Link>
      <Link 
        href="/quiz-maker/data-backup" 
        className={`quiz-nav-button ${isActive("/quiz-maker/data-backup") ? "active" : ""}`}
      >
        Data Backup
      </Link>
    </div>
  );
}