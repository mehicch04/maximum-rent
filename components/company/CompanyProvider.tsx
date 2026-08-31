"use client";

import { createContext, useContext } from "react";
import { COMPANY_FALLBACK, type Company } from "@/lib/company";

/**
 * Makes the company details available to client components.
 *
 * They cannot read the database directly, so the layout fetches once on the
 * server and hands the result down. The fallback keeps every consumer working
 * even if the provider is ever missing from a tree.
 */
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
