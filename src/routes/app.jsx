'use client'

import { Outlet } from "react-router-dom";
import {useState} from 'react'
import SideBar from "../components/ui/common/menu";
import i18n from "../../i18n"
import { useTranslation } from "react-i18next";
import { Toaster } from "react-hot-toast";
import { Header } from "@/components/ui/common/header";

function HomePage() {

  const {t, i18n} = useTranslation();

  const [visibility, setVisibility] = useState(true);

  const changeVisibility = () => {

    setVisibility(!visibility)

    const sideBar = document.getElementById("sideBar");
    const overlay = document.getElementById("overlay");

    if (visibility){
      sideBar.classList.remove("max-sm:hidden");
      sideBar.classList.add("max-sm:flex");
      sideBar.classList.remove("max-md:hidden");
      sideBar.classList.add("max-md:flex");
      sideBar.classList.remove("max-lg:hidden");
      sideBar.classList.add("max-lg:flex");

      if (overlay){
        overlay.classList.remove("max-sm:hidden");
        overlay.classList.add("max-sm:flex");
        overlay.classList.remove("max-md:hidden");
        overlay.classList.add("max-md:flex");
        overlay.classList.remove("max-lg:hidden");
        overlay.classList.add("max-lg:flex");
      }
    }
    else {
      sideBar.classList.remove("max-sm:flex");
      sideBar.classList.add("max-sm:hidden");
      sideBar.classList.remove("max-md:flex");
      sideBar.classList.add("max-md:hidden");
      sideBar.classList.remove("max-lg:flex");
      sideBar.classList.add("max-lg:hidden");

      if(overlay){
        overlay.classList.remove("max-sm:flex");
        overlay.classList.add("max-sm:hidden");
        overlay.classList.remove("max-md:flex");
        overlay.classList.add("max-md:hidden");
        overlay.classList.remove("max-lg:flex");
        overlay.classList.add("max-lg:hidden");
      }
    }
  }
  return (
    <div
     className={" flex flex-row gap-0  w-[100vw] font-arabic bg-black"}>
      {<div onClick={changeVisibility} id="overlay" className="absolute w-full h-screen bg-overlayColor z-1 lg:hidden max-lg:hidden max-md:hidden max-sm:hidden"></div>}
      <SideBar changeVisibility={changeVisibility}/>
      <div className="w-full flex flex-col gap-10 py-20 max-lg:py-0 bg-bgGreyColor h-screen overflow-y-scroll">
        {/* <Header ouvrir={changeVisibility}  /> */}
        <Outlet  />
      </div>
       
        <Toaster />
      </div>
  );
}

export default HomePage;
