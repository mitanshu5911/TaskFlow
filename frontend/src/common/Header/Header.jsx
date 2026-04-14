import React, { useEffect, useState } from 'react'
import SmallDesktop from './smallDesktop';
import LargeDesktop from './LargeDesktop';

const Header = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth<768);
    
    useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    }


    window.addEventListener("resize", handleResize);
    return ()=> window.removeEventListener("resize", handleResize);
  },[]);
  return (
    <>
    {isMobile ? <SmallDesktop/> : <LargeDesktop/>}
    </>
  )
}

export default Header