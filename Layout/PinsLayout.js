import { Navbar } from '../components';

const PinsLayout = ({children, ...pageProps}) => {
  const {searchTerm, setSearchTerm} = pageProps

  return (
    <div className="px-2 md:px-5">
      <div className="bg-gray-50">
        <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
      </div>
      <div className="h-full">
        {children}
      </div>
    </div>
  );
};

export default PinsLayout;
