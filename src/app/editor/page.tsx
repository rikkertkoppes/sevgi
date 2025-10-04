"use client";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import classNames from "classnames";
import {
    Engine,
    Flow,
    GraphedFunction,
    Lib,
    useFunction,
    useUpdatePositions,
} from "@rkmodules/rules";
import Link from "next/link";

import Create from "@/functions/Create";
import Modify from "@/functions/Modify";
import Grid from "@/functions/Grid";
import { Tab, TabHeaders, Tabs } from "@/components/Tabs";
import { Canvas } from "@/components/Canvas";
import { Palette } from "@/components/Palette";
import { output } from "@/functions/Output";

import styles from "./editor.module.css";
import "@rkmodules/rules/index.css";

const engine = new Engine({
    ...Create,
    ...Modify,
    ...Grid,
    output,
});

const testFunction: GraphedFunction = {
    name: "test",
    body: {
        output: {
            name: "output",
            inputs: {},
        },
    },
    outputs: {
        geometry: "<output.geometry>",
    },
};

export default function Home() {
    const [fn, setFn] = React.useState(testFunction);
    const { run, result } = useFunction(engine, fn, true);
    const [placing, setPlacing] = React.useState<string | null>(null);
    const updatePositions = useUpdatePositions(fn);
    const [data, setData] = React.useState<Record<string, any>>({});
    const [selection, setSelection] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    const handleAddNode = (name: string) => {
        setPlacing(name);
    };

    const handlePlace = (
        e: React.MouseEvent,
        pos: { x: number; y: number }
    ) => {
        if (placing) {
            setFn(
                engine.applyNodeAdd(fn, placing, (fn, id) => {
                    updatePositions(id, pos);
                    setPlacing(null);
                })
            );
        }
    };

    // keep the scope of every run
    React.useEffect(() => {
        return engine.subscribe("result", (event) => {
            setData(event.context.scope);
        });
    }, []);

    const handleSelect = React.useCallback((ids: string[]) => {
        setSelection(ids[0] || null);
    }, []);

    // run on every change (not always required, hence not in useFunction)
    React.useEffect(() => {
        setError(null);
        run({}).catch((e) => {
            console.error(e);
            setError((e as Error).message);
        });
    }, [fn, run]);

    return (
        <DndProvider backend={HTML5Backend}>
            <div
                className={classNames(styles.Container, {
                    [styles.placing]: !!placing,
                })}
            >
                <div className={styles.Panes}>
                    <div className={styles.FlowPane}>
                        <Tabs>
                            <TabHeaders>
                                <div className={styles.Version}>
                                    <div className={styles.Title}>
                                        <Link href="/">sevgi</Link>
                                    </div>
                                    v{process.env.NEXT_PUBLIC_APP_VERSION}
                                </div>
                            </TabHeaders>
                            <Tab header="List">
                                <Palette
                                    nodes={{ ...Lib.List, ...Lib.Sequence }}
                                    handleAddNode={handleAddNode}
                                />
                            </Tab>
                            <Tab header="Tree">
                                <Palette
                                    nodes={Lib.Tree}
                                    handleAddNode={handleAddNode}
                                />
                            </Tab>
                            <Tab header="Util">
                                <Palette
                                    nodes={Lib.Util}
                                    handleAddNode={handleAddNode}
                                />
                            </Tab>
                            <Tab header="Math">
                                <Palette
                                    nodes={{ ...Lib.Math, ...Lib.Logic }}
                                    handleAddNode={handleAddNode}
                                />
                            </Tab>
                            <Tab header="Create">
                                <Palette
                                    nodes={Create}
                                    handleAddNode={handleAddNode}
                                />
                            </Tab>
                            <Tab header="Modify">
                                <Palette
                                    nodes={Modify}
                                    handleAddNode={handleAddNode}
                                />
                            </Tab>
                            <Tab header="Patterns">
                                <Palette
                                    nodes={Grid}
                                    handleAddNode={handleAddNode}
                                />
                            </Tab>
                        </Tabs>
                        <Flow
                            function={fn}
                            engine={engine}
                            onChange={setFn}
                            onClick={handlePlace}
                            onSelect={handleSelect}
                        />
                        {error && <div className={styles.Error}>{error}</div>}
                    </div>
                    <div className={styles.ResultPane}>
                        <Tabs>
                            <TabHeaders />
                            <Tab header="Canvas">
                                <Canvas
                                    geometry={result?.geometry}
                                    selection={
                                        selection ? data[selection] || {} : {}
                                    }
                                />
                            </Tab>
                        </Tabs>
                    </div>
                </div>
            </div>
        </DndProvider>
    );
}
