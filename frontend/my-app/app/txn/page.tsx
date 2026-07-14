'use client';

import NavBar from "@/components/Navigation";
import { useEffect, useState } from "react";
import { useStore } from "../store/useStore";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { api } from '@/lib/api';

export default function Txn() {
    return (
        <div className="relative w-full min-h-[calc(100vh-56px)] bg-[#0b0e11] flex justify-center items-start pt-20 px-4 overflow-hidden z-0">
            
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#f0b90b]/[0.02] rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#2ebd85]/[0.02] rounded-full blur-[150px] pointer-events-none -z-10" />

            <div className="w-full max-w-[900px] grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
                <div className="md:col-span-5">
                    <WalletOverview />
                </div>
                <div className="md:col-span-7">
                    <TxnContent />
                </div>
            </div>
        </div>
    );
}

function WalletOverview() {
    const isLoggedIn = useStore(state => state.isLoggedIn);
    const balance = useStore(state => state.balance);
    const wallet = useWallet();

    return (
        <div className="flex flex-col h-full bg-[#131418] border border-[#2b3139]/80 rounded-[12px] p-6 shadow-xl">
            <h2 className="text-[16px] font-medium text-[#eaecef] mb-6 flex items-center gap-2">
                <span className="w-1 h-4 bg-[#f0b90b] rounded-full"></span>
                Asset Overview
            </h2>
            
            <div className="flex flex-col gap-4 flex-grow">
                <div className="bg-[#0b0e11]/50 rounded-[8px] p-5 border border-[#2b3139]/50 shadow-inner">
                    <div className="text-[12px] text-[#848e9c] mb-1 font-medium">Total Balance</div>
                    <div className="text-[28px] text-[#eaecef] font-medium tabular-nums leading-none flex items-baseline gap-2 mt-1">
                        {isLoggedIn ? Number(balance).toFixed(2) : "0.00"}
                        <span className="text-[14px] text-[#848e9c] font-medium">SOL</span>
                    </div>
                </div>

                <div className="bg-[#0b0e11]/50 rounded-[8px] p-5 border border-[#2b3139]/50 transition-colors hover:border-[#2b3139]">
                    <div className="text-[12px] text-[#848e9c] mb-2 font-medium">Network Status</div>
                    <div className="flex items-center gap-3">
                        <div className="relative flex items-center justify-center">
                            
                            
                        </div>
                        <span className="text-[14px] font-medium text-[#eaecef]">Solana Devnet</span>
                    </div>
                </div>

                <div className="bg-[#0b0e11]/50 rounded-[8px] p-5 border border-[#2b3139]/50 transition-colors hover:border-[#2b3139]">
                    <div className="text-[12px] text-[#848e9c] mb-2 font-medium">Connected Address</div>
                    <div className="text-[14px] text-[#eaecef] font-medium tabular-nums truncate">
                        {wallet.publicKey ? wallet.publicKey.toBase58() : "Not Connected"}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TxnContent() {
    const [option, setOption] = useState("Withdraw");
    const [isProcessing, setIsProcessing] = useState(false);
    const [walletBal, setWalletBal] = useState(0);
    
    const isLoggedIn = useStore(state => state.isLoggedIn);
    const setBalance = useStore(state => state.setBalance);
    const balance = useStore(state => state.balance);
    
    const wallet = useWallet();
    const { connection } = useConnection();
    const [amt, setAmt] = useState("");
    const symbol = "SOLUSDT";
    const currPrice = useStore(state => state.livePrice[symbol]) || 145.20; 

   
    useEffect(() => {
        if (wallet.publicKey) {
            connection.getBalance(wallet.publicKey).then(bal => {
                setWalletBal(bal / LAMPORTS_PER_SOL);
            }).catch(console.error);
        } else {
            setWalletBal(0);
        }
    }, [wallet.publicKey, connection]);

    const handleMaxClick = () => {
        if (!isLoggedIn) return;
        
        if (option === "Withdraw") {
            
            const maxSol = Number(balance) / currPrice;
            setAmt(maxSol > 0 ? maxSol.toFixed(4) : "");
        } else {
            
            const safeMax = walletBal > 0.001 ? walletBal - 0.001 : 0;
            setAmt(safeMax > 0 ? safeMax.toFixed(4) : "");
        }
    };

    async function submit() {
        setIsProcessing(true);
        if (option === "Deposit") {
            const Comppubkey = new PublicKey("EGxEqNs8wg83T4CVoV312aMpBzyMcF3Fdx5o4K8USVMK");
            const pubkey = wallet.publicKey;
            const inputSol = Number(amt);
            
            if (!pubkey || !inputSol || inputSol <= 0) {
                setIsProcessing(false);
                return;
            }
            
            try {
                const transaction = new Transaction();
                transaction.add(
                    SystemProgram.transfer({
                        fromPubkey: pubkey,
                        toPubkey: Comppubkey,
                        lamports: inputSol * LAMPORTS_PER_SOL
                    })
                );
                
                const Latestblockhash = await connection.getLatestBlockhash();
                transaction.recentBlockhash = Latestblockhash.blockhash;
                transaction.feePayer = pubkey;
                const signature = await wallet.sendTransaction(transaction, connection);
                
                await connection.confirmTransaction({
                    blockhash: Latestblockhash.blockhash,
                    lastValidBlockHeight: Latestblockhash.lastValidBlockHeight,
                    signature: signature
                });
                
                const response = await api.post("/deposit", {
                    amount: inputSol,
                    signature: signature
                }, {
                    headers: {
                        'authorization': localStorage.getItem('authorization')
                    }
                });

                setBalance(response.data.newBalance);
                setAmt("");
            } catch (e) {
                console.log(e);
            }
        } else if (option === "Withdraw") {
            try {
                const response = await api.post("/withdraw", {
                    amount: Number(amt)
                }, {
                    headers: {
                        'authorization': localStorage.getItem('authorization')
                    }
                });
                
                setBalance(response.data.newBalance);
                setAmt("");
            } catch (e) {
                console.log(e);
            }
        }
        setIsProcessing(false);
    }

    return (
        <div className="flex flex-col h-full bg-[#131418] border border-[#2b3139]/80 rounded-[12px] p-7 shadow-xl">
            
            <div className="flex bg-[#0b0e11] rounded-[8px] p-1.5 mb-8 border border-[#2b3139]/60 shadow-inner">
                <button
                    type="button"
                    onClick={() => { setOption("Withdraw"); setAmt(""); }}
                    className={`flex-1 py-2.5 text-[14px] font-medium transition-all duration-200 rounded-[6px] ${
                        option === "Withdraw" 
                        ? "bg-[#2b3139] text-[#eaecef] shadow-sm ring-1 ring-white/5" 
                        : "text-[#848e9c] hover:text-[#eaecef] hover:bg-[#1e2329]/50"
                    }`}
                >
                    Withdraw
                </button>
                <button
                    type="button"
                    onClick={() => { setOption("Deposit"); setAmt(""); }}
                    className={`flex-1 py-2.5 text-[14px] font-medium transition-all duration-200 rounded-[6px] ${
                        option === "Deposit" 
                        ? "bg-[#2b3139] text-[#eaecef] shadow-sm ring-1 ring-white/5" 
                        : "text-[#848e9c] hover:text-[#eaecef] hover:bg-[#1e2329]/50"
                    }`}
                >
                    Deposit
                </button>
            </div>

            <div className="bg-[#0b0e11]/60 border border-[#2b3139]/50 rounded-[8px] p-5 mb-8 transition-colors focus-within:border-[#5c6370] shadow-inner flex-grow">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[13px] text-[#848e9c] font-medium">
                        {option === "Deposit" ? "Amount to send" : "Amount to receive"}
                    </span>
                    <span className="text-[13px] text-[#eaecef] font-medium bg-[#2b3139] px-2 py-0.5 rounded-[4px]">SOL</span>
                </div>
                
                <div className="relative flex items-center py-2">
                    <input
                        type="number"
                        placeholder="0.00"
                        value={amt}
                        onChange={(e) => setAmt(e.target.value)}
                        className="w-full bg-transparent text-[#eaecef] text-[36px] font-medium tabular-nums outline-none placeholder:text-[#3b444f] pr-14 m-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button 
                        onClick={handleMaxClick}
                        className="absolute right-0 text-[12px] font-semibold text-[#0b0e11] bg-[#f0b90b] hover:bg-[#fcd535] px-3 py-1.5 rounded-[4px] transition-colors"
                    >
                        MAX
                    </button>
                </div>
                
                <div className="mt-4 pt-4 border-t border-[#2b3139]/50 flex justify-between items-center">
                    <span className="text-[13px] text-[#848e9c] font-medium">Estimated value</span>
                    <span className="text-[15px] text-[#eaecef] font-medium tabular-nums">
                        ≈ {(Number(amt) * currPrice || 0).toFixed(2)} <span className="text-[#848e9c] text-[13px] ml-1">USDT</span>
                    </span>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6 px-2">
                <span className="text-[13px] text-[#848e9c] font-medium">Network fee</span>
                <span className="text-[14px] text-[#eaecef] font-medium tabular-nums bg-[#1e2329] px-2.5 py-1 rounded-[4px]">0.00005 SOL</span>
            </div>

            <button
                disabled={!isLoggedIn || isProcessing || (!amt && isLoggedIn) || (Number(amt) <= 0 && isLoggedIn)}
                onClick={submit}
                className={`w-full py-4 rounded-[8px] text-[15px] font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                    !isLoggedIn
                    ? "bg-[#f0b90b] text-[#0b0e11] hover:bg-[#fcd535]"
                    : option === "Deposit" 
                        ? "bg-[#2ebd85] text-[#0b0e11] hover:bg-[#26a673]" 
                        : "bg-[#e0294a] text-[#eaecef] hover:bg-[#c92442]"
                }`}
            >
                {!isLoggedIn 
                    ? "Connect Wallet" 
                    : isProcessing 
                        ? "Processing..." 
                        : `${option} SOL`}
            </button>
        </div>
    );
}