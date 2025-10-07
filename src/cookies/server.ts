import { cookies } from "next/headers";

const FLAGS_COOKIE_NAME = "flags";

/**
 * on server components, preferably the layout
 * @param name
 * @param defaultValue
 */
export async function getServerCookieFlags(): Promise<Record<string, boolean>> {
    const cooks = await cookies();
    const flags = cooks.get(FLAGS_COOKIE_NAME)?.value ?? "{}";
    try {
        const parsed = JSON.parse(flags);
        return parsed;
    } catch {
        return {};
    }
}
