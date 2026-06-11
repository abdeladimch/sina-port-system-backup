import type { Config } from "tailwindcss";

export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                // KPI semantic colors
                kpi: {
                    green: "#16a34a",
                    red: "#dc2626",
                    orange: "#ea580c",
                    pale: "#fed7aa",
                    blue: "#2563eb",
                },
            },
        },
    },
    plugins: [],
} satisfies Config;
