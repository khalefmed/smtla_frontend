import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoImg from '@/assets/logo.png'; 

const formatNombre = (valeur) => {
  if (valeur === undefined || valeur === null || valeur === '' || isNaN(valeur)) {
    return valeur;
  }
  const num = Number(valeur);
  let [entier, decimal] = num.toFixed(2).split('.');
  entier = entier.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return decimal === '00' ? entier : `${entier},${decimal}`;
};

/**
 * Compte le nombre exact de rotations (lignes/opérations d'expédition distinctes)
 * Exemple : "21 CAMION\n43 PIPES" -> compte pour 2 rotations.
 */
const calculerTotalRotations = (reportData) => {
  if (typeof reportData?.total_rotations === 'number' && reportData.total_rotations > 0) {
    return reportData.total_rotations;
  }

  const lignes = reportData?.lignes || [];
  const colonnes = reportData?.colonnes || [];
  let nombreTotalRotations = 0;

  lignes.forEach(ligne => {
    if (ligne.clients) {
      colonnes.forEach(clientKey => {
        const contenu = ligne.clients[clientKey];
        if (contenu) {
          if (typeof contenu === 'number' && contenu > 0) {
            // Un nombre direct équivaut à 1 rotation/opération
            nombreTotalRotations += 1;
          } else if (typeof contenu === 'string') {
            // Sépare par saut de ligne pour obtenir chaque élément/rotation individuel
            const elements = contenu.split(/\n|\r/);
            elements.forEach(item => {
              // Si la ligne contient du texte non vide (ex: "21 CAMION" ou "43 PIPES")
              if (item.trim().length > 0) {
                nombreTotalRotations += 1;
              }
            });
          }
        }
      });
    }
  });

  return nombreTotalRotations;
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

  // --- CALCUL & AFFICHAGE DU NOMBRE TOTAL DE ROTATIONS ---
  const totalRotationsValeur = calculerTotalRotations(reportData);
  const totalRotationsFormate = formatNombre(totalRotationsValeur);
  
  doc.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
  doc.setDrawColor(smtlaBlue[0], smtlaBlue[1], smtlaBlue[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, 67, 85, 8, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(smtlaBlue[0], smtlaBlue[1], smtlaBlue[2]);
  doc.text(`Nombre total de rotations : ${totalRotationsFormate}`, 18, 72.2);

  // --- 2. TABLEAU PROFESSIONNEL ---
  const tableHead = [['DÉSIGNATION', ...reportData.colonnes.map(c => c.toUpperCase())]];

  const tableBody = reportData.lignes.map(ligne => {
    return [
      { content: ligne.label, styles: { fontStyle: 'bold', fillColor: lightBlue, textColor: smtlaBlue } },
      ...reportData.colonnes.map(client => {
        const val = ligne.clients[client];
        return typeof val === 'number' ? formatNombre(val) : (val || '');
      })
    ];
  });

  // Ligne de TOTAL
  if (reportData.total) {
    const totalRow = [
      { content: 'TOTAL GLOBAL', styles: { fontStyle: 'bold', fillColor: smtlaBlue, textColor: [255, 255, 255] } },
      ...reportData.colonnes.map(client => ({
        content: reportData.total.clients[client] || '',
        styles: { fontStyle: 'bold', fillColor: [240, 240, 240] }
      }))
    ];
    tableBody.push(totalRow);
  }

  autoTable(doc, {
    startY: 78,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    styles: { 
      fontSize: 8, 
      cellPadding: 4, 
      valign: 'middle', 
      halign: 'center',
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
      0: { cellWidth: 40, halign: 'left' },
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