import classNames from "classnames";
import React from "react";

import styles from "./Tabs.module.css";

interface TabData {
    id: string;
    header: React.ReactNode;
    content: React.ReactNode;
}

interface TabContextType {
    activeTabIndex: number;
    setActiveTabIndex: (index: number) => void;
    registerTab: (tab: TabData) => void;
    unregisterTab: (id: string) => void;
    tabs: TabData[];
}

const TabContext = React.createContext<TabContextType | undefined>(undefined);

export const useTabContext = () => {
    const context = React.useContext(TabContext);
    if (!context) {
        throw new Error(
            "useTabContext must be used within a TabContextProvider"
        );
    }
    return context;
};

export const TabContextProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [activeTabIndex, setActiveTabIndex] = React.useState(0);
    const [tabs, setTabs] = React.useState<TabData[]>([]);
    const tabIds = React.useRef(new Set<string>());

    const registerTab = React.useCallback((tab: TabData) => {
        if (!tabIds.current.has(tab.id)) {
            setTabs((prevTabs) => [...prevTabs, tab]);
            tabIds.current.add(tab.id);
        }
    }, []);
    const unregisterTab = React.useCallback((id: string) => {
        setTabs((prevTabs) => prevTabs.filter((tab) => tab.id !== id));
        tabIds.current.delete(id);
    }, []);

    return (
        <TabContext.Provider
            value={{
                activeTabIndex,
                setActiveTabIndex,
                registerTab,
                unregisterTab,
                tabs,
            }}
        >
            {children}
        </TabContext.Provider>
    );
};

interface TabProps {
    header: React.ReactNode;
    children?: React.ReactNode;
}

export const Tab: React.FC<TabProps> = ({ header, children }) => {
    const { registerTab, unregisterTab, activeTabIndex, tabs } =
        useTabContext();
    const tabId = React.useRef(
        `tab-${Math.random().toString(36).substr(2, 9)}`
    );

    React.useEffect(() => {
        registerTab({ id: tabId.current, header, content: children });
        return () => unregisterTab(tabId.current);
    }, [header, children, registerTab, unregisterTab]);

    const tabIndex = tabs.findIndex((tab) => tab.id === tabId.current);

    if (activeTabIndex !== tabIndex || tabIndex === -1) {
        return null;
    }

    return <>{children}</>;
};

interface TabHeadersProps {
    position?: "top" | "bottom" | "left" | "right";
}
export const TabHeaders: React.FC = ({ position }: TabHeadersProps) => {
    const { activeTabIndex, setActiveTabIndex, tabs } = useTabContext();

    return (
        <ul className={classNames(styles.Tabs, styles[position || ""])}>
            {tabs.map((tab, index) => (
                <li
                    key={tab.id}
                    onMouseDown={() => setActiveTabIndex(index)}
                    className={classNames({
                        [styles.active]: activeTabIndex === index,
                    })}
                >
                    {tab.header}
                </li>
            ))}
        </ul>
    );
};

interface TabsetProps {
    children: React.ReactNode;
}

export const Tabs: React.FC<TabsetProps> = ({ children }) => {
    return <TabContextProvider>{children}</TabContextProvider>;
};
