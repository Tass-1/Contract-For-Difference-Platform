'use client';
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletDisconnectButton, WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import '@solana/wallet-adapter-react-ui/styles.css';




export default function WalletAdapter({children}: {children:React.ReactNode}) {
    return(
        <div className="h-full w-full">
      <ConnectionProvider endpoint={"https://api.devnet.solana.com"}>
        <WalletProvider wallets={[]} >
            <WalletModalProvider>
                {children}
            </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
        </div>
    )
}