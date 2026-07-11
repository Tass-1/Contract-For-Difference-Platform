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
    <div className="rounded-md mr-2">
        <div className="flex gap-20 mt-1 mr-1 ml-1 items-center bg-og p-5 w-full rounded-md mr-1 tracking-widest">
            <button 
                    onClick={() => setFun("Open Positions")}
                    className={`flex font-sans rounded transition-all ${fun === "Open Positions" ? " text-[#f6d658]" : "text-muted-foreground hover:text-white"}`}
                >
                    Open Positions
            </button>
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
        <div className="m-1 rounded-md">
            <Card className="bg-og  rounded-md overflow-hidden">
      <CardHeader className=" px-5 border-b rounded-md border-white/5">
        <CardTitle className="text-sm font-medium bg-redtext-muted-foreground uppercase tracking-wider">
          {fun} ({data.length})
        </CardTitle>
      </CardHeader>
      <CardContent className=" ">
        <Table >
          <TableHeader className="bg-black/20 rounded-md tracking-wider">
          
            <TableRow className="border-white/5 hover:bg-transparent ">
              <TableHead className="text-xs ">Symbol</TableHead>
              {(fun == "Order History") && <TableHead className="text-xs">Type</TableHead>} 
              <TableHead className="text-xs">Side</TableHead> 
              {/* {(fun != "Order History") ? (<TableHead className="text-xs">Position Size</TableHead>) : null} */}
              {(fun != "Order History") && <TableHead className="text-xs">Entry Price</TableHead>}
              {(fun == "Open Positions") && <TableHead className="text-xs">Current Price</TableHead>} 
              {(fun == "Trade History") && <TableHead className="text-xs">Closing Price</TableHead>}
              {(fun == "Order History") && <TableHead className="text-xs">Quantity</TableHead>}
              {(fun != "Order History") && (<TableHead className="text-xs">PnL (ROE-USDT)</TableHead>)}
              {(fun == "Order History") && (<TableHead className="text-xs">Liquidation Price</TableHead>)}
              <TableHead className="text-xs">Leverage</TableHead>
              {(fun == "Open Positions") && <TableHead className="text-xs">Liquidation Price</TableHead>}
              {(fun == "Open Positions") && <TableHead className="text-xs ">Action</TableHead>}
            </TableRow>

            
          </TableHeader>
          <TableBody>
            {data.map((pos) => {
            //   const pnl = pos.side === "LONG" 
            //     ? (pos.markPrice - pos.entryPrice) * pos.size 
            //     : (pos.entryPrice - pos.markPrice) * pos.size;
              
            //   const roe = (pnl / (pos.entryPrice * pos.size / pos.leverage)) * 100;
            //   const isProfit = pnl >= 0;

              return (
                <TableRow key={pos._id} className="border-white/5 hover:bg-white/[0.02]  rounded-md">
                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <span className="font-bold tracking-wider text-sm">{pos.symbol}</span>
                      <Badge variant="outline" className={`w-fit text-[10px] h-4 px-1 text-[#f6d658]`}>
                        {pos.margin}
                      </Badge>
                    </div>
                  </TableCell>
                  {(fun == "Order History") && <TableCell className="text-sm text-white font-mono">{pos.type}</TableCell>}
                  <TableCell className="text-sm text-muted-foreground font-mono">{pos.side}</TableCell>
                  {/* {(fun != "Order History") ? (<TableCell className="text-sm text-muted-foreground font-mono">{pos.positionSize?.toFixed(2)}</TableCell>) : null} */}
                  {(fun != "Order History") && <TableCell className="text-sm text-muted-foreground font-mono">{pos.entryPrice}</TableCell>}
                  {(fun == "Open Positions") && <TableCell className="text-sm text-muted-foreground font-mono ">{<GetPrice s={pos.symbol}/>}</TableCell>}
                  {(fun == "Trade History") && <TableCell className="text-sm text-muted-foreground font-mono">{(pos.closingPrice?.toFixed(2)) ? pos.closingPrice?.toFixed(2) : <GetPrice s={pos.symbol}/> }</TableCell>}
                  {(fun == "Order History") && <TableCell className="text-sm text-muted-foreground font-mono">{pos.quantity.toFixed(6)}</TableCell>}
                  {(fun == "Order History") && <TableCell className="text-sm text-muted-foreground font-mono">{pos.liquidationPrice?.toFixed(4)}</TableCell>}
                  {(fun == "Trade History") && <TableCell className={`text-sm text-muted-foreground font-mono ${pos.realizedPnL ? (pos.realizedPnL >= 0 ? "text-profit" : "text-loss") : ""}`}>{(pos.realizedPnL?.toFixed(2)) ? pos.realizedPnL?.toFixed(2) : <LivePnl positionId={pos._id} /> }</TableCell>}
                  {(fun == "Open Positions") && <TableCell className="text-sm text-muted-foreground font-mono">{<LivePnl positionId={pos._id} />}</TableCell>}
                  <TableCell className="text-sm text-muted-foreground font-mono">{pos.leverage}</TableCell>
                  {(fun == "Open Positions") && <TableCell className="text-sm text-muted-foreground font-mono">{pos.liquidationPrice?.toFixed(4)}</TableCell>}
                  {/* {(fun == "Trade History") && <TableCell className="text-sm text-muted-foreground font-mono">{pos.closingPrice}</TableCell>} */}
                  
                  {(fun == "Open Positions") && (<TableCell className="">
                    <Button variant="secondary" size="sm" onClick={() => Close(pos.symbol, pos._id)} className="h-7 cursor-pointer text-xs bg-white/5 hover:bg-loss hover:text-white transition-colors">
                      Close Position
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