"use client";
import {useState, useEffect} from 'react';
import Head from 'next/head';
import Navbar from "@/app/component/Navbar";
import Footer from "@/app/component/Footer";
import PropertyCard from "@/app/component/Property";
import {ethers} from 'ethers';
import {Property} from '../types/property';

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

    useEffect(() => {
        const fetchProperties = async (): Promise<void> => {
            try {
                const response = await fetch("/houses.json");
                if (!response.ok) throw new Error("Erreur de chargement des propriétés");

                const data = await response.json();
                const formattedData = data.map((property: any) => ({
                    ...property,
                    price: ethers.utils.parseEther(property.price.toString())
                }));

                setProperties(formattedData);
            } catch (err) {
                console.error("Erreur lors du chargement des propriétés:", err);
                setError("Impossible de charger les propriétés.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProperties();
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const {name, value} = e.target;
        setFilter({...filter, [name]: value});
    };

    const filteredProperties = properties.filter(property => {
        const priceInEth = parseFloat(ethers.utils.formatEther(property.price));
        const size = parseInt(property.size);

        if (filter.location && !property.location.toLowerCase().includes(filter.location.toLowerCase())) {
            return false;
        }
        if (filter.minPrice && priceInEth < parseFloat(filter.minPrice)) {
            return false;
        }
        if (filter.maxPrice && priceInEth > parseFloat(filter.maxPrice)) {
            return false;
        }
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
            </Head>

            <Navbar/>

            <main className="flex-grow py-8 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-8 text-center">Marketplace Immobilier</h1>

                    {/* Barre de filtre */}
                    <div className="bg-white p-4 rounded-lg shadow-md mb-8">
                        <h2 className="text-xl font-semibold mb-4">Filtrer les propriétés</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
                                <input type="text" name="location" value={filter.location} onChange={handleFilterChange}
                                       className="w-full p-2 border border-gray-300 rounded-md"
                                       placeholder="Ville, région..."/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prix min (ETH)</label>
                                <input type="number" name="minPrice" value={filter.minPrice}
                                       onChange={handleFilterChange}
                                       className="w-full p-2 border border-gray-300 rounded-md" placeholder="0"
                                       min="0"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prix max (ETH)</label>
                                <input type="number" name="maxPrice" value={filter.maxPrice}
                                       onChange={handleFilterChange}
                                       className="w-full p-2 border border-gray-300 rounded-md" placeholder="100"
                                       min="0"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Surface min (m²)</label>
                                <input type="number" name="minSize" value={filter.minSize} onChange={handleFilterChange}
                                       className="w-full p-2 border border-gray-300 rounded-md" placeholder="0"
                                       min="0"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Surface max (m²)</label>
                                <input type="number" name="maxSize" value={filter.maxSize} onChange={handleFilterChange}
                                       className="w-full p-2 border border-gray-300 rounded-md" placeholder="500"
                                       min="0"/>
                            </div>
                        </div>
                    </div>

                    <span>test</span>

                    {/* Chargement des propriétés */}
                    {isLoading ? (
                        <p className="text-center text-gray-500">Chargement des propriétés...</p>
                    ) : error ? (
                        <p className="text-center text-red-500">{error}</p>
                    ) : filteredProperties.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProperties.map((property) => (
                                <PropertyCard key={property.id} property={property}
                                              onBuy={function (id: string, price: ethers.BigNumber): void {
                                                  throw new Error('Function not implemented.');
                                              }}/>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">Aucune propriété ne correspond à vos critères</p>
                    )}
                </div>
            </main>

            <Footer/>
        </div>
    );
}