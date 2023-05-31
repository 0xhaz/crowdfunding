import { createContext, useContext, useReducer } from "react";

export type AppState = {
  selectedCategory: string | undefined;
};

export type StateAction = {
  type: string;
  payload?: any;
};

export type AppContextValue = {
  state: AppState;
  dispatch: (arg0: StateAction) => void;
};

export const AppContext = createContext<AppContextValue>({} as AppContextValue);

export type AppStateProviderProps = {
  children: React.ReactNode;
};

const initialState = {
  selectedCategory: undefined,
};

const reducer = (state: AppState, action: StateAction) => {};
