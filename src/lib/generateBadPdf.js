// Installation requise: npm install jspdf jspdf-autotable
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '@/assets/logo.png';

// Import des signatures/cachets
import sigDG from '@/assets/signatures/directeur_general.png';
import sigDO from '@/assets/signatures/directeur_operations.png';
import sigComptable from '@/assets/signatures/comptable.png';

export const generateBadPDF = async (bad, client) => {
  console.log("Génération PDF pour le bon de livraison :", bad);
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Configuration des styles
  const mainBlue = [31, 73, 125]; // Bleu foncé SMTLA
  const lightBlue = [70, 107, 143]; // Bleu acier pour les titres
  const textDark = [44, 62, 80];

  let yPos = 15;

  // ============== EN-TÊTE ==============
  const logoWidth = 45;
  const logoHeight = 22;
  try {
    doc.addImage(logo, 'PNG', 14, yPos, logoWidth, logoHeight);
  } catch (e) {
    console.warn("Logo non chargé, espace réservé");
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
  doc.text('SOCIETE MAURITANIENNE DE MANUTENTION TRANSPORT,.....', 14, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text(`BAD N° : ${bad.reference || 'N/A'} - ${bad.navire || ''}`, 196, yPos, { align: 'right' });

  yPos += 5;
  doc.text('SOCO CITE PLAGE 190 - TEL +222243440001 - +22237818387', 14, yPos);
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
  doc.text('Code postal, Ville', 35, yPos);
  yPos += 5;
  doc.text(`Téléphone : ${client?.telephone || ''}`, 35, yPos);

  const xFacture = 120;
  let yFacture = yPos - 20;
  
  doc.setFont('helvetica', 'bold');
  doc.text('N° facture payée', xFacture, yFacture);
  doc.setFont('helvetica', 'normal');
  doc.text(`${bad.facture_ref || '000/'}`, 170, yFacture);
  
  yFacture += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT FACTURE', xFacture, yFacture);
  doc.text(bad.facture_ref ? 'YES' : 'NO', 175, yFacture);

  yPos += 15;

  // ============== TABLEAU DES ITEMS ==============
  const tableData = bad.items?.map((item, index) => [
    index + 1,
    item.bl,
    item.package_number,
    item.weight
  ]) || [];

  while (tableData.length < 12) {
    tableData.push(['', '', '', '']);
  }

  autoTable(doc, {
    startY: yPos,
    head: [['ITEMS', 'BL - CONNAISSEMENT', 'PACKAGE NUMBER', 'WEIGHT KG']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: lightBlue, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 8, minCellHeight: 8, textColor: [0, 0, 0] },
    columnStyles: { 0: { cellWidth: 15, halign: 'center' }, 1: { cellWidth: 85 }, 2: { cellWidth: 40, halign: 'center' }, 3: { cellWidth: 42, halign: 'center' } }
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // ============== SIGNATURE & CACHET ==============
  
  // Positionnement du cachet si validé
  if (bad.status != 'valide') {
    let signatureImg = null;
    // On utilise la structure corrigée : bad.valideur.type
    const userType = bad.valideur?.type;

    switch (userType) {
      case 'directeur_general': signatureImg = sigDG; break;
      case 'directeur_operations': signatureImg = sigDO; break;
      case 'comptable': signatureImg = sigComptable; break;
      default : signatureImg = sigComptable; break;
    }

    if (signatureImg) {
      // Centré horizontalement sur la zone de signature
      // X: (pageWidth/2) - (largeur/2)
      doc.addImage(signatureImg, 'PNG', (pageWidth / 1.3) - 22.5, yPos - 5, 45, 45);
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...textDark);
  doc.text('SMTLA-SA', pageWidth / 2, yPos + 10, { align: 'center' });
  
  yPos += 25; // On descend pour laisser de la place au cachet
  
  doc.setFontSize(11);
  doc.text('Nous vous remercions de votre confiance !', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 7;
  doc.setTextColor(...mainBlue);
  doc.setFontSize(9);
  doc.text('WWW.SMTLA-SA.COM', pageWidth / 2, yPos, { align: 'center' });

  // Téléchargement
  doc.save(`BAD_${bad.reference || 'Doc'}.pdf`);
};