'use client';
import { useState } from "react";
import { useStore } from "@/app/store/useStore";
import { api } from '@/lib/api';

export default function OrderForm() {
    const symbol = useStore((state) => state.symbol);
    const balance = useStore((state) => state.balance);
    const [orderType, setOrderType] = useState("Market"); 
    const [side, setSide] = useState("LONG");
    const [leverage, setLeverage] = useState(10);
    
    return (
        <div className="w-full flex flex-col h-full bg-[#131418] p-4 font-sans border-l border-[#1e2329]">
            
            <div className="flex bg-[#0b0e11] p-1 rounded-md w-full mb-5 border border-[#1e2329]">
                <button 
                    onClick={() => setOrderType("Market")}
                    className={`flex-1 py-1.5 text-[12px] font-semibold rounded transition-all duration-200 ${orderType === "Market" ? "bg-[#22242a] text-[#eaecef] shadow-sm" : "text-[#7f848f] hover:text-[#b0b5c0]"}`}
                >
                    Market
                </button>
                <button 
                    onClick={() => setOrderType("Limit")}
                    className={`flex-1 py-1.5 text-[12px] font-semibold rounded transition-all duration-200 ${orderType === "Limit" ? "bg-[#22242a] text-[#eaecef] shadow-sm" : "text-[#7f848f] hover:text-[#b0b5c0]"}`}
                >
                    Limit
                </button>
            </div>

            <div className="flex bg-[#0b0e11] p-1 rounded-md w-full mb-6 border border-[#1e2329]">
                <button 
                    onClick={() => setSide("LONG")}
                    className={`flex-1 py-1.5 text-[12px] font-bold tracking-wide rounded transition-all duration-200 ${side === "LONG" ? "bg-[#1d2b23] text-[#427154] shadow-sm" : "text-[#7f848f] hover:text-[#b0b5c0]"}`}
                >
                    LONG
                </button>
                <button 
                    onClick={() => setSide("SHORT")}
                    className={`flex-1 py-1.5 text-[12px] font-bold tracking-wide rounded transition-all duration-200 ${side === "SHORT" ? "bg-[#2b191b] text-[#7c3b42] shadow-sm" : "text-[#7f848f] hover:text-[#b0b5c0]"}`}
                >
                    SHORT
                </button>
            </div>

            <OrderInputs 
                side={side} 
                orderType={orderType} 
                symbol={symbol} 
                leverage={leverage} 
                setLeverage={setLeverage} 
                balance={balance} 
            />
        </div>
    );
}

