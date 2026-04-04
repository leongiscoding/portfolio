"use client";

import { useState } from "react";
import Preloader from "@/components/ui/Preloader";
import CustomCursor from "@/components/ui/CustomCursor";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingActions from "@/components/layout/FloatingActions";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import Education from "@/components/sections/Education";
import Contact from "@/components/sections/Contact";

export default function Home() {
  const [ready, setReady] = useState(false);

  return (
    <>
      <Preloader onComplete={() => setReady(true)} />
      <CustomCursor />
      {/* visibility:hidden keeps layout intact but hides everything until ready.
          Acts as a hard safety net so the curtain never reveals content mid-animation. */}
      <div style={{ visibility: ready ? "visible" : "hidden" }}>
        <Navbar ready={ready} />
        <main>
          <Hero ready={ready} />
          <About />
          <Skills />
          <Experience />
          <Projects />
          <Education />
          <Contact />
        </main>
        <Footer />
        <FloatingActions />
      </div>
    </>
  );
}
