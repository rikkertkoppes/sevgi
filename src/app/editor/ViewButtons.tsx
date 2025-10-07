"use client";
import React from "react";
import { getClientCookieFlags, toggleCookieFlag } from "../../cookies/client";

import styles from "./editor.module.css";

export default function ViewButtons() {
    const [flags, setFlags] = React.useState(getClientCookieFlags());
    const toggleVertical = () => {
        toggleCookieFlag("verticalView");
        setFlags(getClientCookieFlags());
    };
    const symbol = flags.verticalView ? "viewHorizontal" : "viewVertical";

    return (
        <div className={styles.ViewButtons}>
            <button
                onClick={toggleVertical}
                title="Toggle viewport orientation"
            >
                <svg>
                    <use href={`/symbols.svg#${symbol}`}></use>
                </svg>
            </button>
        </div>
    );
}
