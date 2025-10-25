import React from "react";
import { Engine, GraphedFunction, PrimitiveFunction } from "@rkmodules/rules";
import { DraggableButton } from "./DraggableButton";

import styles from "./Palette.module.css";

interface PaletteProps {
    nodes: Record<string, PrimitiveFunction>;
    handleAddNode: (name: string) => void;
    accent?: string;
}
export function Palette({ nodes, handleAddNode, accent }: PaletteProps) {
    return (
        <div
            className={styles.Palette}
            style={
                {
                    "--icon-accent": accent || "var(--accent)",
                } as any
            }
        >
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

interface MyNodesProps {
    engine: Engine;
}
export function MyNodes({ engine }: MyNodesProps) {
    const [nodes, setNodes] = React.useState<Record<string, PrimitiveFunction>>(
        {}
    );

    React.useEffect(() => {
        const fns = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("function_")) {
                const item = localStorage.getItem(key);
                if (item) {
                    try {
                        const parsed = JSON.parse(item) as GraphedFunction;
                        const primitive = engine.build(parsed);
                        fns.push([primitive.name, primitive]);
                    } catch (e) {
                        console.warn(
                            "Failed to parse primitive function from localStorage",
                            key,
                            e
                        );
                    }
                }
            }
        }
        setNodes(Object.fromEntries(fns));
    }, [engine]);

    return (
        <div className={styles.Palette}>
            {Object.entries(nodes).map(([name, primitive]) => (
                <DraggableButton
                    key={name}
                    name={name}
                    fn={primitive}
                    onClick={() => {}}
                    icon="custom"
                />
            ))}
        </div>
    );
}
