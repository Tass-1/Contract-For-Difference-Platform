"use client";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useStore } from "@/app/store/useStore";

export default function SocketListener() {
    const { isLoggedIn, setLivePosition, setLivePrice,setChartData } = useStore();
    
    useEffect(() => {
        const token = localStorage.getItem("authorization");
        const prevention = token ? { auth:  { authorization: token } }: {}
        const socket = io("http://localhost:4000", prevention);


        ["BTCUSDT", "SOLUSDT", "ETHUSDT"].forEach(sym => {
            socket.on(`live-candle-${sym}`, (data) => {
                setChartData(sym, data);
            });
        });

        ["BTCUSDT", "SOLUSDT", "ETHUSDT"].forEach(sym => {
            socket.on(`get${sym}-price`, (price) => {
                setLivePrice(sym, price);
            });
        });
        if (isLoggedIn) {
            socket.on("position-update", (data) => {
            setLivePosition(data.positionId, data);
            });
        }

        return () => { socket.disconnect(); };
    }, [isLoggedIn]);

    return null;
}