const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

async function BasicmintAndList() {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    let basicNft = await ethers.getContract("BasicNft")
    console.log("Minting NFT...")
    const mintTx = await basicNft.mintNft()
    const mintTxReceipt = await mintTx.wait(1)
    const tokenId = mintTxReceipt.logs[0].args.tokenId
    console.log("Approving NFT...")
    console.log(nftMarketplace.target, basicNft.target)
    const approvalTx = await basicNft.approve(nftMarketplace.target, tokenId)
    await approvalTx.wait(1)
    console.log("Listing NFT...")
    const tx = await nftMarketplace.listItem(basicNft.target, tokenId, PRICE)
    await tx.wait(1)
    console.log("NFT Listed!")
    if (network.config.chainId == 31337) {
        // Moralis has a hard time if you move more than 1 at once!
        await moveBlocks(1, (sleepAmount = 1000))
    }
}

async function DynamicmintAndList(TokenURI, price) {
    try {
        const nftMarketplace = await ethers.getContractAt(
            "NftMarketplace",
            "0x71590BCCecD4904A9fDDBEc5950Da10590F1e6D6",
        )
        const ExampleURI = "https://ipfs.io/ipfs/QmRwE5ABCYxNBZcMTaSyUD1GgSSSbfJaEJVRuXjmbixuEx/0"
        const DynamicNft = await ethers.getContractAt(
            "DynamicNft",
            "0xc4693057Df68D0FEFa1d1A63F6b9D9c6412E0DdF",
        )
        console.log("Minting NFT...")
        const mintTx = await DynamicNft.mintNft(TokenURI)
        const mintTxReceipt = await mintTx.wait(1)

        const tokenId = mintTxReceipt.logs[0].args.tokenId
        console.log(tokenId, typeof tokenId)
        console.log("Approving NFT...")
        const approvalTx = await DynamicNft.approve(
            "0x71590BCCecD4904A9fDDBEc5950Da10590F1e6D6",
            tokenId,
        )
        await approvalTx.wait(1)
        console.log("Listing NFT...")
        const PRICE = ethers.parseEther(price)
        const tx = await nftMarketplace.listItem(
            "0xc4693057Df68D0FEFa1d1A63F6b9D9c6412E0DdF",
            tokenId,
            PRICE,
        )
        await tx.wait(1)
        console.log("NFT Listed!")
        if (network.config.chainId == 31337) {
            // Moralis has a hard time if you move more than 1 at once!
            await moveBlocks(1, (sleepAmount = 1000))
        }
        return "success"
    } catch (error) {
        console.log(error)
        return "failed"
    }
}

module.exports = { DynamicmintAndList, BasicmintAndList }
