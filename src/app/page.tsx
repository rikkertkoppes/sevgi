"use client";
import {
    applyNodeAdd,
    Engine,
    Flow,
    GraphedFunction,
    primitives,
    useFunction,
} from "@rkmodules/rules";
import styles from "./page.module.css";
import React from "react";

import "@rkmodules/rules/index.css";

import Shapes from "@/functions/Shapes";
import { exporter } from "makerjs";

const engine = new Engine({
    ...Shapes,
});

const testFunction: GraphedFunction = {
    name: "test",
    body: {
        myVal: {
            name: "value",
            params: {
                type: "string",
                value: "woo",
            },
        },
        myLog: {
            name: "log",
            inputs: {
                data: "<myVal.value>",
            },
        },
        p1: {
            name: "point",
            inputs: {
                x: 0,
                y: 0,
            },
        },
        p2: {
            name: "point",
            inputs: {
                x: 100,
                y: 100,
            },
        },
        myEdge: {
            name: "line",
            inputs: {
                o: "<p1.p>",
                e: "<p2.p>",
            },
        },
        myCircle: {
            name: "circle",
            inputs: {
                o: "<p1.p>",
                r: 50,
            },
        },
    },
    outputs: {
        data: "<myLog.data>",
        geometry: ["<p1.p>", "<p2.p>", "<myEdge.l>", "<myCircle.c>"],
    },
};

export default function Home() {
    const [fn, setFn] = React.useState(testFunction);
    const { run, result } = useFunction(engine, fn, true);
    const [svg, setSvg] = React.useState("");

    const handleAddNode =
        (name: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
            setFn(applyNodeAdd(fn, name));
        };

    // run on every change (not always required, hence not in useFunction)
    React.useEffect(() => {
        run({});
    }, [fn, run]);

    React.useEffect(() => {
        const svg = exporter.toSVG(result?.geometry?.[0] || []);
        setSvg(svg);
    }, [result]);

    return (
        <div className={styles.Container}>
            <div className={styles.Header}>
                <button onClick={async () => run()}>run</button>
                {Object.entries(primitives).map(([name, primitive]) => (
                    <button
                        key={name}
                        title={primitive.description}
                        onClick={handleAddNode(name)}
                    >
                        {primitive.label || primitive.name}
                    </button>
                ))}
            </div>
            <div className={styles.Panes}>
                <div className={styles.FlowVis}>
                    <Flow function={fn} engine={engine} onChange={setFn} />
                </div>
                <div
                    className={styles.Canvas}
                    dangerouslySetInnerHTML={{ __html: svg }}
                ></div>
            </div>
        </div>
    );
}
