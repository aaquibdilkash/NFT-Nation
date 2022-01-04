import React from 'react'

const Toast = ({title, message}) => {
    return (
        <>
      <div className="bg-gradient-to-r from-[themeColor] to-secondTheme text-textColor drop-shadow-lg">
        <div className="">
          <h6 className="font-bold">{title}</h6>
        </div>
      </div>
      <div className='text-textColor font-semi-bold'>
          <span>{message}</span>
        </div>
    </>
    )
}

export default Toast