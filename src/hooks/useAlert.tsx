import useInner from "@rkmodules/use-inner";
import React from "react";
import { create } from "zustand";
import {
    Dialog,
    DialogActions,
    DialogBody,
    DialogTitle,
} from "../components/Dialog";

type AlertMode = "alert" | "confirm" | "prompt";
type Resolver<T> = (value?: T | PromiseLike<T>) => void;
type AlertState = {
    visible: boolean;
    mode: AlertMode;
    message: string | undefined;
    value: string;
    resolver: Resolver<any>;
    alert: (message?: string) => Promise<void>;
    confirm: (message?: string) => Promise<boolean>;
    prompt: (message?: string, _default?: string) => Promise<string | null>;
    handleResult: (returnvalue?: boolean | string | null) => void;
};

const useAlertState = create<AlertState>((set, get) => ({
    visible: false,
    mode: "alert",
    message: "",
    value: "",
    resolver: () => {},
    alert: (message?: string) => {
        return new Promise<void>((resolve) => {
            set({ visible: true, mode: "alert", message, resolver: resolve });
        });
    },
    confirm: (message?: string) => {
        return new Promise<boolean>((resolve) => {
            set({ visible: true, mode: "confirm", message, resolver: resolve });
        });
    },
    prompt: (message?: string, _default?: string) => {
        return new Promise<string | null>((resolve) => {
            set({
                visible: true,
                mode: "prompt",
                message,
                resolver: resolve,
                value: _default,
            });
        });
    },
    handleResult: (returnvalue?: boolean | string | null) => {
        const { resolver } = get();
        set({ visible: false });
        if (returnvalue === undefined) {
            resolver();
            return;
        }
        resolver(returnvalue);
    },
}));

export function useAlert() {
    return useAlertState((state) => state.alert);
}

export function useConfirm() {
    return useAlertState((state) => state.confirm);
}

export function usePrompt() {
    return useAlertState((state) => state.prompt);
}

export function usePrompts() {
    const alert = useAlert();
    const confirm = useConfirm();
    const prompt = usePrompt();
    return { alert, confirm, prompt };
}

export function AlertHandler() {
    const state = useAlertState();
    const ref = React.useRef<HTMLDivElement>(null);
    const [input, setInput] = useInner(state.value || "");
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (state.visible && ref.current && state.mode !== "prompt") {
            ref.current.focus();
        }
        if (state.visible && inputRef.current && state.mode === "prompt") {
            inputRef.current.focus();
            setTimeout(() => {
                inputRef.current?.select();
            }, 0);
        }
    }, [state.visible, state.mode]);

    const confirm = () => {
        switch (state.mode) {
            case "confirm":
                state.handleResult(true);
                break;
            case "prompt":
                state.handleResult(input);
                setInput(state.value);
                break;
            default:
                state.handleResult();
        }
    };
    const cancel = () => {
        switch (state.mode) {
            case "confirm":
                state.handleResult(false);
                break;
            case "prompt":
                state.handleResult(null);
                setInput(state.value);
                break;
            default:
                state.handleResult();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") confirm();
        if (e.key === "Escape") cancel();
    };

    const title = {
        alert: "Please take note",
        confirm: "Please confirm",
        prompt: "Please input",
    }[state.mode];

    if (!state.visible) return null;
    return (
        <Dialog id="alertDialog" buttons={<button onClick={cancel}>x</button>}>
            <DialogTitle>{title}</DialogTitle>
            <DialogBody>
                <div
                    ref={ref}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                    style={{
                        outline: "none",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <p>{state.message}</p>
                    {state.mode === "prompt" && (
                        <input
                            ref={inputRef}
                            type="text"
                            value={input || ""}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    )}
                </div>
            </DialogBody>
            <DialogActions>
                <button onClick={confirm} className="default">
                    OK
                </button>
                {state.mode !== "alert" && (
                    <button onClick={cancel}>Cancel</button>
                )}
            </DialogActions>
        </Dialog>
    );
}
