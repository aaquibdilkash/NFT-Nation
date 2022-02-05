const Spinner = ({ title = "", message, margin = true }) => {
  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      {/* <div className="flex items-center justify-center ">
        <div className="w-40 h-40 border-t-8 border-b-8 border-green-900 rounded-full animate-spin"></div>
      </div> */}

      <div className="bg-[#ffffff] flex space-x-2 p-5 rounded-full justify-center items-center my-5">
        <div className="bg-[#2563EB] p-2  w-4 h-4 rounded-full animate-bounce blue-circle"></div>
        <div className="bg-[#16A34A] p-2 w-4 h-4 rounded-full animate-bounce green-circle"></div>
        <div className="bg-[#DC2626] p-2  w-4 h-4 rounded-full animate-bounce red-circle"></div>
      </div>

      <p className="text-lg font-bold text-center px-2 mt-2">{title}</p>
      <p className="text-lg font-bold text-center px-2">{message}</p>
    </div>
  );
};

export default Spinner
