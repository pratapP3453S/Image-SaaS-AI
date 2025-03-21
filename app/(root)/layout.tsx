import MobileNav from "@/components/shared/MobileNav";
import Sidebar from "@/components/shared/Sidebar";
import { ThemeProvider } from "@/components/Theme/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="root">
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Sidebar />
        <MobileNav />

        <div className="root-container">
          <div className="wrapper">{children}</div>
        </div>

        <Toaster />
      </ThemeProvider>
    </main>
  );
};

export default Layout;
