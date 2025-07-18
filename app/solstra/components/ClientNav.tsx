"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ClientNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/solstra") {
      // Home page is active for exact match or temple routes
      return pathname === "/solstra" || pathname.startsWith("/solstra/temple");
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="self-start flex justify-start gap-2">
      <Link 
        href="/solstra/temple" 
        className={`solstra-nav-button ${isActive("/solstra/temple") ? "active" : ""}`}
      >
        Temple
      </Link>
      <Link 
        href="/solstra/town" 
        className={`solstra-nav-button ${isActive("/solstra/town") ? "active" : ""}`}
      >
        Town
      </Link>
      <Link 
        href="/solstra/house" 
        className={`solstra-nav-button ${isActive("/solstra/house") ? "active" : ""}`}
      >
        House
      </Link>
    </div>
  );
}