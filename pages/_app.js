import "../styles/globals.css";
import { wrapper } from "../redux/store";
import HomeLayout from "../Layout/HomeLayout";

function MyApp({ Component, pageProps }) {

  const ISSERVER = typeof window === "undefined";

  !ISSERVER && window.addEventListener("contextmenu", (e) => e.preventDefault());


  return (
    <HomeLayout>
      <Component {...pageProps} />
    </HomeLayout>
  );
}

export default wrapper.withRedux(MyApp);
