import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '@/assets/logo.png';

export function generateNoteFraisPdf(note) {
  const doc = new jsPDF('l', 'mm', 'a4'); 
  const pageWidth = doc.internal.pageSize.getWidth();
  
  const orangeFill = [248, 192, 80];
  const lightBlueFill = [222, 235, 247];
  const blackText = [0, 0, 0];

  // --- 1. CALCULS DE SÉCURITÉ (Évite le 0 MRU) ---
  const sommeItems = note.items.reduce((acc, curr) => acc + Number(curr.montant || 0), 0);
  const tvaFacteur = note.tva ? 0.16 : 0;
  const montantHT = sommeItems;
  const montantTVA = sommeItems * tvaFacteur;
  const montantTTC = montantHT + montantTVA;

  const dateObj = note.date_creation ? new Date(note.date_creation) : new Date();
  const dateFormatted = isNaN(dateObj.getTime()) ? new Date().toLocaleDateString() : dateObj.toLocaleDateString();

  // --- 2. LOGO ET EN-TÊTE ---
  try {
    doc.addImage(logo, 'PNG', 14, 10, 50, 25);
  } catch (e) { console.warn("Logo manquant"); }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('NOTE DE DEPENSE', 160, 20);
  
  // AJOUT D'ESPACE : On descend la référence de quelques mm (y=28 au lieu de 20)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(note.reference || '', 220, 20); 

  // --- 3. BLOC INFOS ---
  autoTable(doc, {
    startY: 25,
    margin: { left: 180 },
    body: [
      ['Date', dateFormatted],
      ['Nom&Prénom', note.user_name || 'Moustapha Seydina Ali'],
      ['Direction', 'Opération'],
      ['Affectation', 'Bureau siège']
    ],
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 1.5, textColor: blackText, lineColor: [150, 0, 0] },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 35 } }
  });

  // --- 4. TABLEAU DES ITEMS ---
  const categories = [
    { id: 'nourriture', label: 'Nourriture' },
    { id: 'hebergement', label: 'Hebergement' },
    { id: 'medicament', label: 'Medicament' },
    { id: 'carburant', label: 'carburant' },
    { id: 'entretien', label: 'Entretien' },
    { id: 'telecom', label: 'Telecom' },
    { id: 'avance', label: 'Avance' },
    { id: 'divers', label: 'Divers' }
  ];

  const head = [['Désignation', ...categories.map(c => c.label)]];
  const tableBody = note.items.map(item => {
    const row = new Array(9).fill(''); 
    row[0] = item.libelle || '';
    const catIndex = categories.findIndex(c => c.id === item.type);
    if (catIndex !== -1) row[catIndex + 1] = Number(item.montant).toFixed(2);
    return row;
  });

  const totalRow = new Array(9).fill('-');
  totalRow[0] = 'TOTAL';
  categories.forEach((cat, idx) => {
    const sum = note.items
      .filter(i => i.type === cat.id)
      .reduce((acc, curr) => acc + Number(curr.montant || 0), 0);
    totalRow[idx + 1] = sum > 0 ? sum.toLocaleString() : '-';
  });

  autoTable(doc, {
    startY: 65,
    head: head,
    body: [...tableBody, totalRow],
    theme: 'grid',
    styles: { fontSize: 8, halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.1 },
    headStyles: { fillColor: orangeFill, textColor: blackText, fontStyle: 'bold' },
    bodyStyles: { fillColor: lightBlueFill },
    columnStyles: { 0: { halign: 'left', cellWidth: 70, fontStyle: 'bold' } },
    didParseCell: function(data) {
      if (data.row.index === tableBody.length) {
        data.cell.styles.fillColor = orangeFill;
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  let finalY = doc.lastAutoTable.finalY;

  // --- 5. CALCULS RÉELS (Évite le NaN/0) ---
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL : ${montantHT.toLocaleString()} MRU`, pageWidth - 14, finalY + 5, { align: 'right' });

  autoTable(doc, {
    startY: finalY + 10,
    margin: { left: 80 },
    body: [
      ['RATE OF BCM', '', '', '', 'MONTANT HT/MRU', `${montantHT.toLocaleString()} MRU`],
      ['1000 XOF', '1 USD', '1 EURO', 'MRU', 'TVA 16%', `${montantTVA > 0 ? montantTVA.toLocaleString() : '-'} MRU`],
      ['', '', '', '1', 'MONTANT TTC', `${montantTTC.toLocaleString()} MRU`]
    ],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1, textColor: blackText },
    didParseCell: function(data) {
      if (data.column.index >= 4) data.cell.styles.fillColor = [240, 240, 240];
    }
  });

  // --- 6. SIGNATURES ---
  autoTable(doc, {
    startY: doc.internal.pageSize.getHeight() - 60,
    head: [['DG', 'FINANCE', 'BENEFICIAIRE']],
    body: [['', '', '']], 
    theme: 'grid',
    styles: { minCellHeight: 20, halign: 'center', fontSize: 10, fontStyle: 'bold' },
    headStyles: { fillColor: [255, 255, 255], textColor: blackText, lineWidth: 0.2 }
  });

  doc.save(`Note_Frais_${note.reference || 'export'}.pdf`);
}