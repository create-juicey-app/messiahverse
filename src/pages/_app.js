import "@/styles/globals.css";
import Loading from "./components/Loading";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AnimatePresence } from "framer-motion";
import { SessionProvider } from "next-auth/react"
import PropTypes from 'prop-types';

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const [isLoading, setIsLoading] = useState(true); // Start with true for initial load
  const router = useRouter();

  useEffect(() => {
    // Handle initial page load
    setIsLoading(false);

    const handleStart = (url) => {
      // Only show loading if changing to a different route
      if (url !== router.asPath) {
        setIsLoading(true);
      }
    };

    const handleComplete = () => {
      setTimeout(() => setIsLoading(false), 500); // Add small delay for smoother transition
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, []); // Close useEffect

  return (
    <SessionProvider session={session}>
      <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
        {isLoading && <Loading key="loader" />}
      </AnimatePresence>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
