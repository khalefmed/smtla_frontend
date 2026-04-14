// Installation requise: npm install jspdf jspdf-autotable
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '@/assets/logo.png';

// Import des signatures/cachets
import sigDG from '@/assets/signatures/directeur_general.png';
import sigDO from '@/assets/signatures/directeur_operations.png';
import sigComptable from '@/assets/signatures/comptable.png';

/**
 * Formate un nombre de manière robuste pour éviter les caractères spéciaux (/) 
 * sur certains systèmes et navigateurs.
 */
const formatPrix = (valeur) => {
  if (valeur === undefined || valeur === null || isNaN(valeur)) return '0,00';
  
  // Conversion en nombre au cas où c'est un string
  const num = Number(valeur);
  
  // On sépare la partie entière et décimale manuellement pour un contrôle total
  let [entier, decimal] = num.toFixed(2).split('.');
  
  // On ajoute l'espace tous les 3 chiffres pour les milliers (formatage manuel)
  entier = entier.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  
  // On remplace le point par une virgule pour le format FR
  return `${entier},${decimal}`;
};

// Fonction de conversion de nombre en lettres ANGLAISES corrigée
const numberToEnglishWords = (num) => {
  if (num === 0) return 'ZERO';
  if (!num || isNaN(num)) return '';

  const a = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
  const b = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

  const convert = (n) => {
    if (n < 20) return a[Math.floor(n)];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' HUNDRED' + (n % 100 !== 0 ? ' ' + convert(n % 100) : '');
    if (n < 1000000) return convert(Math.floor(n / 1000)) + ' THOUSAND' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
    // Gestion des millions pour éviter le "Undefined"
    if (n < 1000000000) return convert(Math.floor(n / 1000000)) + ' MILLION' + (n % 1000000 !== 0 ? ' ' + convert(n % 1000000) : '');
    return 'LARGE AMOUNT';
  };

  const words = convert(Math.floor(num));
  return words.trim();
};

