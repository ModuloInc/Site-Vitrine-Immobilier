import { ethers } from 'ethers';
import propertyData from '../../../public/data/properties.json';
import { Property } from '../types/property';

// Fonction pour convertir les données JSON en objets Property avec les bonnes conversions
export const loadProperties = (): Property[] => {
    try {
        // Convertir les prix de string en BigNumber
        const properties = propertyData.map(property => ({
            ...property,
            price: ethers.utils.parseEther(property.price)
        }));

        // Récupérer les propriétés déjà achetées du localStorage
        if (typeof window !== 'undefined') {
            const purchasedProperties = JSON.parse(localStorage.getItem('purchasedProperties') || '[]');
            const purchasedIds = purchasedProperties.map((prop: any) => prop.id);

            // Mettre à jour les propriétés pour refléter celles déjà achetées
            return properties.map(prop =>
                purchasedIds.includes(prop.id) ? {...prop, isForSale: false} : prop
            );
        }

        return properties;
    } catch (error) {
        console.error("Erreur lors du chargement des propriétés:", error);
        return [];
    }
};