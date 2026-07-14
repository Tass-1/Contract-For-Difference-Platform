'use client';

import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useStore } from "@/app/store/useStore";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { api } from '@/lib/api';

export default function NavBar() {
    const { isLoggedIn, balance, setIsLoggedIn, setBalance } = useStore();
    const [mounted, setMount] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
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
        <div className="relative w-full h-14 flex items-center justify-between px-4 sm:px-6 bg-[#131418] border-b border-border select-none z-50">
            
            <div className="flex items-center gap-4 md:gap-10">
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex flex-col justify-center items-center w-6 h-6 gap-1 md:hidden cursor-pointer"
                >
                    <span className={`w-5 h-[2px] bg-[#eaecef] transition-transform duration-200 ${isOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
                    <span className={`w-5 h-[2px] bg-[#eaecef] transition-opacity duration-200 ${isOpen ? 'opacity-0' : ''}`} />
                    <span className={`w-5 h-[2px] bg-[#eaecef] transition-transform duration-200 ${isOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
                </button>

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

            <div className="flex items-center gap-2 sm:gap-3">
                <div className="[&_.wallet-adapter-button]:h-9 [&_.wallet-adapter-button]:px-3 sm:[&_.wallet-adapter-button]:px-4 [&_.wallet-adapter-button]:text-[12px] sm:[&_.wallet-adapter-button]:text-[13px] flex items-center">
                    <WalletMultiButton />
                </div>
                
                <div className="h-9 px-2.5 sm:px-4 flex items-center bg-[#1e2329] border border-border rounded-[4px] text-[13px] sm:text-[15px] text-[#eaecef] tabular-nums">
                    {isLoggedIn ? Number(balance).toFixed(2) : "0.00"} 
                    <span className="text-[#848e9c] ml-1.5 sm:ml-2 text-[11px] sm:text-[13px]">SOL</span>
                </div>
            </div>

            {isOpen && (
                <div className="absolute top-14 left-0 w-full bg-[#131418] border-b border-border flex flex-col md:hidden shadow-xl">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.name} 
                            href={link.href} 
                            onClick={() => setIsOpen(false)}
                            className="px-6 py-4 text-[14px] font-medium text-[#848e9c] hover:text-[#eaecef] border-b border-border/20 last:border-none transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            )}
            
        </div>
    );
}