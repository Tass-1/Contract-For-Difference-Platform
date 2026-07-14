'use client';

import NavBar from "@/components/Navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { useStore } from "../store/useStore";
import GetPrice from "@/components/GetPrice";
import LivePnl from "@/components/LivePnl";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { api } from '@/lib/api';

const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toISOString().replace('T', ' ').substring(0, 19);
};

export default function History() {
    const [fun, setFun] = useState("Trade History");
    const [data, setData] = useState<any[]>([]);
    const [entity, setEntity] = useState<any>(null);
    const isLoggedIn = useStore(state => state.isLoggedIn);

    async function getData() {
        try {
            const response = await api.post("/api/positions", { option: fun }, {
                headers: { authorization: localStorage.getItem("authorization") }
            });
            if (response?.data) {
                setData(response.data);
            }
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        if (isLoggedIn) getData();
    }, [fun, isLoggedIn]);

    return (
        <div className="min-h-screen bg-[#0b0e11] p-4 md:p-8 text-[#eaecef] font-sans antialiased">
            <div className="max-w-[1400px] mx-auto">
                
                <div className="flex gap-1 mb-0">
                    <button
                        onClick={() => setFun("Order History")}
                        className={`px-6 py-3.5 text-sm transition-colors rounded-t-lg ${
                            fun === "Order History" 
                            ? "bg-[#131418] text-[#eaecef]" 
                            : "bg-transparent text-[#7f848f] hover:text-[#eaecef]"
                        }`}
                    >
                        Order History
                    </button>
                    <button
                        onClick={() => setFun("Trade History")}
                        className={`px-6 py-3.5 text-sm transition-colors rounded-t-lg ${
                            fun === "Trade History" 
                            ? "bg-[#131418] text-[#eaecef]" 
                            : "bg-transparent text-[#7f848f] hover:text-[#eaecef]"
                        }`}
                    >
                        Trade History
                    </button>
                </div>

                <div className="bg-[#131418] rounded-b-lg rounded-tr-lg border border-[#1e2329] overflow-x-auto">
                    <div className="min-w-[1000px]">
                        <Table className="w-full">
                            <TableHeader>
                                <TableRow className="border-b border-[#1e2329] hover:bg-transparent">
                                    <TableHead className="h-12 text-xs font-normal text-[#7f848f] pl-6">Symbol</TableHead>
                                    <TableHead className="h-12 text-xs font-normal text-[#7f848f]">Side</TableHead>
                                    
                                    {fun === "Trade History" && (
                                        <>
                                            <TableHead className="h-12 text-xs font-normal text-[#7f848f] text-right">Entry Price</TableHead>
                                            <TableHead className="h-12 text-xs font-normal text-[#7f848f] text-right">Closing Price</TableHead>
                                            <TableHead className="h-12 text-xs font-normal text-[#7f848f] text-right">PnL</TableHead>
                                            <TableHead className="h-12 text-xs font-normal text-[#7f848f] text-right">Closed At</TableHead>
                                            <TableHead className="h-12 text-xs font-normal text-[#7f848f] text-right pr-6">Status</TableHead>
                                        </>
                                    )}
                                    
                                    {fun === "Order History" && (
                                        <>
                                            <TableHead className="h-12 text-xs font-normal text-[#7f848f]">Type</TableHead>
                                            <TableHead className="h-12 text-xs font-normal text-[#7f848f]">Status</TableHead>
                                            <TableHead className="h-12 text-xs font-normal text-[#7f848f] text-right">Quantity</TableHead>
                                            <TableHead className="h-12 text-xs font-normal text-[#7f848f] text-right">Created At</TableHead>
                                            <TableHead className="h-12 text-xs font-normal text-[#7f848f] text-right pr-6">Liq. Price</TableHead>
                                        </>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.length === 0 ? (
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableCell colSpan={10} className="h-32 text-center text-[#7f848f] text-sm">
                                            No records found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.map((pos) => (
                                        <TableRow 
                                            key={pos._id} 
                                            className="border-b border-[#1e2329]/50 hover:bg-[#1e2329]/60 cursor-pointer transition-colors" 
                                            onClick={() => setEntity(pos)}
                                        >
                                            <TableCell className="py-4 pl-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm">{pos.symbol}</span>
                                                    <span className="text-xs text-[#7f848f] bg-[#1e2329] px-1.5 py-0.5 rounded">
                                                        {pos.margin}x
                                                    </span>
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell className="py-4">
                                                <span className={`text-sm ${pos.side === 'LONG' ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                                                    {pos.side}
                                                </span>
                                            </TableCell>

                                            {fun === "Order History" && (
                                                <>
                                                    <TableCell className="py-4 text-sm text-[#eaecef]">{pos.type}</TableCell>
                                                    <TableCell className="py-4 text-sm text-[#7f848f] capitalize">{pos.status}</TableCell>
                                                    <TableCell className="py-4 text-sm tabular-nums text-right">{Number(pos.quantity).toFixed(6)}</TableCell>
                                                    <TableCell className="py-4 text-sm text-[#7f848f] tabular-nums text-right">{formatDate(pos.filledAt || pos.createdAt)}</TableCell>
                                                    <TableCell className="py-4 pr-6 text-sm tabular-nums text-right">{pos.liquidationPrice ? Number(pos.liquidationPrice).toFixed(4) : "—"}</TableCell>
                                                </>
                                            )}

                                            {fun === "Trade History" && (
                                                <>
                                                    <TableCell className="py-4 text-sm tabular-nums text-right">{Number(pos.entryPrice).toFixed(4)}</TableCell>
                                                    <TableCell className="py-4 text-sm tabular-nums text-right">
                                                        {pos.closingPrice ? Number(pos.closingPrice).toFixed(4) : <GetPrice s={pos.symbol}/>}
                                                    </TableCell>
                                                    <TableCell className={`py-4 text-sm tabular-nums text-right ${pos.realizedPnL >= 0 ? "text-[#0ecb81]" : "text-[#f6465d]"}`}>
                                                        {pos.realizedPnL !== null && pos.realizedPnL !== undefined 
                                                            ? (pos.realizedPnL >= 0 ? `+${pos.realizedPnL.toFixed(4)}` : pos.realizedPnL.toFixed(4)) 
                                                            : <LivePnl positionId={pos._id} /> 
                                                        }
                                                    </TableCell>
                                                    <TableCell className="py-4 text-sm text-[#7f848f] tabular-nums text-right">
                                                        {pos.closedAt ? formatDate(pos.closedAt) : "Live"}
                                                    </TableCell>
                                                    <TableCell className="py-4 pr-6 text-sm text-[#7f848f] capitalize text-right">{pos.status}</TableCell>
                                                </>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            <Dialog open={!!entity} onOpenChange={(isOpen) => { if (!isOpen) setEntity(null); }}>
                <DialogContent className="bg-[#131418] text-[#eaecef] border-[#1e2329] sm:max-w-md p-0 shadow-2xl rounded-lg font-sans">
                    
                    <div className="px-6 py-5 border-b border-[#1e2329] flex items-center justify-between">
                        <DialogTitle className="text-base font-medium flex items-center gap-2">
                            {entity?.symbol}
                        </DialogTitle>
                        <span className={`text-xs px-2 py-1 rounded ${entity?.side === 'LONG' ? 'bg-[#0ecb81]/10 text-[#0ecb81]' : 'bg-[#f6465d]/10 text-[#f6465d]'}`}>
                            {entity?.side}
                        </span>
                    </div>
                    
                    <div className="px-6 py-6 flex flex-col gap-4">
                        {fun === "Trade History" ? (
                            <>
                                <DetailRow label="ID" value={entity?._id} />
                                <DetailRow label="Leverage" value={`${entity?.leverage}x`} />
                                <DetailRow label="Margin" value={`${Number(entity?.margin).toFixed(4)} SOL`} />
                                <DetailRow label="Quantity" value={entity?.quantity ? Number(entity?.quantity).toFixed(6) : "—"} />
                                <DetailRow label="Entry Price" value={entity?.entryPrice ? Number(entity?.entryPrice).toFixed(4) : "—"} />
                                <DetailRow label="Closing Price" value={entity?.closingPrice ? Number(entity?.closingPrice).toFixed(4) : "—"} />
                                <DetailRow label="Liquidation Price" value={entity?.liquidationPrice ? Number(entity?.liquidationPrice).toFixed(4) : "—"} />
                                <DetailRow label="Stop Loss" value={entity?.stopLoss || "—"} />
                                <DetailRow label="Take Profit" value={entity?.takeProfit || "—"} />
                                <DetailRow label="Realized PnL" value={entity?.realizedPnL ? Number(entity?.realizedPnL).toFixed(4) : "—"} highlight={entity?.realizedPnL >= 0} />
                                <DetailRow label="Status" value={entity?.status} />
                                <DetailRow label="Opened At" value={formatDate(entity?.openedAt)} />
                                <DetailRow label="Closed At" value={formatDate(entity?.closedAt)} />
                            </>
                        ) : (
                            <>
                                <DetailRow label="ID" value={entity?._id} />
                                <DetailRow label="Type" value={entity?.type} />
                                <DetailRow label="Leverage" value={`${entity?.leverage}x`} />
                                <DetailRow label="Margin" value={`${Number(entity?.margin).toFixed(4)} SOL`} />
                                <DetailRow label="Quantity" value={entity?.quantity ? Number(entity?.quantity).toFixed(6) : "—"} />
                                <DetailRow label="Limit Price" value={entity?.limitPrice || "—"} />
                                <DetailRow label="Liquidation Price" value={entity?.liquidationPrice ? Number(entity?.liquidationPrice).toFixed(4) : "—"} />
                                <DetailRow label="Stop Loss" value={entity?.stopLoss || "—"} />
                                <DetailRow label="Take Profit" value={entity?.takeProfit || "—"} />
                                <DetailRow label="Status" value={entity?.status} />
                                <DetailRow label="Expiry" value={formatDate(entity?.expiry)} />
                                <DetailRow label="Filled At" value={formatDate(entity?.filledAt)} />
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function DetailRow({ label, value, highlight }: { label: string, value: any, highlight?: boolean }) {
    return (
        <div className="flex justify-between items-center text-sm">
            <span className="text-[#7f848f]">{label}</span>
            <span className={`tabular-nums text-right max-w-[240px] truncate ${highlight === true ? 'text-[#0ecb81]' : highlight === false ? 'text-[#f6465d]' : 'text-[#eaecef]'}`}>
                {value}
            </span>
        </div>
    );
}