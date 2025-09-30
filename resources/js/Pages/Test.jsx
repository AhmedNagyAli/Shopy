import React from "react";
import { usePage } from "@inertiajs/react";
//import route from "ziggy-js";

export default function Test() {
    const { ziggy } = usePage().props;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Ziggy Test</h1>

            <p className="mt-4">
                Home route: <strong>{route('home', undefined, false, ziggy)}</strong>
            </p>

            <p className="mt-2">
                Example route with param:{" "}
                <strong>{route('products.show', { product: 1 }, false, ziggy)}</strong>
            </p>
        </div>
    );
}
