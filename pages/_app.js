import "../styles/globals.css";
import { wrapper } from "../redux/store";
import HomeLayout from "../Layout/HomeLayout";
import { ToastContainer, Bounce, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"

function MyApp({ Component, pageProps }) {

  const ISSERVER = typeof window === "undefined";

  !ISSERVER && window.addEventListener("contextmenu", (e) => e.preventDefault());


  return (
    <>
    <ToastContainer 
    transition={Slide}
    autoClose={3000}
    draggable={false}
    />
    <HomeLayout>
      <Component {...pageProps} />
    </HomeLayout>
    </>
  );
}

export default wrapper.withRedux(MyApp);
