"use client";
import NavBar from "@/components/Navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import WalletAdapter from "@/components/walletAdapter";
import { useEffect, useState } from "react";
import { useStore } from "../store/useStore";
import axios from "axios";
import { Button } from "@/components/ui/button";
import GetPrice from "@/components/GetPrice";
import LivePnl from "@/components/LivePnl";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { divideBinaryFixedPoint } from "@solana/kit";
import { api } from '@/lib/api';


export default function History(){

    const [fun , setFun] = useState("Trade History")
    const [data , setData] = useState<any>([])
    const [entity , setEntity] = useState<any>(null)
    const isLoggedIn = useStore(state => state.isLoggedIn)
    async function getData(){
            console.log("get pos called")
            const response = await api.post("/api/positions" ,{
                option:fun
            } , {
                headers:{
                    authorization: localStorage.getItem("authorization")
                }
            })
            if(response){
                setData(response.data)
                console.log(response.data)
            }
            
    }
    useEffect(() => {
        if(isLoggedIn){
            getData()
        }
        } , [fun , isLoggedIn])

    return(
        <div>
            <div className="flex gap-20 mt-1 mr-1 ml-1 items-center bg-og p-5 w-full rounded-md mr-1 tracking-widest">
                <button 
                        onClick={() => setFun("Order History")}
                        className={`flex font-sans rounded transition-all ${fun === "Order History" ? " text-[#f6d658]" : "text-muted-foreground hover:text-white"}`}
                    >
                        Order History
                </button>
                <button 
                        onClick={() => setFun("Trade History")}
                        className={`flex  font-sans rounded transition-all ${fun === "Trade History" ? "  text-[#f6d658]" : "text-muted-foreground hover:text-white"}`}
                    >
                        Trade History
                </button>
            </div>
            <div>
                
                <div className="m- p-1 rounded-xl">
                    <Table className="bg-og rounded-xl"> 
                        <TableHeader className="px-">
                            <TableRow className="px-5">
                                <TableHead >Symbol</TableHead>
                                <TableHead>Side</TableHead>
                                {(fun == "Trade History") && (<TableHead>Entry Price</TableHead>) }
                                {(fun == "Trade History") && (<TableHead>Closing Price</TableHead>)}
                                {(fun == "Trade History") && (<TableHead>PnL</TableHead>)}
                                {(fun == "Trade History") && (<TableHead>Closed At</TableHead>)}
                                {(fun == "Trade History") && (<TableHead>Status</TableHead>)}
                                {(fun == "Order History") && (<TableHead>Type</TableHead>)}
                                {(fun == "Order History") && (<TableHead>Status</TableHead>)}
                               
                                {(fun == "Order History") && (<TableHead>Quantity</TableHead>)}
                                {(fun == "Order History") && (<TableHead>Created At</TableHead>)}
                                {(fun == "Order History") && (<TableHead>Liquidation Price</TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((pos) => {
                                return(
                                    <TableRow key={pos._id} className="border-white/5 hover:bg-white/[0.02] cursor-pointer rounded-md" onClick={() => setEntity(pos)}>
                                        <TableCell className="py-4">
                                            <div className="flex flex-col">
                                            <span className="font-bold tracking-wider text-base">{pos.symbol}</span>
                                            <Badge variant="outline" className={`w-fit text-[10px] h-4 px-1 text-[#f6d658]`}>
                                                {pos.margin}
                                            </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-base text-muted-foreground font-sans tracking-wider">{pos.side}</TableCell>
                                        {(fun == "Order History") && <TableCell className="text-base text-white font-sans tracking-wider">{pos.type}</TableCell>}
                                        {(fun == "Order History") && <TableCell className="text-base text-muted-foreground font-sans tracking-wider">{pos.status}</TableCell>}                                               
                                                                                       
                                        {/* {(fun != "Order History") ? (<TableCell className="text-base text-muted-foreground font-sans tracking-wider">{pos.positionSize?.toFixed(2)}</TableCell>) : null} */}
                                        {(fun == "Trade History") && <TableCell className="text-base text-muted-foreground font-sans tracking-wider">{pos.entryPrice}</TableCell>}   
                                        {(fun == "Trade History") && <TableCell className={`text-base text-muted-foreground font-sans tracking-wider ${ pos.closingPrice ? "" : "text-white "}`}>{(pos.closingPrice?.toFixed(2)) ? pos.closingPrice?.toFixed(2) : <GetPrice s={pos.symbol}/> }</TableCell>}
                                        {(fun == "Order History") && <TableCell className="text-base text-muted-foreground font-sans tracking-wider">{pos.quantity.toFixed(6)}</TableCell>}
                                        {(fun == "Order History") && <TableCell className="text-base text-muted-foreground font-sans tracking-wider">{pos.filledAt}</TableCell>}
                                        {(fun == "Order History") && <TableCell className="text-base text-muted-foreground font-sans tracking-wider">{pos.liquidationPrice.toFixed(4)}</TableCell>}
                                        {(fun == "Trade History") && <TableCell className={`text-lg text-muted-foreground font-sans tracking-wider   ${pos.realizedPnL !== null ? (pos.realizedPnL >=0 ? "text-profit" : "text-loss") : ""}`}>{(pos.realizedPnL?.toFixed(2)) ? (pos.realizedPnL?.toFixed(2) >=0 ? `+${pos.realizedPnL?.toFixed(2)}` : pos.realizedPnL?.toFixed(4)) : <LivePnl positionId={pos._id} /> }</TableCell>}
                                        {/* <TableCell className="text-base text-muted-foreground font-sans tracking-wider">{pos.leverage}</TableCell> */}
                                        {(fun == "Trade History") && <TableCell className="text-base text-muted-foreground font-sans tracking-wider">{pos.closedAt ? pos.closedAt : "Live On Market..." }</TableCell>}
                                        {(fun == "Trade History") && <TableCell className="text-base text-muted-foreground font-sans tracking-wider">{pos.status}</TableCell>}
                                        
                                        </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <Dialog 
                open={!!entity} 
                onOpenChange={(isOpen) => {
                    
                    if (!isOpen) setEntity(null);
                }}
            >
                <DialogContent className="bg-og text-white border-white/10 sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl tracking-widest text-yellow-300 font-sans tracking-wider">
                            {entity?.symbol} - {entity?.side}
                        </DialogTitle>
                    </DialogHeader>
                    
                    {fun == "Trade History" ? <div className="grid gap-4 py-4 font-sans text-sm">
                        <div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Position ID:</span>
                            <span className="truncate">{entity?._id}</span>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Symbol:</span>
                            <span className="truncate">{entity?.symbol}</span>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Side:</span>
                            <span className="truncate">{entity?.side}</span>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Type:</span>
                            <span className="truncate">{entity?.type}</span>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Leverage:</span>
                            <span>{entity?.leverage}x</span>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Margin:</span>
                            <span>{entity?.margin?.toFixed(2)} SOL</span>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Status:</span>
                            <span className="truncate">{entity?.status}</span>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Liquidation Price:</span>
                            <span className="truncate">{entity?.liquidationPrice}</span>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Quantity:</span>
                            <span className="truncate">{entity?.quantity}</span>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Stop Loss:</span>
                            <span className="truncate">{entity?.stopLoss}</span>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Take Profit:</span>
                            <span className="truncate">{entity?.takeProfit}</span>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Opened At:</span>
                            <span className="truncate">{entity?.openedAt}</span>
                        </div><div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Closed At:</span>
                            <span className="truncate">{entity?.closedAt}</span>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Entry Price:</span>
                            <span className="truncate">{entity?.entryPrice}</span>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Closing Price:</span>
                            <span className="truncate">{entity?.closingPrice}</span>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Position Size:</span>
                            <span className="truncate">{entity?.positionSize}</span>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Realized Pnl:</span>
                            <span className="truncate">{entity?.realizedPnL}</span>
                        </div>
                        
                     
                    </div> : <div className="grid gap-4 py-4 font-sans tracking-wider text-sm">
                        <div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Order ID:</span>
                            <span className="truncate">{entity?._id}</span>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Symbol:</span>
                            <span className="truncate">{entity?.symbol}</span>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Side:</span>
                            <span className="truncate">{entity?.side}</span>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Type:</span>
                            <span className="truncate">{entity?.type}</span>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Leverage:</span>
                            <span>{entity?.leverage}x</span>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Margin:</span>
                            <span>{entity?.margin?.toFixed(2)} SOL</span>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Status:</span>
                            <span className="truncate">{entity?.status}</span>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Liquidation Price:</span>
                            <span className="truncate">{entity?.liquidationPrice}</span>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Quantity:</span>
                            <span className="truncate">{entity?.quantity}</span>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Stop Loss:</span>
                            <span className="truncate">{entity?.stopLoss}</span>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Take Profit:</span>
                            <span className="truncate">{entity?.takeProfit}</span>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Limit Price:</span>
                            <span className="truncate">{entity?.limitPrice}</span>
                        </div><div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Expiry:</span>
                            <span className="truncate">{entity?.expiry}</span>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Position Id:</span>
                            <span className="truncate">{entity?.positionId}</span>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <span className="text-muted-foreground">Filled At:</span>
                            <span className="truncate">{entity?.filledAt}</span>
                        </div>
                        
                        </div>}
                    
                </DialogContent>
            </Dialog>
        </div>
    )
}