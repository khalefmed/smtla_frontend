import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoImg from '@/assets/logo.png'; 

/**
 * Formatage manuel pour garantir un espace standard comme séparateur de milliers
 * et éviter le bug du caractère "/" sur certains navigateurs.
 */
const formatNombre = (valeur) => {
  if (valeur === undefined || valeur === null || valeur === '' || isNaN(valeur)) {
    return valeur; // Retourne la chaîne vide ou le texte tel quel s'il n'est pas numérique
  }
  const num = Number(valeur);
  let [entier, decimal] = num.toFixed(2).split('.');
  entier = entier.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  // On n'affiche les décimales que si elles sont différentes de 00
  return decimal === '00' ? entier : `${entier},${decimal}`;
};

export function generateGeneralReportPdf(reportData) {
  const doc = new jsPDF('l', 'mm', 'a4'); 
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  const smtlaBlue = [52, 126, 196];
  const lightBlue = [235, 245, 255];
  const textGrey = [100, 100, 100];
  const deepBlack = [30, 30, 30];

  // --- 1. EN-TÊTE ---
  try {
    doc.addImage(logoImg, 'PNG', 14, 10, 35, 20);
  } catch (e) {
    console.warn("Logo non chargé");
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(smtlaBlue[0], smtlaBlue[1], smtlaBlue[2]);
  doc.text('SMTLA.SA', pageWidth / 2, 18, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textGrey[0], textGrey[1], textGrey[2]);
  doc.text('SOCIÉTÉ MAURITANIENNE DE TRANSIT-LOGISTIQUE-PÉTROLE', pageWidth / 2, 23, { align: 'center' });
  doc.text('TRANSPORT TERRESTRE ET AÉRIEN', pageWidth / 2, 27, { align: 'center' });

  doc.setDrawColor(smtlaBlue[0], smtlaBlue[1], smtlaBlue[2]);
  doc.setLineWidth(0.5);
  doc.line(60, 30, pageWidth - 60, 30);

  // Titre du Rapport
  doc.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
  doc.roundedRect((pageWidth / 2) - 30, 35, 60, 10, 2, 2, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(deepBlack[0], deepBlack[1], deepBlack[2]);
  doc.text('REPORT GENERAL', pageWidth / 2, 41.5, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`${reportData.navire || 'MV/HL BRILLIANCE'} - NOUAKCHOTT`, pageWidth / 2, 52, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Période du : ${reportData.date || '10 JAN 2026'}`, pageWidth / 2, 57, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(textGrey[0], textGrey[1], textGrey[2]);
  doc.text(`NIF: ${reportData.nif || '01328556'}`, 14, 65);

  // --- 2. TABLEAU PROFESSIONNEL ---
  const tableHead = [['DÉSIGNATION', ...reportData.colonnes.map(c => c.toUpperCase())]];

  const tableBody = reportData.lignes.map(ligne => {
    return [
      { content: ligne.label, styles: { fontStyle: 'bold', fillColor: lightBlue, textColor: smtlaBlue } },
      // Application du formatage sur chaque cellule de données
      ...reportData.colonnes.map(client => formatNombre(ligne.clients[client]) || '')
    ];
  });

  // Ligne de TOTAL
  if (reportData.total) {
    const totalRow = [
      { content: 'TOTAL GLOBAL', styles: { fontStyle: 'bold', fillColor: smtlaBlue, textColor: [255, 255, 255] } },
      ...reportData.colonnes.map(client => ({
        content: formatNombre(reportData.total.clients[client]) || '0',
        styles: { fontStyle: 'bold', fillColor: [240, 240, 240] }
      }))
    ];
    tableBody.push(totalRow);
  }

  autoTable(doc, {
    startY: 70,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    styles: { 
      fontSize: 8, 
      cellPadding: 4, 
      valign: 'middle', 
      halign: 'center', // Centré pour les rapports de données
      overflow: 'linebreak',
      lineColor: [220, 220, 220],
      lineWidth: 0.1
    },
    headStyles: { 
      fillColor: [255, 255, 255], 
      textColor: smtlaBlue, 
      fontStyle: 'bold',
      halign: 'center',
      minCellHeight: 12
    },
    columnStyles: {
      0: { cellWidth: 40, halign: 'left' }, // La désignation reste alignée à gauche
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    }
  });

  // --- 3. PIED DE PAGE ---
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setTextColor(textGrey[0], textGrey[1], textGrey[2]);
  
  const footerLine1 = "Siège social: SOCO BMCI N°0190 Moughata de Tevragh Zeina - Nouakchott - Mauritanie";
  const footerLine2 = "Tél: 24 34 40 01 / 24 34 40 00  |  SOCIÉTÉ MAURITANIENNE DE TRANSIT-LOGISTIQUE-PÉTROLE";
  
  doc.text(footerLine1, pageWidth / 2, footerY, { align: 'center' });
  doc.text(footerLine2, pageWidth / 2, footerY + 5, { align: 'center' });

  doc.text(`Page 1/1`, pageWidth - 20, footerY + 5);

  doc.save(`Report_General_${reportData.navire || 'SMTLA'}.pdf`);
}