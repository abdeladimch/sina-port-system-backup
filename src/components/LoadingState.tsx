export function LoadingState({ label = "Loading..." }: { label?: string }) {
    return (
        <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">
            <div className="animate-pulse">{label}</div>
        </div>
    );
}

export function EmptyState({
    title,
    description,
    action,
}: {
    title: string;
    description: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col items-center justify-center h-64 text-center px-6 border border-dashed border-zinc-200 rounded-lg bg-zinc-50">
            <div className="text-base font-medium text-zinc-700">{title}</div>
            <div className="mt-1 text-sm text-zinc-500 max-w-md">{description}</div>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
