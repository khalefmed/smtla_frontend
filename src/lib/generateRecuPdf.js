// Installation requise: npm install jspdf jspdf-autotable
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '@/assets/logo.png';

// Import des signatures/cachets
import sigComptable from '@/assets/signatures/comptable.png';

/**
 * Formatage des prix sans centimes pour le reçu (standard MRU)
 */
const formatPrix = (valeur) => {
  if (valeur === undefined || valeur === null || isNaN(valeur)) return '0';
  const num = Number(valeur);
  let [entier] = num.toFixed(0).split('.'); 
  entier = entier.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return entier;
};

export const generateRecuPDF = async (facture) => {
  const doc = new jsPDF();
  let yPos = 15;

  // ============== EN-TÊTE ==============
  doc.addImage(logo, 'PNG', 20, yPos - 5, 25, 12);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SMTLA-SA', 105, yPos, { align: 'center' });
  
  yPos += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('SOCIÉTÉ MAURITANIENNE DE TRANSIT-', 105, yPos, { align: 'center' });
  yPos += 4;
  doc.text('LOGISTIQUE-PÉTROLE TRANSPORT TERRESTRE ET AÉRIEN', 105, yPos, { align: 'center' });
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.text(`NIF : 01328566`, 105, yPos, { align: 'center' });

  yPos += 15;
  
  // ============== TITRE DU REÇU ==============
  doc.setFontSize(16);
  doc.text(`Reçu de Paiement N° ${facture.numero_recu || '.......2026'}`, 105, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(10);
  const datePaiement = facture.date_paiement 
    ? new Date(facture.date_paiement).toLocaleDateString('fr-FR') 
    : new Date().toLocaleDateString('fr-FR');
  doc.text(`Nouakchott, le    ${datePaiement}`, 185, yPos, { align: 'right' });

  yPos += 10;

  // ============== TABLEAU DE PAIEMENT (LARGEURS FIXES) ==============
  const tableData = [[
    facture.reference || '---',
    facture.client?.nom || facture.client_nom || '---',
    facture.bl || '---',
    formatPrix(facture.montant_total),
    facture.devise || 'Mru',
    facture.moyen || 'Cash',
    facture.numero_recu || '---'
  ]];

  autoTable(doc, {
    startY: yPos,
    head: [['Facture', 'Client', 'BL', 'Montant', 'Devise', 'Mode de Paiement', 'Référence']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8, halign: 'center', textColor: [0, 0, 0] },
    headStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.1 },
    // Configuration des colonnes pour correspondre aux rectangles du bas
    columnStyles: {
      0: { cellWidth: 25 }, // Facture
      1: { cellWidth: 35 }, // Client
      2: { cellWidth: 30 }, // BL
      3: { cellWidth: 28.5, fontStyle: 'bold' }, // Montant
      4: { cellWidth: 14.5 }, // Devise
      5: { cellWidth: 24.5 }, // Mode
      6: { cellWidth: 24.5, fontSize: 7 }  // Référence
    },
    margin: { left: 14 }
  });

  yPos = doc.lastAutoTable.finalY;

  // ============== LIGNE TOTAL ENCAISSEMENT (ALIGNEMENT CORRIGÉ) ==============
  doc.setFont('helvetica', 'bold');
  
  // Rectangle 1: Somme des colonnes 0, 1 et 2 (25+35+30 = 90)
  doc.rect(14, yPos, 90, 8); 
  doc.text('Total Encaissement', 59, yPos + 5.5, { align: 'center' });
  
  // Rectangle 2: Aligné sur la colonne 3 (Montant)
  doc.rect(104, yPos, 28.5, 8); 
  doc.text(formatPrix(facture.montant_total), 118.25, yPos + 5.5, { align: 'center' });
  
  // Rectangle 3: Aligné sur la colonne 4 (Devise)
  doc.rect(132.5, yPos, 14.5, 8); 
  doc.text(facture.devise || 'Mru', 139.75, yPos + 5.5, { align: 'center' });
  
  // Rectangle 4: Reste du tableau (Colonnes 5 et 6 : 24.5+24.5 = 49)
  doc.rect(147, yPos, 49, 8); 
  
  yPos += 25;

  // ============== SIGNATURES & CACHET ==============
  doc.setFontSize(10);
  doc.text('Service d\'exploitation', 25, yPos);
  doc.text('Service Financier', 150, yPos);

  // Apposition du cachet par défaut (Comptable)
  doc.addImage(sigComptable, 'PNG', 145, yPos + 2, 40, 40);

  doc.setDrawColor(150);
  doc.line(20, yPos + 25, 70, yPos + 25);
  doc.line(140, yPos + 25, 190, yPos + 25);

  // ============== PIED DE PAGE ==============
  const pageHeight = doc.internal.pageSize.height;
  
  doc.setDrawColor(100);
  doc.setLineWidth(0.5);
  doc.line(14, pageHeight - 20, 196, pageHeight - 20);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Siège social : SOCO BMCI N°0190 Moughata de Tevragh Zeina - Nouakchott-Mauritanie', 105, pageHeight - 15, { align: 'center' });
  doc.text('Tél : 24344000/24344001 /', 105, pageHeight - 10, { align: 'center' });

  // Sauvegarde du fichier
  doc.save(`Recu_${facture.reference}.pdf`);
};