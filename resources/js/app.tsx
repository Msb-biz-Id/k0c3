import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import Preloader from './Components/Preloader';
import { applyPlatformTheme } from './Utils/theme';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        const company = (props.initialPage.props as any)?.company;

        if (company) {
            applyPlatformTheme(company.primary_color, company.custom_color_hex, company.typography_preset);
        }

        root.render(
            <>
                <Preloader company={company} />
                <App {...props} />
            </>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
