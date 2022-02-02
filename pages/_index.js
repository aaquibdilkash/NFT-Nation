import { Feed } from "../components";
import Head from "next/head";
import axios from "axios";
import { basePath } from "../utils/data";

const Home = ({data}) => {
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
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Feed data={data}/>
    </>
  );
};

export default Home;

export const getServerSideProps = async (context) => {
  const { query } = context;
  console.log("inside server side", query);
  const {
    type = "",
    page = "",
    keyword = "",
    category = "",
    owner = "",
    seller = "",
    bids = "",
    saved = "",
    auctionEnded = "",
    feed = "",
    pinId = "",
    userId = "",
    followers = "",
    followings = "",
    collection = "",
    collectionId = "",
    createdBy = "",
    sort = "",
    commented = "",
    postedBy = "",
  } = query;

  const pinLink = `/api/pins?${page ? `page=${page}` : `page=1`}${
    keyword ? `&keyword=${keyword}` : ``
  }${feed ? `&feed=${feed}` : ``}${
    category ? `&category=${category}` : ``
  }${owner ? `&owner=${owner}` : ``}${seller ? `&seller=${seller}` : ``}${
    bids ? `&bids=${userId}` : ``
  }${commented ? `&commented=${userId}` : ``}${
    saved ? `&saved=${userId}` : ``
  }${auctionEnded ? `&auctionEnded=${auctionEnded}` : ``}${
    pinId ? `&ne=${pinId}` : ``
  }${collection ? `&collection=${collectionId}` : ``}${
    postedBy ? `&postedBy=${postedBy}` : ``
  }${createdBy ? `&createdBy=${createdBy}` : ``}${
    sort ? `&sort=${sort}` : ``
  }`;

  const collectionLink = `/api/collections?${page ? `page=${page}` : `page=1`}${
    keyword ? `&keyword=${keyword}` : ``
  }${category ? `&category=${category}` : ``}${
    commented ? `&commented=${userId}` : ``
  }${saved ? `&saved=${userId}` : ``}${
    createdBy ? `&createdBy=${userId}` : ``
  }${sort ? `&sort=${sort}` : ``}`;

  const userLink = `/api/users?${page ? `page=${page}` : `page=1`}${
    keyword ? `&keyword=${keyword}` : ``
  }${followers ? `&followers=${userId}` : ``}${
    followings ? `&followings=${userId}` : ``
  }${sort ? `&sort=${sort}` : ``}`;

  const link =
    type === "collections"
      ? collectionLink
      : type === "users"
      ? userLink
      : pinLink;

    console.log(link, "DDDDDDDDDDDDDDDDDDD")
  // const CancelToken = axios.CancelToken;
  // const source = CancelToken.source();

  const { data } = await axios.get(`${basePath}${link}`, {
    // cancelToken: source.token,
  });

  if (!data) {
    return {
      notFound: true,
    };
  }


  return {
    props: {
      data,
    },
  };
};
