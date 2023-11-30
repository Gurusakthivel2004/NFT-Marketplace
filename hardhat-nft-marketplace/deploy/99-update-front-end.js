const { frontEndContractsFile, frontEndAbiLocation } = require("../helper-hardhat-config")
require("dotenv").config()
const fs = require("fs")
const { network, ethers } = require("hardhat")

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Writing to front end...")
        await updateContractAddresses()
        await updateAbi()
        console.log("Front end written!")
    }
}

async function updateAbi() {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    fs.writeFileSync(
        `${frontEndAbiLocation}NftMarketplace.json`,
        nftMarketplace.interface.formatJson(),
    )

    const basicNft = await ethers.getContract("BasicNft")
    fs.writeFileSync(`${frontEndAbiLocation}BasicNft.json`, basicNft.interface.formatJson())
    const DynamicNft = await ethers.getContract("DynamicNft")
    fs.writeFileSync(`${frontEndAbiLocation}DynamicNft.json`, DynamicNft.interface.formatJson())
}

async function updateContractAddresses() {
    const chainId = network.config.chainId.toString()
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const BasicNFT = await ethers.getContract("BasicNft")
    const DynamicNFT = await ethers.getContract("DynamicNft")
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))
    if (chainId in contractAddresses) {
        if (!contractAddresses[chainId]["NftMarketplace"].includes(nftMarketplace.target)) {
            contractAddresses[chainId]["NftMarketplace"].push(nftMarketplace.target)
        }
        if (!contractAddresses[chainId]["BasicNft"].includes(BasicNFT.target)) {
            contractAddresses[chainId]["BasicNft"].push(BasicNFT.target)
        }
        if (!contractAddresses[chainId]["DynamicNft"].includes(DynamicNFT.target)) {
            contractAddresses[chainId]["DynamicNft"].push(DynamicNFT.target)
        }
    } else {
        contractAddresses[chainId] = { NftMarketplace: [nftMarketplace.target] }
        contractAddresses[chainId] = { BasicNft: [BasicNFT.target] }
        contractAddresses[chainId] = { DynamicNft: [DynamicNFT.target] }
    }

    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
}
module.exports.tags = ["all", "frontend"]
