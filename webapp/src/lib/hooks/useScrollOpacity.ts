"use client";

import { useEffect, useState } from "react";

export function useScrollOpacity(maxScroll: number = 500) {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const newOpacity = Math.max(0, 1 - scrollPosition / maxScroll);
      setOpacity(newOpacity);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener("scroll", handleScroll);
  }, [maxScroll]);

  return opacity;
}
