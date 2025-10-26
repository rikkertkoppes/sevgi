"use client";
import React from "react";
import classNames from "classnames";
import {
    DDContext,
    Engine,
    Flow,
    GraphedFunction,
    Lib,
    useFunction,
    useUpdatePositions,
} from "@rkmodules/rules";
import Link from "next/link";
import dynamic from "next/dynamic";

import Create from "@/functions/Create";
import Modify from "@/functions/Modify";
import Grid from "@/functions/Grid";
import List from "@/functions/List";
import { AlertHandler, usePrompts } from "@/hooks/useAlert";
import { Tab, TabHeaders, Tabs } from "@/components/Tabs";
import { Canvas } from "@/components/Canvas";
import { MyNodes, Palette } from "@/components/Palette";
const ViewButtons = dynamic(() => import("./ViewButtons"), { ssr: false });

import styles from "./editor.module.css";
import "@rkmodules/rules/index.css";

const engine = new Engine({
    ...Create,
    ...Modify,
    ...Grid,
    ...List,
});

if (typeof window !== "undefined") {
    (window as any).engine = engine;
}

const emptyFunction: GraphedFunction = {
    name: "",
    body: {},
    outputs: {
        geometry: "",
    },
};

export default function Home() {
    const [fn, setFn] = React.useState(emptyFunction);
    const [saved, setSaved] = React.useState(false);
    const { run, result } = useFunction(engine, fn, true);
    const [placing, setPlacing] = React.useState<string | null>(null);
    const updatePositions = useUpdatePositions(fn);
    const [data, setData] = React.useState<Record<string, any>>({});
    const [selection, setSelection] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const prompts = usePrompts();

    const handleAddNode = (name: string) => {
        setPlacing(name);
    };

    const handleNew = async () => {
        if (
            saved ||
            fn === emptyFunction ||
            (await prompts.confirm("Current flow is not saved, continue?"))
        ) {
            setFn(emptyFunction);
        }
    };

    const handleSave = async () => {
        const toSave = { ...fn };
        if (!toSave.name) {
            const name = await prompts.prompt(
                "Enter function name",
                fn.name || ""
            );
            if (name) {
                toSave.name = name;
            } else {
                return;
            }
        }
        localStorage.setItem(`function_${toSave.name}`, JSON.stringify(toSave));
        setFn(toSave);
        setSaved(true);
    };

    const handleOpen = async () => {
        const name = await prompts.prompt(
            "Enter function name to open",
            fn.name || ""
        );
        if (name) {
            const savedFn = localStorage.getItem(`function_${name}`);
            if (savedFn) {
                setFn(JSON.parse(savedFn));
            } else {
                alert("Function not found");
            }
        }
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
        <DDContext>
            <div
                className={classNames(styles.Container, {
                    [styles.placing]: !!placing,
                })}
            >
                <div className={styles.Panes}>
                    <Tabs>
                        <div className={styles.FlowPane}>
                            <TabHeaders
                                leftTools={
                                    <div className={styles.MainMenu}>
                                        <button onClick={handleNew}>New</button>
                                        <button onClick={handleSave}>
                                            Save...
                                        </button>
                                        <button onClick={handleOpen}>
                                            Open...
                                        </button>
                                    </div>
                                }
                            >
                                <div className={styles.Version}>
                                    <ViewButtons />
                                    <div className={styles.Title}>
                                        <Link href="/">sevgi</Link>
                                    </div>
                                    v{process.env.NEXT_PUBLIC_APP_VERSION}
                                </div>
                            </TabHeaders>
                            <div className={styles.FlowPanel}>
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
                                <Tab header="List">
                                    <Palette
                                        nodes={{
                                            ...Lib.List,
                                            ...Lib.Sequence,
                                            ...List,
                                        }}
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
                                        nodes={{
                                            inputs: Lib.IO.inputs,
                                            ...Lib.Util,
                                        }}
                                        handleAddNode={handleAddNode}
                                    />
                                </Tab>
                                <Tab header="Math">
                                    <Palette
                                        nodes={{ ...Lib.Math, ...Lib.Logic }}
                                        handleAddNode={handleAddNode}
                                    />
                                </Tab>
                                <Tab header="My Flows">
                                    <MyNodes engine={engine} />
                                </Tab>
                                <Flow
                                    function={fn}
                                    engine={engine}
                                    onChange={setFn}
                                    onClick={handlePlace}
                                    onSelect={handleSelect}
                                    customPrompts={prompts}
                                />
                                {error && (
                                    <div className={styles.Error}>{error}</div>
                                )}
                            </div>
                        </div>
                    </Tabs>
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
            <AlertHandler />
        </DDContext>
    );
}
