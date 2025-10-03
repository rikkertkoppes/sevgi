import { PrimitiveFunction } from "@rkmodules/rules";
import { DraggableButton } from "./DraggableButton";

import styles from "./Palette.module.css";

interface PaletteProps {
    nodes: Record<string, PrimitiveFunction>;
    handleAddNode: (name: string) => void;
}
export function Palette({ nodes, handleAddNode }: PaletteProps) {
    return (
        <div className={styles.Palette}>
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
