import { Feed } from "../components";
import Head from "next/head";

const Home = () => {
  return (
    <>
      <Head>
        <title>Home | NFT Nation</title>
        <meta
          name="description"
          content={`Browse, Mint, Buy or Sell ERC721 based NFT Tokens on NFT Nation which is a Polygon blockchain based Marketplace for trading ERC-21 NFT Tokens with MATIC Tokens`}
        />
        <meta property="og:title" content={`Home | NFT Nation`} />
        <meta
          property="og:description"
          content={`Browse, Mint, Buy or Sell ERC721 based NFT Tokens on NFT Nation which is a Polygon blockchain based Marketplace for trading ERC-21 NFT Tokens with MATIC Tokens`}
        />
        <meta property="og:url" content={`https://nft-nation.vercel.app`} />
        <meta property="og:type" content="website" />
        <link rel="icon" href="./favicon.png" />
      </Head>
      <Feed />
    </>
  );
};

export default Home;
