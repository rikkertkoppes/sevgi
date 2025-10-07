const FLAGS_COOKIE_NAME = "flags";

export function getClientCookieFlags(): Record<string, boolean> {
    if (typeof document === "undefined") return {};
    const cookies = document.cookie.split("; ").reduce((acc, cook) => {
        const [name, value] = cook.split("=");
        acc[name] = value;
        return acc;
    }, {} as Record<string, string>);
    const flags = cookies[FLAGS_COOKIE_NAME] ?? "{}";
    try {
        const parsed = JSON.parse(flags);
        return parsed;
    } catch {
        return {};
    }
}

export function toggleCookieFlag(name: string, value?: boolean) {
    const flags = getClientCookieFlags();
    const newValue = value ?? !flags[name];
    const newFlags = { ...flags, [name]: newValue };
    const json = JSON.stringify(newFlags);
    document.documentElement.classList.toggle(name, newValue);
    document.cookie = `${FLAGS_COOKIE_NAME}=${json}; path=/; max-age=31536000`;
}
