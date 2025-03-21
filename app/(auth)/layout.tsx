import { ThemeProvider } from "@/components/Theme/ThemeProvider";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="auth">
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </main>
  );
};

export default Layout;
