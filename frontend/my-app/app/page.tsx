"use client";
import Image from "next/image";
import TradeCharts from "@/components/TradeChart";
import WalletAdapter from "@/components/walletAdapter";
import AuthButton from "@/components/AuthButton";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import DepositFunc from "@/components/DepositFunc";
import WithdrawMoney from "@/components/WithdrawMoney";
import GetPrice from "@/components/GetPrice";
import Order from "@/components/Order";
import LivePnl from "@/components/LivePnl";
import GetPositions from "@/components/GetPositions";
import GetTrades from "@/components/GetTrades";
import { Button } from "../components/ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import NavBar from "@/components/Navigation";
import Trade from "./trade/page";
import OrderForm from "@/components/OrderForm";
import Positions from "@/components/GetPositions";
import SocketListener from "@/components/SocketComp";
import { useEffect, useState } from "react";
import axios from "axios";


export default function Home() {

  const [sol , setSol] = useState("0.00")
  const [btc , setBtc] = useState("0.00")
  const [eth , setEth] = useState("0.00")
  useEffect(() => {
    async function getChange(){
      await Promise.all(["BTCUSDT" , "ETHUSDT", "SOLUSDT"].map(async sym => {
          const response = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${sym}`);
          if(sym == "BTCUSDT"){ setBtc(response.data.priceChangePercent)}
          if(sym == "SOLUSDT"){ setSol(response.data.priceChangePercent)}
          if(sym == "ETHUSDT"){ setEth(response.data.priceChangePercent)}
        })
      )
    } 
    getChange();

    const interval = setInterval(getChange , 6000);
    return () => {
      clearInterval(interval)
    }
  }  , [])

  return (
    <div className="flex flex-col">
      <div className="h-screen w-screen bg-og">   
         
          <div className="flex gap-20">
            <div className="w-150 bg-og ml-35 mt-20">
            <div className="bg-og text-8xl font-sans text-semibold text-yellow-300 tracking-widest"> TRADE <div className="bg-og text-8xl font-sans text-semibold text-profit font-semibold tracking-widest">CRYPTO </div> <div className="bg-og text-8xl font-sans  text-white tracking-widest">WITH</div>  <div className="bg-og text-8xl font-semibold font-sans text-semibold text-loss tracking-widest">LEVERAGE</div>  </div>
            <div className="bg-og text-3xl mt-4 tracking-wider"> Real-time CFD trading on BTC, ETH, SOL </div>
            </div>
            <div className="w-150 h-80 bg-muted mt-20 rounded-4xl p-10 "> 
              
              
            <div className="flex justify-between border-b border-white/10 pb-4"> 
              <div className="text-muted-foreground text-sm uppercase tracking-wider">Currencies</div> 
              <div className="text-muted-foreground text-sm uppercase tracking-wider">Markets</div>
            </div>
            
            <div className="mt-6 flex justify-between w-full font-medium items-center">
              <div className="font-medium tracking-wider text-white text-lg">BTC</div>
              <div className="font-mono text-white flex">$ <GetPrice s={"BTCUSDT"}/></div>
              <div className={btc >= 0 ? "text-profit font-mono font-medium" : "text-loss font-mono font-medium"}>
                {btc >= 0 ? "+ " : ""}{btc}%
              </div>
            </div>
            
            <div className="mt-6 flex justify-between font-medium w-full items-center">
              <div className="font-medium tracking-wider text-white text-lg">SOL</div>
              <div className="font-mono text-white flex">$ <GetPrice s={"SOLUSDT"}/></div>
              <div className={sol >= 0 ? "text-profit font-mono font-medium" : "text-loss font-mono font-medium"}>
                {sol >= 0 ? "+ " : ""}{sol}%
              </div>
            </div>
            
            <div className="mt-6 flex justify-between font-medium w-full items-center">
              <div className="font-medium tracking-wider text-white text-lg">ETH</div>
              <div className="font-mono text-white flex">$ <GetPrice s={"ETHUSDT"}/></div>
              <div className={eth >= 0 ? "text-profit font-mono font-medium" : "text-loss font-mono font-medium"}>
                {eth >= 0 ? "+ " : ""}{eth}%
              </div>
            
          </div>
          
        </div>
        
      </div>
        {/* <div className="ml-215 text-3xl  text-black font-semibold bg-yellow-300 rounded-lg h-40 flex justify-between items-center p-10 w-130">START YOUR TRADING JOURNEY TODAY</div>     */}
    </div>
      
      
      {/* <div className="bg-[url('./en.png')] w-screen h-screen bg-cover bg-no-repeat blur-xs"></div> */}
  </div>
    
  );
}
