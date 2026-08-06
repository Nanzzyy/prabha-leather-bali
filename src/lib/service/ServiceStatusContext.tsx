'use client';

import { createContext, useCallback, useContext, useState } from 'react';

// Lightweight "is the data layer degraded" signal. Live readers (catalog,
// collection, heroes, stores, looks) report a failure only when they have no
// build-time fallback to show — i.e. the storefront would otherwise be blank.
// StorefrontGate surfaces it as a non-blocking banner instead of hiding it.

type ServiceStatusValue = { degraded: boolean; reportDataError: () => void };
const ServiceStatusContext = createContext<ServiceStatusValue | null>(null);

export function ServiceStatusProvider({ children }: { children: React.ReactNode }) {
  const [degraded, setDegraded] = useState(false);
  const reportDataError = useCallback(() => setDegraded(true), []);
  return <ServiceStatusContext.Provider value={{ degraded, reportDataError }}>{children}</ServiceStatusContext.Provider>;
}

export function useServiceStatus() {
  const value = useContext(ServiceStatusContext);
  return value ?? { degraded: false, reportDataError: () => {} };
}
