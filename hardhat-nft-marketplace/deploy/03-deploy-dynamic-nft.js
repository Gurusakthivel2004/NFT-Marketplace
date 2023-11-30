const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId || 31337

    const dynamicNft = await deploy("DynamicNft", {
        from: deployer,
        args: [],
        log: true,
        waitConfiramtions: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.API_KEY) {
        console.log("Verifying......")
        await verify(dynamicNft.address, [])
    }

    console.log("--------------------------------------------")
}

module.exports.tags = ["all", "dynamicNft"]
