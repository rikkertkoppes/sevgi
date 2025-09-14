"use client";
import {
    Engine,
    Flow,
    GraphedFunction,
    PrimitiveFunction,
    primitives,
    useFunction,
} from "@rkmodules/rules";
import styles from "./page.module.css";
import React from "react";

import "@rkmodules/rules/index.css";

import Shapes from "@/functions/Shapes";
import Models from "@/functions/Models";
import Grid from "@/functions/Grid";
import { Tab, TabHeaders, Tabs } from "@/components/Tabs";
import { Canvas } from "./Canvas";

const engine = new Engine({
    ...Shapes,
    ...Models,
    ...Grid,
});

const testFunction: GraphedFunction = {
    name: "test",
    body: {
        mainModel: {
            name: "model",
            inputs: {},
        },
    },
    outputs: {
        model: "<mainModel.m>",
    },
};

interface NodeButtonsProps {
    nodes: Record<string, PrimitiveFunction>;
    handleAddNode: (name: string) => void;
}
function NodeButtons({ nodes, handleAddNode }: NodeButtonsProps) {
    return (
        <div className={styles.Header}>
            {Object.entries(nodes).map(([name, primitive]) => (
                <button
                    key={name}
                    title={primitive.description}
                    onClick={() => handleAddNode(name)}
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

    const handleAddNode = (name: string) => {
        setFn(engine.applyNodeAdd(fn, name));
    };

    // run on every change (not always required, hence not in useFunction)
    React.useEffect(() => {
        run({});
    }, [fn, run]);

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
                <Canvas model={result?.model} />
            </div>
        </div>
    );
}
