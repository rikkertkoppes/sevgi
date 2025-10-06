import fs from "node:fs/promises";
import fssync from "node:fs";
import path from "node:path";
import { optimize } from "svgo";
import { load as loadXML, CheerioAPI, Cheerio } from "cheerio";

const SRC_DIR = "public/symbols";
const OUT_FILE = "public/symbols.svg";

// Map any color token to your CSS variables (extend as needed)
const REPLACE_MAP: Record<string, string> = {
    black: "var(--foreground)",
    "#000": "var(--foreground)",
    "#000000": "var(--foreground)",
    "rgb(0,0,0)": "var(--foreground)",
    white: "var(--background)",
    "#fff": "var(--background)",
    "#ffffff": "var(--background)",
    "rgb(255,255,255)": "var(--background)",
    red: "var(--icon-accent)",
    "#f00": "var(--icon-accent)",
    "#ff0000": "var(--icon-accent)",
    "rgb(255,0,0)": "var(--icon-accent)",
};

const PAINT_ATTRS = [
    "fill",
    "stroke",
    "stop-color",
    "flood-color",
    "lighting-color",
] as const;

// function kebabify(name: string) {
//     return name
//         .replace(/\.[^.]+$/, "")
//         .replace(/[_\s]+/g, "-")
//         .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
//         .toLowerCase();
// }

function normalizeColor(v: string | undefined | null) {
    if (!v) return v;
    const t = v.trim().toLowerCase().replace(/\s+/g, "");
    const m = t.match(/^#([0-9a-f]{3})$/i);
    if (m) {
        const [r, g, b] = m[1];
        return `#${r}${r}${g}${g}${b}${b}`;
    }
    return t;
}

function mapPaint(value: string | undefined | null) {
    if (!value) return value ?? "";
    const v = normalizeColor(value);
    if (!v || v === "none" || v === "transparent") return value;
    return REPLACE_MAP[v] ?? value;
}

function cleanWithSvgo(svg: string) {
    return optimize(svg, {
        multipass: true,
        plugins: [
            "removeEditorsNSData",
            "removeDesc",
            "removeDimensions",
            {
                name: "removeAttrs",
                params: {
                    attrs: [
                        "^inkscape:.*$",
                        "^sodipodi:.*$",
                        "xml:space",
                        "data-name",
                    ],
                },
            },
            { name: "removeXMLNS" },
        ],
    }).data;
}

function extractViewBox($svg: Cheerio<any>) {
    const vb = $svg.attr("viewBox");
    if (vb) return vb;
    const w = parseFloat(($svg.attr("width") ?? "").replace(/[^0-9.]/g, ""));
    const h = parseFloat(($svg.attr("height") ?? "").replace(/[^0-9.]/g, ""));
    if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0)
        return `0 0 ${w} ${h}`;
    return "0 0 24 24";
}

function rewritePaintAttributes($: CheerioAPI) {
    $("*").each((_, el) => {
        const $el = $(el);
        for (const a of PAINT_ATTRS) {
            if ($el.attr(a)) $el.attr(a, mapPaint($el.attr(a))!);
        }
        const style = $el.attr("style");
        if (style) {
            const newStyle = style
                .split(";")
                .map((decl) => {
                    const [prop, rawVal] = decl.split(":");
                    if (!prop || rawVal == null) return decl;
                    const p = prop.trim().toLowerCase();
                    const v = rawVal.trim();
                    if ((PAINT_ATTRS as readonly string[]).includes(p))
                        return `${p}: ${mapPaint(v)}`;
                    return decl;
                })
                .join(";");
            $el.attr("style", newStyle);
        }
    });

    $("style").each((_, el) => {
        const $el = $(el);
        let css = $el.html() ?? "";
        for (const [from, to] of Object.entries(REPLACE_MAP)) {
            const isName = /^[a-z]+$/i.test(from);
            const re = isName
                ? new RegExp(`(^|[^-\\w])(${from})(?![-\\w])`, "gi")
                : new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
            css = css.replace(re, (m, pre) => (isName ? `${pre}${to}` : to));
        }
        $el.text(css);
    });
}

