'use client';
import Link from "next/link";
import { NavigationMenuList, NavigationMenuItem, NavigationMenu, NavigationMenuLink, navigationMenuTriggerStyle } from "./ui/navigation-menu";
import WalletAdapter from "./walletAdapter";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useStore } from "@/app/store/useStore";
import AuthButton from "./AuthButton";
import { useEffect, useState } from "react";
import axios from "axios";
import { useWallet } from "@solana/wallet-adapter-react";
import { api } from '@/lib/api';




export default function NavBar(){
    const {isLoggedIn, balance, setIsLoggedIn, setBalance} = useStore()
    const [mounted, setMount] = useState(false);
    const {publicKey , connected,} = useWallet();
    const wallet = useWallet();

    

     useEffect(() => {
        const handleSignIn = async () => {
        console.log("Signed in")
        const pubkey = wallet.publicKey?.toBase58();
        if(pubkey){
                const response =  await api.post("/auth/nonce" , {
                pubkey: pubkey
            })
            const nonce = response.data.nonce;
            const message = new TextEncoder().encode(nonce);
            const sign = await wallet.signMessage?.(message);
            console.log(sign);
            const response2 = await api.post("/auth/verify" , {
                pubkey: pubkey,
                sign: Array.from(sign)
            })
            const token = response2.data.token;
            if(token){
                localStorage.setItem('authorization' , token);
            
                setIsLoggedIn(true);
                const respon = await api.post("/getBalance" ,{}, {
                    headers:{
                        authorization: localStorage.getItem("authorization")
                    }
                })
                const balance = parseFloat(respon.data.balance);
                setBalance(balance);
                setIsLoggedIn(true);

                
            }
        } else{
            console.log("Handle sign in usestore waler me dikkat")
        }
        
    }
            console.log("NAVBAR DEBUG:", { 
        connected, 
        hasPubKey: !!publicKey, 
        isLoggedIn,
        pubkeyValue: publicKey?.toBase58()  
    });
            if(connected && publicKey && !isLoggedIn){
                handleSignIn();

            } else if( !connected && !publicKey && isLoggedIn){
                setBalance(0);
                localStorage.removeItem('authorization')
                setIsLoggedIn(false);

            }
        }  , [ connected, publicKey])
    

    useEffect(() => {
        setMount(true);
    },[]);

    if(!mounted){
        return null;
    }

    
    

       
        


    return (
        <div className="text-xl flex justify-between w-full items-center h-16 px-4 sm:px-6 bg-og/90 backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
            <div className="text-xl p-2 text-[#c5a03b] font-bold tracking-wide">mantisHigh</div>
            <NavigationMenu className="hidden md:flex" >
        <NavigationMenuList className="gap-8">
            <NavigationMenuItem >
            <NavigationMenuLink asChild>
                <Link href="/" className={`${navigationMenuTriggerStyle()} text-white/80 hover:text-white transition-colors`}>
                Home
                </Link>
            </NavigationMenuLink>
            
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/trade" legacyBehavior passHref>
              <NavigationMenuLink className={`${navigationMenuTriggerStyle()} text-white/80 hover:text-white transition-colors`}>
                Trades
            </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/Markets" legacyBehavior passHref>
              <NavigationMenuLink className={`${navigationMenuTriggerStyle()} text-white/80 hover:text-white transition-colors`}>
                Markets
            </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/history" legacyBehavior passHref>
              <NavigationMenuLink className={`${navigationMenuTriggerStyle()} text-white/80 hover:text-white transition-colors`}>
                History
            </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/txn" legacyBehavior passHref>
              <NavigationMenuLink className={`${navigationMenuTriggerStyle()} text-white/80 hover:text-white transition-colors`}>
                Deposit / Withdraw
            </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="mr-1 flex justify-end items-center gap-3">
            
                <WalletMultiButton></WalletMultiButton>
            
            <div className="font-mono text-white/90 text-base bg-muted px-3 py-1.5 rounded-lg border border-white/10 min-w-[4rem] text-right">{isLoggedIn ?  Number(balance).toFixed(2) : null}</div>
      </div>
        </div>
    )
}