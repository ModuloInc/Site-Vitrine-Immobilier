"use client"

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from 'next/link';

// Type pour les propriétés
interface Property {
  id: number;
  title: string;
  price: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  imageUrl: string;
}

const HomePage = () => {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Simuler le chargement des propriétés depuis votre contrat (à remplacer par votre logique)
  useEffect(() => {
    // Exemple de données - remplacer par l'appel à votre contrat
    const dummyData: Property[] = [
      {
        id: 1,
        title: "Villa moderne avec piscine",
        price: "150",
        location: "Paris, France",
        bedrooms: 4,
        bathrooms: 3,
        size: 220,
        imageUrl: "/images/house1.jpg"
      },
      {
        id: 2,
        title: "Appartement au centre-ville",
        price: "80",
        location: "Lyon, France",
        bedrooms: 2,
        bathrooms: 1,
        size: 85,
        imageUrl: "/images/house2.jpg"
      },
      {
        id: 3,
        title: "Maison de campagne",
        price: "120",
        location: "Bordeaux, France",
        bedrooms: 3,
        bathrooms: 2,
        size: 180,
        imageUrl: "/images/house3.jpg"
      }
    ];

    setFeaturedProperties(dummyData);
    setIsLoading(false);
  }, []);

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="relative bg-blue-900 text-white py-20">
        <div className="container mx-auto px-4 z-10 relative">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Achetez des biens immobiliers avec de l'Ethereum
            </h1>
            <p className="text-xl mb-8">
              La première plateforme pour investir dans l'immobilier avec de la crypto-monnaie
            </p>
            <Link 
              href="/properties" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
            >
              Explorer les propriétés
            </Link>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-transparent"></div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Propriétés à la une</h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-xl">Chargement des propriétés...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property) => (
                <div key={property.id} className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
                  <div className="relative h-48 w-full">
                    <div className="bg-gray-300 w-full h-full flex items-center justify-center">
                      <span>Image de la propriété</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{property.title}</h3>
                    <p className="text-blue-600 text-2xl font-bold mb-4">{property.price} ETH</p>
                    <div className="flex items-center mb-4">
                      <span className="text-gray-600">📍</span>
                      <span className="ml-2 text-gray-600">{property.location}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 mb-6">
                      <span>🛏️ {property.bedrooms} Ch.</span>
                      <span>🚿 {property.bathrooms} SdB</span>
                      <span>📏 {property.size} m²</span>
                    </div>
                    <Link 
                      href={`/properties/${property.id}`}
                      className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg transition-colors"
                    >
                      Voir détails
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-10">
            <Link 
              href="/properties"
              className="inline-block border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Voir toutes les propriétés
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Comment ça marche</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-bold mb-3">Connectez votre portefeuille</h3>
              <p className="text-gray-600">Liez votre portefeuille MetaMask pour accéder à la plateforme</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-bold mb-3">Choisissez une propriété</h3>
              <p className="text-gray-600">Parcourez notre catalogue et sélectionnez la propriété qui vous intéresse</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-bold mb-3">Finalisez l'achat</h3>
              <p className="text-gray-600">Payez en ETH et recevez instantanément l'acte de propriété sous forme de NFT</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
