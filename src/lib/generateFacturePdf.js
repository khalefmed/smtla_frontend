// Installation requise: npm install jspdf jspdf-autotable
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '@/assets/logo.png';

// Import des signatures/cachets
import sigDG from '@/assets/signatures/directeur_general.png';
import sigDO from '@/assets/signatures/directeur_operations.png';
import sigComptable from '@/assets/signatures/comptable.png';

/**
 * Formatage manuel des nombres pour éviter les erreurs de locale (/) 
 * et garantir un espace standard comme séparateur de milliers.
 */
const formatPrix = (valeur) => {
  if (valeur === undefined || valeur === null || isNaN(valeur)) return '0,00';
  const num = Number(valeur);
  let [entier, decimal] = num.toFixed(2).split('.');
  // Ajoute un espace standard tous les 3 chiffres
  entier = entier.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${entier},${decimal}`;
};

// Fonction de conversion de nombre en lettres françaises
const numberToFrenchWords = (num) => {
  if (num === 0) return 'zéro';
  if (!num || isNaN(num)) return '';

  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

  const convertLessThanThousand = (n) => {
    if (n < 20) return units[n];
    let ten = Math.floor(n / 10);
    let unit = n % 10;
    let tenStr = tens[ten];
    let addStr = '';
    if (ten === 7 || ten === 9) {
      tenStr = tens[ten - 1];
      addStr = unit === 0 ? '' : (unit === 1 ? ' et ' : '-') + units[10 + unit];
    } else if (ten === 8) {
      if (unit === 0) tenStr += 's';
      addStr = unit > 0 ? '-' + units[unit] : '';
    } else {
      addStr = unit > 0 ? (unit === 1 ? ' et ' : '-') + units[unit] : '';
    }
    return tenStr + addStr;
  };

  const convertHundreds = (n) => {
    if (n < 100) return convertLessThanThousand(n);
    let hundred = Math.floor(n / 100);
    let rest = n % 100;
    let hundStr = hundred > 1 ? units[hundred] + ' ' : '';
    let centS = (hundred > 1 && rest === 0) ? 's' : '';
    let s = rest > 0 ? ' ' + convertLessThanThousand(rest) : '';
    return hundStr + (hundred >= 1 ? 'cent' + centS : '') + s;
  };

  // Gestion des millions et milliers
  let million = Math.floor(num / 1000000);
  let thousand = Math.floor((num % 1000000) / 1000);
  let rest = Math.floor(num % 1000);

  let milStr = million > 0 ? convertHundreds(million) + (million > 1 ? ' millions' : ' million') : '';
  let thouStr = thousand > 1 ? convertHundreds(thousand) + ' mille' : (thousand === 1 ? 'mille' : '');
  let restStr = rest > 0 ? ' ' + convertHundreds(rest) : '';
  
  let words = (milStr + (milStr && thouStr ? ' ' : '') + thouStr + restStr).trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

export const generateFacturePDF = async (facture) => {
  const doc = new jsPDF();
  const blueHeader = [15, 117, 188]; 
  const lightBlue = [15, 117, 188]; 
  let yPos = 15;
  
  // ============== EN-TÊTE ==============
  doc.addImage(logo, 'PNG', 14, yPos - 10, 30, 15);
  doc.setFontSize(20);
  doc.setTextColor(...lightBlue);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 144, yPos);
  
  yPos += 14;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
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
  doc.text('N° INVOICE', 142, yPos + 5);
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
  doc.text('INVOICE TO', 16, yPos + 5);
  doc.text('CUSTOMER REF', 107, yPos + 5);
  
  yPos += 7;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  
  const leftCol = 16;
  const rightCol = 107;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Client :', leftCol, yPos + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(facture.client?.nom || facture.client_nom || '---', leftCol + 15, yPos + 5);
  doc.setFont('helvetica', 'bold');
  doc.text('NIF', leftCol, yPos + 10);
  doc.setFont('helvetica', 'normal');
  doc.text(facture.client?.nif || '---', leftCol + 15, yPos + 10);
  doc.setFont('helvetica', 'bold');
  doc.text('Adresse', leftCol, yPos + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(facture.client?.adresse || '---', leftCol + 15, yPos + 15);
  doc.setFont('helvetica', 'bold');
  doc.text('Tel', leftCol, yPos + 20);
  doc.setFont('helvetica', 'normal');
  doc.text(facture.client?.telephone || '---', leftCol + 15, yPos + 20);
  doc.setFont('helvetica', 'bold');
  doc.text('Email :', leftCol, yPos + 25);
  doc.setFont('helvetica', 'normal');
  doc.text(facture.client?.email || '---', leftCol + 15, yPos + 25);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Navire', rightCol, yPos + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(facture.vessel || '---', rightCol + 20, yPos + 5);
  doc.setFont('helvetica', 'bold');
  doc.text('Voyage', rightCol, yPos + 10);
  doc.setFont('helvetica', 'normal');
  doc.text(facture.voyage || '---', rightCol + 20, yPos + 10);
  doc.setFont('helvetica', 'bold');
  doc.text('BL NO', rightCol, yPos + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(facture.bl || '---', rightCol + 20, yPos + 15);

  if (facture.type) {
    doc.setFont('helvetica', 'bold');
    doc.text('Type :', rightCol, yPos + 20 );
    doc.setFont('helvetica', 'normal');
    doc.text(facture.type, rightCol + 20, yPos + 20 );
  }
  if (facture.poids) {
    doc.setFont('helvetica', 'bold');
    doc.text('Weight :', rightCol, yPos + 25);
    doc.setFont('helvetica', 'normal');
    doc.text(facture.poids, rightCol + 20, yPos + 25 );
  }
  if (facture.volume) {
    doc.setFont('helvetica', 'bold');
    doc.text('Volume :', rightCol, yPos + 30);
    doc.setFont('helvetica', 'normal');
    doc.text(facture.volume, rightCol + 20, yPos + 30 );
  }
  if (facture.description) {
    doc.setFont('helvetica', 'bold');
    doc.text('Description :', rightCol, yPos + 35);
    doc.setFont('helvetica', 'normal');
    const splitDesc = doc.splitTextToSize(facture.description, 60);
    doc.text(splitDesc, rightCol + 20, yPos + 35);
  }
  
  yPos += 38;
  
  // ============== TABLEAU ==============
  const currencyLabel = facture.devise || 'MRU';
  const tableData = (facture.items || []).map(item => [
    item.libelle,
    item.quantite,
    `${formatPrix(item.prix_unitaire)} ${currencyLabel}`,
    `${formatPrix(Number(item.quantite) * Number(item.prix_unitaire))} ${currencyLabel}`
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
  const currencyWords = { 'MRU': 'Ouguiyas', 'EUR': 'Euros', 'DOLLAR': 'Dollars' };
  const totalWords = numberToFrenchWords(Math.round(total)) + ' ' + (currencyWords[facture.devise] || 'Ouguiyas');
  doc.setFont('helvetica', 'normal');
  doc.text(`The present invoice is fixed at the sum of : ${totalWords}`, 14, yPos);

  yPos += 15;

  // ============== SIGNATURES & CACHETS ==============
  doc.setFont('helvetica', 'bold');
  doc.text('Operations Department', 30, yPos);
  doc.text('Financial Department', 140, yPos);
  
  if (facture.status === 'valide' && facture.valideur) {
    let signatureImg = null;
    switch (facture.valideur.type) {
      case 'directeur_general': signatureImg = sigDG; break;
      case 'directeur_operations': signatureImg = sigDO; break;
      case 'comptable': signatureImg = sigComptable; break;
    }
    if (signatureImg) doc.addImage(signatureImg, 'PNG', 25, yPos + 1, 45, 45);
  }
  
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPos + 22, 80, yPos + 22); 
  doc.line(130, yPos + 22, 190, yPos + 22);
  
  yPos += 50;

  // ============== COMMENTAIRE ==============
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
    yPos += (splitRemarks.length * 5) + 10;
  }
  
  // ============== INFOS BANCAIRES ==============
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Coordonnés bancaires :', 14, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text('Banque : BMCI | IBAN : MR1300010000010485740015102 | SWIFT : MBICMRMRXXX', 14, yPos + 5);
  
  // ============== INFOS CRÉATION ==============
  yPos += 15;
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'italic');
  const createur = (facture.createur?.prenom || '') + ' ' + (facture.createur?.nom || 'Système');
  const now = new Date(facture.date_creation || Date.now());
  const dateGen = now.toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  doc.text(`Created by : ${createur}`, 14, yPos);
  doc.text(`Document generated on : ${dateGen}`, 14, yPos + 4);

  // ============== PIED DE PAGE ==============
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('Siège social : SOCO BMCI N°0190 Moughata de Tevragh Zeina - Nouakchott - Mauritanie', 105, pageHeight - 10, { align: 'center' });
  
  doc.save(`${facture.reference}.pdf`);
};