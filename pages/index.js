import { Feed } from "../components";
import Head from "next/head";
import { basePath } from "../utils/data";
// import { basePath, getImage } from "../utils/data";
// import { wrapper } from "../redux/store";
// import axios from "axios";

const Home = ({data = []}) => {
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
        <meta
          property="og:image"
          content={`${basePath}/favicon.png`}
        />
        <meta name="twitter:card" content="summary" />
        <meta property="og:url" content={`${basePath}`} />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Feed data={data}/>
    </>
  );
};

export default Home;

// export const getServerSideProps = wrapper.getServerSideProps(
//   (store) =>
//     async ({ query }) => {

//       const { userReducer } = store.getState();
//       const { user } = userReducer;
//       console.log(user)

//       const {
//         type,
//         page,
//         keyword,
//         category,
//         onSale,
//         bids,
//         saved,
//         auctionEnded,
//         feed,
//         pinId,
//         userId,
//         followers,
//         followings,
//         collection,
//         collectionId,
//         createdBy,
//         sort,
//         commented,
//         postedBy,
//         referred,
//       } = query;

//       const pinLink = `/api/pins?${page ? `page=${page}` : `page=1`}${
//         keyword ? `&keyword=${keyword}` : ``
//       }${feed && user?._id ? `&feed=${user?._id}` : ``}${
//         category ? `&category=${category}` : ``
//       }${onSale ? `&onSale=${userId}` : ``}${
//         bids ? `&bids.user=${userId}` : ``
//       }${commented ? `&comments.user=${userId}` : ``}${
//         saved ? `&saved=${userId}` : ``
//       }${auctionEnded ? `&auctionEnded=${auctionEnded}` : ``}${
//         pinId ? `&ne=${pinId}` : ``
//       }${collection ? `&pinCollection=${collectionId}` : ``}${
//         postedBy ? `&postedBy=${userId ?? user?._id}` : ``
//       }${createdBy ? `&createdBy=${userId ?? user?._id}` : ``}${
//         sort ? `&sort=${sort}` : ``
//       }`;

//       const collectionLink = `/api/collections?${
//         page ? `page=${page}` : `page=1`
//       }${keyword ? `&keyword=${keyword}` : ``}${
//         feed && user?._id ? `&feed=${user?._id}` : ``
//       }${category ? `&category=${category}` : ``}${
//         commented ? `&comments.user=${userId}` : ``
//       }${saved ? `&saved=${userId}` : ``}${
//         createdBy ? `&createdBy=${userId}` : ``
//       }${sort ? `&sort=${sort}` : ``}`;

//       const userLink = `/api/users?${page ? `page=${page}` : `page=1`}${
//         keyword ? `&keyword=${keyword}` : ``
//       }${feed && user?._id ? `&feed=${user?._id}` : ``}${
//         followers ? `&followings=${userId}` : ``
//       }${referred ? `&referred.user=${userId}` : ``}${
//         followings ? `&followers=${userId}` : ``
//       }${sort ? `&sort=${sort}` : ``}`;

//       const link =
//         type === "collections"
//           ? collectionLink
//           : type === "users"
//           ? userLink
//           : pinLink;

//       const { data } = await axios.get(`${basePath}${link}`);

//       if (!data) {
//         return {
//           notFound: true,
//         };
//       }

//       return {
//         props: {
//           data: data.data,
//         },
//       };
//     }
// );
