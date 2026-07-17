import { create } from "zustand";

interface livePositionData {
    pnl: number,
    currentPrice: number, 
    symbol: string
}

interface candleData {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

interface State {
    balance: number;
    setBalance: (newBalance: number) => void;
    userId: string | null;
    jwt: string | null;
    symbol: string | null;
    isLoggedIn: boolean;
    setIsLoggedIn: (isLoggedIn: boolean) => void;
    setUser: (userId: string, jwt: string) => void;
    logout: () => void;
    setSymbol: (newSymbol: string) => void;
    livePositions: Record<string , livePositionData>;
    ChartData: Record<string , candleData>;
    livePrice: Record<string , number>;
    setLivePosition: (positionId: string , data: livePositionData) => void;
    setChartData: (symbol: string , data: candleData) => void;
    setLivePrice: (symbol: string , price: number) => void;
    
   
    refreshTrigger: number;
    triggerRefresh: () => void;
}

export const useStore = create<State>((set) => ({
    balance: 0,
    userId: null,     
    jwt: null,        
    isLoggedIn: false,
    setIsLoggedIn:(newLoggedIn) => set({isLoggedIn: newLoggedIn}),
    setBalance: (newBalance) => set({balance: newBalance}),
    symbol: "BTCUSDT",
    setSymbol: (newSymbol) => set({symbol: newSymbol}),
    
    setUser: (userId, jwt) => set({ 
        userId: userId, 
        jwt: jwt, 
        isLoggedIn: true 
    }),

    logout: () => set({ 
        userId: null, 
        jwt: null, 
        isLoggedIn: false, 
        balance: 0 
    }),

    livePositions: {},
    livePrice: {},
    ChartData: {},
    
    setLivePosition: (positionId , data) => set((state) =>({
        livePositions: {
            ...state.livePositions,
            [positionId]: data
        }
    })),
    setLivePrice: (symbol, price) => set((state) => ({
        livePrice: {
            ...state.livePrice,  
            [symbol]: price        
        }
    })),
    setChartData: (symbol, data) => set((state) => ({
        ChartData: {
            ...state.ChartData,  
            [symbol]: data        
        }
    })),

    
    refreshTrigger: 0,
    triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 }))
}));