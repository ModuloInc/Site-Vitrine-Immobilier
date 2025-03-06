"use client"

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ethers } from 'ethers';
import Navbar from "@/app/component/Navbar";
import Footer from "@/app/component/Footer";
import { HETIC_ABI } from "@/app/abi/hetic";
import { loadProperties } from '@/app/utils/propertyUtils';

export default function HomePage() {
    const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [tokenBalance, setTokenBalance] = useState<string>("0");
    const [tokenName, setTokenName] = useState<string>("");
    const [tokenSymbol, setTokenSymbol] = useState<string>("");
    const [userAddress, setUserAddress] = useState<string>("");
    const [mintAmount, setMintAmount] = useState<string>("100");
    const [isMinting, setIsMinting] = useState<boolean>(false);

    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    const connectWallet = async () => {
        try {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setIsConnected(true);
                setUserAddress(accounts[0]);

                loadContractInfo(accounts[0]);
            } else {
                alert("Veuillez installer MetaMask pour utiliser cette application");
            }
        } catch (error) {
            console.error("Erreur lors de la connexion au wallet:", error);
        }
    };

    const loadContractInfo = async (userAddress: string) => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = new ethers.Contract(
                contractAddress,
                HETIC_ABI,
                provider
            );

            const name = await contract.name();
            const symbol = await contract.symbol();
            const balance = await contract.balanceOf(userAddress);

            setTokenName(name);
            setTokenSymbol(symbol);
            setTokenBalance(ethers.utils.formatEther(balance));
        } catch (error) {
            console.error("Erreur lors du chargement des informations du contrat:", error);
        }
    };

    const mintTokens = async () => {
        try {
            setIsMinting(true);
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const contract = new ethers.Contract(
                    contractAddress,
                    HETIC_ABI,
                    signer
                );

                const amountToMint = ethers.utils.parseEther(mintAmount);

                const tx = await contract.mint(userAddress, amountToMint);
                await tx.wait();

                loadContractInfo(userAddress);

                alert(`${mintAmount} ${tokenSymbol} ont été mintés avec succès!`);
            }
        } catch (error) {
            console.error("Erreur lors du mint des tokens:", error);
            alert("Erreur lors du mint. Vérifiez que vous avez les droits nécessaires.");
        } finally {
            setIsMinting(false);
        }
    };

    const handleBuy = async (propertyId: string, price: ethers.BigNumber): Promise<void> => {
        try {
            if (!isConnected) {
                alert("Veuillez d'abord connecter votre wallet");
                return;
            }

            // Demander confirmation à l'utilisateur
            const confirmPurchase = window.confirm(`Confirmez-vous l'achat de cette propriété pour ${ethers.utils.formatEther(price)} ${tokenSymbol}?`);
            if (!confirmPurchase) return;

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(
                contractAddress,
                HETIC_ABI,
                signer
            );

            // Vérifiez d'abord le solde
            const userBalance = await contract.balanceOf(userAddress);
            if (userBalance.lt(price)) {
                alert(`Solde insuffisant. Vous avez ${ethers.utils.formatEther(userBalance)} ${tokenSymbol} mais la propriété coûte ${ethers.utils.formatEther(price)} ${tokenSymbol}`);
                return;
            }

            try {
                // Vérifier l'allowance actuelle
                const allowance = await contract.allowance(userAddress, contractAddress);

                // Si l'allowance est insuffisante, demander une approbation
                if (allowance.lt(price)) {
                    const approveTx = await contract.approve(contractAddress, price);
                    await approveTx.wait();
                    console.log("Approbation accordée");
                }

                // Simuler l'achat (dans un contrat réel, vous appelleriez une fonction comme buyProperty)
                const tx = await contract.transfer(contractAddress, price);
                const receipt = await tx.wait();

                console.log("Transaction effectuée:", receipt);

                // Stocker la propriété achetée dans le localStorage
                const purchasedProperties = JSON.parse(localStorage.getItem('purchasedProperties') || '[]');

                // Trouver la propriété complète à partir de l'ID
                const purchasedProperty = featuredProperties.find(prop => prop.id === propertyId);

                if (purchasedProperty) {
                    // Marquer la propriété comme achetée (non disponible)
                    purchasedProperty.isForSale = false;

                    // Ajouter des informations d'achat
                    const propertyWithPurchaseInfo = {
                        ...purchasedProperty,
                        purchaseDate: new Date().toISOString(),
                        purchasePrice: ethers.utils.formatEther(price) + " " + tokenSymbol
                    };

                    // Ajouter aux propriétés achetées
                    purchasedProperties.push(propertyWithPurchaseInfo);
                    localStorage.setItem('purchasedProperties', JSON.stringify(purchasedProperties));

                    // Mettre à jour la liste des propriétés affichées
                    const updatedProperties = featuredProperties.map(prop =>
                        prop.id === propertyId ? {...prop, isForSale: false} : prop
                    );
                    setFeaturedProperties(updatedProperties);
                }

                alert(`Achat réussi! La propriété ${propertyId} est désormais à vous. Vous pouvez la retrouver dans "Mes Propriétés".`);

                // Rafraîchir le solde
                loadContractInfo(userAddress);
            } catch (error) {
                console.error("Erreur lors de la transaction:", error);
                alert("La transaction a échoué. Veuillez réessayer.");
            }
        } catch (error) {
            console.error("Erreur lors de l'achat:", error);
            alert("Erreur lors de l'achat. Veuillez vérifier votre solde et réessayer.");
        }
    };

    useEffect(() => {
        // Vérifier si le wallet est déjà connecté
        if (window.ethereum) {
            window.ethereum.request({ method: 'eth_accounts' })
                .then((accounts: any) => {
                    if (accounts.length > 0) {
                        setIsConnected(true);
                        setUserAddress(accounts[0]);
                        loadContractInfo(accounts[0]);
                    }
                });

            // Écouter les changements de compte
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                if (accounts.length > 0) {
                    setIsConnected(true);
                    setUserAddress(accounts[0]);
                    loadContractInfo(accounts[0]);
                } else {
                    setIsConnected(false);
                    setUserAddress("");
                    setTokenBalance("0");
                }
            });
        }

        // Charger les propriétés depuis le fichier JSON
        const properties = loadProperties();

        // Simuler un temps de chargement
        setTimeout(() => {
            setFeaturedProperties(properties);
            setIsLoading(false);
        }, 1000);

        // Nettoyage
        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', () => {});
            }
        };
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <Head>
                <title>ImmoChain - Achat de biens immobiliers avec {tokenSymbol}</title>
                <meta name="description" content="Plateforme d'achat et de vente de biens immobiliers utilisant la technologie blockchain" />
                <link rel="icon" href="/public/favicon.ico" />
            </Head>

            <Navbar />

            <main className="flex-grow">
                <section className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                    <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
                        <div className="text-center">
                            <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
                                <span className="block">Révolutionnez votre</span>
                                <span className="block">Expérience Immobilière</span>
                            </h1>
                            <p className="mt-4 text-xl max-w-md mx-auto">
                                Achetez et vendez des biens immobiliers en toute sécurité avec {tokenSymbol || "HETIC"} sur la blockchain.
                            </p>
                            <div className="mt-8 flex flex-col md:flex-row justify-center items-center gap-4">
                                <Link href="/marketplace">
                                    <span className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg shadow-lg cursor-pointer">
                                        Explorer le Marketplace
                                    </span>
                                </Link>

                                {!isConnected ? (
                                    <button
                                        onClick={connectWallet}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-colors"
                                    >
                                        Connecter Wallet
                                    </button>
                                ) : (
                                    <div className="bg-blue-900 rounded-lg px-4 py-3 text-white">
                                        <p className="text-sm">Solde: {tokenBalance} {tokenSymbol}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {isConnected && (
                    <section className="py-8 bg-gray-100">
                        <div className="max-w-xl mx-auto px-4">
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="text-xl font-bold mb-4">Obtenir des {tokenSymbol || "HETIC"} Tokens</h2>
                                <div className="flex flex-col sm:flex-row items-center gap-3">
                                    <input
                                        type="number"
                                        value={mintAmount}
                                        onChange={(e) => setMintAmount(e.target.value)}
                                        className="flex-1 p-2 border border-gray-300 rounded-md w-full sm:w-auto"
                                        placeholder="Montant"
                                        min="1"
                                    />
                                    <button
                                        onClick={mintTokens}
                                        disabled={isMinting}
                                        className={`px-4 py-2 rounded-md w-full sm:w-auto ${isMinting
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700'} text-white`}
                                    >
                                        {isMinting ? 'En cours...' : `Mint ${tokenSymbol || "HETIC"}`}
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 mt-3">
                                    Note: Cette fonction est disponible uniquement pour les tests. En production, les tokens seraient distribués par d'autres mécanismes.
                                </p>
                            </div>
                        </div>
                    </section>
                )}

                <section className="py-12 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-8">Propriétés à la Une</h2>

                        {isLoading ? (
                            <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : error ? (
                            <div className="text-center text-red-500">{error}</div>
                        ) : featuredProperties.filter(property => property.isForSale).length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {featuredProperties
                                    .filter(property => property.isForSale)
                                    .slice(0, 3) // Cette ligne limite l'affichage à 3 propriétés
                                    .map((property) => (
                                        <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
                                            <div className="relative">
                                                <img
                                                    src={property.imageUrl}
                                                    alt={property.title}
                                                    className="h-48 w-full object-cover"
                                                />
                                                {property.isForSale && (
                                                    <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 text-xs rounded-full">
                                                    À Vendre
                                                </span>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="text-lg font-semibold text-gray-800 mb-1">{property.title}</h3>
                                                <p className="text-gray-600 text-sm mb-2">{property.location}</p>
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="font-bold text-blue-600">{ethers.utils.formatEther(property.price)} {tokenSymbol || "HETIC"}</span>
                                                    <div className="flex items-center">
                                                        <span className="text-sm text-gray-600">{property.size} m²</span>
                                                    </div>
                                                </div>
                                                <p className="text-gray-500 text-sm mb-3 line-clamp-2">{property.description}</p>
                                                <button
                                                    onClick={() => handleBuy(property.id, property.price)}
                                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                                >
                                                    Acheter
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500">
                                <p>Toutes les propriétés ont été vendues!</p>
                                <Link href="/my-properties">
                                    <span className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer block mt-4">
                                        Voir mes propriétés →
                                    </span>
                                </Link>
                            </div>
                        )}

                        <div className="text-center mt-8">
                            <Link href="/marketplace">
                                <span className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer">
                                    Voir toutes les propriétés →
                                </span>
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="py-12">
                    <div className="max-w-7xl mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-12">Comment ça marche</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center text-blue-600 text-2xl font-bold mx-auto mb-4">
                                    1
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Connectez votre Wallet</h3>
                                <p className="text-gray-600">
                                    Utilisez MetaMask pour vous connecter à notre plateforme de manière sécurisée.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center text-blue-600 text-2xl font-bold mx-auto mb-4">
                                    2
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Explorez les Propriétés</h3>
                                <p className="text-gray-600">
                                    Parcourez notre marketplace pour trouver le bien immobilier de vos rêves.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center text-blue-600 text-2xl font-bold mx-auto mb-4">
                                    3
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Achetez en Toute Sécurité</h3>
                                <p className="text-gray-600">
                                    Achetez des propriétés avec des {tokenSymbol || "HETIC"}, sécurisées par des contrats intelligents.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}