function OrderInputs({ side, orderType, symbol, leverage, setLeverage, balance }: any) {
    const isLong = side === "LONG";
    const [marginAmount, setMarginAmount] = useState<number | string>("");
    const solPrice = useStore(state => state.livePrice["SOLUSDT"]) || 0;
    
    const [expiry, setExpiry] = useState("");
    const [stopLoss, setStopLoss] = useState<number | string>("");
    const [takeProfit, setTakeProfit] = useState<number | string>("");
    const [limitPrice, setLimitPrice] = useState<number | string>("");
    
    const currentPrice = useStore(state => state.livePrice[symbol]) || 0;
    const setBalance = useStore(state => state.setBalance);

    const focusBorder = isLong ? "focus-within:border-[#427154]" : "focus-within:border-[#7c3b42]";
    const buttonClass = isLong 
        ? "bg-[#427154] hover:bg-[#497c5d] text-[#eaecef]" 
        : "bg-[#7c3b42] hover:bg-[#8f444c] text-[#eaecef]";

    async function order() {
        const margin = Number(marginAmount);
        const leverageNum = Number(leverage);
        const sl = Number(stopLoss) || 0;
        const tp = Number(takeProfit) || 0;
        const limit = Number(limitPrice) || 0;

        try {
            if (orderType === "Market") {
                const response = await api.post("/order", {
                    margin: margin,
                    leverage: leverageNum,
                    symbol: symbol,
                    side: side,
                    stopLoss: sl,
                    takeProfit: tp,
                    type: orderType
                }, {
                    headers: { 'authorization': localStorage.getItem('authorization') }
                });
                
                if (response.data?.newBalance !== undefined) {
                    setBalance(Number(response.data.newBalance));
                }
            } else {
                await api.post("/limit-order", {
                    margin: margin,
                    leverage: leverageNum,
                    symbol: symbol,
                    side: side,
                    stopLoss: sl,
                    takeProfit: tp,
                    type: orderType,
                    limitPrice: limit,
                    expiry: expiry ? new Date(expiry).toISOString() : null
                }, {
                    headers: { 'authorization': localStorage.getItem('authorization') }
                });
            }
        } catch (error: any) {
            console.error("Order failed. Server response:", error.response?.data || error.message);
        }
    }

    return (
        <div className="flex flex-col h-full">
            
            <div className="flex flex-col gap-3">
                {orderType === "Limit" ? (
                    <div className={`flex items-center justify-between bg-[#0b0e11] border border-[#1e2329] px-3 py-2.5 rounded-md transition-colors ${focusBorder}`}>
                        <span className="text-[12px] text-[#7f848f] font-medium w-20">Limit Price</span>
                        <input 
                            type="number" 
                            className="bg-transparent text-right text-[13px] font-medium text-[#eaecef] tabular-nums outline-none w-full px-2 placeholder:text-[#333741] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            value={limitPrice}
                            onChange={(e) => setLimitPrice(e.target.value)}
                            placeholder="0.00"
                        />
                        <span className="text-[11px] font-bold text-[#7f848f] w-8 text-right">USDT</span>
                    </div>
                ) : (
                    <div className="flex items-center justify-between bg-[#0b0e11]/30 border border-[#1e2329]/50 px-3 py-2.5 rounded-md cursor-not-allowed">
                        <span className="text-[12px] text-[#7f848f] font-medium">Price</span>
                        <span className="text-[12px] text-[#7f848f] font-medium tracking-wide">Market Execution</span>
                    </div>
                )}

                <div className={`flex items-center justify-between bg-[#0b0e11] border border-[#1e2329] px-3 py-2.5 rounded-md transition-colors ${focusBorder}`}>
                    <span className="text-[12px] text-[#7f848f] font-medium w-16">Margin</span>
                    <input 
                        type="number" 
                        className="bg-transparent text-right text-[13px] font-medium text-[#eaecef] tabular-nums outline-none w-full px-2 placeholder:text-[#333741] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={marginAmount}
                        onChange={(e) => setMarginAmount(e.target.value)}
                        placeholder="0.00"
                    />
                    <span className="text-[11px] font-bold text-[#eaecef] w-8 text-right">SOL</span>
                </div>
            </div>

            <div className="py-5">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-[12px] text-[#7f848f] font-medium">Leverage</span>
                    <div className="bg-[#22242a] border border-[#2b3139] px-2 py-0.5 rounded-sm text-[11px] text-[#eaecef] font-mono font-medium">
                        {leverage}x
                    </div>
                </div>
                <div className="px-1">
                    <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        value={leverage} 
                        onChange={(e) => setLeverage(Number(e.target.value))}
                        className="w-full h-1 bg-[#22242a] rounded-lg appearance-none cursor-pointer accent-[#b0b5c0]"
                        style={{
                            background: `linear-gradient(to right, ${isLong ? '#427154' : '#7c3b42'} ${((leverage - 1) / 9) * 100}%, #22242a ${((leverage - 1) / 9) * 100}%)`
                        }}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-3 mb-4">
                <div className={`flex items-center justify-between bg-[#0b0e11] border border-[#1e2329] px-3 py-2.5 rounded-md transition-colors ${focusBorder}`}>
                    <span className="text-[12px] text-[#7f848f] font-medium whitespace-nowrap w-24">Take Profit</span>
                    <input 
                        type="number"
                        placeholder="0.00" 
                        value={takeProfit}
                        className="bg-transparent text-right text-[13px] font-medium text-[#eaecef] tabular-nums outline-none w-full px-2 placeholder:text-[#333741] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        onChange={(e) => setTakeProfit(e.target.value)}
                    />
                    <span className="text-[11px] font-bold text-[#7f848f] w-8 text-right">USDT</span>
                </div>
                <div className={`flex items-center justify-between bg-[#0b0e11] border border-[#1e2329] px-3 py-2.5 rounded-md transition-colors ${focusBorder}`}>
                    <span className="text-[12px] text-[#7f848f] font-medium whitespace-nowrap w-24">Stop Loss</span>
                    <input 
                        type="number"
                        placeholder="0.00" 
                        value={stopLoss}
                        className="bg-transparent text-right text-[13px] font-medium text-[#eaecef] tabular-nums outline-none w-full px-2 placeholder:text-[#333741] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        onChange={(e) => setStopLoss(e.target.value)}
                    />
                    <span className="text-[11px] font-bold text-[#7f848f] w-8 text-right">USDT</span>
                </div>
            </div>

            {orderType === "Limit" && (
                <div className={`flex flex-col bg-[#0b0e11] border border-[#1e2329] px-3 py-2 rounded-md transition-colors mb-4 ${focusBorder}`}>
                    <span className="text-[10px] text-[#7f848f] font-medium mb-1 uppercase tracking-wider">Expiry Date</span>
                    <input 
                        type="datetime-local" 
                        value={expiry}
                        className="bg-transparent text-[13px] font-medium text-[#eaecef] outline-none w-full [color-scheme:dark]"
                        onChange={(e) => setExpiry(e.target.value)}
                    />
                </div>
            )}

            <div className="mt-auto pt-4 border-t border-[#1e2329]/60">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[12px] font-medium text-[#7f848f]">Avail. Balance</span>
                    <span className="text-[13px] font-semibold text-[#eaecef] tabular-nums">
                        {Number(balance * solPrice).toFixed(2)} <span className="text-[11px] font-medium text-[#7f848f] ml-1">USDT</span>
                    </span>
                </div>
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[12px] font-medium text-[#7f848f]">Position Size</span>
                    <span className="text-[13px] font-semibold text-[#eaecef] tabular-nums">
                        {(Number(marginAmount) * solPrice * leverage).toFixed(4)} <span className="text-[11px] font-medium text-[#7f848f] ml-1">USDT</span>
                    </span>
                </div>

                <button 
                    className={`w-full h-[42px] text-[13px] font-bold tracking-wide uppercase rounded-md transition-colors ${buttonClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={Number(marginAmount) <= 0}
                    onClick={order}
                >
                    {isLong ? "Open Long" : "Open Short"}
                </button>
            </div>
            
        </div>
    );
}