import Loading from "../components/Loading";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AnimatePresence } from "framer-motion";
import { SessionProvider } from "next-auth/react"
import { ImageCacheProvider } from "@/contexts/ImageCache";
import dynamic from 'next/dynamic';
import '../styles/globals.css';
import { ThemeProvider } from "@/contexts/ThemeContext";

// SafeHydrate component to prevent hydration issues
function SafeHydrate({ children }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted ? <div suppressHydrationWarning>{children}</div> : null
}

const AppContent = dynamic(() => Promise.resolve(({ Component, pageProps }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!router) return;

    const handleStart = (url) => {
      if (url !== router.asPath) {
        setIsLoading(true);
      }
    };

    const handleComplete = () => {
      setTimeout(() => setIsLoading(false), 500);
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  return (
    <>
      <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
        {isLoading && <Loading key="loader" />}
      </AnimatePresence>
      <Component {...pageProps} />
    </>
  );
}), { ssr: false });

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
      <ImageCacheProvider>
        <SafeHydrate>
          <AppContent Component={Component} pageProps={pageProps} />
        </SafeHydrate>
      </ImageCacheProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
