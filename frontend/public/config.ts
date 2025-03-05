import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {  hardhat } from "wagmi/chains";

export const config = getDefaultConfig({
    appName: "Web app Hetic",
    projectId: "YOUR_PROJECT_ID",
    chains: [ hardhat],
    ssr: true, // If your dApp uses server side rendering (SSR)
});