async function readAndTransformOne(filePath: string) {
    const raw = await fs.readFile(filePath, "utf8");
    const cleaned = cleanWithSvgo(raw);
    const $ = loadXML(cleaned, { xmlMode: true });
    const $svg = $("svg").first();
    $svg.removeAttr("xmlns").removeAttr("xmlns:xlink");
    rewritePaintAttributes($);
    const viewBox = extractViewBox($svg);
    const inner = $svg.html() ?? "";
    return { viewBox, inner };
}

async function buildSprite(rootDir: string) {
    const srcAbs = path.join(rootDir, SRC_DIR);
    const outAbs = path.join(rootDir, OUT_FILE);

    if (!fssync.existsSync(srcAbs)) {
        console.log(`[sprite] No ${path.relative(rootDir, srcAbs)}; skipping.`);
        return { files: [] as string[], outAbs };
    }

    const files = fssync
        .readdirSync(srcAbs)
        .filter((f) => f.toLowerCase().endsWith(".svg"))
        .sort()
        .map((f) => path.join(srcAbs, f));

    const symbols: string[] = [];
    for (const full of files) {
        const id = path.basename(full, ".svg");
        try {
            const { viewBox, inner } = await readAndTransformOne(full);
            symbols.push(
                `<symbol id="${id}" viewBox="${viewBox}">${inner}</symbol>`
            );
            console.log(`[sprite] ${path.basename(full)} → #${id}`);
        } catch (e: any) {
            console.error(
                `[sprite] ${path.basename(full)}: ${e?.message ?? e}`
            );
        }
    }

    const sprite =
        `<!-- Auto-generated. Do not edit by hand. -->\n` +
        `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n` +
        symbols.join("\n") +
        `\n</svg>\n`;

    await fs.mkdir(path.dirname(outAbs), { recursive: true });
    await fs.writeFile(outAbs, sprite, "utf8");
    console.log(
        `[sprite] Wrote ${path.relative(rootDir, outAbs)} (${
            symbols.length
        } symbols)`
    );

    // return { files, outAbs };
}

buildSprite(".").catch((e) => {
    console.error(e);
    process.exit(1);
});

// export class SymbolSpritePlugin {
//     // apply(compiler: Compiler) {
//     apply(compiler: any) {
//         const root = compiler.context;

//         const runBuild = async () => {
//             const { files, outAbs } = await buildSprite(root);

//             // Let webpack know about dependencies so changes trigger rebuilds.
//             compiler.hooks.afterCompile.tap(
//                 "SymbolSpritePlugin",
//                 (compilation: any) => {
//                     for (const f of files)
//                         (compilation.fileDependencies as any).add(f);
//                     (compilation.fileDependencies as any).add(outAbs);
//                 }
//             );
//         };

//         compiler.hooks.beforeCompile.tapPromise("SymbolSpritePlugin", runBuild);

//         // In dev, watch the folder and invalidate to force a refresh.
//         compiler.hooks.afterEnvironment.tap("SymbolSpritePlugin", () => {
//             // `watch` is true under next dev
//             //// @ts-expect-error - .watch exists in webpack's CompilerOptions at runtime
//             if (compiler.options.watch) {
//                 const srcAbs = path.join(root, SRC_DIR);
//                 const watcher = chokidar.watch(path.join(srcAbs, "**/*.svg"), {
//                     ignoreInitial: true,
//                 });
//                 const rebuild = debounce(async () => {
//                     await buildSprite(root);
//                     // Trigger a rebuild/refresh even if no JS changed
//                     //// @ts-expect-error - watching is set by webpack when in watch mode
//                     if (compiler.watching && compiler.watching.invalidate)
//                         compiler.watching.invalidate();
//                 }, 120);
//                 watcher
//                     .on("add", rebuild)
//                     .on("change", rebuild)
//                     .on("unlink", rebuild);
//             }
//         });
//     }
// }

// function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
//     let t: NodeJS.Timeout | undefined;
//     return (...args: Parameters<T>) => {
//         if (t) clearTimeout(t);
//         t = setTimeout(() => fn(...args), ms);
//     };
// }
