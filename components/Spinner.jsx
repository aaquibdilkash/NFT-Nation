const Spinner = ({ title = "", message }) => {
  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      <div className="flex items-center justify-center ">
        <div className="w-40 h-40 border-t-8 border-b-8 border-green-900 rounded-full animate-spin"></div>
        {/* <span className="flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
        </span> */}
      </div>

      <p className="text-lg font-bold text-center px-2">{title}</p>
      <p className="text-lg font-bold text-center px-2">{message}</p>
    </div>
  );
};

export default Spinner;
