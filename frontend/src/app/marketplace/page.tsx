"use client"
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from "@/app/component/Navbar";
import Footer from "@/app/component/Footer";
import PropertyCard from "@/app/component/Property";
import { ethers } from 'ethers';
import { Property } from '../types/property';
import {HETIC_ABI} from "@/app/abi/hetic";

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
    const [filter, setFilter] = useState<FilterState>({
        location: '',
        minPrice: '',
        maxPrice: '',
        minSize: '',
        maxSize: ''
    });
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Remplacez par votre adresse de contrat

    useEffect(() => {
        const loadProperties = async (): Promise<void> => {
            try {
                const mockProperties: Property[] = [
                    {
                        id: "1",
                        title: "Villa de luxe avec piscine",
                        description: "Magnifique villa avec vue sur la mer, piscine privée et jardin luxuriant.",
                        imageUrl: "https://via.placeholder.com/400x300",
                        price: ethers.utils.parseEther("10"),
                        size: "250",
                        location: "Cannes, France",
                        isForSale: true
                    },
                    {
                        id: "2",
                        title: "Appartement en centre-ville",
                        description: "Appartement moderne avec 3 chambres, proche de toutes commodités.",
                        imageUrl: "https://via.placeholder.com/400x300",
                        price: ethers.utils.parseEther("5"),
                        size: "120",
                        location: "Paris, France",
                        isForSale: true
                    },
                    {
                        id: "3",
                        title: "Maison de campagne",
                        description: "Charmante maison avec grand terrain dans un environnement calme et verdoyant.",
                        imageUrl: "https://via.placeholder.com/400x300",
                        price: ethers.utils.parseEther("7.5"),
                        size: "180",
                        location: "Provence, France",
                        isForSale: true
                    },
                    {
                        id: "4",
                        title: "Loft industriel",
                        description: "Spacieux loft dans un ancien bâtiment industriel, entièrement rénové avec goût.",
                        imageUrl: "https://via.placeholder.com/400x300",
                        price: ethers.utils.parseEther("6.2"),
                        size: "150",
                        location: "Lyon, France",
                        isForSale: true
                    },
                    {
                        id: "5",
                        title: "Chalet de montagne",
                        description: "Authentique chalet avec vue imprenable sur les montagnes, idéal pour les amateurs de sports d'hiver.",
                        imageUrl: "https://via.placeholder.com/400x300",
                        price: ethers.utils.parseEther("8.7"),
                        size: "200",
                        location: "Chamonix, France",
                        isForSale: true
                    }
                ];
                setTimeout(() => {
                    setProperties(mockProperties);
                    setIsLoading(false);
                }, 1000);

                /* Commentez le code réel qui appelle le contrat pour le moment
                if (window.ethereum) {
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const contract = new ethers.Contract(
                        contractAddress,
                        HETIC_ABI,
                        provider
                    );

                    // Get all properties from contract
                    const totalProperties = await contract.getTotalProperties();
                    const propertiesArray: Property[] = [];

                    for (let i = 0; i < parseInt(totalProperties.toString()); i++) {
                        const propertyId = await contract.propertyIds(i);
                        const property = await contract.properties(propertyId);

                        // Only add properties that are for sale
                        if (property.isForSale) {
                            propertiesArray.push({
                                id: propertyId.toString(),
                                title: property.name,
                                description: property.description,
                                imageUrl: property.imageUrl,
                                price: property.price,
                                size: property.size.toString(),
                                location: property.location,
                                isForSale: property.isForSale
                            });
                        }
                    }

                    setProperties(propertiesArray);
                }
                */
            } catch (err) {
                console.error("Erreur lors du chargement des propriétés:", err);
                setError("Impossible de charger les propriétés. Veuillez réessayer plus tard.");
                setIsLoading(false);
            }
        };

        loadProperties();
    }, []);

    const handleBuy = async (propertyId: string, price: ethers.BigNumber): Promise<void> => {
        try {
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const accounts = await provider.listAccounts();

                if (accounts.length === 0) {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                }

                const signer = provider.getSigner();
                const contract = new ethers.Contract(
                    contractAddress,
                    HETIC_ABI,
                    signer
                );

                // Pour le développement, simulez simplement un achat réussi
                alert(`Simulation: Vous achèteriez la propriété ${propertyId} pour ${ethers.utils.formatEther(price)} tokens HETIC`);

                /* Code réel pour plus tard
                const transaction = await contract.buyProperty(propertyId, {
                    value: price
                });

                await transaction.wait();
                alert("Achat réussi! La propriété est maintenant à vous.");
                */
            } else {
                alert("Veuillez installer MetaMask pour acheter des propriétés");
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
                    <h1 className="text-3xl font-bold mb-8 text-center">Marketplace Immobilier</h1>

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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prix min (HETIC)</label>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prix max (HETIC)</label>
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
                    ) : filteredProperties.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProperties.map((property) => (
                                <PropertyCard
                                    key={property.id}
                                    property={property}
                                    onBuy={handleBuy}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 my-12">
                            Aucune propriété ne correspond à vos critères de recherche
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}