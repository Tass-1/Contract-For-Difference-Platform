"use client";
import { useEffect, useState } from "react";
import {io , Socket } from 'socket.io-client';
import { useStore } from "@/app/store/useStore";
export default function LivePnl({ positionId }: { positionId: string }) {
    const [liveData , setLiveData] = useState<any>(null);
    const [BTCPrice , setBTCPrice] = useState<String>("0.00");
    const {isLoggedIn} = useStore();

    const pnl = useStore(state => state.livePositions[positionId]?.pnl)
    const isProfit = pnl >= 0;
    return(
        <div>
            

            <div className={`font-sans ${isProfit ? "text-profit" : "text-loss"}`}>
               { pnl !== undefined ? pnl.toFixed(4) : 0.0000}    
            </div>
                    

            
        </div>
    )
    
    
}