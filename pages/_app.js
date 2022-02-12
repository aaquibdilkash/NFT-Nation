import "../styles/globals.css";
import { wrapper } from "../redux/store";
import HomeLayout from "../Layout/HomeLayout";
import { ToastContainer, Slide } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Router } from "next/router";
import { NAVIGATING_SET } from "../redux/constants/UserTypes";

function MyApp({ Component, pageProps }) {
  const dispatch = useDispatch()

  useEffect(() => {
    const ISSERVER = typeof window === "undefined";

  !ISSERVER &&
    window.addEventListener("contextmenu", (e) => e.preventDefault());
  }, [])

    useEffect(() => {
      const start = () => {
        console.log("start");
        dispatch({
          type: NAVIGATING_SET,
          payload: true
        })
      };
      const end = () => {
        console.log("findished");
        dispatch({
          type: NAVIGATING_SET,
          payload: false
        })
      };
      Router.events.on("routeChangeStart", start);
      Router.events.on("routeChangeComplete", end);
      Router.events.on("routeChangeError", end);
      return () => {
        Router.events.off("routeChangeStart", start);
        Router.events.off("routeChangeComplete", end);
        Router.events.off("routeChangeError", end);
      };
    }, []);

  return (
    <>
    <ToastContainer draggable={false} transition={Slide} autoClose={1500} position="bottom-right"/>
      <HomeLayout>
        <Component {...pageProps} />
      </HomeLayout>
    </>
  );
}

export default wrapper.withRedux(MyApp);
