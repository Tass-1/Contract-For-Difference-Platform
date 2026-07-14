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
      <div className="min-h-screen w-screen bg-og overflow-hidden">

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center lg:items-start px-6 sm:px-10 lg:px-0">
            <div className="w-full lg:w-150 lg:ml-35 mt-16 lg:mt-20 text-center lg:text-left">
              <div className="bg-og font-sans font-semibold text-yellow-300 tracking-widest leading-[0.95] text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
                TRADE
                <div className="bg-og font-sans font-semibold text-profit tracking-widest">CRYPTO</div>
                <div className="bg-og font-sans font-semibold text-white tracking-widest">WITH</div>
                <div className="bg-og font-sans font-semibold text-loss tracking-widest">LEVERAGE</div>
              </div>
              <div className="bg-og text-xl sm:text-2xl lg:text-3xl mt-6 tracking-wider text-white/70">
                Real-time CFD trading on BTC, ETH, SOL
              </div>
            </div>

            <div className="w-full max-w-md lg:w-150 lg:max-w-none h-auto lg:h-80 bg-[#131418] mt-4 lg:mt-20 rounded-4xl p-8 sm:p-10 border border-white/10 shadow-2xl shadow-black/40">

              <div className="flex justify-between border-b border-white/10 pb-4">
                <div className="text-muted-foreground text-sm uppercase tracking-wider">Currencies</div>
                <div className="text-muted-foreground text-sm uppercase tracking-wider">Markets</div>
              </div>

              <div className="mt-6 flex justify-between w-full font-medium items-center rounded-xl px-2 -mx-2 transition-colors hover:bg-white/5">
                <div className="font-medium tracking-wider text-white text-lg">BTC</div>
                <div className="font-mono text-white flex">$ <GetPrice s={"BTCUSDT"}/></div>
                <div className={btc >= 0 ? "text-profit font-mono font-medium" : "text-loss font-mono font-medium"}>
                  {btc >= 0 ? "+ " : ""}{btc}%
                </div>
              </div>

              <div className="mt-6 flex justify-between font-medium w-full items-center rounded-xl px-2 -mx-2 transition-colors hover:bg-white/5">
                <div className="font-medium tracking-wider text-white text-lg">SOL</div>
                <div className="font-mono text-white flex">$ <GetPrice s={"SOLUSDT"}/></div>
                <div className={sol >= 0 ? "text-profit font-mono font-medium" : "text-loss font-mono font-medium"}>
                  {sol >= 0 ? "+ " : ""}{sol}%
                </div>
              </div>

              <div className="mt-6 flex justify-between font-medium w-full items-center rounded-xl px-2 -mx-2 transition-colors hover:bg-white/5">
                <div className="font-medium tracking-wider text-white text-lg">ETH</div>
                <div className="font-mono text-white flex">$ <GetPrice s={"ETHUSDT"}/></div>
                <div className={eth >= 0 ? "text-profit font-mono font-medium" : "text-loss font-mono font-medium"}>
                  {eth >= 0 ? "+ " : ""}{eth}%
                </div>
              </div>

            </div>

          </div>
      </div>
    </div>

  );
}