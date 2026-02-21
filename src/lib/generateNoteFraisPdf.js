import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '@/assets/logo.png';
import signatureDG from '@/assets/signatures/directeur_general.png';
import signatureComptable from '@/assets/signatures/comptable.png';

export function generateNoteFraisPdf(note) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  
  const orangeFill = [248, 192, 80];
  const lightBlueFill = [222, 235, 247];
  const blackText = [0, 0, 0];

  // --- 1. CALCULS (Utilisation des champs du Serializer) ---
  const sommeItems = note.items?.reduce((acc, curr) => acc + Number(curr.montant || 0), 0) || 0;
  const tvaFacteur = note.tva ? 0.16 : 0; // note.tva vient de expression_besoin.tva via le serializer
  const montantHT = sommeItems;
  const montantTVA = sommeItems * tvaFacteur;
  const montantTTC = montantHT + montantTVA;

  const dateFormatted = note.date_creation ? new Date(note.date_creation).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
  const etaFormatted = note.eta ? new Date(note.eta).toLocaleString('fr-FR') : '-';

  // --- 2. EN-TÊTE ---
  try {
    doc.addImage(logo, 'PNG', 14, 10, 40, 20);
  } catch (e) { console.warn("Logo manquant"); }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('NOTE DE FRAIS', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Réf: ${note.reference || ''}`, pageWidth - 14, 25, { align: 'right' }); 
  
  // Référence de l'EB source juste en dessous
  doc.setFontSize(8);
  doc.text(`EB Source: ${note.expression_besoin_reference || 'N/A'}`, pageWidth - 14, 30, { align: 'right' });

  // --- 3. BLOCS INFOS (SYSTÈME MIROIR) ---
  const startYInfos = 35;

  // Tableau GAUCHE : Origine
  autoTable(doc, {
    startY: startYInfos,
    margin: { right: 110 },
    body: [
      ['Date Note', dateFormatted],
      ['Demandeur', note.createur_nom || 'Non précisé'], // Utilise le créateur de la note
      ['Statut', note.status_display || 'En attente'],
      ['Référence EB', note.expression_besoin_reference || '-']
    ],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.2 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 30, fillColor: [245, 245, 245] } }
  });

  // Tableau DROITE : Logistique (Champs directs du serializer)
  autoTable(doc, {
    startY: startYInfos,
    margin: { left: 110 },
    body: [
      ['BL / AWB', note.bl_awb || '-'],
      ['Navire', note.navire || '-'],
      ['ETA', etaFormatted],
      ['Client', note.client_beneficiaire_nom || '-']
    ],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.2 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 30, fillColor: [245, 245, 245] } }
  });

  // --- 4. TABLEAU DES ITEMS ---
  const tableHead = [['Désignation', 'Type', 'Montant']];
  const tableBody = note.items?.map(item => [
    item.libelle || '',
    item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : 'Equipement',
    `${Number(item.montant).toLocaleString()} ${note.devise || 'MRU'}`
  ]) || [];

  tableBody.push([
    { content: 'TOTAL NOTE', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold', fillColor: orangeFill } },
    { content: `${montantHT.toLocaleString()} ${note.devise || 'MRU'}`, styles: { fontStyle: 'bold', fillColor: orangeFill } }
  ]);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: orangeFill, textColor: blackText, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 40, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' }
    }
  });

  // --- 5. RÉCAPITULATIF FINANCIER (6 colonnes) ---
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    body: [
      ['RATE OF BCM', '', '', '', 'MONTANT HT', `${montantHT.toLocaleString()} ${note.devise || 'MRU'}`],
      ['1000 XOF', '1 USD', '1 EURO', 'MRU', 'TVA 16%', `${montantTVA > 0 ? montantTVA.toLocaleString() : '-'} ${note.devise || 'MRU'}`],
      [
        note.devise === 'XOF' ? '1' : '', 
        note.devise === 'DOLLAR' ? '1' : '', // 'DOLLAR' selon votre modèle Django
        note.devise === 'EUR' ? '1' : '', 
        '1', 
        'MONTANT TTC', 
        `${montantTTC.toLocaleString()} ${note.devise || 'MRU'}`
      ]
    ],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.5 },
    columnStyles: {
      4: { fontStyle: 'bold', fillColor: [240, 240, 240], cellWidth: 35 },
      5: { halign: 'right', fontStyle: 'bold', cellWidth: 40 }
    }
  });

  // --- 6. SIGNATURES ---
  autoTable(doc, {
    startY: doc.internal.pageSize.getHeight() - 70, 
    head: [['DIRECTEUR GÉNÉRAL', 'FINANCE / COMPTABILITÉ', 'BÉNÉFICIAIRE']],
    body: [['', '', '']], 
    theme: 'grid',
    styles: { 
      minCellHeight: 30, 
      halign: 'center', 
      valign: 'middle',
      fontSize: 9, 
      fontStyle: 'bold' 
    },
    headStyles: { 
      fillColor: [245, 245, 245], 
      minCellHeight: 8 
    },
    didDrawCell: (data) => {
      if (note.status === 'valide' && data.section === 'body') {
        const imgSize = 25;
        const posX = data.cell.x + (data.cell.width / 2) - (imgSize / 2);
        const posY = data.cell.y + (data.cell.height / 2) - (imgSize / 2);

        try {
          if (data.column.index === 0) {
            doc.addImage(signatureDG, 'PNG', posX, posY, imgSize, imgSize);
          } else if (data.column.index === 1) {
            doc.addImage(signatureComptable, 'PNG', posX, posY, imgSize, imgSize);
          }
        } catch (e) { /* Signature absente */ }
      }
    }
  });

  doc.save(`NoteFrais_${note.reference}.pdf`);
}