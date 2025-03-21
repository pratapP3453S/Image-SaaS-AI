"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button"; // Assuming you're using a UI library
import { Sun, Moon } from "lucide-react"; // Import sun and moon icons
import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion for animations

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      variant="ghost"
      size="sm"
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ opacity: 0, rotate: -30 }}
          animate={{ opacity: 1, rotate: 0 }}
          exit={{ opacity: 0, rotate: 30 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {theme === "dark" ? (
            <Sun className="h-6 w-6 text-yellow-600" />
          ) : (
            <Moon className="h-6 w-6 text-gray-800 dark:text-gray-200" />
          )}
        </motion.div>
      </AnimatePresence>
    </Button>
  );
}