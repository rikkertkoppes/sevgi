"use client";
import Link from "next/link";
import React from "react";

import styles from "./page.module.css";

export default function Home() {
    return (
        <div className={styles.Landing}>
            <div className={styles.Head}>
                <Link href="/editor">sevgi</Link>
            </div>
            <div className={styles.Features}>
                <div className={styles.Feature}>
                    <h3>Free</h3>
                    <ul>
                        <li>Open source and free to use.</li>
                        <li>Constribute with code</li>
                        <li>Or join the discussion</li>
                        <li>Or donate to support Sevgi</li>
                    </ul>
                </div>
                <div className={styles.Feature}>
                    <h3>SVG Export</h3>
                    <ul>
                        <li>Export your designs as SVG files.</li>
                        <li>Perfect for laser cutting</li>
                    </ul>
                </div>
                <div className={styles.Feature}>
                    <h3>Node-based</h3>
                    <ul>
                        <li>Visual programming with a node-based interface.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
