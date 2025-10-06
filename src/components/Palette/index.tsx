import { PrimitiveFunction } from "@rkmodules/rules";
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
