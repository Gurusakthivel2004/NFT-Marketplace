const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Nft Marketplace Unit Tests", function () {
          let nftMarketplace, nftMarketplaceContract, basicNft, basicNftContract
          const PRICE = ethers.parseEther("0.1")
          const TOKEN_ID = 0

          beforeEach(async () => {
              accounts = await ethers.getSigners() // could also do with getNamedAccounts
              deployer = accounts[0]
              user = accounts[1]
              await deployments.fixture(["all"])
              nftMarketplaceContract = await ethers.getContract("NftMarketplace")
              nftMarketplace = nftMarketplaceContract.connect(deployer)
              basicNftContract = await ethers.getContract("BasicNft")
              basicNft = basicNftContract.connect(deployer)
              await basicNft.mintNft()
              await basicNft.approve(nftMarketplaceContract.target, TOKEN_ID)
              console.log("🥹")
          })

          describe("listItem", function () {
              it("emits an event after listing an item", async function () {
                  expect(await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE)).to.emit(
                      "ItemListed",
                  )
              })
              it("exclusively items that haven't been listed", async function () {
                  await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE)
                  const error =
                      "NftMarketplace_AlreadyListed(" + basicNft.target + "," + TOKEN_ID + ")"
                  //   await expect(
                  //       nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  //   ).to.be.revertedWith("AlreadyListed")
                  await expect(
                      nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE),
                  ).to.be.revertedWithCustomError(nftMarketplace, "NftMarketplace_AlreadyListed")
              })
              it("exclusively allows owners to list", async function () {
                  nftMarketplace = nftMarketplaceContract.connect(user)
                  await basicNft.approve(user, TOKEN_ID)
                  await expect(
                      nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE),
                  ).to.be.revertedWithCustomError(nftMarketplace, "NftMarketplace_NotOwner()")
              })
              it("needs approvals to list item", async function () {
                  await basicNft.approve(ethers.ZeroAddress, TOKEN_ID)
                  await expect(
                      nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE),
                  ).to.be.revertedWithCustomError(
                      nftMarketplace,
                      "NftMarketplace_NotApprovedForMarketplace()",
                  )
              })
              it("Updates listing with seller and price", async function () {
                  await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE)
                  const listing = await nftMarketplace.getListing(basicNft.target, TOKEN_ID)
                  //   console.log(listing.price.toString(), PRICE.toString())
                  assert.equal(listing.price.toString(), PRICE.toString())
                  assert.equal(listing.seller.toString(), deployer.address.toString())
              })
              it("reverts if the price be 0", async () => {
                  const ZERO_PRICE = ethers.parseEther("0")
                  await expect(
                      nftMarketplace.listItem(basicNft.target, TOKEN_ID, ZERO_PRICE),
                  ).revertedWithCustomError(nftMarketplace, "NftMarketplace_PriceMustBeAboveZero()")
              })
          })
          describe("cancelListing", function () {
              it("reverts if there is no listing", async function () {
                  await expect(
                      nftMarketplace.cancelListing(basicNft.target, TOKEN_ID),
                  ).to.be.revertedWithCustomError(nftMarketplace, "NftMarketplace_NotListed")
              })
              it("reverts if anyone but the owner tries to call", async function () {
                  await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE)
                  nftMarketplace = nftMarketplaceContract.connect(user)
                  await basicNft.approve(user, TOKEN_ID)
                  await expect(
                      nftMarketplace.cancelListing(basicNft.target, TOKEN_ID),
                  ).to.be.revertedWithCustomError(nftMarketplace, "NftMarketplace_NotOwner")
              })
              it("emits event and removes listing", async function () {
                  await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE)
                  expect(await nftMarketplace.cancelListing(basicNft.target, TOKEN_ID)).to.emit(
                      "ItemCanceled",
                  )
                  const listing = await nftMarketplace.getListing(basicNft.target, TOKEN_ID)
                  assert.equal(listing.price.toString(), "0")
              })
          })
          describe("buyItem", function () {
              it("reverts if the item isnt listed", async function () {
                  await expect(
                      nftMarketplace.buyItem(basicNft.target, TOKEN_ID),
                  ).to.be.revertedWithCustomError(nftMarketplace, "NftMarketplace_NotListed")
              })
              it("reverts if the price isnt met", async function () {
                  await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE)
                  await expect(
                      nftMarketplace.buyItem(basicNft.target, TOKEN_ID),
                  ).to.be.revertedWithCustomError(nftMarketplace, "NftMarketplace_PriceNotMet")
              })
              it("transfers the nft to the buyer and updates internal proceeds record", async function () {
                  await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE)
                  nftMarketplace = nftMarketplaceContract.connect(user)
                  expect(
                      await nftMarketplace.buyItem(basicNft.target, TOKEN_ID, { value: PRICE }),
                  ).to.emit("ItemBought")
                  const newOwner = await basicNft.ownerOf(TOKEN_ID)
                  const deployerProceeds = await nftMarketplace.getProceeds(deployer.address)
                  assert.equal(newOwner.toString(), user.address)
                  assert.equal(deployerProceeds.toString(), PRICE.toString())
              })
          })
          describe("updateListing", function () {
              it("must be owner and listed", async function () {
                  await expect(
                      nftMarketplace.updateListing(basicNft.target, TOKEN_ID, PRICE),
                  ).to.be.revertedWithCustomError(nftMarketplace, "NftMarketplace_NotListed")
                  await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE)
                  nftMarketplace = nftMarketplaceContract.connect(user)
                  await expect(
                      nftMarketplace.updateListing(basicNft.target, TOKEN_ID, PRICE),
                  ).to.be.revertedWithCustomError(nftMarketplace, "NftMarketplace_NotOwner")
              })
              it("reverts if new price is 0", async function () {
                  const updatedPrice = ethers.parseEther("0")
                  await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE)
                  await expect(
                      nftMarketplace.updateListing(basicNft.target, TOKEN_ID, updatedPrice),
                  ).to.be.revertedWithCustomError(
                      nftMarketplace,
                      "NftMarketplace_PriceMustBeAboveZero",
                  )
              })
              it("updates the price of the item", async function () {
                  const updatedPrice = ethers.parseEther("0.2")
                  await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE)
                  expect(
                      await nftMarketplace.updateListing(basicNft.target, TOKEN_ID, updatedPrice),
                  ).to.emit("ItemListed")
                  const listing = await nftMarketplace.getListing(basicNft.target, TOKEN_ID)
                  assert.equal(listing.price.toString(), updatedPrice.toString())
              })
          })
          describe("withdrawProceeds", function () {
              it("doesn't allow 0 proceed withdrawls", async function () {
                  await expect(nftMarketplace.withdrawProceeds()).to.be.revertedWithCustomError(
                      nftMarketplace,
                      "NftMarketplace_NoProceeds",
                  )
              })
              it("withdraws proceeds", async function () {
                  await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE)
                  nftMarketplace = nftMarketplaceContract.connect(user)
                  await nftMarketplace.buyItem(basicNft.target, TOKEN_ID, { value: PRICE })
                  nftMarketplace = nftMarketplaceContract.connect(deployer)

                  const deployerProceedsBefore = await nftMarketplace.getProceeds(deployer.address)
                  const deployerBalanceBefore = await deployer.provider.getBalance(deployer.address)
                  const txResponse = await nftMarketplace.withdrawProceeds()
                  const transactionReceipt = await txResponse.wait(1)
                  const { gasUsed, gasPrice } = await transactionReceipt
                  const gasCost = gasUsed * BigInt(gasPrice)
                  const deployerBalanceAfter = await deployer.provider.getBalance(deployer.address)

                  assert.equal(
                      (deployerBalanceAfter + BigInt(gasCost)).toString(),
                      (deployerProceedsBefore + BigInt(deployerBalanceBefore)).toString(),
                  )
              })
          })
      })
