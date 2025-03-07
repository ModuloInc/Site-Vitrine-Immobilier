"use client"
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from "@/app/component/Navbar";
import Footer from "@/app/component/Footer";
import PropertyCard from "@/app/component/Property";
import { ethers } from 'ethers';
import { Property } from '../types/property';
import {HETIC_ABI} from "@/app/abi/hetic";
import { loadProperties } from '@/app/utils/propertyUtils';

interface FilterState {
    location: string;
    minPrice: string;
    maxPrice: string;
    minSize: string;
    maxSize: string;
}

export default function Marketplace() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [userAddress, setUserAddress] = useState<string>("");
    const [tokenBalance, setTokenBalance] = useState<string>("0");
    const [tokenSymbol, setTokenSymbol] = useState<string>("HETIC");
    const [filter, setFilter] = useState<FilterState>({
        location: '',
        minPrice: '',
        maxPrice: '',
        minSize: '',
        maxSize: ''
    });
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Remplacez par votre adresse de contrat

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

    const loadContractInfo = async (address: string) => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = new ethers.Contract(
                contractAddress,
                HETIC_ABI,
                provider
            );

            const symbol = await contract.symbol();
            const balance = await contract.balanceOf(address);

            setTokenSymbol(symbol);
            setTokenBalance(ethers.utils.formatEther(balance));
        } catch (error) {
            console.error("Erreur lors du chargement des informations du contrat:", error);
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

        const loadMarketplaceProperties = async (): Promise<void> => {
            try {
                // Charger les propriétés depuis le fichier JSON
                const properties = loadProperties();

                // Simuler un délai de chargement
                setTimeout(() => {
                    setProperties(properties);
                    setIsLoading(false);
                }, 1000);
            } catch (err) {
                console.error("Erreur lors du chargement des propriétés:", err);
                setError("Impossible de charger les propriétés. Veuillez réessayer plus tard.");
                setIsLoading(false);
            }
        };

        loadMarketplaceProperties();

        // Nettoyage
        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', () => {});
            }
        };
    }, []);

    const handleBuy = async (propertyId: string, price: ethers.BigNumber): Promise<void> => {
        try {
            if (!window.ethereum) {
                alert("Veuillez installer MetaMask pour acheter des propriétés");
                return;
            }

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            let accounts = await provider.listAccounts();

            // Si aucun compte n'est connecté, demander la connexion
            if (accounts.length === 0) {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                accounts = await provider.listAccounts();
            }

            if (accounts.length === 0) {
                alert("Veuillez connecter votre wallet pour acheter des propriétés");
                return;
            }

            const userAddress = accounts[0];
            setIsConnected(true);
            setUserAddress(userAddress);

            // Demander confirmation à l'utilisateur
            const confirmPurchase = window.confirm(`Confirmez-vous l'achat de cette propriété pour ${ethers.utils.formatEther(price)} ${tokenSymbol}?`);
            if (!confirmPurchase) return;

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

                // Effectuer la transaction de transfert des tokens
                const tx = await contract.transfer(contractAddress, price);
                const receipt = await tx.wait();

                console.log("Transaction effectuée:", receipt);

                // Stocker la propriété achetée dans le localStorage
                const purchasedProperties = JSON.parse(localStorage.getItem('purchasedProperties') || '[]');

                // Trouver la propriété complète à partir de l'ID
                const purchasedProperty = properties.find(prop => prop.id === propertyId);

                if (purchasedProperty) {
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
                    const updatedProperties = properties.map(prop =>
                        prop.id === propertyId ? {...prop, isForSale: false} : prop
                    );
                    setProperties(updatedProperties);
                }

                alert(`Achat réussi! La propriété ${propertyId} est désormais à vous. Vous pouvez la retrouver dans "Mes Propriétés".`);

                // Rafraîchir le solde
                loadContractInfo(userAddress);
            } catch (error) {
                console.error("Erreur lors de la transaction:", error);
                alert("La transaction a échoué. Veuillez réessayer.");
            }
        } catch (err) {
            console.error("Erreur lors de l'achat de la propriété:", err);
            alert("Erreur lors de l'achat. Veuillez vérifier votre solde et réessayer.");
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setFilter({
            ...filter,
            [name]: value
        });
    };

    const filteredProperties = properties.filter(property => {
        // Filter by location
        if (filter.location && !property.location.toLowerCase().includes(filter.location.toLowerCase())) {
            return false;
        }

        // Filter by price
        const priceInEth = parseFloat(ethers.utils.formatEther(property.price));
        if (filter.minPrice && priceInEth < parseFloat(filter.minPrice)) {
            return false;
        }
        if (filter.maxPrice && priceInEth > parseFloat(filter.maxPrice)) {
            return false;
        }

        // Filter by size
        const size = parseInt(property.size);
        if (filter.minSize && size < parseInt(filter.minSize)) {
            return false;
        }
        if (filter.maxSize && size > parseInt(filter.maxSize)) {
            return false;
        }

        return true;
    });

    return (
        <div className="flex flex-col min-h-screen">
            <Head>
                <title>Marketplace - ImmoChain</title>
                <meta name="description" content="Explorez et achetez des biens immobiliers sur la blockchain" />
                <link rel="icon" href="/public/favicon.ico" />
            </Head>

            <Navbar />

            <main className="flex-grow py-8 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-center">Marketplace Immobilier</h1>

                        {isConnected ? (
                            <div className="bg-blue-900 rounded-lg px-4 py-2 text-white">
                                <p className="text-sm">Solde: {tokenBalance} {tokenSymbol}</p>
                            </div>
                        ) : (
                            <button
                                onClick={connectWallet}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                Connecter Wallet
                            </button>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="bg-white p-4 rounded-lg shadow-md mb-8">
                        <h2 className="text-xl font-semibold mb-4">Filtrer les propriétés</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={filter.location}
                                    onChange={handleFilterChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="Ville, région..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prix min ({tokenSymbol})</label>
                                <input
                                    type="number"
                                    name="minPrice"
                                    value={filter.minPrice}
                                    onChange={handleFilterChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prix max ({tokenSymbol})</label>
                                <input
                                    type="number"
                                    name="maxPrice"
                                    value={filter.maxPrice}
                                    onChange={handleFilterChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="100"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Surface min (m²)</label>
                                <input
                                    type="number"
                                    name="minSize"
                                    value={filter.minSize}
                                    onChange={handleFilterChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Surface max (m²)</label>
                                <input
                                    type="number"
                                    name="maxSize"
                                    value={filter.maxSize}
                                    onChange={handleFilterChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="500"
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Properties Grid */}
                    {isLoading ? (
                        <div className="flex justify-center my-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 my-8">{error}</div>
                    ) : filteredProperties.filter(property => property.isForSale).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProperties
                                .filter(property => property.isForSale)
                                .map((property) => (
                                    <Link key={property.id} href={`/property/${property.id}`} passHref>
                                        <div className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105">
                                            <div className="relative">
                                                <img
                                                    src={property.imageUrl}
                                                    alt={property.title}
                                                    className="h-48 w-full object-cover"
                                                />
                                                {property.isForSale ? (
                                                    <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 text-xs rounded-full">
              À Vendre
            </span>
                                                ) : (
                                                    <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded-full">
              Vendu
            </span>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                    {property.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-2">{property.location}</p>
                                                <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-blue-600">
                        {ethers.utils.formatEther(property.price)} {"HETIC"}
                    </span>
                                                    <span className="text-sm text-purple-600">{property.size} m²</span>
                                                </div>
                                                <p className="text-gray-500 mb-3 line-clamp-2">{property.description}</p>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Empêche la navigation quand on clique sur le bouton
                                                        handleBuy(property.id, property.price);
                                                    }}
                                                    className={`w-full ${property.isForSale ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'} text-white font-semibold py-2 px-4 rounded-lg transition-colors`}
                                                    disabled={!isConnected || !property.isForSale}
                                                >
                                                    Acheter
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                ))}

                        </div>
                    ) : (
                        <div className="text-center text-gray-500 my-12">
                            {filter.location || filter.minPrice || filter.maxPrice || filter.minSize || filter.maxSize ?
                                "Aucune propriété ne correspond à vos critères de recherche" :
                                <div>
                                    <p>Toutes les propriétés ont été vendues!</p>
                                    <Link href="/my-properties">
                                        <span
                                            className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer block mt-4">
                                            Voir mes propriétés →
                                        </span>
                                    </Link>
                                </div>
                            }
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}