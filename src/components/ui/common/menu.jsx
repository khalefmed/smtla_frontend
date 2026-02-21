import Logo from "../../../assets/logo.jpeg";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { MyNavLink } from "../shared/navLink";
import {TruckIcon} from "../../icons/truck.jsx";
import { IoHome } from "react-icons/io5";
import { IoMdBusiness } from "react-icons/io";
import { MdCategory, MdGroups } from "react-icons/md";
import { FaArchive, FaTasks, FaUsers } from "react-icons/fa";
import { FaMoneyCheck } from "react-icons/fa";
import { BsBank2 } from "react-icons/bs";
import { ImCancelCircle } from "react-icons/im";
import { FaClipboardList, FaFile, FaMoneyBillWave, FaP, FaPaperclip, FaProductHunt } from "react-icons/fa6";

import { RiDashboardFill } from "react-icons/ri";
import { FaExchangeAlt } from "react-icons/fa";
import { PiStudentFill } from "react-icons/pi";
import { SiGoogleclassroom } from "react-icons/si";
import { FaWallet } from "react-icons/fa";
import { BiSolidCategory } from "react-icons/bi";
import { Dashboard, Logout } from "@mui/icons-material";
import { File, Settings } from "lucide-react";
import { Header } from "./header";
import MenuCompte from "./popover";
import { FaFolder } from "react-icons/fa";
import { aLeRole, hasPermission } from "@/lib/utils";
import { HiNewspaper } from "react-icons/hi2";



function SideBar({changeVisibility}) {
  const { i18n, t } = useTranslation();

  const role = localStorage.getItem("role");

  if(role == null){
    window.location = "/connexion";
  }

  const frenshAnimation =
    "flex flex-col py-[10px] gap-4 w-[250px] bg-whiteColor  h-full text-[12px] overflow-y-scroll z-50 max-lg:absolute max-md:absolute max-sm:absolute transform max-lg:animate-sideBarLeftAnimation max-md:animate-sideLeftBarAnimation max-sm:animate-sideLeftBarAnimation";
  const arabicAnimation =
    "flex flex-col py-[100px] gap-4 w-[250px] font-arabic bg-whiteColor  h-full text-[12px] overflow-y-scroll z-50 max-lg:absolute max-md:absolute max-sm:absolute transform max-lg:animate-sideBarRightAnimation max-md:animate-sideBarRightAnimation max-sm:animate-sideBarRightAnimation";

  return (
    <>
      <div
        id="sideBar"
        className="w-[250px]  max-sm:absolute top-0 left sideBar justify-start h-[100vh] text-textGreyColor font-semibold max-lg:hidden max-sm:hidden max-md:hidden">
        <div
          className={i18n.language == "ar" ? arabicAnimation : frenshAnimation}>
            <div className={`lg-hidden px-10 h-fit flex justify-end text-blackColor`} onClick={changeVisibility}>
              <ImCancelCircle size={25} className="lg:hidden"/>
            </div>

          <div className="flex items-center justify-center">
            <img
              className="w-[90px] h-[90px] aspect-square"
              src={Logo}
              alt="logo images"
            />
          </div>
          <nav className="text-[12px]  pr-10 pl-10">
            <ul className="flex flex-col items-start gap-[15px] mx-auto list-none">
              {/* <MyNavLink route="" label={t("Acceuil")} icon={RiDashboardFill}/> */}
              {/* <MyNavLink route="demandes" label={t("Demandes")} icon={FaTasks}/> */}
              {/* {(aLeRole("numerisation") || aLeRole("validation") || role == 'super-admin') && <MyNavLink route="dossiers" label={t("Dossiers")} icon={FaFolder}/>}
              {role == 'super-admin' && <MyNavLink route="groupes" label={t("Groupes")} icon={MdGroups}/>}
              {(aLeRole("admin") || role == 'super-admin') && <MyNavLink route="types" label={t("Types")} icon={MdCategory}/>}
              {aLeRole("admin") && <MyNavLink route="utilisateurs" label={t("Utilisateurs")} icon={FaUsers}/>}
              {role == 'super-admin' && <MyNavLink route="utilisateurs-admin" label={t("Utilisateurs Admin")} icon={FaUsers}/>} */}
              {<MyNavLink route="" label={t("Dashboard")} icon={RiDashboardFill}/>} 
              {hasPermission("rotations") && <MyNavLink route="rotations" label={t("Rotations")} icon={FaProductHunt}/>} 
              {!hasPermission("expression_besoin") ?  <></> : <MyNavLink route="expression_besoin" label={t("Expression de Besoin")} icon={FaTasks}/>} 
              {!hasPermission("note_frais") ?  <></> : <MyNavLink route="notes_frais" label={t("Notes de Frais")} icon={FaTasks}/>} 
              {hasPermission("devis") && <MyNavLink route="devis" label={t("Devis")} icon={FaFile}/>} 
              {hasPermission("factures") && <MyNavLink route="factures" label={t("Factures")} icon={FaFile}/>} 
              {!hasPermission("bon_commande") ?  <></> : <MyNavLink route="bon_de_commande" label={t("Bon de Commande")} icon={HiNewspaper}/>} 
              {!hasPermission("bad") ?  <></> : <MyNavLink route="bad" label={t("Bons à Délivrer")} icon={HiNewspaper}/>} 
              {(hasPermission("archives")) && <MyNavLink route="archives" label={t("Archives")} icon={FaArchive}/>}
              {hasPermission("clients") && <MyNavLink route="clients" label={t("Clients")} icon={FaUsers}/>} 
              {hasPermission("fournisseurs") && <MyNavLink route="fournisseurs" label={t("Fournisseurs")} icon={FaUsers}/>} 
              {hasPermission("types de materiel") && <MyNavLink route="types" label={t("Types de Materiel")} icon={MdCategory}/>} 




            </ul>
          </nav>


          <div className="px-8">
            <hr />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-row justify-center items-center">
              <MenuCompte/>
            </div>


            <nav className="text-[12px]  pr-10 pl-10">
              <ul className="flex flex-col items-start gap-[15px] mx-auto list-none">
                <MyNavLink route="mot_de_passe" label={t("Parametres")} icon={Settings}/>
                <MyNavLink route="deconnexion" label={t("Deconnexion")} icon={Logout}/>





              </ul>
            </nav>
          </div>

         
        </div>
      </div>
    </>
  );
}
export default SideBar;
