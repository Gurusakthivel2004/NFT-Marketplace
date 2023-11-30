require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")
require("@nomiclabs/hardhat-ethers")

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const API_KEY = process.env.API_KEY
const MAIN_NET_RPC_URL = process.env.MAIN_NET_RPC_URL
const COIN_MARKET_CAP_API = process.env.COIN_MARKET_CAP_API

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "sepolia",
    networks: {
        hardhat: {
            chainId: 31337,
            forking: {
                url: MAIN_NET_RPC_URL,
            },
            allowUnlimitedContractSize: true,
        },
        sepolia: {
            tags: ["mint", "all"],
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            blockConfirmations: 6,
            chainId: 11155111,
            gas: 6000000,
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337,
            allowUnlimitedContractSize: true,
        },
    },
    solidity: {
        compilers: [
            {
                version: "0.8.19",
            },
            {
                version: "0.6.12",
            },
            {
                version: "0.4.19",
            },
            {
                version: "0.6.0",
            },
        ],
    },
    etherscan: {
        apiKey: API_KEY,
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COIN_MARKET_CAP_API,
        token: "MATIC",
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        user: {
            default: 1,
        },
    },
}
