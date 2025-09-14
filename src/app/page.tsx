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
import { exporter, IModel } from "makerjs";
import { ScrollCanvas } from "@/components/ScrollCanvas";
import { Tab, TabHeaders, Tabs } from "@/components/Tabs";

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
        const models = toArray(result?.model || []) as IModel[];
        console.log("result geometry", result, models);

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
                strokeWidth: 0.1,
            })
        );
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
                <div className={styles.Canvas}>
                    <ScrollCanvas className={styles.Scroll}>
                        <div dangerouslySetInnerHTML={{ __html: svg }} />
                    </ScrollCanvas>
                </div>
            </div>
        </div>
    );
}
