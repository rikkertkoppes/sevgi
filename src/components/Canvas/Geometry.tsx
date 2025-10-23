import React from "react";

interface GeometryProps {
    c: string;
    d: string;
}
export const Geometry = React.memo(({ d, c }: GeometryProps) => {
    if (!d) return null;
    return <path d={d} className={c} />;
});
Geometry.displayName = "Geometry";
