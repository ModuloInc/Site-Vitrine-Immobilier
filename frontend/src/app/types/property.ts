// types/property.ts
import { BigNumber } from 'ethers';

export interface Property {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    price: BigNumber;
    size: string;
    location: string;
    isForSale: boolean;
}