import React, { createContext, useContext, useState, useCallback } from 'react';

export type CurrencyCode = 'GHS' | 'USD' | 'EUR' | 'GBP' | 'NGN';

interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rate: number; // rate from GHS
}

export const currencies: Record<CurrencyCode, CurrencyInfo> = {
  GHS: { code: 'GHS', symbol: '₵', name: 'Ghana Cedi', rate: 1 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 0.063 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.058 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.05 },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rate: 97.65 },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (amountInGHS: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = 'techmart-currency';

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in currencies) {
      return stored as CurrencyCode;
    }
    return 'GHS';
  });

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, []);

  const formatPrice = useCallback(
    (amountInGHS: number): string => {
      const info = currencies[currency];
      const converted = amountInGHS * info.rate;
      return `${info.symbol}${converted.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    },
    [currency]
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
