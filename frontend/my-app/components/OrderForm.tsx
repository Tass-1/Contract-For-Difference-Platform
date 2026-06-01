'use client';
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useStore } from "@/app/store/useStore";
import axios from "axios";
import GetPrice from "./GetPrice";

export default function OrderForm() {
    const symbol = useStore((state) => state.symbol);
    const balance = useStore((state) => state.balance);
    const [orderType, setOrderType] = useState("Market"); 
    const [leverage, setLeverage] = useState([10]);
    

    return (
        <div className="w-full flex flex-col gap-4">
            {/* 1. Order Type Selection (Market vs Limit) */}
            <div className="flex gap-2 p-1 bg-black/40 rounded-md">
                <button 
                    onClick={() => setOrderType("Market")}
                    className={`flex-1 py-1 text-xs rounded transition-all ${orderType === "Market" ? "bg-secondary text-white" : "text-muted-foreground hover:text-white"}`}
                >
                    Market
                </button>
                <button 
                    onClick={() => setOrderType("Limit")}
                    className={`flex-1 py-1 text-xs rounded transition-all ${orderType === "Limit" ? "bg-secondary text-white" : "text-muted-foreground hover:text-white"}`}
                >
                    Limit
                </button>
            </div>

            <Tabs defaultValue="LONG" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-black/20 mb-4">
                    <TabsTrigger value="LONG" className="data-[state=active]:bg-profit data-[state=active]:text-black font-bold">
                        Long
                    </TabsTrigger>
                    <TabsTrigger value="SHORT" className="data-[state=active]:bg-loss data-[state=active]:text-white font-bold">
                        Short
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="LONG" className="mt-0">
                    <OrderInputs side="LONG" orderType={orderType} symbol={symbol} leverage={leverage} setLeverage={setLeverage} balance={balance} />
                </TabsContent>
                
                <TabsContent value="SHORT" className="mt-0">
                    <OrderInputs side="SHORT" orderType={orderType} symbol={symbol} leverage={leverage} setLeverage={setLeverage} balance={balance} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function OrderInputs( {side, orderType, symbol, leverage, setLeverage, balance}: any ) {
    const isLong = side === "LONG";
    const [price, setPrice] = useState(0);
    const solPrice = useStore(state => state.livePrice["SOLUSDT"])
    
    const [expiry ,setExpiry] = useState("")
    const [stopLoss, setstopLoss] = useState(0);
    const [takeProfit, setTakeprofit] = useState(0);
    const [limit, setLimit] = useState(0);
    const currentPrice = useStore(state => state.livePrice[symbol])
    const setBalance = useStore(state => state.setBalance)


    async function order(amount: number , leverage:number , symbol: string, side: string, stopLoss: number, takeProfit: number, type: string, limitPrice?: number, expiry?: string) {
        console.log("buttonon")
        const margin = Number(amount);
        const leverageNum= Number(leverage);
        

        if( type == "Market"){
            console.log("DOing work for market ordr")
            const response = await axios.post("http://localhost:4000/order",{
                margin: margin,
                leverage: leverageNum,
                symbol: symbol,
                side: side,
                stopLoss : Number(stopLoss),
                takeProfit: Number(takeProfit),
                type: type
            }, {
                headers:{
                    'authorization': localStorage.getItem('authorization')
                }
            })
            console.log(response.data)
            setBalance(response.data.newBalance)
         }
         else{
            console.log("DOing work for limit ordr")
            const response = await axios.post("http://localhost:4000/limit-order",{
                margin: margin,
                leverage: leverageNum,
                symbol: symbol,
                side: side,
                stopLoss : Number(stopLoss),
                takeProfit: Number(takeProfit),
                type: type,
                limitPrice: Number(limitPrice),
                expiry: expiry ? new Date(expiry) : null
            }, {
                headers:{
                    'authorization': localStorage.getItem('authorization')
                }
            })
         }
    }
    return (
        <div className="space-y-4">
            
            <div className="space-y-2">
                <div className="flex justify-between">
                    <Label className="text-muted-foreground text-xs">Margin (SOL)</Label>
                    {/* {isMarket && <span className="text-[10px] text-profit uppercase font-bold">Best Market Price</span>} */}
                </div>
                <Input 
                    type="number" 
                    // disabled={isMarket}
                    // value={isMarket ? "" : price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                />
                </div>

            

        
            <div className="space-y-4 py-2">
                <div className="flex justify-between items-center">
                    <Label className="text-muted-foreground text-xs">Leverage</Label>
                    <span className="text-xs font-mono text-white bg-secondary px-2 py-0.5 rounded border border-white/5">{leverage}x</span>
                </div>
                <Slider value={leverage} onValueChange={setLeverage} max={10} step={1} />
            </div>

            
                <div>   
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">Take Profit</Label>
                            <Input placeholder="TP" className="h-8 bg-black/20 text-xs" onChange={(e) => setTakeprofit(Number(e.target.value))}/>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">Stop Loss</Label>
                            <Input placeholder="SL" className="h-8 bg-black/20 text-xs"  onChange={(e) => setstopLoss(Number(e.target.value))} />
                        </div>
                    </div>
                    <div className="flex justify-between mt-7 mb-2">
                        <Label className="text-muted-foreground text-xs">Limit Price (USDT)</Label>
                    </div>
                    <Input 
                        type="number" 
                        onChange={(e) => setLimit(Number(e.target.value))}
                        disabled={ orderType == "Limit" ? false : true}
                    />
                    {orderType === "Limit" && (
                        <div className="space-y-2 mt-4">
                            <Label className="text-muted-foreground text-xs">Expiry Date/Time</Label>
                            <Input 
                                type="datetime-local" 
                                className="text-muted" 
                                onChange={(e) => setExpiry(e.target.value)}
                            />
                        </div>
                    )}
                </div>
                

            

        
            <div className="bg-black/10 p-3 rounded-md space-y-1 text-[14px] border border-white/5 font-sans">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Balance</span>
                    <span className="text-white">{Number(balance*solPrice).toFixed(2)} USDT</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Pos. Size</span>
                    <span className="text-white">{(Number((price * leverage[0]).toFixed(2))*currentPrice).toFixed(4) } USDT</span>
                </div>
            </div>

            <Button className={`w-full h-15 font-bold py-6 text-lg uppercase tracking-wider bg-profit hover:bg-profit/90 text-black cursor-pointer`} disabled={isLong ? false : true || price < 0.1}
            onClick={() => order(price, leverage[0], symbol, side, stopLoss, takeProfit, orderType, limit, expiry )} >
                Open Long
            </Button>
            <Button className={`w-full h-15 font-bold py-6 text-lg uppercase tracking-wider cursor-pointer bg-loss hover:bg-loss/90 text-black 
            `} disabled={!isLong ? false : true || price < 0.1} onClick={() => order(price, leverage[0], symbol, side, stopLoss, takeProfit, orderType, limit, expiry )} >
                Open Short
            </Button>
        </div>
    );
}


