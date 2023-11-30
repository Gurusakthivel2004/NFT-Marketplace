const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

const PRICE = ethers.parseEther("0.1")

async function mintAndList() {
    // const basicNft = await ethers.getContract("BasicNft")
    // console.log("Minting NFT...")
    // const mintTx = await basicNft.mintNft()
    // const mintTxReceipt = await mintTx.wait(1)
    // console.log(
    //     `Minted tokenId ${mintTxReceipt.logs[0].args.tokenId.toString()} from contract: ${
    //         basicNft.target
    //     }`,
    // )
    // if (network.config.chainId == 31337) {
    //     // Moralis has a hard time if you move more than 1 block!
    //     await moveBlocks(2, (sleepAmount = 1000))
    // }
    const DynamicNft = await ethers.getContract("DynamicNft")
    console.log("Minting NFT...")
    const mintTx = await DynamicNft.mintNft(
        "http://bafybeid66t6vekiwz7dt6pgsekp7yiq2rkrgt27w5yzwy3z5lvumsxzunm.ipfs.localhost:8080/0",
    )
    const mintTxReceipt = await mintTx.wait(1)
    console.log(
        `Minted tokenId ${mintTxReceipt.logs[0].args.tokenId.toString()} from contract: ${
            DynamicNft.target
        }`,
    )
    if (network.config.chainId == 31337) {
        // Moralis has a hard time if you move more than 1 block!
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

mintAndList()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
