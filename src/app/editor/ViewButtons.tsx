"use client";
import React from "react";
import { getClientCookieFlags, toggleCookieFlag } from "../../cookies/client";

import styles from "./editor.module.css";

export default function ViewButtons() {
    const [flags, setFlags] = React.useState(getClientCookieFlags());
    const [fs, setFs] = React.useState<boolean>(false);
    const toggleVertical = () => {
        toggleCookieFlag("verticalView");
        setFlags(getClientCookieFlags());
    };
    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setFs(true);
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
            setFs(false);
        }
    };
    const orSymbol = flags.verticalView ? "viewHorizontal" : "viewVertical";
    const fsSymbol = fs ? "fullscreenExit" : "fullscreenEnter";

    return (
        <div className={styles.ViewButtons}>
            <button
                className={styles.Orientation}
                onClick={toggleVertical}
                title="Toggle viewport orientation"
            >
                <svg>
                    <use href={`/symbols.svg#${orSymbol}`}></use>
                </svg>
            </button>
            <button
                className={styles.Fullscreen}
                onClick={toggleFullScreen}
                title="Toggle fullscreen"
            >
                <svg>
                    <use href={`/symbols.svg#${fsSymbol}`}></use>
                </svg>
            </button>
        </div>
    );
}
