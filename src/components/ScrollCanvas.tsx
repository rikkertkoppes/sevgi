import React from "react";
import InfiniteViewer from "react-infinite-viewer";

// import styles from "./Consolidation.module.css";

interface ScrollCanvasProps {
    className?: string;
    children?: React.ReactNode;
}
export function ScrollCanvas({ className, children }: ScrollCanvasProps) {
    const viewer = React.useRef<any>(null);

    const center = () => {
        viewer.current?.infiniteViewer.scrollCenter({
            duration: 300,
        });
    };

    React.useEffect(() => {
        center();
    }, []);

    const zoomin = () => {
        if (viewer.current) {
            const iv = viewer.current.infiniteViewer;
            const zoom = iv.getZoom();
            iv.setZoom(zoom * 1.2, { duration: 100 });
            // iv.zoomBy(0.2, { duration: 0 });
        }
    };
    const zoomout = () => {
        if (viewer.current) {
            const iv = viewer.current.infiniteViewer;
            const zoom = iv.getZoom();
            if (zoom >= 0.2) {
                iv.setZoom((zoom * 1) / 1.2, { duration: 100 });
                // iv.zoomBy(-0.2, { duration: 0 });
            }
        }
    };
    const handleWheel = (e: React.WheelEvent) => {
        if (e.deltaY < 0) {
            zoomin();
        } else {
            zoomout();
        }
        // e.preventDefault();
        // e.stopPropagation();
    };

    return (
        <div onWheel={handleWheel} style={{ height: "100%" }} id="foo">
            <InfiniteViewer
                ref={viewer}
                // className={styles.Viewer}
                className={className}
                style={{ height: "100%", width: "100%" }}
                margin={0}
                threshold={0}
                // rangeX={[0, 0]}
                // rangeY={[0, 0]}
                useMouseDrag={true}
                preventWheelClick={false}
                useWheelScroll={false}
                useWheelPinch={false}
                // onScroll={(e) => {
                //     console.log(e.currentTarget);
                // }}
                onDragStart={(e) => {
                    // only  allow wheel
                    if (e.inputEvent.button > 1) {
                        e.stop();
                        return;
                    }
                }}
            >
                <div className="viewport">{children}</div>
            </InfiniteViewer>
        </div>
    );
}
