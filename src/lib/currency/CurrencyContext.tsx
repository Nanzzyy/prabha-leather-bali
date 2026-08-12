'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type CurrencyCode = 'USD' | 'IDR';

// Static presentation rate used for storefront pricing. Final payment and
// shipping amounts are confirmed by the team before an order is completed.
const RATE_TO_IDR = 18000;

const META: Record<CurrencyCode, { locale: string; label: string }> = {
  USD: { locale: 'en-US', label: 'USD' },
  IDR: { locale: 'id-ID', label: 'IDR' },
};

interface CurrencyContextValue {
  code: CurrencyCode;
  setCode: (code: CurrencyCode) => void;
  toggle: () => void;
  formatPrice: (usd: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [code, setCodeState] = useState<CurrencyCode>(() => {
    if (typeof window === 'undefined') return 'USD';
    return (localStorage.getItem('praba-currency') as CurrencyCode) || 'USD';
  });

  const value = useMemo<CurrencyContextValue>(() => {
    const setCode = (next: CurrencyCode) => {
      setCodeState(next);
      if (typeof window !== 'undefined') localStorage.setItem('praba-currency', next);
    };
    return {
      code,
      setCode,
      toggle: () => setCode(code === 'USD' ? 'IDR' : 'USD'),
      formatPrice: (usd: number) => {
        const amount = code === 'IDR' ? usd * RATE_TO_IDR : usd;
        return new Intl.NumberFormat(META[code].locale, {
          style: 'currency',
          currency: code,
          maximumFractionDigits: 0,
        }).format(amount);
      },
    };
  }, [code]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
  return ctx;
}
