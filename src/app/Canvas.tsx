"use client";
import React from "react";
import { toArray, Tree } from "@rkmodules/rules";
import { ScrollCanvas } from "@/components/ScrollCanvas";
import { exporter, IModel, IPath, IPoint } from "makerjs";

function isPoint(obj: any): obj is [number, number] {
    return (
        Array.isArray(obj) &&
        obj.length === 2 &&
        typeof obj[0] === "number" &&
        typeof obj[1] === "number"
    );
}
function isPath(obj: any): obj is IPath {
    return ["line", "arc", "circle", "ellipse", "bezier"].includes(obj?.type);
}

function isModel(obj: any): obj is IModel {
    return obj && (obj.paths || obj.models);
}

import "@rkmodules/rules/index.css";
import styles from "./page.module.css";

interface CanvasProps {
    model: Tree<IModel>;
    selection: Record<string, any>;
}

export function Canvas({ model, selection }: CanvasProps) {
    const [svg, setSvg] = React.useState("");
    const [selSvg, setSelSvg] = React.useState("");
    const [points, setPoints] = React.useState<IPoint[]>([]);

    React.useEffect(() => {
        const models = toArray(model || {}) as IModel[];
        console.log("result geometry", models);

        // TODO: use model walker to iterate paths
        // then use pathToSVGPathData to create svg paths
        // use own style annotations in the paths to add style
        // output react elements
        // can use memoization to only redraw when needed

        const finalModel: IModel = {
            models: Object.fromEntries(
                models.map((m: any, i: number) => [`m${i}`, m])
            ),
        };

        setSvg(
            exporter.toSVG(finalModel, {
                useSvgPathOnly: false,
                // flow: {
                //     size: 1,
                // },
                strokeWidth: "0.2px",
                origin: [0, 0],
            })
        );
    }, [model]);

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([svg], { type: "image/svg+xml" });
        element.href = URL.createObjectURL(file);
        element.download = "model.svg";
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
        document.body.removeChild(element); // Clean up
    };

    React.useEffect(() => {
        const mainSel = selection[Object.keys(selection)[0]];
        const points: IPoint[] = [];
        const selModel: IModel = { paths: {}, models: {} };
        if (mainSel) {
            const items = toArray(mainSel);
            console.log("focus items", items);
            items.forEach((item, index) => {
                if (isPoint(item)) {
                    points.push(item);
                } else if (isPath(item)) {
                    selModel.paths!["p" + index] = item;
                } else if (isModel(item)) {
                    selModel.models!["m" + index] = item;
                }
            });
        }
        setPoints(points);
        setSelSvg(
            exporter.toSVG(selModel, {
                useSvgPathOnly: false,
                strokeWidth: "0.1px",
                stroke: "#0af",
                origin: [0, 0],
            })
        );
    }, [selection]);

    return (
        <div className={styles.Canvas}>
            <button className={styles.Download} onClick={handleDownload}>
                Download SVG
            </button>
            <ScrollCanvas className={styles.Scroll}>
                <div dangerouslySetInnerHTML={{ __html: svg }} />
                <div dangerouslySetInnerHTML={{ __html: selSvg }} />
                <svg>
                    {points.map((p, i) => (
                        <circle
                            key={i}
                            cx={p[0]}
                            cy={-p[1]}
                            r={1}
                            fill="#0af"
                        />
                    ))}
                </svg>
            </ScrollCanvas>
        </div>
    );
}
