// components/Navbar.tsx
import {useState, useEffect} from 'react';
import Link from 'next/link';
import {ethers} from 'ethers';
import {ConnectButton} from "@rainbow-me/rainbowkit";

const Navbar: React.FC = () => {
    const [account, setAccount] = useState<string>('');
    const [balance, setBalance] = useState<string>('');
    const [isConnected, setIsConnected] = useState<boolean>(false);

    const connectWallet = async (): Promise<void> => {
        try {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
                const provider = new ethers.providers.Web3Provider(window.ethereum);

                // Get account balance
                const balance = await provider.getBalance(accounts[0]);
                const balanceInEth = ethers.utils.formatEther(balance);

                setAccount(accounts[0]);
                setBalance(parseFloat(balanceInEth).toFixed(4));
                setIsConnected(true);
            } else {
                alert("Veuillez installer MetaMask pour utiliser cette application");
            }
        } catch (error) {
            console.error("Erreur lors de la connexion au wallet:", error);
        }
    };

    const disconnectWallet = (): void => {
        setAccount('');
        setBalance('');
        setIsConnected(false);
        window.location.reload();
    };

    useEffect(() => {
        // Check if already connected
        if (window.ethereum) {
            window.ethereum.request({method: 'eth_accounts'})
                .then((accounts: string) => {
                    if (accounts.length > 0) {
                        connectWallet();
                    }
                });

            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                if (accounts.length > 0) {
                    connectWallet();
                } else {
                    setAccount('');
                    setBalance('');
                    setIsConnected(false);
                }
            });
        }
    }, []);

    return (
        <nav className="bg-[var(--dark-color)] min-h-20 content-center">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/homepage">
              <span className="bg-[var(--dark-gray-o-color)] rounded-xl flex-shrink-0 flex items-center cursor-pointer">
                <h1 className="logo text-[var(--white-color)] m-2">ImmoChain</h1>
              </span>
                        </Link>
                        <div className="hidden md:ml-6 md:flex md:space-x-4">
                            <Link href="/homepage">
                <span
                    className="mn text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer">
                  Accueil
                </span>
                            </Link>
                            <Link href="/marketplace">
                <span
                    className="mn text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer">
                  Marketplace
                </span>
                            </Link>
                            <Link href="/my-properties">
                <span
                    className="mn text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer">
                  Mes Propriétés
                </span>
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center">
                        {isConnected ? (
                            <ConnectButton/>
                        ) : (
                            <button
                                onClick={connectWallet}
                                className="bg-[var(--button-color)] text-[var(--dark-color)] font-bold py-2 px-4 rounded-lg transition-colors cursor-pointer"
                            >
                                Connecter Wallet
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;