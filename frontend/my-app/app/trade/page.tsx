"use client";
import Strip from "@/components/Strip";
import TradeCharts from "@/components/TradeChart";
import SocketListener from "@/components/SocketComp";
import OrderForm from "@/components/OrderForm";
import Positions from "@/components/GetPositions";
import { useStore } from "../store/useStore";
import TickerTape from "@/components/Ticker";

export default function Trade() {
    const Nsymbol = useStore(state => state.symbol);

    return (
        <div className="w-full h-[calc(100vh-64px)] flex flex-col bg-[#0b0e11] text-[#eaecef] overflow-hidden font-sans">
            
            <SocketListener />
            
            <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
                
                <div className="flex-1 flex flex-col min-w-0 border-r border-[#1e2329]">
                    
                    <div className="shrink-0 border-b border-[#1e2329]">
                        <Strip />
                    </div>
                    
                  
                    <div className="flex-1 min-h-0 bg-[#0b0e11] relative z-0 overflow-hidden">
                        <TradeCharts symbol={Nsymbol} />
                    </div>
                    
                   
                    <div className="h-[35%] min-h-[220px] shrink-0 border-t border-[#1e2329] bg-[#0b0e11] relative z-10 overflow-hidden shadow-[0_-10px_15px_-3px_rgba(11,14,17,1)]">
                        <Positions />
                    </div>
                    
                </div>

                <div className="w-full lg:w-[320px] xl:w-[360px] shrink-0 flex flex-col h-full bg-[#131418] overflow-y-auto">
                    <OrderForm />
                </div>
                
            </div>

            <TickerTape />
            
        </div>
    );
}