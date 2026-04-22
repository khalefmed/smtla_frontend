import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '@/assets/logo.png';
import signatureDG from '@/assets/signatures/directeur_general.png';
import signatureDO from '@/assets/signatures/directeur_operations.png';
import signatureComptable from '@/assets/signatures/comptable.png';

/**
 * Formatage robuste pour les milliers et décimales
 */
const formatPrix = (valeur) => {
  if (valeur === undefined || valeur === null || isNaN(valeur)) return '0,00';
  const num = Number(valeur);
  let [entier, decimal] = num.toFixed(2).split('.');
  entier = entier.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${entier},${decimal}`;
};

export function generateEbPdf(eb) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  const orangeFill = [248, 192, 80];
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

  // --- 3. BLOCS INFOS ---
  const startYInfos = 35;
  autoTable(doc, {
    startY: startYInfos,
    margin: { right: 110 },
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

  autoTable(doc, {
    startY: startYInfos,
    margin: { left: 110 },
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

  // --- 4. TABLEAU DES ITEMS ---
  const currencyLabel = eb.devise || 'MRU';
  const tableHead = [['Désignation', 'Type', 'Montant']];
  const tableBody = eb.items?.map(item => [
    item.libelle || '',
    item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : 'Equipement',
    `${formatPrix(item.montant)} ${currencyLabel}`
  ]) || [];

  tableBody.push([
    { content: 'TOTAL', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold', fillColor: orangeFill } },
    { content: `${formatPrix(montantHT)} ${currencyLabel}`, styles: { fontStyle: 'bold', fillColor: orangeFill } }
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

  // --- 5. RÉCAPITULATIF FINANCIER ---
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 5,
    body: [
      ['RATE OF BCM', '', '', '', 'MONTANT HT', `${formatPrix(montantHT)} ${currencyLabel}`],
      ['1000 XOF', '1 USD', '1 EURO', 'MRU', 'TVA 16%', `${montantTVA > 0 ? formatPrix(montantTVA) : '-'} ${currencyLabel}`],
      [
        eb.devise === 'XOF' ? '1' : '', 
        eb.devise === 'USD' ? '1' : '', 
        eb.devise === 'EURO' ? '1' : '', 
        '1', 
        'MONTANT TTC', 
        `${formatPrix(montantTTC)} ${currencyLabel}`
      ]
    ],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.5 },
    columnStyles: {
      4: { fontStyle: 'bold', fillColor: [240, 240, 240], cellWidth: 35 },
      5: { halign: 'right', fontStyle: 'bold', cellWidth: 40 }
    }
  });

  // --- 6. SIGNATURES (DYNAMIQUE) ---
  let finalYSignatures = doc.lastAutoTable.finalY + 10;

  // Si on est trop proche du bas de page, on passe à la page suivante
  if (finalYSignatures > pageHeight - 70) {
    doc.addPage();
    finalYSignatures = 20;
  }

  console.log(eb);

  autoTable(doc, {
    startY: finalYSignatures, 
    head: [[eb.valideur_type === 'directeur_general' ? 'DIRECTEUR GÉNÉRAL' : 'Directeur des operations', 'FINANCE / COMPTABILITÉ', 'BÉNÉFICIAIRE']],
    body: [['', '', '']], 
    theme: 'grid',
    styles: { minCellHeight: 30, halign: 'center', valign: 'middle', fontSize: 9, fontStyle: 'bold' },
    headStyles: { fillColor: [245, 245, 245], textColor: blackText, lineWidth: 0.1, minCellHeight: 8 },
    didDrawCell: (data) => {
      if (eb.status === 'valide' && data.section === 'body') {
        const imgSize = 25;
        const posX = data.cell.x + (data.cell.width / 2) - (imgSize / 2);
        const posY = data.cell.y + (data.cell.height / 2) - (imgSize / 2);

        try {
          if (data.column.index === 0) {
            doc.addImage(eb.valideur_type === 'directeur_general' ? signatureDG : signatureDO, 'PNG', posX, posY, imgSize, imgSize);
          } else if (data.column.index === 1) {
            doc.addImage(signatureComptable, 'PNG', posX, posY, imgSize, imgSize);
          }
        } catch (e) { /* Signature absente */ }
      }
    }
  });

  // --- 7. TRAÇABILITÉ (DYNAMIQUE) ---
  let yTrace = doc.lastAutoTable.finalY + 5;
  const maxTraceY = pageHeight - 25;
  if (yTrace > maxTraceY) yTrace = maxTraceY;

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'italic');

  const createur = (eb.createur?.prenom && eb.createur?.nom) 
    ? `${eb.createur.prenom} ${eb.createur.nom}` 
    : 'Système';
    
  const dateGen = new Date().toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  doc.text(`Document établi par : ${createur}`, 14, yTrace);
  doc.text(`Document généré le : ${dateGen}`, 14, yTrace + 4);

  // --- 8. PIED DE PAGE FIXE ---
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  doc.text('Siège social : SOCO BMCI N°0190 Moughata de Tevragh Zeina - Nouakchott - Mauritanie', pageWidth / 2, pageHeight - 10, { align: 'center' });

  doc.save(`EB_${eb.reference || 'Export'}.pdf`);
}