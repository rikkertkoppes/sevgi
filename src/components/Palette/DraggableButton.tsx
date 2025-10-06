import {
    normalizeVarDef,
    PrimitiveFunction,
    useDraggableNode,
} from "@rkmodules/rules";

interface DraggableButtonProps {
    name: string;
    fn: PrimitiveFunction;
    onClick?: (e: React.MouseEvent) => void;
}
export function DraggableButton({ name, fn, onClick }: DraggableButtonProps) {
    const ref = useDraggableNode(name, fn);
    const outType = normalizeVarDef(
        Object.values(fn.outputs || {})[0] || { type: "Geometry" }
    ).type;
    return (
        <button
            ref={ref as any}
            title={fn.description}
            onClick={onClick}
            style={
                {
                    "--icon-accent": `var(--color-${outType})`,
                } as any
            }
        >
            <svg>
                <use href={`/symbols.svg#${name}`}></use>
            </svg>
            {fn.label || fn.name}
        </button>
    );
}
