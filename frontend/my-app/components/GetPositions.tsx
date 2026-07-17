'use client';
import { useEffect, useState, useCallback } from "react";
import { api } from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStore } from "@/app/store/useStore";
import GetPrice from "./GetPrice";
import LivePnl from "./LivePnl";

export default function Positions() {
    const [fun, setFun] = useState<string>("Open Positions");
    const { isLoggedIn, setBalance } = useStore();
    const refreshTrigger = useStore(state => state.refreshTrigger);
    const [data, setData] = useState<any[]>([]);

    const GetPos = useCallback(async () => {
        if (!isLoggedIn) return;
        try {
            const response = await api.post("/api/positions", {
                option: fun
            }, {
                headers: {
                    authorization: localStorage.getItem("authorization")
                }
            });
            if (response?.data) {
                setData(response.data);
            }
        } catch (err) {
            console.error(err);
        }
    }, [fun, isLoggedIn]);

    async function Close(sym: string, id: string) {
        try {
            const response = await api.post("/api/closePositions", {
                symbol: sym,
                positionId: id
            }, {
                headers: {
                    authorization: localStorage.getItem("authorization")
                }
            });
            
            if (response.data?.balance !== undefined) {
                setBalance(Number(response.data.balance));
            }
            await GetPos();
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        GetPos();
    }, [GetPos, refreshTrigger]);

    return (
        <div className="w-full h-full flex flex-col font-sans bg-[#0b0e11] border-t border-[#1e2329]">
            
            <div className="flex px-4 border-b border-[#1e2329] bg-[#131418]">
                <button
                    onClick={() => setFun("Open Positions")}
                    className={`px-4 py-3 text-[13px] font-medium transition-colors border-b-2 ${fun === "Open Positions" ? "border-[#f0b90b] text-[#eaecef]" : "border-transparent text-[#7f848f] hover:text-[#eaecef]"}`}
                >
                    OPEN POSITIONS <span className="ml-1 opacity-70">({fun === "Open Positions" ? data.length : 0})</span>
                </button>
                <button
                    onClick={() => setFun("Order History")}
                    className={`px-4 py-3 text-[13px] font-medium transition-colors border-b-2 ${fun === "Order History" ? "border-[#f0b90b] text-[#eaecef]" : "border-transparent text-[#7f848f] hover:text-[#eaecef]"}`}
                >
                    ORDER HISTORY
                </button>
                <button
                    onClick={() => setFun("Trade History")}
                    className={`px-4 py-3 text-[13px] font-medium transition-colors border-b-2 ${fun === "Trade History" ? "border-[#f0b90b] text-[#eaecef]" : "border-transparent text-[#7f848f] hover:text-[#eaecef]"}`}
                >
                    TRADE HISTORY
                </button>
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar bg-[#0b0e11]">
                <Table className="w-full min-w-[800px]">
                    <TableHeader>
                        <TableRow className="sticky top-0 z-20 bg-[#0b0e11] border-b border-[#1e2329] hover:bg-transparent">
                            <TableHead className="text-[11px] font-normal text-[#7f848f] uppercase tracking-wider h-10 pl-4">Symbol</TableHead>
                            {fun === "Order History" && <TableHead className="text-[11px] font-normal text-[#7f848f] uppercase tracking-wider h-10">Type</TableHead>}
                            <TableHead className="text-[11px] font-normal text-[#7f848f] uppercase tracking-wider h-10">Side</TableHead>
                            {fun !== "Order History" && <TableHead className="text-[11px] font-normal text-[#7f848f] uppercase tracking-wider h-10 text-right">Entry Price</TableHead>}
                            {fun === "Open Positions" && <TableHead className="text-[11px] font-normal text-[#7f848f] uppercase tracking-wider h-10 text-right">Current Price</TableHead>}
                            {fun === "Trade History" && <TableHead className="text-[11px] font-normal text-[#7f848f] uppercase tracking-wider h-10 text-right">Closing Price</TableHead>}
                            {fun === "Order History" && <TableHead className="text-[11px] font-normal text-[#7f848f] uppercase tracking-wider h-10 text-right">Quantity</TableHead>}
                            {fun !== "Order History" && <TableHead className="text-[11px] font-normal text-[#7f848f] uppercase tracking-wider h-10 text-right">PnL (ROE)</TableHead>}
                            <TableHead className="text-[11px] font-normal text-[#7f848f] uppercase tracking-wider h-10 text-right">Leverage</TableHead>
                            {fun !== "Trade History" && <TableHead className="text-[11px] font-normal text-[#7f848f] uppercase tracking-wider h-10 text-right">Liq. Price</TableHead>}
                            {fun === "Open Positions" && <TableHead className="text-[11px] font-normal text-[#7f848f] uppercase tracking-wider h-10 text-right pr-4">Action</TableHead>}
                        </TableRow>
                    </TableHeader>
                    
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow className="border-none hover:bg-transparent">
                                <TableCell colSpan={10} className="h-32 text-center text-[13px] text-[#7f848f]">
                                    No {fun.toLowerCase()} found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((pos) => {
                                return (
                                    <TableRow key={pos._id} className="border-b border-[#1e2329] hover:bg-[#131418] transition-colors">
                                        
                                        <TableCell className="py-3 pl-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-[13px] text-[#eaecef]">{pos.symbol}</span>
                                            </div>
                                        </TableCell>
                                        
                                        {fun === "Order History" && <TableCell className="text-[13px] text-[#eaecef]">{pos.type}</TableCell>}
                                        
                                        <TableCell className={`text-[13px] font-semibold ${pos.side === "LONG" ? "text-[#0ecb81]" : "text-[#f6465d]"}`}>
                                            {pos.side}
                                        </TableCell>
                                        
                                        {fun !== "Order History" && <TableCell className="text-[13px] text-[#eaecef] tabular-nums text-right font-mono">{Number(pos.entryPrice).toFixed(4)}</TableCell>}
                                        
                                        {fun === "Open Positions" && <TableCell className="text-[13px] text-[#eaecef] tabular-nums text-right font-mono"><GetPrice s={pos.symbol} /></TableCell>}
                                        
                                        {fun === "Trade History" && (
                                            <TableCell className="text-[13px] text-[#eaecef] tabular-nums text-right font-mono">
                                                {pos.closingPrice ? Number(pos.closingPrice).toFixed(4) : <GetPrice s={pos.symbol} />}
                                            </TableCell>
                                        )}
                                        
                                        {fun === "Order History" && <TableCell className="text-[13px] text-[#eaecef] tabular-nums text-right font-mono">{Number(pos.quantity).toFixed(6)}</TableCell>}
                                        
                                        {fun === "Trade History" && (
                                            <TableCell className={`text-[13px] font-medium tabular-nums text-right font-mono ${pos.realizedPnL !== null && pos.realizedPnL >= 0 ? "text-[#0ecb81]" : "text-[#f6465d]"}`}>
                                                {pos.realizedPnL !== null && pos.realizedPnL !== undefined 
                                                    ? (pos.realizedPnL >= 0 ? `+${pos.realizedPnL.toFixed(4)}` : pos.realizedPnL.toFixed(4)) 
                                                    : <LivePnl positionId={pos._id} /> 
                                                }
                                            </TableCell>
                                        )}
                                        
                                        {fun === "Open Positions" && (
                                            <TableCell className="text-[13px] font-medium tabular-nums text-right font-mono">
                                                <LivePnl positionId={pos._id} />
                                            </TableCell>
                                        )}
                                        
                                        <TableCell className="text-[13px] text-[#eaecef] text-right font-mono">{pos.leverage}x</TableCell>
                                        
                                        {fun !== "Trade History" && <TableCell className="text-[13px] text-[#f6465d] tabular-nums text-right font-mono">{pos.liquidationPrice ? Number(pos.liquidationPrice).toFixed(4) : "—"}</TableCell>}
                                        
                                        {fun === "Open Positions" && (
                                            <TableCell className="text-right pr-4">
                                                <button 
                                                    onClick={() => Close(pos.symbol, pos._id)} 
                                                    className="h-7 px-4 rounded-[4px] text-[12px] font-medium transition-colors bg-[#1e2329] text-[#eaecef] hover:bg-[#f6465d] hover:text-white"
                                                >
                                                    Close
                                                </button>
                                            </TableCell>
                                        )}
                                        
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}