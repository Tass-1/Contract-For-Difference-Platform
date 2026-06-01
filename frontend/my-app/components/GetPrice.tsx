'use client';
import { useStore } from "@/app/store/useStore";
import axios from "axios";
import { useEffect, useState } from "react";
import {io} from "socket.io-client";


export default function GetPrice({s} : {s:string}) {
    const price = useStore(state => state.livePrice[s])
   
    
    return(
            <div className="font-semiBold">
                {price ? parseFloat(price).toFixed(4) : "..."}
            </div>
           

    )
}