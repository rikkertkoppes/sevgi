"use client";
import React from "react";
import { toArray, Tree } from "@rkmodules/rules";
import { ScrollCanvas } from "@/components/ScrollCanvas";
import { exporter, IModel } from "makerjs";

import "@rkmodules/rules/index.css";
import styles from "./page.module.css";

interface CanvasProps {
    model: Tree<IModel>;
}

export function Canvas({ model }: CanvasProps) {
    const [svg, setSvg] = React.useState("");

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

    return (
        <div className={styles.Canvas}>
            <button className={styles.Download} onClick={handleDownload}>
                Download SVG
            </button>
            <ScrollCanvas className={styles.Scroll}>
                <div dangerouslySetInnerHTML={{ __html: svg }} />
            </ScrollCanvas>
        </div>
    );
}
