"use client";

import { createContext, useContext } from "react";
import { COMPANY_FALLBACK, type Company } from "@/lib/company";

const CompanyContext = createContext<Company>(COMPANY_FALLBACK);

export function CompanyProvider({
  value,
  children,
}: {
  value: Company;
  children: React.ReactNode;
}) {
  return (
    <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>
  );
}

export function useCompany(): Company {
  return useContext(CompanyContext);
}
