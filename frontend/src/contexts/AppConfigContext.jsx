import React, { createContext, useContext } from 'react';
const AppConfigContext = createContext({
    connectionState: 'connected',
    liveUpdates: true
});
export function AppConfigProvider({ connectionState, liveUpdates, children }) {
    return (<AppConfigContext.Provider value={{ connectionState, liveUpdates }}>{children}</AppConfigContext.Provider>);
}
export function useAppConfig() {
    return useContext(AppConfigContext);
}
