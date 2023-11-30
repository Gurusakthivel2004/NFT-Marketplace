const IPFS = require("ipfs-mini")
const ipfs = new IPFS({ host: "ipfs.infura.io", port: 5001, protocol: "https" }) // Adjust these settings as needed.

async function uploadImageToIPFS(imageBuffer) {
    return new Promise((resolve, reject) => {
        ipfs.add(imageBuffer, (err, hash) => {
            if (err) {
                console.error("Error uploading image to IPFS:", err)
                reject(err)
            } else {
                console.log("Image uploaded to IPFS with hash:", hash)
                resolve(hash)
            }
        })
    })
}

module.exports = { uploadImageToIPFS }
