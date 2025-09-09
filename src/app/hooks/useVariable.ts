import { create } from "zustand";
import { persist } from "zustand/middleware";

interface VariableStore {
    data: Record<string, any>;
    getVar: (scope: string, name: string, persist: boolean) => any;
    setVar: (scope: string, name: string, value: any, persist: boolean) => void;
}
let variableStore = create<VariableStore>((set, get, api) =>
    persist<VariableStore>(
        (pset, pget) => ({
            data: {},
            getVar: (scope: string, name: string, persist: boolean) => {
                if (persist) {
                    return pget().data[`${scope}|${name}`];
                } else {
                    return get().data[`${scope}|${name}`];
                }
            },
            setVar: (
                scope: string,
                name: string,
                value: any,
                persist: boolean
            ) => {
                if (persist) {
                    let data = { ...pget().data, [`${scope}|${name}`]: value };
                    pset({ data });
                } else {
                    let data = { ...get().data, [`${scope}|${name}`]: value };
                    set({ data });
                }
            },
        }),
        {
            name: "variable-storage", // unique name
            // getStorage: () => sessionStorage, // (optional) by default the 'localStorage' is used
        }
    )(set, get, api)
);

/**
 * scope restricts the variable scope, for example to a view id
 * @param scope
 * @param name
 */
export const useVariable = <T = any>(
    scope: string,
    name: string,
    initial: T,
    persist = true
): [T, (t: T) => void] => {
    let value = variableStore(({ getVar }) => getVar(scope, name, persist));
    if (typeof value === "undefined") value = initial;
    let setVar = variableStore(({ setVar }) => setVar);
    let setValue = (value: any) => setVar(scope, name, value, persist);
    return [value, setValue];
};
