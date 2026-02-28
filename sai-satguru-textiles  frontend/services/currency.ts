
import { Currency } from '../types';

export const fetchExchangeRates = async (): Promise<Currency[]> => {
    try {
        const cached = localStorage.getItem('ss_currency_rates');
        const cacheTime = localStorage.getItem('ss_currency_rates_ts');

        if (cached && cacheTime) {
            const now = new Date().getTime();
            const diff = now - parseInt(cacheTime, 10);
            // Cache for 1 hour to catch market fluctuations
            if (diff < 1 * 60 * 60 * 1000) {
                return JSON.parse(cached);
            }
        }

        const response = await fetch('https://open.er-api.com/v6/latest/INR');
        const data = await response.json();

        if (data.rates) {
            const currencies: Currency[] = Object.entries(data.rates).map(([code, rate]) => {
                let label = code;
                let symbol = code;

                try {
                    const regionNames = new Intl.DisplayNames(['en'], { type: 'currency' });
                    label = `${regionNames.of(code)} (${code})`;
                } catch (e) {
                    // fallback
                }

                try {
                    const format = new Intl.NumberFormat('en', { style: 'currency', currency: code }).formatToParts(0);
                    const symbolPart = format.find(part => part.type === 'currency');
                    if (symbolPart) symbol = symbolPart.value;
                } catch (e) {
                    // fallback
                }

                return {
                    code,
                    rate: rate as number,
                    symbol,
                    label
                };
            });

            // Sort currencies: INR first, then USD, EUR, GBP, then rest alphabetically
            const priority = ['INR', 'USD', 'EUR', 'GBP'];
            currencies.sort((a, b) => {
                const idxA = priority.indexOf(a.code);
                const idxB = priority.indexOf(b.code);

                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                if (idxA !== -1) return -1;
                if (idxB !== -1) return 1;

                return a.label.localeCompare(b.label);
            });

            // Store in local storage
            localStorage.setItem('ss_currency_rates', JSON.stringify(currencies));
            localStorage.setItem('ss_currency_rates_ts', new Date().getTime().toString());

            return currencies;
        }
        return [];
    } catch (err) {
        console.error('Failed to fetch rates', err);
        return [];
    }
};
