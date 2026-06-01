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
            
                setIsLoggedIn(true);
                const respon = await axios.post("http://localhost:4000/getBalance" ,{}, {
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
        <div className="text-xl flex justify-between w-full items-center h-15 p-3 bg-og sticky top-0 z-50">
            <div className="text-xl p-2 text-[#c5a03b] font-bold ">mantisHigh</div>
            <NavigationMenu  >
        <NavigationMenuList className="gap-10">
            <NavigationMenuItem >
            <Link href="/" legacyBehavior passHref >
            <NavigationMenuLink className={`${navigationMenuTriggerStyle()} `}>
                Home
            </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/trade" legacyBehavior passHref>
              <NavigationMenuLink className={`${navigationMenuTriggerStyle()} `}>
                Trades
            </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/Markets" legacyBehavior passHref>
              <NavigationMenuLink className={`${navigationMenuTriggerStyle()} `}>
                Markets
            </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/history" legacyBehavior passHref>
              <NavigationMenuLink className={`${navigationMenuTriggerStyle()} `}>
                History
            </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/txn" legacyBehavior passHref>
              <NavigationMenuLink className={`${navigationMenuTriggerStyle()} `}>
                Deposit / Withdraw
            </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="mr-3 flex justify-between items-center gap-2">
            
                <WalletMultiButton></WalletMultiButton>
            
            <div>{isLoggedIn ?  Number(balance).toFixed(2) : null}</div>
      </div>
        </div>
    )
}