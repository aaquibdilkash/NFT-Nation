import React, { useState } from "react";
import { faqCategories } from "../utils/faqData";

const activeTab = "drop-shadow-lg sm:px-6 py-3 w-1/2 sm:w-auto justify-center sm:justify-start border-b-2 title-font font-bold bg-themeColor inline-flex items-center leading-none border-indigo-500 text-[#ffffff] tracking-wider rounded-t cursor-pointer"

const inactiveTab = "drop-shadow-lg sm:px-6 py-3 w-1/2 sm:w-auto justify-center sm:justify-start border-b-2 title-font font-semibold bg-gray-100 inline-flex items-center leading-none border-indigo-500 text-indigo-500 tracking-wider rounded-t cursor-pointer"

const faqs = () => {
  const [tab, setTab] = useState("Mint NFT");
  return (
    <div>
      <section className="text-gray-600 body-font">
        <div className="container px-5 py-6 mx-auto flex flex-wrap flex-col">
          <div className="flex mx-auto flex-wrap mb-20">
            {Object.keys(faqCategories).map((item, index) => {
              return (
                <a
                  key={index}
                  onClick={() => {
                    setTab(item);
                  }}
                  className={item === tab ? activeTab : inactiveTab}
                >
                  <div className="w-5 h-5 mr-2">
                    {faqCategories[`${item}`].icon}
                  </div>
                  {item}
                </a>
              );
            })}
          </div>

          <div className="container px-5 py-2 mx-auto flex flex-wrap">
            <div className="flex flex-wrap w-full">
              <div className="lg:w-2/5 md:w-1/2 md:pr-10 md:py-6">
                {faqCategories[`${tab}`]?.data?.map((item, index) => {
                  return (
                    <div key={index} className="flex relative pb-12">
                      <div className="h-full w-10 absolute inset-0 flex items-center justify-center">
                        <div className="h-full w-1 bg-gray-200 pointer-events-none"></div>
                      </div>
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500 inline-flex items-center justify-center text-white relative z-10">
                        <div className="w-5">
                        {item?.icon}
                        </div>
                      </div>
                      <div className="flex-grow pl-4">
                        <h2 className="font-bold title-font text-sm text-gray-900 mb-1 tracking-wider">
                          {item?.title}
                        </h2>
                        <p className="leading-relaxed">{item?.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <img
                className="lg:w-3/5 md:w-1/2 object-cover object-center rounded-lg md:mt-0 mt-12"
                src={faqCategories[`${tab}`].image}
                alt="step"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default faqs;
