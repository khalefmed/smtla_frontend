// Installation requise: npm install jspdf jspdf-autotable
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '@/assets/logo.png';

// Import des signatures/cachets
import sigDG from '@/assets/signatures/directeur_general.png';
import sigDO from '@/assets/signatures/directeur_operations.png';
import sigComptable from '@/assets/signatures/comptable.png';

export const generateBCPDF = async (bc, fournisseur) => {
  const doc = new jsPDF();

  console.log("Génération PDF pour le bon de commande :", bc);
  
  const greyLight = [240, 240, 240];
  const greyDark = [100, 100, 100];
  let yPos = 20;

  // ============== 1. TITRE PRINCIPAL ==============
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('BON DE COMMANDE', 105, yPos, { align: 'center' });
  
  yPos += 15;

  // ============== 2. INFOS SOCIÉTÉ SMTLA ==============
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Société : SMTLA', 14, yPos);
  
  doc.setFont('helvetica', 'normal');
  yPos += 6;
  doc.text('Adresse : SOCO BMCI N°0190, Nouakchott, Mauritanie', 14, yPos);
  yPos += 6;
  doc.text('Téléphone : 24 34 40 10 - 24 34 40 10', 14, yPos);
  yPos += 6;
  doc.text('E-mail : infos@smtla-sa.com', 14, yPos);

  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.text(`Bon de commande N° : ${bc.reference || 'SMTLA/BC/_______/2026'}`, 14, yPos);
  yPos += 6;
  const dateBC = bc.date ? new Date(bc.date).toLocaleDateString('fr-FR') : '__ / __ / 2026';
  doc.text(`Date : ${dateBC}`, 14, yPos);

  yPos += 15;

  // ============== 3. SECTION FOURNISSEUR ==============
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bolditalic');
  doc.text('FOURNISSEUR', 14, yPos);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPos += 8;

  doc.text(`Raison sociale : ${bc.fournisseur.nom || '...........................................'}`, 14, yPos);
  yPos += 6;
  doc.text(`Adresse : ${bc.fournisseur.adresse || '...................................................'}`, 14, yPos);
  yPos += 6;
  doc.text(`Téléphone : ${bc.fournisseur.telephone || '...........................................'}`, 14, yPos);
  yPos += 6;
  doc.text(`E-mail : ${bc.fournisseur.email || '......................................................'}`, 14, yPos);

  yPos += 15;

  // ============== 4. OBJET DE LA COMMANDE ==============
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bolditalic');
  doc.text('OBJET DE LA COMMANDE', 14, yPos);
  
  doc.setFont('helvetica', 'normal');
  yPos += 4;
  doc.text(bc.objet_commande || '', 14, yPos);

  yPos += 10;

  // ============== 5. TABLEAU DES ARTICLES ==============
  const currency = bc.devise || 'MRU';
  const totalHT = bc.items.reduce((sum, item) => sum + (item.prix_unitaire * item.quantite), 0);
  const tva = totalHT * 0.16;
  const totalTTC = totalHT + tva;

  const tableRows = bc.items.map((item, index) => [
    index + 1,
    item.libelle,
    item.quantite,
    Number(item.prix_unitaire).toLocaleString(),
    Number(item.prix_unitaire * item.quantite).toLocaleString()
  ]);

  tableRows.push([{ content: 'TOTAL HT', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } }, '', totalHT.toLocaleString()]);
  tableRows.push([{ content: 'TVA (16%)', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } }, '', tva.toLocaleString()]);
  tableRows.push([{ content: 'TOTAL TTC', colSpan: 3, styles: { fontStyle: 'bold', fillColor: [240, 240, 240], halign: 'right' } }, '', { content: totalTTC.toLocaleString() + ' ' + currency, styles: { fontStyle: 'bold' } }]);

  autoTable(doc, {
    startY: yPos,
    head: [['N°', 'Désignation', 'Quantité', 'Prix unitaire', 'Montant']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
    styles: { fontSize: 9, lineColor: [0, 0, 0], lineWidth: 0.1 },
    columnStyles: { 0: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'right' }, 4: { halign: 'right' } }
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // ============== 6. SECTION VALIDATION ==============
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bolditalic');
  doc.text('VALIDATION', 14, yPos);
  yPos += 5;

  autoTable(doc, {
    startY: yPos,
    head: [['Pour SMTLA', 'Pour le fournisseur']],
    body: [
      ['Nom / Fonction :', 'Nom / Fonction :'],
      [{ content: 'Signature & Cachet :', styles: { minCellHeight: 40 } }, 'Signature & Cachet :']
    ],
    theme: 'grid',
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
    styles: { lineColor: [0, 0, 0], lineWidth: 0.1, fontSize: 10 }
  });

  // RÉCUPÉRATION DE LA POSITION POUR LE CACHET DANS LE TABLEAU
  const finalYTable = doc.lastAutoTable.finalY;
  const stampY = finalYTable - 40; // On remonte un peu à l'intérieur de la cellule de signature

  // Ajout du cachet automatique pour SMTLA si le bon est validé
  if (bc.status === 'valide') {
    console.log(bc.valideur.type)
    let signatureImg = null;
    // On utilise bc.valideur.type selon votre correction précédente
    const userType = bc.valideur.type;

    switch (userType) {
      case 'directeur_general': signatureImg = sigDG; break;
      case 'directeur_operations': signatureImg = sigDO; break;
      case 'comptable': signatureImg = sigComptable; break;
    }

    if (signatureImg) {
      // Placement à gauche (sous Pour SMTLA)
      // X: 25, Y: stampY, Largeur: 40, Hauteur: 40
      doc.addImage(signatureImg, 'PNG', 35, stampY, 50, 50);
    }
  }

  // Sauvegarder
  doc.save(`BC_${bc.reference || 'PROVISOIRE'}.pdf`);
};