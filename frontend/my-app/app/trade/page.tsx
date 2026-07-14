'use client';

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
        <div className="w-full min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] flex flex-col bg-[#0b0e11] text-[#eaecef] overflow-x-hidden overflow-y-auto lg:overflow-hidden font-sans">
            
            <SocketListener />
            
            <div className="flex-1 flex flex-col lg:flex-row min-h-0">
                
                <div className="flex-1 flex flex-col min-w-0 lg:border-r border-[#1e2329]">
                    
                    <div className="shrink-0 border-b border-[#1e2329]">
                        <Strip />
                    </div>
                    
                    <div className="flex-none h-[400px] lg:flex-1 lg:h-auto lg:min-h-0 bg-[#0b0e11] relative z-0 overflow-hidden">
                        <TradeCharts symbol={Nsymbol} />
                    </div>
                    
                    <div className="flex-none min-h-[350px] lg:shrink-0 lg:h-[35%] lg:min-h-[220px] border-t border-[#1e2329] bg-[#0b0e11] relative z-10 overflow-hidden lg:shadow-[0_-10px_15px_-3px_rgba(11,14,17,1)]">
                        <Positions />
                    </div>
                    
                </div>

                <div className="w-full lg:w-[320px] xl:w-[360px] shrink-0 flex flex-col h-auto lg:h-full bg-[#131418] lg:overflow-y-auto border-t lg:border-t-0 border-[#1e2329]">
                    <OrderForm />
                </div>
                
            </div>

            <div className="shrink-0 hidden lg:block">
                <TickerTape />
            </div>
            
        </div>
    );
}