"use client"

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { HETIC_ABI} from "@/app/abi/hetic";

export function MintTokens() {
    const [amount, setAmount] = useState<string>("100");
    const [isMinting, setIsMinting] = useState<boolean>(false);
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Adresse de votre contrat

    const mintTokens = async () => {
        try {
            setIsMinting(true);
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const userAddress = await signer.getAddress();

                const contract = new ethers.Contract(
                    contractAddress,
                    HETIC_ABI,
                    signer
                );

                // Convertir le montant en wei (ou l'unité appropriée pour votre token)
                const amountToMint = ethers.utils.parseEther(amount);

                // Appeler la fonction mint du contrat
                const tx = await contract.mint(userAddress, amountToMint);
                await tx.wait();

                alert(`${amount} HETIC tokens ont été mintés avec succès!`);
            }
        } catch (error) {
            console.error("Erreur lors du mint des tokens:", error);
            alert("Erreur lors du mint des tokens. Vérifiez que vous avez les droits nécessaires.");
        } finally {
            setIsMinting(false);
        }
    };

    return (
        <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Obtenir des HETIC Tokens</h3>
            <div className="flex items-center space-x-2">
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                    placeholder="Montant"
                    min="1"
                />
                <button
                    onClick={mintTokens}
                    disabled={isMinting}
                    className={`px-4 py-2 rounded-md ${isMinting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'} text-white`}
                >
                    {isMinting ? 'En cours...' : 'Mint Tokens'}
                </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
                Note: Cette fonction n'est disponible que pour les propriétaires ou les adresses autorisées
            </p>
        </div>
    );
}