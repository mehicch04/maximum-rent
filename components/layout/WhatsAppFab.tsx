"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useCompany } from "@/components/company/CompanyProvider";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export function WhatsAppFab() {
  const t = useTranslations("Common");
  const company = useCompany();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const on = () => setShow(window.scrollY > 420 || document.documentElement.scrollHeight <= window.innerHeight + 420);
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);

  if (!company.whatsapp) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.a
          href={`https://wa.me/${company.whatsapp}?text=${encodeURIComponent(t("waText"))}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("waLabel")}
          title={t("waLabel")}
          initial={{ opacity: 0, scale: 0.7, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 12 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          whileTap={{ scale: 0.94 }}
          className="wa-fab group fixed bottom-4 right-4 z-40 flex h-12 items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_24px_-10px_rgba(17,17,19,0.55)] transition-colors hover:bg-[#1FB859] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:bottom-6 sm:right-6 sm:h-14"
        >
          <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0 transition-[max-width,opacity,padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:max-w-[11rem] group-hover:pl-5 group-hover:opacity-100 sm:block">
            {t("waShort")}
          </span>
          <span className="grid h-12 w-12 shrink-0 place-items-center sm:h-14 sm:w-14">
            <WhatsAppIcon className="h-6 w-6 sm:h-7 sm:w-7" />
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
