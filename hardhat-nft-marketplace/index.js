const cors = require("cors")
const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const multer = require("multer")
const fs = require("fs")
const { ethers, network } = require("hardhat")

const { uploadImageToIPFS } = require("./utils/ipfs-handler")
const { DynamicmintAndList } = require("./scripts/mint-and-list")

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

/* CORS */
app.use(cors())
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})
app.use("/public", express.static(__dirname + "/public"))

// File Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "img")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    },
})
const upload = multer({ storage })

app.post("/test", async function (req, res) {
    try {
        const { TokenURI, price } = req.body
        const result = await DynamicmintAndList(TokenURI, price)
        console.log(result.data)
        console.log("chainID", network.config.chainId)
        res.status(201).json({ result: result })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

app.listen(3001, function () {
    console.log("Server started on port 3001")
})
