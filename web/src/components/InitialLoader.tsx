"use client";

import { useState, useEffect } from "react";
import CinematicLoader from "./CinematicLoader";
import { usePathname } from "next/navigation";

export default function InitialLoader() {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // Optionally, you can skip the initial loader on certain paths if you want
  // const shouldShowLoader = pathname === "/";

  useEffect(() => {
    // Show loader for 3.5 seconds to allow full camera drawing animation
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return <CinematicLoader isLoading={loading} text="Sculpting Light..." />;
}
