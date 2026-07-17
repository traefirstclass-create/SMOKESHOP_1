"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const STORAGE_KEY = "alibaba-smoke-shop:age-verified";

export function AgeGate() {
  const [visible, setVisible] = useState(false);
  const [declined, setDeclined] = useState(false);

  useEffect(() => {
    try {
      const verified = window.localStorage.getItem(STORAGE_KEY);
      if (verified !== "true") setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function confirm() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  function deny() {
    setDeclined(true);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 text-center"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {declined ? (
              <>
                <h2 className="text-xl font-semibold">Sorry, come back soon</h2>
                <p className="mt-3 text-sm text-foreground/60">
                  You must be 21 or older to view this website. Please check
                  back once you meet the age requirement in your area.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm uppercase tracking-widest text-accent">
                  Age Verification
                </p>
                <h2 className="mt-2 text-2xl font-bold">Are you 21 or older?</h2>
                <p className="mt-3 text-sm text-foreground/60">
                  This site sells age-restricted products. By entering you
                  confirm you meet the legal age to purchase these products in
                  your jurisdiction.
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={deny}
                    className="flex-1 rounded-full border border-border py-2.5 text-sm font-medium transition hover:border-foreground/40"
                  >
                    No
                  </button>
                  <button
                    onClick={confirm}
                    className="flex-1 rounded-full bg-accent py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover"
                  >
                    Yes, I&apos;m 21+
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
