import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-body)', 'Inter', ...defaultTheme.fontFamily.sans],
                heading: ['var(--font-heading)', 'Outfit', ...defaultTheme.fontFamily.sans],
                display: ['var(--font-heading)', 'Outfit', ...defaultTheme.fontFamily.sans],
                mono: ['var(--font-mono)', 'JetBrains Mono', ...defaultTheme.fontFamily.mono],
            },
            colors: {
                'accent-primary': 'var(--app-accent, #a3e635)',
                'accent-hover': 'var(--app-accent-hover, #84cc16)',
                'accent-glow': 'var(--app-accent-glow, rgba(163, 230, 53, 0.18))',
                'slate-950': '#07090e',
                'slate-900': '#0d121d',
                'slate-850': '#131b2e',
                'slate-800': '#1b2640',
                'slate-700': '#29385c',
            },
        },
    },

    plugins: [forms],
};
