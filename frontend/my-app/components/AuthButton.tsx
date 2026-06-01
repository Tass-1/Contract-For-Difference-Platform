'use client';
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import axios from "axios";
import {Buffer} from 'buffer';
import { Button } from "./ui/button";


export default function AuthButton() {

    const wallet = useWallet();
    const connection = useConnection();

    const handleSignIn = async () => {
        const pubkey = wallet.publicKey?.toBase58();
        const response =  await axios.post("http://localhost:4000/auth/nonce" , {
            pubkey: pubkey
        })
        const nonce = response.data.nonce;
        const message = new TextEncoder().encode(nonce);
        const sign = await wallet.signMessage?.(message);
        console.log(sign);
        const response2 = await axios.post("http://localhost:4000/auth/verify" , {
            pubkey: pubkey,
            sign: Array.from(sign)
        })
        const token = response2.data.token;
        if(token){
            localStorage.setItem('authorization' , token);
            axios.defaults.headers.common['authorization'] = token;
            // console.log("item setted " , localStorage.getItem('authorization'))
        }

    }
    return(
        <div>
            <Button onClick={handleSignIn} variant='destructive' size='lg'>Authenticate</Button>
        </div>
    )
}