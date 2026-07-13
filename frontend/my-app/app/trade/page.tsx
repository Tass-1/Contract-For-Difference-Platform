"use client";
import Strip from "@/components/Strip";
import TradeCharts from "@/components/TradeChart";
import NavBar from "@/components/Navigation"; 
import SocketListener from "@/components/SocketComp"; 
import OrderForm from "@/components/OrderForm"; 
import Positions from "@/components/GetPositions"; 
import WalletAdapter from "@/components/walletAdapter"; 
import { useStore } from "../store/useStore";
import TickerTape from "@/components/Ticker";
import { api } from '@/lib/api';

export default function Trade() {
    const Nsymbol = useStore(state => state.symbol)
  return (
    <div className="flex flex-col items-center bg-background font-sans min-h-screen">

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-1 w-full p-1">

            <div className="rounded-md mx-auto w-full overflow-hidden">

              <Strip/>

              <div className="w-full h-full rounded-md">
                  <TradeCharts symbol={Nsymbol}/>
              </div>

            </div>

            <div className="w-full bg-og p-5 rounded-md h-fit xl:sticky xl:top-[68px]">
              <OrderForm/>
            </div>

          </div>

          <div className="w-full">
            <Positions/>
          </div>

        </div>
  );
}