"use client";
import { toArray, Tree } from "@rkmodules/rules";
import styles from "./page.module.css";
import React from "react";

import "@rkmodules/rules/index.css";

import { ScrollCanvas } from "@/components/ScrollCanvas";
import { exporter, IModel } from "makerjs";

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
                // fill: "red",
                flow: {
                    size: 1,
                },
                strokeWidth: "0.1px",
            })
        );
    }, [model]);

    return (
        <div className={styles.Canvas}>
            <ScrollCanvas className={styles.Scroll}>
                <div dangerouslySetInnerHTML={{ __html: svg }} />
            </ScrollCanvas>
        </div>
    );
}
