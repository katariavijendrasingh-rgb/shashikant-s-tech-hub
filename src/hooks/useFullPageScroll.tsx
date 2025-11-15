import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const routes = [
  "/",
  "/about",
  "/experience",
  "/projects",
  "/skills",
  "/pors",
  "/achievements",
  "/resume",
  "/contact",
];

export const useFullPageScroll = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout>();

  const currentIndex = routes.indexOf(location.pathname);

  const scrollToSection = useCallback(
    (index: number) => {
      if (index >= 0 && index < routes.length && !isScrolling) {
        setIsScrolling(true);
        navigate(routes[index]);

        // Reset scrolling state after animation
        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
          setIsScrolling(false);
        }, 1000);
      }
    },
    [navigate, isScrolling]
  );

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isScrolling) {
        e.preventDefault();
        return;
      }

      const delta = e.deltaY;

      // Scroll down
      if (delta > 0 && currentIndex < routes.length - 1) {
        e.preventDefault();
        scrollToSection(currentIndex + 1);
      }
      // Scroll up
      else if (delta < 0 && currentIndex > 0) {
        e.preventDefault();
        scrollToSection(currentIndex - 1);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrolling) return;

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        scrollToSection(currentIndex + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        scrollToSection(currentIndex - 1);
      }
    };

    // Add event listeners
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [currentIndex, isScrolling, scrollToSection]);

  return {
    currentIndex,
    totalSections: routes.length,
    isScrolling,
    scrollToSection,
  };
};
