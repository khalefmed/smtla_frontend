import React from 'react'
import Account from "../../../assets/icons/account_image.jpg";
import { useTranslation } from "react-i18next";
import MenuCompte from './popover';
import { FaLanguage } from "react-icons/fa6";
import { RiMenu2Fill, RiMenu3Line } from "react-icons/ri";

export const Header = ({ouvrir}) => {
    const { i18n, t } = useTranslation();

    const switchLanguage = lang => {
        window.localStorage.setItem("lang", lang);
        window.location.reload();
      };

    return (
        <div className='w-full h-[40px] flex flex-row justify-between align-center items-center py-6 px-10 max-md:px-2 max-lg:bg-whiteColor  '>
           
            <div className='h-full w-full flex flex-row justify-between align-center  gap-2 items-center cursor-pointer '>
                {i18n.language == "fr" ?
                <RiMenu2Fill size={20} onClick={ouvrir} className='lg:hidden text-blackColor' />
                :
                <RiMenu3Line size={20} onClick={ouvrir} className='lg:hidden text-blackColor' />
                }
                {
                    i18n.language == "fr" ? 
                    <div onClick={() => switchLanguage("ar")} className="bg-whiteColor text-md max-md:text-xs font-semibold px-4 py-2 max-md:px-2 max-md:py-1 text-blackColor rounded flex gap-2 items-center">
                       <p>العربية</p>
                       <FaLanguage /> 
                    </div>
                    :
                    <div onClick={() => switchLanguage("fr")} className="bg-whiteColor text-md font-semibold px-4 py-2 text-blackColor rounded flex gap-2 items-center">
                       <p>Français</p>
                       <FaLanguage /> 
                    </div>
                }
                <MenuCompte/>
            </div>
        </div>
    )
}
