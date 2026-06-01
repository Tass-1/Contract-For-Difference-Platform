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

export default function Trade() {
    const Nsymbol = useStore(state => state.symbol)
  return (
    <div className="flex flex-col items-center bg-background font-sans">
          
          <div className="flex w-full">
            <div className="w-full rounded-md mx-auto p-1 pl-1 l-0"  >

            {/* <div className="w-full h-18 rounded-md flex items-center p-4 bg-red-200"> STRIP </div> */}

            <Strip/>

            <div className="w-full h-full rounded-md">

                <TradeCharts symbol={Nsymbol}/>

            </div>

        </div> 
            <div className="w-full m-1 bg-og p-5 rounded-md h-169">
              <OrderForm/>
            </div>
            
          </div>
          <div>
            {/* <TickerTape/> */}
          </div>
          <div className="w-full">
            <Positions/>
          </div>
          {/* <div>
            <LivePnl />
          </div> */}
          
          {/* <WalletAdapter>
            <Order/>
            <GetPrice/>
            <WithdrawMoney/>
            <DepositFunc/>
            <AuthButton></AuthButton>
            <WalletMultiButton></WalletMultiButton>
          </WalletAdapter>
          <TradeCharts/>
          <LivePnl/>
          <GetPositions/>
          <GetTrades/>
          <Button size='lg' variant='destructive'> Shadcn Button</Button>
           */}
          
        </div>
  );
}