import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react'
import Account from "../../../assets/icons/account_image.jpg";
import { useTranslation } from "react-i18next";

import { MdAccountCircle, MdEdit } from "react-icons/md";
import { MdPassword } from "react-icons/md";
import { IoLogOut } from "react-icons/io5";

export default function MenuCompte() {

    const { i18n, t } = useTranslation();

    const prenom = window.localStorage.getItem("prenom")
    const nom = window.localStorage.getItem("nom")
    const type = window.localStorage.getItem("role")
  return (
    <div className="flex">
      <div className="">
        <Popover dir='ltr' >
          <PopoverButton className="text-sm/6 font-semibold text-white/50 focus:outline-none  ">
                <div className='flex flex-row justify-end gap-2 items-center cursor-pointer '>
                    <div className='w-[27px] h-[27px] rounded-full'>
                        <img src={Account} height={30}  className="rounded-full border-1 border-blackColor " alt="" />
                    </div>
                    <div className='flex flex-col items-start justify-center align-center gap-0 max-sm:hidden'>
                        <p className='font-semibold text-blackColor text-xs'>{prenom} {nom}</p>
                        <p  className=' font-normal text-textGreyColor text-xs'>{type}</p>
                    </div>
                </div>
          </PopoverButton>
          {/* <Transition
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <PopoverPanel dir='ltr'
              anchor="bottom"
              className="divide-y bg-white rounded-xl   [--anchor-gap:var(--spacing-5)]  shadow-xl font-arabic"
            >
                <div className=' flex flex-col text-sm text-textGreyColor' dir={ i18n.language == "ar" ? 'rtl' : 'ltr'}> 
                    <a href='/profil' className='flex flex-row gap-2 px-4 pt-4 pb-2 hover:text-blackColor hover:bg-bgGreyColor cursor-pointer items-center duratoion-500'>
                        <MdAccountCircle size={20} />
                        <span>{t('Mon profil')}</span>
                    </a>
                    <a href='/mot_de_passe' className='flex flex-row gap-2 px-4 py-3 hover:text-blackColor hover:bg-bgGreyColor cursor-pointer items-center duratoion-500'>
                        <MdPassword size={20} />
                        <span>{t('Mot de passe')}</span>
                    </a>
                    <a href='/modifier_informations' className='flex flex-row gap-2 px-4 py-3 hover:text-blackColor hover:bg-bgGreyColor cursor-pointer items-center duratoion-500'>
                        <MdEdit size={20} />
                        <span>{t('Modifier mes informations')}</span>
                    </a>
                    <a href='/deconnexion' className='flex flex-row gap-2 px-4 pb-4 pt-2 text-redColor hover:bg-bgGreyColor cursor-pointer items-center duratoion-500'>
                        <IoLogOut size={20} />
                        <span>{t('Deconnexion')}</span>
                    </a>
                    
                </div>
              
            </PopoverPanel>
          </Transition> */}
        </Popover>
      </div>
    </div>
  )
}
