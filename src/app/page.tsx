"use client";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import classNames from "classnames";
import {
    Engine,
    Flow,
    GraphedFunction,
    PrimitiveFunction,
    Lib,
    useDraggableNode,
    useFunction,
    useUpdatePositions,
} from "@rkmodules/rules";
import styles from "./page.module.css";

import "@rkmodules/rules/index.css";

import Shapes from "@/functions/Shapes";
import Models from "@/functions/Models";
import Grid from "@/functions/Grid";
import { Tab, TabHeaders, Tabs } from "@/components/Tabs";
import { Canvas } from "./Canvas";
import { Point } from "@/Core/Geometry/Vector";

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
        model: "<mainModel.shapes>",
    },
};

interface DraggableButtonProps {
    name: string;
    fn: PrimitiveFunction;
    onClick?: (e: React.MouseEvent) => void;
}
function DraggableButton({ name, fn, onClick }: DraggableButtonProps) {
    const ref = useDraggableNode(name, fn);
    return (
        <button ref={ref as any} title={fn.description} onClick={onClick}>
            {fn.label || fn.name}
        </button>
    );
}

interface NodeButtonsProps {
    nodes: Record<string, PrimitiveFunction>;
    handleAddNode: (name: string) => void;
}
function NodeButtons({ nodes, handleAddNode }: NodeButtonsProps) {
    return (
        <div className={styles.Header}>
            {Object.entries(nodes).map(([name, primitive]) => (
                <DraggableButton
                    key={name}
                    name={name}
                    fn={primitive}
                    onClick={() => handleAddNode(name)}
                />
            ))}
        </div>
    );
}

export default function Home() {
    const [fn, setFn] = React.useState(testFunction);
    const { run, result } = useFunction(engine, fn, true);
    const [placing, setPlacing] = React.useState<string | null>(null);
    const updatePositions = useUpdatePositions(fn);
    const [data, setData] = React.useState<Record<string, any>>({});
    const [selection, setSelection] = React.useState<string | null>(null);

    const handleAddNode = (name: string) => {
        setPlacing(name);
    };

    const handlePlace = (e: React.MouseEvent, pos: Point) => {
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
        run({});
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
                            <TabHeaders />
                            <Tab header="List">
                                <NodeButtons
                                    nodes={{ ...Lib.List, ...Lib.Sequence }}
                                    handleAddNode={handleAddNode}
                                />
                            </Tab>
                            <Tab header="Tree">
                                <NodeButtons
                                    nodes={Lib.Tree}
                                    handleAddNode={handleAddNode}
                                />
                            </Tab>
                            <Tab header="Util">
                                <NodeButtons
                                    nodes={Lib.Util}
                                    handleAddNode={handleAddNode}
                                />
                            </Tab>
                            <Tab header="Math">
                                <NodeButtons
                                    nodes={{ ...Lib.Math, ...Lib.Logic }}
                                    handleAddNode={handleAddNode}
                                />
                            </Tab>
                            <Tab header="Shapes">
                                <NodeButtons
                                    nodes={Shapes}
                                    handleAddNode={handleAddNode}
                                />
                            </Tab>
                            <Tab header="Model">
                                <NodeButtons
                                    nodes={Models}
                                    handleAddNode={handleAddNode}
                                />
                            </Tab>
                            <Tab header="Patterns">
                                <NodeButtons
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
                    </div>
                    <div className={styles.ResultPane}>
                        <Tabs>
                            <TabHeaders />
                            <Tab header="Canvas">
                                <Canvas
                                    model={result?.model}
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
