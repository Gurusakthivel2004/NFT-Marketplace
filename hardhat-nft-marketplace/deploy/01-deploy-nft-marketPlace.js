const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    // const FUND_AMOUNT = ethers.parseEther("2")

    const nftMarketPlace = await deploy("NftMarketplace", {
        from: deployer,
        args: [],
        log: true,
        waitConfiramtions: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.API_KEY) {
        console.log("Verifying......")
        await verify(nftMarketPlace.address, [])
    }

    console.log("--------------------------------------------")
}

module.exports.tags = ["all", "nftMarketPlace"]
