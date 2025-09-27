"use client";
import React from "react";
import { toArray, Tree } from "@rkmodules/rules";
import { ScrollCanvas } from "@/components/ScrollCanvas";

import "@rkmodules/rules/index.css";
import styles from "./page.module.css";
import { BaseGeometry } from "@/Core/Geometry/BaseGeometry";

interface GeometryProps {
    g: BaseGeometry;
}
function Geometry({ g }: GeometryProps) {
    if (!g) return null;
    return (
        <path
            d={g.toSVG()}
            stroke="black"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={0.2}
        />
    );
}

interface CanvasProps {
    model: Tree<BaseGeometry>;
    selection: Record<string, any>;
}

export function Canvas({ model, selection }: CanvasProps) {
    const [svg, setSvg] = React.useState("");
    const [geometry, setGeometry] = React.useState<BaseGeometry[]>([]);

    React.useEffect(() => {
        const models = toArray(model || {}) as BaseGeometry[];
        console.log("result geometry", models);

        // TODO: use model walker to iterate paths
        // then use pathToSVGPathData to create svg paths
        // use own style annotations in the paths to add style
        // output react elements
        // can use memoization to only redraw when needed

        // const finalModel: IModel = {
        //     models: Object.fromEntries(
        //         models.map((m: any, i: number) => [`m${i}`, m])
        //     ),
        // };

        // setSvg(
        //     exporter.toSVG(finalModel, {
        //         useSvgPathOnly: false,
        //         // flow: {
        //         //     size: 1,
        //         // },
        //         strokeWidth: "0.2px",
        //         origin: [0, 0],
        //     })
        // );
        setGeometry(models);
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

    // React.useEffect(() => {
    //     const mainSel = selection[Object.keys(selection)[0]];
    //     const points: IPoint[] = [];
    //     const selModel: IModel = { paths: {}, models: {} };
    //     if (mainSel) {
    //         const items = toArray(mainSel);
    //         console.log("focus items", items);
    //         items.forEach((item, index) => {
    //             if (isPoint(item)) {
    //                 points.push(item);
    //             } else if (isPath(item)) {
    //                 selModel.paths!["p" + index] = item;
    //             } else if (isModel(item)) {
    //                 selModel.models!["m" + index] = item;
    //             }
    //         });
    //     }
    //     setPoints(points);
    //     setSelSvg(
    //         exporter.toSVG(selModel, {
    //             useSvgPathOnly: false,
    //             strokeWidth: "0.1px",
    //             stroke: "#0af",
    //             origin: [0, 0],
    //         })
    //     );
    // }, [selection]);

    return (
        <div className={styles.Canvas}>
            <button className={styles.Download} onClick={handleDownload}>
                Download SVG
            </button>
            <ScrollCanvas className={styles.Scroll}>
                <svg>
                    <g transform="scale(1,-1)">
                        {geometry.map((g, i) => (
                            <Geometry g={g} key={i} />
                        ))}
                    </g>
                </svg>
                {/* <div dangerouslySetInnerHTML={{ __html: svg }} /> */}
                {/* <div dangerouslySetInnerHTML={{ __html: selSvg }} />
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
                </svg> */}
            </ScrollCanvas>
        </div>
    );
}
