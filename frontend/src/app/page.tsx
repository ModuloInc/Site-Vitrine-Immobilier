"use client"

import {useState, useEffect} from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {ethers} from 'ethers';
import Navbar from "@/app/component/Navbar";
import Footer from "@/app/component/Footer";
import {MODULOCOIN_ABI} from "@/app/abi/modulocoin";
import Scene from "@/app/component/CoinView";
import {loadProperties} from '@/app/utils/propertyUtils';
import CustomCursor from "@/app/component/CustomCursor";
import Image from 'next/image';

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
    const [showCustomCursor, setShowCustomCursor] = useState<boolean>(true);

    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    const connectWallet = async () => {
        try {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
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
                MODULOCOIN_ABI,
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
                    MODULOCOIN_ABI,
                    signer
                );

                // Convertir le montant en BigNumber pour l'envoyer en tant que value
                const ethAmount = ethers.utils.parseEther(mintAmount);
                console.log("Montant ETH à envoyer:", ethAmount.toString());

                // Utiliser la fonction mint avec l'option value
                const tx = await contract.mint(userAddress, {
                    value: ethAmount
                });

                console.log("Transaction envoyée:", tx.hash);
                const receipt = await tx.wait();
                console.log("Transaction confirmée:", receipt);

                loadContractInfo(userAddress);
                alert(`Transaction réussie! Vous avez envoyé ${mintAmount} ETH et reçu des tokens ${tokenSymbol}.`);
                setMintAmount("0.1");
            }
        } catch (error) {
            console.error("Erreur détaillée:", error);
            alert(`Erreur lors du mint: ${(error as Error).message}`);
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
                MODULOCOIN_ABI,
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
            window.ethereum.request({method: 'eth_accounts'})
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
                window.ethereum.removeListener('accountsChanged', () => {
                });
            }
        };
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <Head>
                <title>ImmoChain - Achat de biens immobiliers avec {tokenSymbol}</title>
                <meta name="description"
                      content="Plateforme d'achat et de vente de biens immobiliers utilisant la technologie blockchain"/>
                <link rel="icon" href="/public/favicon.ico"/>
            </Head>

            <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={showCustomCursor}
                        onChange={() => setShowCustomCursor(!showCustomCursor)}
                    />
                    <div
                        className="group peer ring-0 bg-gradient-to-r from-rose-400 to-red-900 rounded-full outline-none duration-700 after:duration-300 w-24 h-12 shadow-md peer-checked:bg-gradient-to-r peer-checked:from-emerald-500 peer-checked:to-emerald-900 peer-focus:outline-none after:content-[''] after:rounded-full after:absolute after:bg-gray-50 after:outline-none after:h-10 after:w-10 after:top-1 after:left-1 peer-checked:after:translate-x-12 peer-hover:after:scale-95">
                        <Image
                            src="/disableFirework.svg"
                            alt="Cursor Effect"
                            width={100}
                            height={100}
                            className="group-hover:scale-65 duration-300 absolute top-1 left-12 stroke-gray-900 w-10 h-10 scale-75"
                        />
                    </div>
                </label>

                <span className="text-white px-3 py-1 rounded-lg">
          Disable Cursor Effect
        </span>
            </div>
            {showCustomCursor && <CustomCursor/>}


            <Navbar/>

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="bg-[var(--dark-color)] text-white ">
                    <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 flex gap-8">
                        <div className="text-center content-center">
                            <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
                                <span className="block">Révolutionnez votre</span>
                                <span className="block">Expérience Immobilière</span>
                            </h1>
                            <p className="mt-4 text-xl max-w-md mx-auto text-[var(--gray-o-color)]">
                                Achetez et vendez des biens immobiliers en toute sécurité
                                avec {tokenSymbol || "ModuloCoin"} sur la blockchain.
                            </p>
                            <div className="mt-8 flex flex-col md:flex-row justify-center items-center gap-4">
                                <Link href="/marketplace">
                  <span
                      className="bg-white text-black hover:bg-gray-100 font-bold py-3 px-6 rounded-lg shadow-lg cursor-pointer">
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
                        <div>
                            <Scene/>
                        </div>
                    </div>
                </section>

                {isConnected && (
                    <section className="py-8 bg-[var(--dark-color)]">
                        <div className="max-w-xl mx-auto px-4">
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="text-xl font-bold mb-4 text-[var(--dark-color)]">Obtenir
                                    des {tokenSymbol || "ModuloCoin"}</h2>
                                <div className="flex flex-col sm:flex-row items-center gap-3">
                                    <input
                                        type="number"
                                        value={mintAmount}
                                        onChange={(e) => setMintAmount(e.target.value)}
                                        className="flex-1 p-2 border border-gray-300 rounded-md w-full sm:w-auto text-[var(--dark-color)]"
                                        placeholder="Montant ETH"
                                        min="0.001"
                                        step="0.01"
                                    />
                                    <button
                                        onClick={mintTokens}
                                        disabled={isMinting}
                                        className={`px-4 py-2 rounded-md w-full sm:w-auto ${isMinting
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700'} text-white`}
                                    >
                                        {isMinting ? 'En cours...' : `Acheter des ${tokenSymbol || "ModuloCoin"}`}
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 mt-3">
                                    Note: En envoyant de l'ETH, vous recevrez des
                                    tokens {tokenSymbol || "ModuloCoin"} en échange.
                                </p>
                            </div>
                        </div>
                    </section>
                )}

                {/* Featured Properties Section */}
                <section className="py-12 bg-[var(--dark-color)]">
                    <div className="max-w-7xl mx-auto px-4">
                        <h2 className="h2 text-[var(--white-color)] text-center mb-8">Propriétés à la Une</h2>

                        {isLoading ? (
                            <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : error ? (
                            <div className="text-center text-red-500">{error}</div>
                        ) : featuredProperties.filter(property => property.isForSale).length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {featuredProperties.slice(0, 3).map((property, index) => (
                                    <div key={property.id}
                                         className={`${index % 2 === 0 ? 'bg-[var(--dark-gray-o-color)]' : 'bg-[var(--white-color)]'} rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105`}>
                                        <div className="relative">
                                            <img
                                                src={property.imageUrl}
                                                alt={property.title}
                                                className="h-48 w-full object-cover"
                                            />
                                            {property.isForSale ? (
                                                <span
                                                    className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 text-xs rounded-full">
                                                    À Vendre
                                                </span>
                                            ) : (
                                                <span
                                                    className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded-full">
                                                    Vendu
                                                </span>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className={`text-lg font-semibold ${index % 2 === 0 ? 'text-[var(--white-color)]' : 'text-[var(--dark-gray-t-color)]'} mb-1`}>{property.title}</h3>
                                            <p className={`mn ${index % 2 === 0 ? 'text-[var(--gray-t-color)]' : 'text-[var(--dark-gray-t-color)]'} mb-2`}>{property.location}</p>
                                            <div className="flex justify-between items-center mb-3">
                                                <span
                                                    className="font-bold text-blue-600">{ethers.utils.formatEther(property.price)} {tokenSymbol || "HETIC"}</span>
                                                <div className="flex items-center">
                                                    <span
                                                        className="text-sm text-[var(--purple-color)]">{property.size} m²</span>
                                                </div>
                                            </div>
                                            <p className={`${index % 2 === 0 ? 'text-[var(--gray-t-color)]' : 'text-[var(--dark-gray-o-color)]'} mb-3 line-clamp-2`}>{property.description}</p>
                                            <button
                                                onClick={() => handleBuy(property.id, property.price)}
                                                className={`w-full ${property.isForSale ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'} text-white font-semibold py-2 px-4 rounded-lg transition-colors`}
                                                disabled={!isConnected || !property.isForSale}
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
                                    <span
                                        className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer block mt-4">
                                        Voir mes propriétés →
                                    </span>
                                </Link>
                            </div>
                        )}

                        <div className="text-center mt-8">
                            <Link href="/marketplace">
                <span className="mn text-[var(--purple-color)] font-medium cursor-pointer">
                  Voir toutes les propriétés →
                </span>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="bg-[var(--dark-gray-o-color)] py-12">
                    <div className="max-w-7xl mx-auto px-4">
                        <h2 className="text-[var(--white-color)] text-3xl font-bold text-center mb-12">Comment ça
                            marche</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div
                                    className="bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center text-blue-600 text-2xl font-bold mx-auto mb-4">
                                    1
                                </div>
                                <h3 className="text-[var(--white-color)] text-xl font-semibold mb-2">Connectez votre
                                    Wallet</h3>
                                <p className="text-[var(--gray-t-color)]">
                                    Utilisez MetaMask pour vous connecter à notre plateforme de manière sécurisée.
                                </p>
                            </div>

                            <div className="text-center">
                                <div
                                    className="bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center text-blue-600 text-2xl font-bold mx-auto mb-4">
                                    2
                                </div>
                                <h3 className="text-[var(--white-color)] text-xl font-semibold mb-2">Explorez les
                                    Propriétés</h3>
                                <p className="text-[var(--gray-t-color)]">
                                    Parcourez notre marketplace pour trouver le bien immobilier de vos rêves.
                                </p>
                            </div>

                            <div className="text-center">
                                <div
                                    className="bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center text-blue-600 text-2xl font-bold mx-auto mb-4">
                                    3
                                </div>
                                <h3 className="text-[var(--white-color)] text-xl font-semibold mb-2">Achetez en Toute
                                    Sécurité</h3>
                                <p className="text-[var(--gray-t-color)]">
                                    Achetez des propriétés avec des {tokenSymbol || "HETIC"}, sécurisées par des
                                    contrats intelligents.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer/>
        </div>
    );
}

//test