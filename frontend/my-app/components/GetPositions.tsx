"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { api } from '@/lib/api';





async function GetPositions(){
    
    const [pos , setPos] = useState<any>([])
    async function GetPos(){
        const response = await api.post("/api/positions" ,{} , {
            headers:{
                authorization: localStorage.getItem("authorization")
            }
        })
        if(response){
            setPos(response.data);
            console.log(JSON.stringify(response.data))
        }
        
    }
    return(
        <div>
            <button onClick={GetPos} className="rounder bg-blue-400 px-5 py-2 cursor-pointer"> GET POS</button>
            <div className="bg-blue-500 text-white p-10 m-10" >
                 the open positions are {JSON.stringify(pos)}
            </div>
        </div>
    )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStore } from "@/app/store/useStore";
import GetPrice from "./GetPrice";
import LivePnl from "./LivePnl";




export default function Positions() {
   const [fun , setFun] = useState<String>("Open Positions");
    const {isLoggedIn , setIsLoggedIn ,setBalance } = useStore()
   const [pos , setPos] = useState<any>([])
   const [order , setOrder] = useState<any>([])
   const [trade , setTrade] = useState<any>([])
   const [data , setData] = useState<any>([])
   const [rel , setRel] = useState(true);
   async function Close(sym:string , id:string){
    console.log(id)
    const response = await api.post("/api/closePositions" , {
      symbol: sym,
      positionId: id
    },{
            headers:{
                authorization: localStorage.getItem("authorization")
            }
        })
        console.log(response.data.balance)
        if(response.data.balance !== undefined){
          setBalance(Number(response.data.balance))
        }
        await GetPos();
        
   }
    async function GetPos(){
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
            GetPos()
        }
    } , [fun , isLoggedIn ])
  return (
    <div className="rounded-md mt-1">
        <div className="flex gap-2 mt-1 mx-1 items-center bg-og p-2 w-full rounded-md">
            <button 
                    onClick={() => setFun("Open Positions")}
                    className={`px-4 py-2 text-sm font-sans rounded-md transition-all border-b-2 ${fun === "Open Positions" ? "border-[#f6d658] text-[#f6d658] bg-white/5" : "border-transparent text-muted-foreground hover:text-white"}`}
                >
                    Open Positions
            </button>
            <button 
                    onClick={() => setFun("Order History")}
                    className={`px-4 py-2 text-sm font-sans rounded-md transition-all border-b-2 ${fun === "Order History" ? "border-[#f6d658] text-[#f6d658] bg-white/5" : "border-transparent text-muted-foreground hover:text-white"}`}
                >
                    Order History
            </button>
            <button 
                    onClick={() => setFun("Trade History")}
                    className={`px-4 py-2 text-sm font-sans rounded-md transition-all border-b-2 ${fun === "Trade History" ? "border-[#f6d658] text-[#f6d658] bg-white/5" : "border-transparent text-muted-foreground hover:text-white"}`}
                >
                    Trade History
            </button>
        </div>
        <div className="m-1 rounded-md">
            <Card className="bg-og rounded-md overflow-hidden border border-white/5">
      <CardHeader className="px-5 py-3 border-b border-white/5">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-baseline gap-2">
          {fun}
          <span className="text-white/30 font-mono normal-case">({data.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table >
          <TableHeader className="bg-black/20">
          
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-[11px] uppercase tracking-wider">Symbol</TableHead>
              {(fun == "Order History") && <TableHead className="text-[11px] uppercase tracking-wider">Type</TableHead>} 
              <TableHead className="text-[11px] uppercase tracking-wider">Side</TableHead> 
              {(fun != "Order History") && <TableHead className="text-[11px] uppercase tracking-wider">Entry Price</TableHead>}
              {(fun == "Open Positions") && <TableHead className="text-[11px] uppercase tracking-wider">Current Price</TableHead>} 
              {(fun == "Trade History") && <TableHead className="text-[11px] uppercase tracking-wider">Closing Price</TableHead>}
              {(fun == "Order History") && <TableHead className="text-[11px] uppercase tracking-wider">Quantity</TableHead>}
              {(fun != "Order History") && (<TableHead className="text-[11px] uppercase tracking-wider">PnL (ROE-USDT)</TableHead>)}
              {(fun == "Order History") && (<TableHead className="text-[11px] uppercase tracking-wider">Liquidation Price</TableHead>)}
              <TableHead className="text-[11px] uppercase tracking-wider">Leverage</TableHead>
              {(fun == "Open Positions") && <TableHead className="text-[11px] uppercase tracking-wider">Liquidation Price</TableHead>}
              {(fun == "Open Positions") && <TableHead className="text-[11px] uppercase tracking-wider">Action</TableHead>}
            </TableRow>

            
          </TableHeader>
          <TableBody>
            {data.map((pos) => {
              return (
                <TableRow key={pos._id} className="border-white/5 hover:bg-white/[0.03] transition-colors">
                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <span className="font-bold tracking-wider text-sm">{pos.symbol}</span>
                      <Badge variant="outline" className={`w-fit text-[10px] h-4 px-1 text-[#f6d658] border-[#f6d658]/30 font-mono`}>
                        {pos.margin}
                      </Badge>
                    </div>
                  </TableCell>
                  {(fun == "Order History") && <TableCell className="text-sm text-white font-mono">{pos.type}</TableCell>}
                  <TableCell className={`text-sm font-mono font-semibold ${pos.side === "LONG" ? "text-profit" : "text-loss"}`}>{pos.side}</TableCell>
                  {(fun != "Order History") && <TableCell className="text-sm text-muted-foreground font-mono">{pos.entryPrice}</TableCell>}
                  {(fun == "Open Positions") && <TableCell className="text-sm text-muted-foreground font-mono">{<GetPrice s={pos.symbol}/>}</TableCell>}
                  {(fun == "Trade History") && <TableCell className="text-sm text-muted-foreground font-mono">{(pos.closingPrice?.toFixed(2)) ? pos.closingPrice?.toFixed(2) : <GetPrice s={pos.symbol}/> }</TableCell>}
                  {(fun == "Order History") && <TableCell className="text-sm text-muted-foreground font-mono">{pos.quantity.toFixed(6)}</TableCell>}
                  {(fun == "Order History") && <TableCell className="text-sm text-muted-foreground font-mono">{pos.liquidationPrice?.toFixed(4)}</TableCell>}
                  {(fun == "Trade History") && <TableCell className={`text-sm font-mono font-semibold ${pos.realizedPnL ? (pos.realizedPnL >= 0 ? "text-profit" : "text-loss") : "text-muted-foreground"}`}>{(pos.realizedPnL?.toFixed(2)) ? pos.realizedPnL?.toFixed(2) : <LivePnl positionId={pos._id} /> }</TableCell>}
                  {(fun == "Open Positions") && <TableCell className="text-sm font-mono font-semibold">{<LivePnl positionId={pos._id} />}</TableCell>}
                  <TableCell className="text-sm text-muted-foreground font-mono">{pos.leverage}x</TableCell>
                  {(fun == "Open Positions") && <TableCell className="text-sm text-loss/80 font-mono">{pos.liquidationPrice?.toFixed(4)}</TableCell>}
                  
                  {(fun == "Open Positions") && (<TableCell className="">
                    <Button variant="secondary" size="sm" onClick={() => Close(pos.symbol, pos._id)} className="h-7 cursor-pointer text-xs font-mono uppercase tracking-wide bg-white/5 border border-white/10 hover:bg-loss hover:border-loss hover:text-white transition-colors">
                      Close
                    </Button>
                  </TableCell>)}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
        </div>
        
    </div>
    
  );
}