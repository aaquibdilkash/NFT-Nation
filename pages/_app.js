import '../styles/globals.css'
import {wrapper} from "../redux/store"

function MyApp({ Component, pageProps }) {
  return (
    <div className=''>
    <Component {...pageProps} />
    </div>
  )
}

export default wrapper.withRedux(MyApp)