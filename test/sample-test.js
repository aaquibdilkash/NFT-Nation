const { expect } = require("chai");
const hre = require("hardhat");
const {ethers} = require("ethers");

describe("NFTMarket", async () => {
  beforeEach(() => {
    console.log("hello")
  })
  it("Should create and execute market sales", async () => {
    const [_, buyerAddress] = await hre.ethers.getSigners();

    const NAME = "NFT Nation Token";
    const SYMBOL = "NNT";
    // const TOTAL_SUPPLY = parseUnits.utils.parseUnits("1000", "ether");

    const TOKEN = await hre.ethers.getContractFactory("Token");
    const token = await TOKEN.deploy(NAME, SYMBOL, ethers.utils.parseUnits("1000", "ether"));
    await token.deployed();
    const tokenAdress = token.address;
    console.log("token deployed")

    const Market = await hre.ethers.getContractFactory("NFTMarket");
    const market = await Market.deploy(tokenAdress);
    await market.deployed();
    const marketAddress = market.address;
    console.log("market deployed")

    await token.transfer(marketAddress, ethers.utils.parseUnits("400", "ether"))
    console.log(await token.balanceOf(marketAddress), "balance of market")
    const provider = waffle.provider;
    console.log(await hre.waffle.provider.getBalance(marketAddress), "ETH balance of market")
    console.log(await token.balanceOf(_.address), "balance of owner")
    console.log(await hre.waffle.provider.getBalance(_.address), "ETH balance of owner")
    console.log(await token.balanceOf(buyerAddress.address), "balance of buyer")
    console.log(await hre.waffle.provider.getBalance(buyerAddress.address), "ETH balance of buyer")
    
    await market.connect(buyerAddress).crowdSale({value: ethers.utils.parseUnits("50", "ether")})
    
    console.log(await hre.waffle.provider.getBalance(marketAddress), "ETH balance of market")
    console.log(await token.balanceOf(marketAddress), "balance of market")
    console.log(await token.balanceOf(_.address), "balance of owner")
    console.log(await hre.waffle.provider.getBalance(_.address), "ETH balance of owner")
    console.log(await token.balanceOf(buyerAddress.address), "balance of buyer")
    console.log(await hre.waffle.provider.getBalance(buyerAddress.address), "ETH balance of buyer")

    const NFT = await hre.ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(NAME, SYMBOL);
    await nft.deployed();
    const nftContractAddress = nft.address;
    console.log("NFT deployed")


    const auctionPrice = ethers.utils.parseUnits("100", "ether").toString();
    console.log(auctionPrice, "DDDDDDDDDDDDDDDDD")

    await nft.createToken("https://www.mytokenlocation.com");

    console.log(await nft.ownerOf(1), "befor sale");
    // await nft.createToken("https://www.mytokenlocation2.com")
    // await nft.createToken("https://www.mytokenlocation3.com")
    console.log(await nft.getApproved(1), marketAddress);

    console.log(await nft.approve(marketAddress, 1));
    console.log(await nft.ownerOf(1), "after approval");
    // console.log(await nft.getApproved(1), marketAddress)

    console.log("before market item created:::::::::::::::::::::::::::")
    await market.createMarketItemForSale(nftContractAddress, 1, auctionPrice);
    console.log("market item created:::::::::::::::::::::::::::")
    // await market.createMarketItem(nftContractAddress, 2, auctionPrice )
    // await market.createMarketItem(nftContractAddress, 3, auctionPrice )

    // const [_, buyerAddress] = await hre.ethers.getSigners();

    await market
      .connect(buyerAddress)
      .executeMarketSale(nftContractAddress, 1, { value: auctionPrice });

    console.log(await nft.ownerOf(1), "after sale");

    // items = await market.fetchMarketItems()
    // items = await Promise.all(items.map(async i => {
    //   const tokenUri = await nft.tokenURI(i.tokenId)
    //   let item = {
    //     price: i.price.toString(),
    //     tokenId: i.tokenId.toString(),
    //     seller: i.seller,
    //     owner: i.owner,
    //     tokenUri
    //   }
    //   return item
    // }))
    // console.log('items Market items: ', items)

    // await market.cancelSale(1)
    // await market.cancelSale(2)

    // items = await market.fetchMarketItems()
    // items = await Promise.all(items.map(async i => {
    //   const tokenUri = await nft.tokenURI(i.tokenId)
    //   let item = {
    //     itemId: i.itemId.toString(),
    //     price: i.price.toString(),
    //     tokenId: i.tokenId.toString(),
    //     seller: i.seller,
    //     owner: i.owner,
    //     tokenUri
    //   }
    //   return item
    // }))

    // result = await market.idToMarketItem(4)
    // console.log(result)
    // console.log('before cancelling sale items Market items: ', items)

    // await market.createMarketSale(nftContractAddress, 1, auctionPrice)

    // items = await market.fetchMarketItems()
    // items = await Promise.all(items.map(async i => {
    //   const tokenUri = await nft.tokenURI(i.tokenId)
    //   let item = {
    //     itemId: i.itemId.toString(),
    //     price: i.price.toString(),
    //     tokenId: i.tokenId.toString(),
    //     seller: i.seller,
    //     owner: i.owner,
    //     tokenUri
    //   }
    //   return item
    // }))

    // result = await market.idToMarketItem(4)
    // console.log(result)
    // console.log('after cancelling sale items Market items: ', items)

    // items = await market.fetchMyNFTs()
    // items = await Promise.all(items.map(async i => {
    //   const tokenUri = await nft.tokenURI(i.tokenId)
    //   let item = {
    //     price: i.price.toString(),
    //     tokenId: i.tokenId.toString(),
    //     seller: i.seller,
    //     owner: i.owner,
    //     tokenUri
    //   }
    //   return item
    // }))
    // console.log('items My NFTs: ', items)

    // items = await market.fetchItemsCreated()
    // items = await Promise.all(items.map(async i => {
    //   const tokenUri = await nft.tokenURI(i.tokenId)
    //   let item = {
    //     price: i.price.toString(),
    //     tokenId: i.tokenId.toString(),
    //     seller: i.seller,
    //     owner: i.owner,
    //     tokenUri
    //   }
    //   return item
    // }))
    // console.log('items Items created: ', items)
  });
});
