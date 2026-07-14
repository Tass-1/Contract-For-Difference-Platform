'use client';
import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useStore } from "@/app/store/useStore";
import { useEffect, useState } from "react";
import axios from "axios";
import { useWallet } from "@solana/wallet-adapter-react";
import { api } from '@/lib/api';

export default function NavBar() {
    const { isLoggedIn, balance, setIsLoggedIn, setBalance } = useStore();
    const [mounted, setMount] = useState(false);
    const { publicKey, connected } = useWallet();
    const wallet = useWallet();

    useEffect(() => {
        const handleSignIn = async () => {
            const pubkey = wallet.publicKey?.toBase58();
            if (pubkey) {
                const response = await api.post("/auth/nonce", { pubkey: pubkey });
                const nonce = response.data.nonce;
                const message = new TextEncoder().encode(nonce);
                const sign = await wallet.signMessage?.(message);
                
                const response2 = await api.post("/auth/verify", {
                    pubkey: pubkey,
                    sign: Array.from(sign as Uint8Array)
                });
                
                const token = response2.data.token;
                if (token) {
                    localStorage.setItem('authorization', token);
                    setIsLoggedIn(true);
                    const respon = await api.post("/getBalance", {}, {
                        headers: { authorization: localStorage.getItem("authorization") }
                    });
                    setBalance(parseFloat(respon.data.balance));
                }
            }
        };

        if (connected && publicKey && !isLoggedIn) {
            handleSignIn();
        } else if (!connected && !publicKey && isLoggedIn) {
            setBalance(0);
            localStorage.removeItem('authorization');
            setIsLoggedIn(false);
        }
    }, [connected, publicKey]);

    useEffect(() => { setMount(true); }, []);
    if (!mounted) return null;

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Trades", href: "/trade" },
        { name: "Markets", href: "/Markets" },
        { name: "History", href: "/history" },
        { name: "Deposit / Withdraw", href: "/txn" },
    ];

    return (
        <div className="w-full h-14 flex items-center justify-between px-6 bg-[#131418] border-b border-border select-none">
            
            <div className="flex items-center gap-10">
                <Link href="/" className="text-[17px] font-bold tracking-tight text-[#f0b90b]">
                    MANTIS<span className="text-[#eaecef]">HIGH</span>
                </Link>
                
                <div className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.name} 
                            href={link.href} 
                            className="text-[13px] font-medium text-[#848e9c] hover:text-[#eaecef] transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="[&_.wallet-adapter-button]:h-9 [&_.wallet-adapter-button]:px-4 [&_.wallet-adapter-button]:text-[13px] flex items-center">
                    <WalletMultiButton />
                </div>
                
                <div className="h-9 px-4 flex items-center bg-[#1e2329] border border-border rounded-[4px] text-[15px]  text-[#eaecef]">
                    {isLoggedIn ? Number(balance).toFixed(2) : "0.00"} 
                    <span className="text-[#848e9c] ml-2 text-[13px] ">SOL</span>
                </div>
            </div>
            
        </div>
    );
}