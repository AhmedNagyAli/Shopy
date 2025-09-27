import React from 'react';
import { Head } from '@inertiajs/react';

export default function AppLayout({ title, children }) {
    return (
        <div className="min-h-screen flex flex-col">
            <Head title={title} />
            <main className="flex-1">{children}</main>
        </div>
    );
}
