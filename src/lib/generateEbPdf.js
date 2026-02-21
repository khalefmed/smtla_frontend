import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '@/assets/logo.png';
import signatureDG from '@/assets/signatures/directeur_general.png';
import signatureComptable from '@/assets/signatures/comptable.png';

export function generateEbPdf(eb) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  
  const orangeFill = [248, 192, 80];
  const lightBlueFill = [222, 235, 247];
  const blackText = [0, 0, 0];

  // --- 1. CALCULS ---
  const sommeItems = eb.items?.reduce((acc, curr) => acc + Number(curr.montant || 0), 0) || 0;
  const tvaFacteur = eb.tva ? 0.16 : 0;
  const montantHT = sommeItems;
  const montantTVA = sommeItems * tvaFacteur;
  const montantTTC = montantHT + montantTVA;

  const dateFormatted = eb.date_creation ? new Date(eb.date_creation).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
  const etaFormatted = eb.eta ? new Date(eb.eta).toLocaleString('fr-FR') : '-';

  // --- 2. EN-TÊTE ---
  try {
    doc.addImage(logo, 'PNG', 14, 10, 40, 20);
  } catch (e) { console.warn("Logo manquant"); }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('EXPRESSION DE BESOIN', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Réf: ${eb.reference || ''}`, pageWidth - 14, 25, { align: 'right' }); 

  // --- 3. BLOCS INFOS (CÔTE À CÔTE) ---
  const startYInfos = 35;

  // Tableau GAUCHE : Origine
  autoTable(doc, {
    startY: startYInfos,
    margin: { right: 110 }, // On laisse de la place à droite
    body: [
      ['Date', dateFormatted],
      ['Demandeur', eb.nom_demandeur || '-'],
      ['Direction', eb.direction || '-'],
      ['Affectation', eb.affectation || '-']
    ],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.2 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 30, fillColor: [245, 245, 245] } }
  });

  // Tableau DROITE : Logistique
  autoTable(doc, {
    startY: startYInfos,
    margin: { left: 110 }, // On commence après le milieu
    body: [
      ['BL / AWB', eb.bl_awb || '-'],
      ['Navire', eb.navire || '-'],
      ['ETA', etaFormatted],
      ['Client', eb.client_beneficiaire_nom || '-']
    ],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.2 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 30, fillColor: [245, 245, 245] } }
  });

  // --- 4. TABLEAU DES ITEMS (FORMAT VERTICAL) ---
  const tableHead = [['Désignation', 'Type', 'Montant']];
  const tableBody = eb.items?.map(item => [
    item.libelle || '',
    item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : 'Equipement',
    `${Number(item.montant).toLocaleString()} ${eb.devise || 'MRU'}`
  ]) || [];

  tableBody.push([
    { content: 'TOTAL', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold', fillColor: orangeFill } },
    { content: `${montantHT.toLocaleString()} ${eb.devise || 'MRU'}`, styles: { fontStyle: 'bold', fillColor: orangeFill } }
  ]);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10, // Se base sur le dernier tableau d'infos
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

  // --- 5. RÉCAPITULATIF RATE OF BCM (6 colonnes) ---
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    body: [
      ['RATE OF BCM', '', '', '', 'MONTANT HT', `${montantHT.toLocaleString()} ${eb.devise || 'MRU'}`],
      ['1000 XOF', '1 USD', '1 EURO', 'MRU', 'TVA 16%', `${montantTVA > 0 ? montantTVA.toLocaleString() : '-'} ${eb.devise || 'MRU'}`],
      [
        eb.devise === 'XOF' ? '1' : '', 
        eb.devise === 'USD' ? '1' : '', 
        eb.devise === 'EURO' ? '1' : '', 
        '1', 
        'MONTANT TTC', 
        `${montantTTC.toLocaleString()} ${eb.devise || 'MRU'}`
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
      textColor: blackText, 
      lineWidth: 0.1,
      minCellHeight: 8 
    },
    didDrawCell: (data) => {
      if (eb.status === 'valide' && data.section === 'body') {
        const imgWidth = 25;
        const imgHeight = 25;
        const posX = data.cell.x + (data.cell.width / 2) - (imgWidth / 2);
        const posY = data.cell.y + (data.cell.height / 2) - (imgHeight / 2);

        try {
          if (data.column.index === 0) {
            doc.addImage(signatureDG, 'PNG', posX, posY, imgWidth, imgHeight);
          } else if (data.column.index === 1) {
            doc.addImage(signatureComptable, 'PNG', posX, posY, imgWidth, imgHeight);
          }
        } catch (e) { /* Signature absente */ }
      }
    }
  });

  doc.save(`EB_${eb.reference || 'Export'}.pdf`);
}