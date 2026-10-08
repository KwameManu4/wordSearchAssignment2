'use client';

import {useEffect} from 'react';
import {usePathname} from 'next/navigation';

const MAX_SECONDS = 1800;

export function usePageVisit() {
    const pathname = usePathname();

    useEffect(() => {
        const start = Date.now();
        let sent = false;

        const send = () => {
            if (sent) return;
            sent = true;


            const durationSeconds = Math.round((Date.now() - start) / 1000);
            if (durationSeconds < 1 || durationSeconds > MAX_SECONDS) return;

            const body = new Blob(
                [JSON.stringify({page:pathname, durationSeconds})],
                {type:'application/json'}
            );
            navigator.sendBeacon('/api/page-visits', body);
        };

        window.addEventListener('pagehide', send);

        return () => {
            window.removeEventListener('pagehide', send);
            send();
        };
    }, [pathname]);
}