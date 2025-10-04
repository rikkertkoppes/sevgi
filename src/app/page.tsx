"use client";
import Link from "next/link";
import React from "react";

import styles from "./page.module.css";

export default function Home() {
    return (
        <div className={styles.Landing}>
            <div className={styles.Head}>
                <Link href="/editor" className={styles.Logo}>
                    sevgi
                </Link>
                <div className={styles.Row}>
                    <Link href="/editor" className={styles.Launch}>
                        Open the editor
                    </Link>
                </div>
            </div>

            <div className={styles.Features}>
                <div className={styles.Feature}>
                    <h3>Free</h3>
                    <ul>
                        <li>Open source and free to use.</li>
                        <li>
                            Constribute{" "}
                            <a
                                href="https://github.com/rikkertkoppes/sevgi/"
                                target="_blank"
                            >
                                with code
                            </a>
                        </li>
                        <li>
                            ...or join the{" "}
                            <a
                                href="https://github.com/rikkertkoppes/sevgi/issues"
                                target="_blank"
                            >
                                discussion
                            </a>
                        </li>
                        <li>
                            ...or{" "}
                            <a
                                href="https://github.com/sponsors/rikkertkoppes"
                                target="_blank"
                            >
                                donate to support Sevgi
                            </a>
                        </li>
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
            <div className={styles.Start}>
                <h1>Getting Started</h1>
                <p>
                    Sevgi is different. Rather than drawing on a canvas, you
                    define shapes using a <i>graph</i> of <i>nodes</i>. A graph
                    is a network of elements with connections between them. We
                    call those elements <i>nodes</i>.
                </p>
                <p>
                    <img src="/img/circle.png" alt="Circle Node" />
                </p>
                <p>
                    Above is a `Circle` node connected to the output. It draws a
                    circle. Simple right?
                </p>
                <p>
                    By connecting a `Point` node to the circle node, we can
                    change its center point:
                </p>
                <p>
                    <img
                        src="/img/point-circle.png"
                        alt="Circle Node with Point input"
                    />
                </p>
                <p>
                    However, by connecting a grid of points to the circle, we
                    instantly get a whole grid of circles. This gets powerful{" "}
                    <i>very fast</i>.
                </p>
                <p>
                    <img
                        src="/img/trigrid-circle.png"
                        alt="Circle Node with Grid input"
                    />
                </p>
                <p>
                    By using the `Preview` panel of a node, you can have a look
                    at what it outputs. Click the output parameter to change the
                    view. Also, when a node is selected, the first output
                    parameter is highlighted on the canvas:
                </p>
                <p>
                    <img
                        src="/img/trigrid-circle-preview.png"
                        alt="Circle Node with Grid input and preview panels open"
                    />
                </p>
                {/* <h1>Things to Draw</h1> */}
            </div>
        </div>
    );
}