export const generateDevisPDF = async (facture, client) => {
  const doc = new jsPDF();
  
  const blueHeader = [15, 117, 188]; 
  const lightBlue = [15, 117, 188]; 
  
  let yPos = 15;
  
  // ============== EN-TÊTE ==============
  const logoWidth = 30;
  const logoHeight = 15;
  doc.addImage(logo, 'PNG', 14, yPos - 10, logoWidth, logoHeight);

  doc.setFontSize(20);
  doc.setTextColor(...lightBlue);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTATION', 144, yPos);
  
  yPos += 14;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('SOCIETE MAURITANIENNE DE TRANSIT-LOGISTIQUE-PETROLE', 14, yPos);
  yPos += 5;
  doc.text('TRANSPORT TERRESTRE ET AERIENS', 14, yPos);
  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.text('NIF : 01328566', 14, yPos);
  
  yPos += 2;
  doc.setFillColor(...lightBlue);
  doc.rect(140, yPos, 55, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('N° Quote', 142, yPos + 5);
  doc.text('DATE', 175, yPos + 5);
  
  yPos += 10;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text(facture.reference || '', 142, yPos + 3);
  const invoiceDate = facture.date_creation ? new Date(facture.date_creation).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
  doc.text(invoiceDate, 175, yPos + 3);
  
  yPos += 10;
  
  // ============== SECTION CLIENT ==============
  doc.setFillColor(...blueHeader);
  doc.rect(14, yPos, 90, 7, 'F');
  doc.rect(105, yPos, 90, 7, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Quote to', 16, yPos + 5);
  doc.text('RÉF CUSTOMER', 107, yPos + 5);
  
  yPos += 7;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  
  const leftCol = 16;
  const rightCol = 107;
  var yp = 0; 

  // Colonne Gauche
  doc.setFont('helvetica', 'bold');
  doc.text('Client :', leftCol, yPos + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(facture.client?.nom || facture.client_nom || '---', leftCol + 25, yPos + 5);
  
  doc.setFont('helvetica', 'bold');
  doc.text('NIF :', leftCol, yPos + 10);
  doc.setFont('helvetica', 'normal');
  doc.text(facture.client?.nif || '---', leftCol + 25, yPos + 10);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Arrival PORT :', leftCol, yPos + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(facture.port_arrive || '---', leftCol + 25, yPos + 15);

  if (facture.type) {
    yp += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Type :', leftCol, yPos + 15 + yp);
    doc.setFont('helvetica', 'normal');
    doc.text(facture.type, leftCol + 25, yPos + 15 + yp);
  }

  if (facture.poids) {
    yp += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Weight :', leftCol, yPos + 15 + yp);
    doc.setFont('helvetica', 'normal');
    doc.text(facture.poids, leftCol + 25, yPos + 15 + yp);
  }

  if (facture.description) {
    yp += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Description :', leftCol, yPos + 15 + yp);
    doc.setFont('helvetica', 'normal');
    const splitDesc = doc.splitTextToSize(facture.description, 60);
    doc.text(splitDesc, leftCol + 25, yPos + 15 + yp);
    yp += (splitDesc.length - 1) * 4;
  }

  // Colonne Droite
  var ypRight = 0;
  doc.setFont('helvetica', 'bold');
  doc.text('Vessel :', rightCol, yPos + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(facture.vessel || '---', rightCol + 20, yPos + 5);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Voyage :', rightCol, yPos + 10);
  doc.setFont('helvetica', 'normal');
  doc.text(facture.voyage || '---', rightCol + 20, yPos + 10);
  
  doc.setFont('helvetica', 'bold');
  doc.text('BL NO :', rightCol, yPos + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(facture.bl || '---', rightCol + 20, yPos + 15);

  if (facture.eta) {
    ypRight += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('ETA :', rightCol, yPos + 15 + ypRight);
    doc.setFont('helvetica', 'normal');
    doc.text(facture.eta.replace('T', ' '), rightCol + 20, yPos + 15 + ypRight);
  }

  if (facture.etd) {
    ypRight += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('ETD :', rightCol, yPos + 15 + ypRight);
    doc.setFont('helvetica', 'normal');
    doc.text(facture.etd.replace('T', ' '), rightCol + 20, yPos + 15 + ypRight);
  }

  if (facture.volume) {
    ypRight += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Volume :', rightCol, yPos + 15 + ypRight);
    doc.setFont('helvetica', 'normal');
    doc.text(facture.volume, rightCol + 20, yPos + 15 + ypRight);
  }
  
  yPos += 20 + Math.max(yp, ypRight);
  
  // ============== TABLEAU ==============
  const currencyLabel = facture.devise || 'MRU';
  const tableData = (facture.items || []).map(item => [
    item.libelle,
    item.quantite,
    `${formatPrix(item.prix_unitaire)} ${currencyLabel}`,
    `${formatPrix(Number(item.prix_unitaire) * Number(item.quantite))} ${currencyLabel}`
  ]);
  
  const subtotal = (facture.items || []).reduce((sum, item) => sum + (Number(item.prix_unitaire) * Number(item.quantite) || 0), 0);
  const taxeRate = facture.tva ? 0.16 : 0;
  const taxe = subtotal * taxeRate;
  const total = subtotal + taxe;
  
  autoTable(doc, {
    startY: yPos,
    head: [['DESCRIPTION', 'QTY', `UNIT PRICE ${currencyLabel}`, `TOTAL PRICE ${currencyLabel}`]],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: blueHeader, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 90 }, 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' } }
  });
  
  yPos = doc.lastAutoTable.finalY + 5;
  
  // ============== TOTAUX ==============
  const xTotaux = 130;
  doc.setFont('helvetica', 'bold');
  doc.text('HT TOTAL PRICE', xTotaux, yPos + 4);
  doc.text(`${formatPrix(subtotal)} ${currencyLabel}`, 195, yPos + 4, { align: 'right' });
  yPos += 6;
  doc.text('VAT 16%', xTotaux, yPos + 4);
  doc.text(`${formatPrix(taxe)} ${currencyLabel}`, 195, yPos + 4, { align: 'right' });
  yPos += 6;
  doc.setFillColor(...blueHeader);
  doc.rect(xTotaux - 2, yPos, 67, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('TTC', xTotaux, yPos + 5);
  doc.text(`${formatPrix(total)} ${currencyLabel}`, 195, yPos + 5, { align: 'right' });
  
  yPos += 15;
  doc.setTextColor(0, 0, 0);
  
  // ============== MONTANT EN LETTRES ==============
  const totalWords = numberToEnglishWords(Math.round(total));
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`The present quote is fixed at the sum of : ${totalWords} ${currencyLabel}`, 14, yPos);

  yPos += 20;

  // ============== SIGNATURES & CACHETS ==============
  doc.setFont('helvetica', 'bold');
  doc.text('Operations Department', 30, yPos);
  doc.text('Financial Department', 140, yPos);
  
  if (facture.status === 'valide') {
    let signatureImg = sigDO; 
    if (signatureImg) {
      doc.addImage(signatureImg, 'PNG', 25, yPos + 5, 40, 40);
    }
  }
  
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPos + 45, 80, yPos + 45); 
  doc.line(130, yPos + 45, 190, yPos + 45);
  
  yPos += 55; 
  
  // ============== AJOUT DU COMMENTAIRE ==============
  if (facture.commentaire) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...blueHeader);
    doc.text('Comment', 14, yPos);
    
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    
    const splitRemarks = doc.splitTextToSize(facture.commentaire, 180);
    doc.text(splitRemarks, 14, yPos);
    yPos += (splitRemarks.length * 5) + 5;
  }
  
  // ============== INFOS CRÉATION ==============
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'italic');
  
  const createur = (facture.createur?.prenom) ? `${facture.createur.prenom} ${facture.createur.nom}` : 'System';
  const now = new Date();
  const dateGen = now.toLocaleString('fr-FR');

  doc.text(`Created by : ${createur}`, 14, yPos);
  doc.text(`Document generated on : ${dateGen}`, 14, yPos + 4);

  // ============== PIED DE PAGE ==============
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(0, 0, 0);
  doc.text(facture.is_excluding_customs ? 'EXCLUDING: ALL CUSTOMS DUTIES AND TAXES' : 'INCLUDING: ALL CUSTOMS DUTIES AND TAXES', 14, pageHeight - 20);
  
  doc.setTextColor(150, 150, 150);
  doc.text('Siège social : SOCO BMCI N°0190 Moughata de Tevragh Zeina - Nouakchott - Mauritanie', 105, pageHeight - 10, { align: 'center' });
  doc.text('Tél : 24 34 40 01 / 24 34 40 00 | NIF : 01328566', 105, pageHeight - 6, { align: 'center' });
  
  doc.save(`${facture.reference}.pdf`);
};