"use client";
import {
    applyNodeAdd,
    Engine,
    Flow,
    GraphedFunction,
    primitives,
    toArray,
    useFunction,
} from "@rkmodules/rules";
import styles from "./page.module.css";
import React from "react";

import "@rkmodules/rules/index.css";

import Shapes from "@/functions/Shapes";
import Models from "@/functions/Models";
import Grid from "@/functions/Grid";
import { Tab, TabHeaders, Tabs } from "@/components/Tabs";

const engine = new Engine({
    ...Shapes,
    ...Models,
    ...Grid,
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
function NodeButtons({ nodes, handleAddNode }) {
    return (
        <div className={styles.Header}>
            {Object.entries(nodes).map(([name, primitive]) => (
                <button
                    key={name}
                    title={primitive.description}
                    onClick={handleAddNode(name)}
                >
                    {primitive.label || primitive.name}
                </button>
            ))}
        </div>
    );
}

export default function Home() {
    const [fn, setFn] = React.useState(testFunction);
    const { run, result } = useFunction(engine, fn, true);
    const [svg, setSvg] = React.useState("");

    const handleAddNode = (name: string) => () => {
        setFn(applyNodeAdd(fn, name));
    };

    // run on every change (not always required, hence not in useFunction)
    React.useEffect(() => {
        run({});
    }, [fn, run]);

    React.useEffect(() => {
        const geometry = toArray(result?.geometry || []);
        console.log("result geometry", result, geometry);
        const svg = exporter.toSVG(geometry);
        setSvg(svg);
    }, [result]);

    return (
        <div className={styles.Container}>
            <Tabs>
                <TabHeaders />
                <Tab header="Tree">
                    <NodeButtons
                        nodes={primitives}
                        handleAddNode={handleAddNode}
                    />
                </Tab>
                <Tab header="Shapes">
                    <NodeButtons nodes={Shapes} handleAddNode={handleAddNode} />
                </Tab>
                <Tab header="Model">
                    <NodeButtons nodes={Models} handleAddNode={handleAddNode} />
                </Tab>
                <Tab header="Grid">
                    <NodeButtons nodes={Grid} handleAddNode={handleAddNode} />
                </Tab>
            </Tabs>
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
