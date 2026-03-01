import React, { createContext, useContext, useState, useEffect } from 'react';
import { Currency, CurrencyCode } from '../types';
import { CURRENCIES } from '../constants';

interface CurrencyContextType {
  currentCurrency: Currency;
  currencies: Currency[];
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (priceInINR: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currencies, setCurrencies] = useState<Currency[]>(CURRENCIES);
  const [currentCurrency, setCurrentCurrencyState] = useState<Currency>(CURRENCIES[0]);

  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const { fetchExchangeRates } = await import('../services/currency');
        const rates = await fetchExchangeRates();
        if (rates.length > 0) {
          setCurrencies(rates);

          const saved = localStorage.getItem('ss_currency') as CurrencyCode;
          if (saved) {
            const found = rates.find(c => c.code === saved);
            if (found) setCurrentCurrencyState(found);
          } else {
            // Ensure INR is default if available
            const defaultCurr = rates.find(c => c.code === 'INR') || rates[0];
            setCurrentCurrencyState(defaultCurr);
          }
        }
      } catch (error) {
        console.error("Failed to load currencies", error);
      }
    };
    loadCurrencies();
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    const found = currencies.find(c => c.code === code);
    if (found) {
      setCurrentCurrencyState(found);
      localStorage.setItem('ss_currency', code);
    }
  };

  const formatPrice = React.useCallback((priceInINR: number) => {
    const converted = priceInINR * currentCurrency.rate;
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currentCurrency.code,
      minimumFractionDigits: currentCurrency.code === 'INR' ? 0 : 2,
      maximumFractionDigits: currentCurrency.code === 'INR' ? 0 : 2,
    }).format(converted);
  }, [currentCurrency]);

  return (
    <CurrencyContext.Provider value={{ currentCurrency, currencies, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
  return context;
};