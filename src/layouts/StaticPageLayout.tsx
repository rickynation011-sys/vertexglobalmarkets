import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ReactNode } from "react";

const StaticPageLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-16">{children}</main>
    <Footer />
  </div>
);

export default StaticPageLayout;
