// Installation requise: npm install jspdf jspdf-autotable
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '@/assets/logo.png';

// Import des signatures/cachets
import sigDG from '@/assets/signatures/directeur_general.png';
import sigDO from '@/assets/signatures/directeur_operations.png';
import sigComptable from '@/assets/signatures/comptable.png';

/**
 * Formatage manuel pour éviter l'erreur du caractère "/" à la place de l'espace
 * et garantir un affichage propre des poids et montants.
 */
const formatNombre = (valeur) => {
  if (valeur === undefined || valeur === null || isNaN(valeur)) return '0,00';
  const num = Number(valeur);
  let [entier, decimal] = num.toFixed(2).split('.');
  entier = entier.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${entier},${decimal}`;
};

export const generateBadPDF = async (bad, client) => {
  console.log("Génération PDF pour le bon de livraison :", bad);
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Configuration des styles
  const mainBlue = [31, 73, 125]; 
  const lightBlue = [70, 107, 143]; 
  const textDark = [44, 62, 80];

  let yPos = 15;

  // ============== EN-TÊTE ==============
  const logoWidth = 45;
  const logoHeight = 22;
  try {
    doc.addImage(logo, 'PNG', 14, yPos, logoWidth, logoHeight);
  } catch (e) {
    console.warn("Logo non chargé");
  }

  doc.setFontSize(40);
  doc.setTextColor(...lightBlue);
  doc.setFont('helvetica', 'bold');
  doc.text('BAD', 196, yPos + 15, { align: 'right' });

  yPos += logoHeight + 5;

  doc.setFillColor(...mainBlue);
  doc.rect(14, yPos, 182, 6, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('DELIVERY ORDER / BON DE LIVRAISON', pageWidth / 2, yPos + 4, { align: 'center' });

  yPos += 12;

  // ============== INFOS SOCIÉTÉ ==============
  doc.setTextColor(...textDark);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('SMTLA-SA', 14, yPos);
  
  const dateStr = bad.date ? new Date(bad.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  doc.text(`Date : ${dateStr}`, 196, yPos, { align: 'right' });

  yPos += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('SOCIETE MAURITANIENNE DE MANUTENTION TRANSPORT LOGISTIQUE ET AFFRETEMENT', 14, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text(`BAD N° : ${bad.reference || 'N/A'} - ${bad.navire || ''}`, 196, yPos, { align: 'right' });

  yPos += 5;
  doc.text('SOCO CITE PLAGE 190 - TEL +222 24 34 40 01 - +222 24 34 40 00', 14, yPos);
  doc.text(`Référence client : ${client?.nom || bad.client_nom || 'CLIENT'}`, 196, yPos, { align: 'right' });

  yPos += 5;
  doc.setDrawColor(200);
  doc.line(14, yPos, 196, yPos);

  yPos += 10;

  // ============== ADRESSE ET PAIEMENT ==============
  doc.setFontSize(9);
  doc.text('À :', 25, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text(client?.nom || bad.client_nom || '', 35, yPos);
  
  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(`ATTN : ${bad.nom_representant || ''}`, 35, yPos);
  yPos += 5;
  doc.text(`Adresse : ${client?.adresse || 'Nouakchott'}`, 35, yPos);
  yPos += 5;
  doc.text(`Téléphone : ${client?.telephone || ''}`, 35, yPos);

  const xFacture = 120;
  let yFacture = yPos - 15;
  
  doc.setFont('helvetica', 'bold');
  doc.text('N° facture payée', xFacture, yFacture);
  doc.setFont('helvetica', 'normal');
  doc.text(`${bad.facture_ref || '---'}`, 170, yFacture);
  
  yFacture += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT FACTURE', xFacture, yFacture);
  doc.text(bad.facture_ref ? 'YES' : 'NO', 175, yFacture);

  yPos += 20;

  // ============== TABLEAU DES ITEMS ==============
  const tableData = bad.items?.map((item, index) => [
    index + 1,
    item.bl,
    item.package_number,
    formatNombre(item.weight) // Utilisation du formateur robuste pour le poids
  ]) || [];

  // Remplissage lignes vides pour l'esthétique
  while (tableData.length < 10) {
    tableData.push(['', '', '', '']);
  }

  autoTable(doc, {
    startY: yPos,
    head: [['ITEMS', 'BL - CONNAISSEMENT', 'PACKAGE', 'WEIGHT (KG)']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: lightBlue, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 8, minCellHeight: 8, textColor: [0, 0, 0] },
    columnStyles: { 
      0: { cellWidth: 15, halign: 'center' }, 
      1: { cellWidth: 85 }, 
      2: { cellWidth: 40, halign: 'center' }, 
      3: { cellWidth: 42, halign: 'right' } 
    }
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // ============== SIGNATURE & CACHET ==============

  let signatureImg = null;
  signatureImg = sigDO


  if (signatureImg) {
    doc.addImage(signatureImg, 'PNG', (pageWidth / 1.3) - 22.5, yPos - 10, 45, 45);
  }
  

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...textDark);
  doc.text('SMTLA-SA', pageWidth / 2, yPos + 10, { align: 'center' });
  
  yPos += 30; 
  
  doc.setFontSize(11);
  doc.text('Nous vous remercions de votre confiance !', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 7;
  doc.setTextColor(...mainBlue);
  doc.setFontSize(9);
  doc.text('WWW.SMTLA-SA.COM', pageWidth / 2, yPos, { align: 'center' });

  // Téléchargement
  doc.save(`BAD_${bad.reference || 'Doc'}.pdf`);
};