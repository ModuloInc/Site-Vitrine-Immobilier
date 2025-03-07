"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ethers } from "ethers";
import Navbar from "@/app/component/Navbar";
import Footer from "@/app/component/Footer";
import { loadProperties } from "@/app/utils/propertyUtils";

export default function PropertyDetailPage() {
    const { id } = useParams();
    const [property, setProperty] = useState<any>(null);

    useEffect(() => {
        if (id) {
            const properties = loadProperties();
            const selectedProperty = properties.find((prop: any) => prop.id.toString() === id);
            setProperty(selectedProperty);
        }
    }, [id]);

    if (!property) {
        return <div className="text-center text-white p-8">Chargement...</div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-[var(--dark-color)] text-white">
            <Navbar />

            <main className="flex-grow p-12">
                <div className="max-w-5xl mx-auto">
                    <img
                        src={property.imageUrl}
                        alt={property.title}
                        className="w-full h-96 object-cover rounded-lg"
                    />

                    <div className="mt-8 space-y-4">
                        <h1 className="text-4xl font-bold">{property.title}</h1>
                        <p className="text-lg text-gray-300">{property.location}</p>
                        <p className="text-gray-400">{property.description}</p>

                        <p className="text-2xl font-semibold text-blue-400">
                            Prix : {ethers.utils.formatEther(property.price)} HETIC
                        </p>

                        <div className="flex justify-end mt-6">
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                            >
                                Acheter
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
