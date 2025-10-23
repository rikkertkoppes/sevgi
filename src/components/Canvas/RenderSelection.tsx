import React from "react";
import { toArray, Tree } from "@rkmodules/rules";

import { BaseGeometry } from "@/Core/Geometry/BaseGeometry";
import { Geometry } from "./Geometry";

import styles from "./Canvas.module.css";

interface RenderSelectionProps {
    selection: Record<string, Tree<BaseGeometry>>;
}
export function RenderSelection({ selection }: RenderSelectionProps) {
    const [selectionGeometry, setSelectionGeometry] = React.useState<
        BaseGeometry[]
    >([]);
    React.useEffect(() => {
        const mainSel = selection[Object.keys(selection)[0]];
        const selGeometry = toArray(mainSel || {}) as BaseGeometry[];
        setSelectionGeometry(selGeometry);
    }, [selection]);

    return (
        <g className={styles.Selection}>
            {selectionGeometry.map((g, i) => {
                if (!g) return null;
                return <Geometry d={g.toSVG?.()} key={i} c={g.type} />;
            })}
        </g>
    );
}
