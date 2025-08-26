"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ClientNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/greek-word-counter") {
      return pathname === "/greek-word-counter";
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="self-start flex justify-start gap-2">
      <Link 
        href="/greek-word-counter" 
        className={`greek-nav-button ${isActive("/greek-word-counter") ? "active" : ""}`}
      >
        Greek Words
      </Link>
      <Link 
        href="/greek-word-counter/add-words" 
        className={`greek-nav-button ${isActive("/greek-word-counter/add-words") ? "active" : ""}`}
      >
        Add Words
      </Link>
      <Link 
        href="/greek-word-counter/historical-chart" 
        className={`greek-nav-button ${isActive("/greek-word-counter/historical-chart") ? "active" : ""}`}
      >
        Historical Chart
      </Link>
      <Link 
        href="/greek-word-counter/analyze-text" 
        className={`greek-nav-button ${isActive("/greek-word-counter/analyze-text") ? "active" : ""}`}
      >
        Analyze Text
      </Link>
    </div>
  );
}