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
        <div className="w-full flex flex-col h-full bg-[#131418] p-4 font-sans lg:border-l border-[#1e2329]">
            
            <div className="flex bg-[#0b0e11] p-1 rounded-[6px] w-full mb-5 border border-[#1e2329]">
                <button 
                    onClick={() => setOrderType("Market")}
                    className={`flex-1 py-1.5 text-[12px] font-medium rounded-[4px] transition-colors ${orderType === "Market" ? "bg-[#1e2329] text-[#eaecef]" : "text-[#7f848f] hover:text-[#eaecef] hover:bg-[#131418]"}`}
                >
                    Market
                </button>
                <button 
                    onClick={() => setOrderType("Limit")}
                    className={`flex-1 py-1.5 text-[12px] font-medium rounded-[4px] transition-colors ${orderType === "Limit" ? "bg-[#1e2329] text-[#eaecef]" : "text-[#7f848f] hover:text-[#eaecef] hover:bg-[#131418]"}`}
                >
                    Limit
                </button>
            </div>

            <div className="flex bg-[#0b0e11] p-1 rounded-[6px] w-full mb-6 border border-[#1e2329]">
                <button 
                    onClick={() => setSide("LONG")}
                    className={`flex-1 py-1.5 text-[12px] font-bold tracking-wide rounded-[4px] transition-colors ${side === "LONG" ? "bg-[#0ecb81]/10 text-[#0ecb81]" : "text-[#7f848f] hover:text-[#eaecef] hover:bg-[#131418]"}`}
                >
                    LONG
                </button>
                <button 
                    onClick={() => setSide("SHORT")}
                    className={`flex-1 py-1.5 text-[12px] font-bold tracking-wide rounded-[4px] transition-colors ${side === "SHORT" ? "bg-[#f6465d]/10 text-[#f6465d]" : "text-[#7f848f] hover:text-[#eaecef] hover:bg-[#131418]"}`}
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
    
    const setBalance = useStore(state => state.setBalance);
    const triggerRefresh = useStore(state => state.triggerRefresh);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const focusBorder = isLong ? "focus-within:border-[#0ecb81]" : "focus-within:border-[#f6465d]";
    const buttonClass = isLong 
        ? "bg-[#0ecb81] hover:bg-[#11d68a] text-[#0b0e11]" 
        : "bg-[#f6465d] hover:bg-[#ff556b] text-[#eaecef]";

    async function order() {
        if (!marginAmount || Number(marginAmount) <= 0) return;
        setIsSubmitting(true);
        
        const margin = Number(marginAmount);
        const leverageNum = Number(leverage);
        const sl = Number(stopLoss) || 0;
        const tp = Number(takeProfit) || 0;
        const limit = Number(limitPrice) || 0;

        try {
            let response;
            
            if (orderType === "Market") {
                response = await api.post("/order", {
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
            } else {
                response = await api.post("/limit-order", {
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
            
            if (response && response.data) {
                if (response.data.newBalance !== undefined) {
                    setBalance(Number(response.data.newBalance));
                } else if (response.data.balance !== undefined) {
                    setBalance(Number(response.data.balance));
                }
            }

            setMarginAmount("");
            setLimitPrice("");
            triggerRefresh(); 
            
        } catch (error: any) {
            console.error(error.response?.data || error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex flex-col h-full">
            
            <div className="flex flex-col gap-3">
                {orderType === "Limit" ? (
                    <div className={`flex items-center justify-between bg-[#0b0e11] border border-[#1e2329] px-3 py-2.5 rounded-[6px] transition-colors ${focusBorder}`}>
                        <span className="text-[12px] text-[#7f848f] w-20">Limit Price</span>
                        <input 
                            type="number" 
                            className="bg-transparent text-right text-[13px] font-medium text-[#eaecef] tabular-nums outline-none w-full px-2 placeholder:text-[#2b3139] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            value={limitPrice}
                            onChange={(e) => setLimitPrice(e.target.value)}
                            placeholder="0.00"
                        />
                        <span className="text-[12px] text-[#7f848f] w-8 text-right">USDT</span>
                    </div>
                ) : (
                    <div className="flex items-center justify-between bg-[#0b0e11]/50 border border-[#1e2329]/50 px-3 py-2.5 rounded-[6px] cursor-not-allowed">
                        <span className="text-[12px] text-[#7f848f]">Price</span>
                        <span className="text-[12px] text-[#7f848f]">Market Execution</span>
                    </div>
                )}

                <div className={`flex items-center justify-between bg-[#0b0e11] border border-[#1e2329] px-3 py-2.5 rounded-[6px] transition-colors ${focusBorder}`}>
                    <span className="text-[12px] text-[#7f848f] w-16">Margin</span>
                    <input 
                        type="number" 
                        className="bg-transparent text-right text-[13px] font-medium text-[#eaecef] tabular-nums outline-none w-full px-2 placeholder:text-[#2b3139] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={marginAmount}
                        onChange={(e) => setMarginAmount(e.target.value)}
                        placeholder="0.00"
                    />
                    <span className="text-[12px] text-[#eaecef] w-8 text-right">SOL</span>
                </div>
            </div>

            <div className="py-6">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-[12px] text-[#7f848f]">Leverage</span>
                    <div className="bg-[#1e2329] px-2 py-0.5 rounded-[4px] text-[12px] text-[#eaecef] font-mono">
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
                        className="w-full h-1 bg-[#1e2329] rounded-lg appearance-none cursor-pointer accent-[#eaecef]"
                        style={{
                            background: `linear-gradient(to right, ${isLong ? '#0ecb81' : '#f6465d'} ${((leverage - 1) / 9) * 100}%, #1e2329 ${((leverage - 1) / 9) * 100}%)`
                        }}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-3 mb-4">
                <div className={`flex items-center justify-between bg-[#0b0e11] border border-[#1e2329] px-3 py-2.5 rounded-[6px] transition-colors ${focusBorder}`}>
                    <span className="text-[12px] text-[#7f848f] whitespace-nowrap w-24">Take Profit</span>
                    <input 
                        type="number"
                        placeholder="0.00" 
                        value={takeProfit}
                        className="bg-transparent text-right text-[13px] font-medium text-[#eaecef] tabular-nums outline-none w-full px-2 placeholder:text-[#2b3139] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        onChange={(e) => setTakeProfit(e.target.value)}
                    />
                    <span className="text-[12px] text-[#7f848f] w-8 text-right">USDT</span>
                </div>
                <div className={`flex items-center justify-between bg-[#0b0e11] border border-[#1e2329] px-3 py-2.5 rounded-[6px] transition-colors ${focusBorder}`}>
                    <span className="text-[12px] text-[#7f848f] whitespace-nowrap w-24">Stop Loss</span>
                    <input 
                        type="number"
                        placeholder="0.00" 
                        value={stopLoss}
                        className="bg-transparent text-right text-[13px] font-medium text-[#eaecef] tabular-nums outline-none w-full px-2 placeholder:text-[#2b3139] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        onChange={(e) => setStopLoss(e.target.value)}
                    />
                    <span className="text-[12px] text-[#7f848f] w-8 text-right">USDT</span>
                </div>
            </div>

            {orderType === "Limit" && (
                <div className={`flex flex-col bg-[#0b0e11] border border-[#1e2329] px-3 py-2.5 rounded-[6px] transition-colors mb-4 ${focusBorder}`}>
                    <span className="text-[11px] text-[#7f848f] mb-1.5 uppercase tracking-wider">Expiry Date</span>
                    <input 
                        type="datetime-local" 
                        value={expiry}
                        className="bg-transparent text-[13px] text-[#eaecef] outline-none w-full [color-scheme:dark]"
                        onChange={(e) => setExpiry(e.target.value)}
                    />
                </div>
            )}

            <div className="mt-auto pt-5 border-t border-[#1e2329]">
                <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[12px] text-[#7f848f]">Avail. Balance</span>
                    <span className="text-[13px] font-medium text-[#eaecef] tabular-nums">
                        {Number(balance * solPrice).toFixed(2)} <span className="text-[11px] text-[#7f848f] ml-1">USDT</span>
                    </span>
                </div>
                <div className="flex justify-between items-center mb-5">
                    <span className="text-[12px] text-[#7f848f]">Position Size</span>
                    <span className="text-[13px] font-medium text-[#eaecef] tabular-nums">
                        {(Number(marginAmount) * solPrice * leverage).toFixed(4)} <span className="text-[11px] text-[#7f848f] ml-1">USDT</span>
                    </span>
                </div>

                <button 
                    className={`w-full h-11 text-[13px] font-semibold tracking-wide uppercase rounded-[6px] transition-colors ${buttonClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={Number(marginAmount) <= 0 || isSubmitting}
                    onClick={order}
                >
                    {isSubmitting ? "Processing..." : isLong ? "Open Long" : "Open Short"}
                </button>
            </div>
            
        </div>
    );
}