import React from 'react'

export const  Deconnexion = () => {
    window.localStorage.removeItem("token")
    window.localStorage.removeItem("nom")
    window.localStorage.removeItem("prenom")
    window.localStorage.removeItem("role")
    window.location = "/connexion"
    return (
        <div>
        </div>
    )
}

export default Deconnexion;
