import { useState, useEffect } from "react";
import { ListeTransactions } from "@/components/ui/listes/listeTransactions";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import AjouterEtudiant from "@/components/ui/common/ajouterEtudiant";
import AjouterTransaction from "@/components/ui/common/ajouterTransaction";

function Transactions() {
  const { t } = useTranslation();

  const [liste, setListe] = useState([]);
  const [types, setTypes] = useState([]);
  const [comptes, setComptes] = useState([]);

  const [type, setType] = useState("");
  const [compte, setCompte] = useState("");

  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  const [filteredListe, setFilteredListe] = useState([]);

  useEffect(() => {
    getTransactions();
    getTypesAndComptes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [liste, type, compte, dateDebut, dateFin]);

  const getTransactions = async () => {
    try {
      const response = await api.get("transactions/custom");
      setListe(response.data);
    } catch (exception) {
      toast.error(<p className="text-redColor">{t("Une erreur s'est produite")}</p>);
    }
  };

  const getTypesAndComptes = async () => {
    try {
      const comptesData = await api.get("comptes");
      const typesData = await api.get("types");

      setTypes(typesData.data);
      setComptes(comptesData.data);

    } catch (exception) {
      toast.error(<p className="text-redColor">{t("Une erreur s'est produite")}</p>);
    }
  };

  /* --------------------- FILTRAGE COMPLET --------------------- */
  const applyFilters = () => {
    let results = [...liste];

    if (type !== "") {
      results = results.filter((item) => item.type.id === parseInt(type));
    }

    if (compte !== "") {
      results = results.filter((item) => item.compte.id === parseInt(compte));
    }

    if (dateDebut !== "") {
      results = results.filter((item) => new Date(item.date) >= new Date(dateDebut));
    }

    if (dateFin !== "") {
      results = results.filter((item) => new Date(item.date) <= new Date(dateFin));
    }

    setFilteredListe(results);
  };

  const handleExport = (format) => {
    if (format === "pdf") exportPDF();
    if (format === "excel") exportExcel();
  };

  /* --------------------- EXPORT PDF --------------------- */
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Liste des Transactions", 14, 16);

    const tableColumn = ["Montant", "Type", "Compte", "Date"];
    const tableRows = [];

    filteredListe.forEach((item) => {
      tableRows.push([
        item.type.is_debiteur ? `- ${item.montant} MRU` : `+ ${item.montant} MRU`,
        item.type.nom_type,
        item.compte.nom_compte,
        item.date,
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("transactions.pdf");
  };

  /* --------------------- EXPORT EXCEL --------------------- */
  const exportExcel = () => {
    const rows = filteredListe.map((item) => ({
      Montant: item.type.is_debiteur ? `- ${item.montant} MRU` : `+ ${item.montant} MRU`,
      Type: item.type.nom_type,
      Compte: item.compte.nom_compte,
      Date: item.date,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(new Blob([excelBuffer]), "transactions.xlsx");
  };

  return (
    <div className="flex flex-col gap-10 px-10 max-sm:px-4">
      <div>
        <h1 className="font-bold text-2xl text-blackColor">Transactions</h1>
        <p className="text-textGreyColor font-medium">
          Page de gestion des transactions
        </p>
      </div>

      <div className="w-full px-6 py-4 bg-white rounded-lg flex flex-row justify-between">
        <div className="flex flex-row gap-2">

          {/* FILTRE TYPE */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-4 py-2 w-full bg-inputFieldColor rounded-lg outline-none"
          >
            <option value="">{t("Type")}</option>
            {types.map((c) => (
              <option key={c.id} value={c.id}>{c.nom_type}</option>
            ))}
          </select>

          {/* FILTRE COMPTE */}
          <select
            value={compte}
            onChange={(e) => setCompte(e.target.value)}
            className="px-4 py-2 w-full bg-inputFieldColor rounded-lg outline-none"
          >
            <option value="">{t("Compte")}</option>
            {comptes.map((c) => (
              <option key={c.id} value={c.id}>{c.nom_compte}</option>
            ))}
          </select>

          {/* DATE DEBUT */}
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="px-4 py-2 w-full bg-inputFieldColor rounded-lg outline-none"
          />

          {/* DATE FIN */}
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="px-4 py-2 w-full bg-inputFieldColor rounded-lg outline-none"
          />

          {/* EXPORT */}
          <select
            onChange={(e) => handleExport(e.target.value)}
            className="px-4 py-2 w-full bg-inputFieldColor rounded-lg outline-none text-blackColor"
          >
            <option value="">{t("Exporter")}</option>
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
          </select>
        </div>

        <AjouterTransaction/>
      </div>

      {filteredListe && (
        <ListeTransactions donnees={filteredListe} setDonnees={setListe} />
      )}
    </div>
  );
}

export default Transactions;