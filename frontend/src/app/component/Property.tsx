// components/PropertyCard.tsx
import { ethers } from 'ethers';
import { Property} from "@/app/types/property";


interface PropertyCardProps {
  property: Property;
  onBuy: (id: string, price: ethers.BigNumber) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onBuy }) => {
  return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
        <div className="relative pb-2/3">
          <img
              src={property.imageUrl || "/property-placeholder.jpg"}
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
            <span className="font-bold text-blue-600">{ethers.utils.formatEther(property.price)} ETH</span>
            <div className="flex items-center">
              <span className="text-sm text-gray-600">{property.size} m²</span>
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-3 line-clamp-2">{property.description}</p>
          <button
              onClick={() => onBuy(property.id, property.price)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Acheter
          </button>
        </div>
      </div>
  );
};

export default PropertyCard;