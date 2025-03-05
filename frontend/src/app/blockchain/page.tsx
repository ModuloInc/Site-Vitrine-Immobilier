"use client";

import {ConnectButton} from '@rainbow-me/rainbowkit';
import {useAccount, useWriteContract, useReadContract} from 'wagmi';
import {HETIC_ABI} from "../../../public/hetic";

export default function blockchain() {
    const {writeContract} = useWriteContract()
    const {address} = useAccount()
    const {data: balance} = useReadContract({
        abi: HETIC_ABI,
        address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        functionName: "balanceOf",
        args: [address!],
    });

    if (!address) return <ConnectButton/>

    const handleClick = () => {
        console.log("Button clicked");
        console.log(HETIC_ABI)
        writeContract({
            abi: HETIC_ABI,
            functionName: "mint",
            address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
            args: [address, 100n],
        });
    }

    return (
        <div>
            <h1>block chain</h1>
            <ConnectButton/>
            <p>Balance: {balance}</p>
            <button onClick={handleClick}>Mint 100 tokens</button>
        </div>
    );
}
