import React from "react";
import ReactDOM from "react-dom";
import { create } from "zustand";

/**
 * registry is used to prevent race conditions
 * otherwise portalslot could not yet be available
 * when portal content wants to render
 *
 * now we rerender content when slot gets registered
 */

interface SlotState {
    ready: Record<string, boolean>;
    register: (id: string) => void;
    unregister: (id: string) => void;
}
const slotState = create<SlotState>((set, get) => ({
    ready: {},
    register: (id: string) => {
        const ready = get().ready;
        set({ ready: { ...ready, [id]: true } });
    },
    unregister: (id: string) => {
        const ready = get().ready;
        set({ ready: { ...ready, [id]: false } });
    },
}));

const useRegistry = (id: string) => {
    const { register, unregister } = slotState();
    React.useEffect(() => {
        register(id);
        return () => {
            unregister(id);
        };
    }, [id, register, unregister]);
};
const useReady = (id: string) => {
    return slotState((s) => !!s.ready[id]);
};

interface PortalSlotProps {
    id: string;
}
export const PortalSlot = ({ id }: PortalSlotProps) => {
    useRegistry(id);
    return <div id={id}></div>;
};

interface PortalContentProps {
    id: string;
    children: React.ReactNode;
}
export const PortalContent = ({ id, children }: PortalContentProps) => {
    const ready = useReady(id);
    if (typeof window === "undefined") {
        return null;
    }
    const el = document.getElementById(id);
    if (!(el && ready)) return null;
    return ReactDOM.createPortal(children, el);
};
