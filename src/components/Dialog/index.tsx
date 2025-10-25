import classNames from "classnames";
import React from "react";

import { PortalContent } from "../Portal";

import styles from "./Dialog.module.css";

interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
    onScrimClick?: (e: React.MouseEvent) => void;
    className?: string;
    portal?: string;
    children?: React.ReactNode;
    buttons?: React.ReactNode;
}
export const Dialog = ({
    onScrimClick,
    className,
    portal,
    children,
    buttons,
    ...divProps
}: DialogProps) => {
    const contents = (
        <div className={styles.DialogWrap}>
            <div className={styles.DialogScrim} onClick={onScrimClick} />
            <div className={classNames(styles.Dialog, className)} {...divProps}>
                <div className={styles.DialogButtons}>{buttons}</div>
                {children}
            </div>
        </div>
    );
    if (portal) {
        return <PortalContent id={portal}>{contents}</PortalContent>;
    } else {
        return contents;
    }
};

interface DialogActionsProps {
    children?: React.ReactNode;
}
export const DialogActions = ({ children }: DialogActionsProps) => {
    return <div className={styles.DialogActions}>{children}</div>;
};

interface DialogTitleProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}
export const DialogTitle = ({ children, ...props }: DialogTitleProps) => {
    return (
        <div className={styles.DialogTitle} {...props}>
            {children}
        </div>
    );
};

interface DialogBodyProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}
export const DialogBody = ({ children, ...props }: DialogBodyProps) => {
    return (
        <div className={styles.DialogBody} {...props}>
            {children}
        </div>
    );
};
