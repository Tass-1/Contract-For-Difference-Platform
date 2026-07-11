


"use client";
import axios from "axios";
import { useState } from "react";
import { api } from '@/lib/api';





export default function GetTrades(){
    
    const [pos , setPos] = useState<any>([])
    async function GetTrade(){
        const response = await api.post("/api/trades" ,{} , {
            headers:{
                authorization: localStorage.getItem("authorization")
            }
        })
        if(response){
            setPos(response.data);
        }
        
    }





    return(
        <div>
            <button onClick={GetTrade} className="rounder bg-blue-400 px-5 py-2 cursor-pointer"> GET POS</button>
            <div className="bg-blue-500 text-white p-10 m-10" >
                 the closed trades are {JSON.stringify(pos)}
            </div>
        </div>
    )
}