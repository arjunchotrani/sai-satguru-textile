/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./App.tsx",
        "./index.tsx",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    dark: '#050505',      /* Rich Black */
                    glass: 'rgba(255, 255, 255, 0.05)',
                    glassBorder: 'rgba(255, 255, 255, 0.1)',
                    gold: '#FFD700',      /* Gold */
                    saffron: '#FF9933',   /* Saffron */
                    red: '#D70040',       /* Deep Red */
                    border: '#1a1a1a',
                    muted: '#a3a3a3',     /* Medium Gray for readability */
                }
            },
            fontFamily: {
                serif: ['"Playfair Display"', 'serif'],
                sans: ['"Manrope"', 'sans-serif'],
                display: ['"Cinzel"', 'serif'],
                script: ['"Great Vibes"', 'cursive'],
            },
            animation: {
                'spin-slow': 'spin 8s linear infinite',
                'float': 'float 6s ease-in-out infinite',
                'slide-up': 'slideUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'grow-line': 'growWidth 1.5s ease-out forwards',
                'draw': 'draw 2.5s ease-in-out forwards',
                'fade-in': 'fadeIn 1s ease-out forwards',
                'fade-in-fast': 'fadeIn 0.2s ease-out forwards',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(40px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' }
                },
                growWidth: {
                    '0%': { width: '0%', opacity: '0' },
                    '100%': { width: '100%', opacity: '1' }
                },
                draw: {
                    '0%': { strokeDashoffset: '1000' },
                    '100%': { strokeDashoffset: '0' }
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                }
            }
        }
    },
    plugins: [],
}
