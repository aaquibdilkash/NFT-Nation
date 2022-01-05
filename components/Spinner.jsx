
const Spinner = ({ title = "", message }) => {
  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      <div className="flex items-center justify-center ">
        <div className="w-40 h-40 border-t-8 border-b-8 border-green-900 rounded-full animate-spin"></div>
      </div>

      <p className="text-lg font-bold text-center px-2">{title}</p>
      <p className="text-lg font-bold text-center px-2">{message}</p>
    </div>
  );
}

export default Spinner;
