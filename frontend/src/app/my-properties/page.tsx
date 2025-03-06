"use client"

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { ethers } from 'ethers';
import Navbar from "@/app/component/Navbar";
import Footer from "@/app/component/Footer";

interface Property {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    price: ethers.BigNumber;
    size: string;
    location: string;
    isForSale: boolean;
    purchaseDate?: string;
    purchasePrice?: string;
}

export default function MyProperties() {
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [userAddress, setUserAddress] = useState<string>("");
    const [myProperties, setMyProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        // Vérifier si le wallet est connecté
        const checkWalletConnection = async () => {
            if (window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    if (accounts.length > 0) {
                        setIsConnected(true);
                        setUserAddress(accounts[0]);

                        // Charger les propriétés achetées depuis localStorage
                        const purchasedProperties = JSON.parse(localStorage.getItem('purchasedProperties') || '[]');
                        setMyProperties(purchasedProperties);
                    }
                    setIsLoading(false);
                } catch (error) {
                    console.error("Erreur lors de la vérification du wallet:", error);
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };

        checkWalletConnection();

        // Écouter les changements de compte
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                if (accounts.length > 0) {
                    setIsConnected(true);
                    setUserAddress(accounts[0]);

                    // Recharger les propriétés pour le nouveau compte
                    const purchasedProperties = JSON.parse(localStorage.getItem('purchasedProperties') || '[]');
                    setMyProperties(purchasedProperties);
                } else {
                    setIsConnected(false);
                    setUserAddress("");
                    setMyProperties([]);
                }
            });
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', () => {});
            }
        };
    }, []);

    const connectWallet = async () => {
        try {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setIsConnected(true);
                setUserAddress(accounts[0]);

                // Charger les propriétés achetées
                const purchasedProperties = JSON.parse(localStorage.getItem('purchasedProperties') || '[]');
                setMyProperties(purchasedProperties);
            } else {
                alert("Veuillez installer MetaMask pour utiliser cette application");
            }
        } catch (error) {
            console.error("Erreur lors de la connexion au wallet:", error);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Head>
                <title>Mes Propriétés - ImmoChain</title>
                <meta name="description" content="Vos propriétés immobilières achetées sur la blockchain" />
                <link rel="icon" href="/public/favicon.ico" />
            </Head>

            <Navbar />

            <main className="flex-grow py-8 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-8 text-center">Mes Propriétés</h1>

                    {isLoading ? (
                        <div className="flex justify-center my-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : !isConnected ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600 mb-6">Veuillez connecter votre wallet pour voir vos propriétés</p>
                            <button
                                onClick={connectWallet}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-colors"
                            >
                                Connecter Wallet
                            </button>
                        </div>
                    ) : myProperties.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600">Vous n'avez pas encore acheté de propriétés</p>
                            <a href="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
                                Explorer les propriétés disponibles
                            </a>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myProperties.map((property) => (
                                <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                    <div className="relative">
                                        <img
                                            src={property.imageUrl}
                                            alt={property.title}
                                            className="h-48 w-full object-cover"
                                        />
                                        <span className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 text-xs rounded-full">
                                            Propriété Acquise
                                        </span>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-1">{property.title}</h3>
                                        <p className="text-gray-600 text-sm mb-2">{property.location}</p>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="font-bold text-blue-600">{property.purchasePrice}</span>
                                            <div className="flex items-center">
                                                <span className="text-sm text-gray-600">{property.size} m²</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-500 text-sm mb-3">{property.description}</p>
                                        <div className="text-sm text-gray-500 mt-3 pt-3 border-t border-gray-200">
                                            <p>Acheté le: {new Date(property.purchaseDate || "").toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}