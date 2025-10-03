import { PrimitiveFunction, useDraggableNode } from "@rkmodules/rules";

interface DraggableButtonProps {
    name: string;
    fn: PrimitiveFunction;
    onClick?: (e: React.MouseEvent) => void;
}
export function DraggableButton({ name, fn, onClick }: DraggableButtonProps) {
    const ref = useDraggableNode(name, fn);
    return (
        <button ref={ref as any} title={fn.description} onClick={onClick}>
            {fn.label || fn.name}
        </button>
    );
}
