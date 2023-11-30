const pinataSDK = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")
require("dotenv").config()

const api_key = process.env.PINATA_API_KEY
const api_secret = process.env.PINATA_API_SECRET
const pinata = pinataSDK(api_key, api_secret)

const storeImages = async (imagePath) => {
    const fullPath = path.resolve(imagePath)
    const files = fs.readdirSync(fullPath)
    console.log("Uploading to IPFS.....")
    let responses = []
    for (fileIndex in files) {
        const readableFileStream = fs.createReadStream(`${fullPath}/${files[fileIndex]}`)
        try {
            const response = await pinata.pinFileToIPFS(readableFileStream)
            responses.push(response)
        } catch (error) {
            console.log(error)
        }
    }
    return { responses, files }
}

const storeTokenURIMetadata = async (metaData) => {
    try {
        const response = await pinata.pinJSONToIPFS(metaData)
        return response
    } catch (error) {
        console.log(error)
    }
    return null
}

module.exports = { storeImages, storeTokenURIMetadata }
