import { Button } from "./ui/button";
import { useTheme } from "./theme-provider";
import { useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleTheme = () => {
    setIsAnimating(true);

    // Add a slight delay to see the animation
    setTimeout(() => {
      if (theme === "dark") {
        setTheme("light");
      } else {
        setTheme("dark");
      }
      setIsAnimating(false);
    }, 150);
  };

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      className="relative py-2 px-2 cursor-pointer overflow-hidden group hover:bg-accent transition-all duration-300"
      onClick={toggleTheme}
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        {/* Sun Icon */}
        <i
          className={`bx bx-sun absolute text-xl transition-all duration-500 ease-in-out transform ${
            isDark
              ? "opacity-0 rotate-90 scale-0"
              : "opacity-100 rotate-0 scale-100"
          } ${isAnimating ? "animate-pulse" : ""}`}
        />

        {/* Moon Icon */}
        <i
          className={`bx bx-moon absolute text-xl transition-all duration-500 ease-in-out transform ${
            isDark
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 -rotate-90 scale-0"
          } ${isAnimating ? "animate-pulse" : ""}`}
        />
      </div>

      {/* Animated background effect */}
      <div
        className={`absolute inset-0 rounded-md transition-all duration-700 ease-out ${
          isAnimating
            ? "bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-purple-600/20 animate-pulse"
            : ""
        }`}
      />
    </Button>
  );
}
