// import { useState, React, forwardRef } from "react";

import { useState, forwardRef } from "react";
import Logo from "../assets/logo.png";
import Person from "../assets/icons/person.svg";
import Password from "../assets/icons/password.svg";
import Eye from "../assets/icons/eye.svg";
import EyeSlashed from "../assets/icons/eye_slashed.svg";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { toast, Toaster } from "react-hot-toast";
import Spinner from "@/components/ui/shared/spinner";



function Connexion() {

  const {t} = useTranslation()
  const [nom_utilisateur, setNomUtilisateur] = useState();
  const [mot_de_passe, setMotDePasse] = useState();
  const [en_cours, setEnCours] = useState(false);

  const [show, setShow] = useState(false)

  const connexion = async (e) => {
    e.preventDefault()
    try {
      setEnCours(true)
      const response = await api.post("connexion/", {
        "username" : nom_utilisateur,
        "mot_de_passe" : mot_de_passe
      });
      console.log(response.data.utilisateur.type_display)
      window.localStorage.setItem("token", response.data.token);
      window.localStorage.setItem("prenom", response.data.utilisateur.prenom);
      window.localStorage.setItem("nom", response.data.utilisateur.nom);
      window.localStorage.setItem("role", response.data.utilisateur.type_display);
      window.localStorage.setItem("telephone", response.data.utilisateur.telephone);
      window.localStorage.setItem("groupes", response.data.groupes);
      window.localStorage.setItem("groupes_info", JSON.stringify(response.data.utilisateur.groupes_info));
      window.location = "/";
      
    }
    catch (exception){
      setEnCours(false)
      console.log(exception.response.status)
      if (exception.response.status === 401){
        toast.error(<p className="text-redColor">{t('Mot de passe Incorrecte')}</p>);
      }
      else if (exception.response.status = 404){
        toast.error(<p className="text-redColor">{t('Vous n\'êtes pas autorisés')}</p>);
      }
      else {
        toast.error(<p className="text-redColor">{t('Une erreur s\'est produite')}</p>);
      }
    }
  }


  return (
    <div className="flex flex-col items-center justify-center bg-bgGreyColor h-screen max-md:px-4 px-12 py-12 relative font-arabic ">
        <div className="w-[800px] max-lg:w-fit flex flex-row bg-white rounded-lg shadow-2xl shadow-shadowColor overflow-hidden ">
            <div className="w-[60%] p-10  flex flex-col max-lg:hidden justify-center  bg-gradient-to-b from-buttonGradientSecondary to-buttonGradientPrimary text-white font-normal">
              <h1 className="font-semibold text-3xl h-12">{t('Bienvenue')}</h1>
              <p className="font-light text-bgGreyColor">{t('Connexion text')}</p>
            </div>

            
            <form onSubmit={connexion} className="lg:w-[40%] flex flex-col px-8 py-16 items-center justify-center align-center gap-8 ">
              <img src={Logo}  width={220} className="mb-4" alt="" />
              <div className="flex flex-col gap-3 w-full">
                <div className="flex flex-row gap-2 bg-bgGreyColor px-4 py-3 text-sm w-full font-light rounded-md">
                  <img src={Person} alt="" />
                  <input type="text" value={nom_utilisateur} onChange={(e) => setNomUtilisateur(e.target.value)} placeholder={t("Identifiant")} name="nom_utilisateur" className="outline-none placeholder-inputTextColor bg-inherit" />
                </div>
                <div className="flex flex-row justify-between gap-2 bg-bgGreyColor px-4 py-3 text-sm w-full font-light rounded-md">
                  <div className="flex flex-row  gap-2">
                    <img src={Password} alt="" />
                    <input type={show ? "text" : "password"} value={mot_de_passe} onChange={(e) => setMotDePasse(e.target.value)} placeholder={t("Mot de passe")} name="password" className="outline-none placeholder-inputTextColor bg-inherit" />
                  </div>
                  <img src={show ? EyeSlashed : Eye} onClick={() => {setShow(!show); console.log("Changed")} } width={18} alt="" />
                </div>
                
              </div>
              <div className="w-full flex flex-row align-center items-center justify-center gap-2 cursor-pointer  text-sm font-medium px-4 py-3 bg-gradient-to-b from-buttonGradientSecondary to-buttonGradientPrimary hover:bg-gradient-to-l  text-white font-normal rounded-md ">
                {en_cours ? <Spinner color="white" /> : <></>}
                <input type="submit" onClick={(e) => connexion(e)} value={t("Connexion")} className="cursor-pointer w-full text-white font-medium"/>
                <span></span>
              </div>

            </form>
        </div>
        <Toaster />
    </div>
  );
}

export default Connexion;
