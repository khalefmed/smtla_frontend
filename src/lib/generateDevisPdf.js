// Installation requise: npm install jspdf jspdf-autotable
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '@/assets/logo.png';

// Import des signatures/cachets
import sigDG from '@/assets/signatures/directeur_general.png';
import sigDO from '@/assets/signatures/directeur_operations.png';
import sigComptable from '@/assets/signatures/comptable.png';

// Fonction de conversion de nombre en lettres françaises
const numberToFrenchWords = (num) => {
  if (num === 0) return 'zéro';

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

  let thousand = Math.floor(num / 1000);
  let rest = num % 1000;
  let thouStr = thousand > 1 ? convertHundreds(thousand) + ' mille' : (thousand === 1 ? 'mille' : '');
  let restStr = rest > 0 ? ' ' + convertHundreds(rest) : '';
  let words = (thouStr + restStr).trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

export const generateDevisPDF = async (facture, client) => {
  const doc = new jsPDF();
  
  // Couleurs personnalisées
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
  doc.text('DEVIS', 144, yPos);
  
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
  doc.text('N° DEVIS', 142, yPos + 5);
  doc.text('DATE', 175, yPos + 5);
  
  yPos += 10;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text(facture.reference, 142, yPos + 3);
  const invoiceDate = facture.date_creation ? new Date(facture.date_creation).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
  doc.text(invoiceDate, 175, yPos + 3);
  
  yPos += 10;
  
  // ============== SECTION CLIENT ==============
  doc.setFillColor(...blueHeader);
  doc.rect(14, yPos, 90, 7, 'F');
  doc.rect(105, yPos, 90, 7, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('DEVIS À', 16, yPos + 5);
  doc.text('RÉF CLIENT', 107, yPos + 5);
  
  yPos += 7;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  
  const leftCol = 16;
  const rightCol = 107;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Client :', leftCol, yPos + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(facture.client?.nom || facture.client_nom || '', leftCol + 15, yPos + 5);
  
  doc.setFont('helvetica', 'bold');
  doc.text('NIF', leftCol, yPos + 10);
  doc.setFont('helvetica', 'normal');
  doc.text(facture.client?.nif || '', leftCol + 15, yPos + 10);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Port d\'arrivée :', leftCol, yPos + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(facture.port_arrive || '---', leftCol + 25, yPos + 15);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Vessel', rightCol, yPos + 5);
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

  var yp = 0;

  if (facture.eta != null) {
    doc.setFont('helvetica', 'bold');
    doc.text('ETA', rightCol, yPos + 20);
    doc.setFont('helvetica', 'normal');
    doc.text(facture.eta || '---', rightCol + 20, yPos + 20);

    yp += 5;
  }

  if (facture.eta != null) {
    doc.setFont('helvetica', 'bold');
    doc.text('ETD', rightCol, yPos + 25);
    doc.setFont('helvetica', 'normal');
    doc.text(facture.etd || '---', rightCol + 20, yPos + 25);

    yp += 5;
  }
  
  yPos += 25 + yp;
  
  // ============== TABLEAU DES ITEMS ==============
  const currencyLabel = facture.devise || 'MRU';
  const tableData = facture.items.map(item => [
    item.libelle,
    item.quantite,
    `${Number(item.prix_unitaire).toLocaleString()} ${currencyLabel}`,
    `${Number(item.montant_total).toLocaleString()} ${currencyLabel}`
  ]);
  
  const subtotal = facture.items.reduce((sum, item) => sum + Number(item.montant_total || 0), 0);
  const taxeRate = facture.tva ? 0.16 : 0;
  const taxe = subtotal * taxeRate;
  const total = subtotal + taxe;
  
  autoTable(doc, {
    startY: yPos,
    head: [['DESCRIPTION', 'QTÉ', `PRIX UNITAIRE ${currencyLabel}`, `MONTANT ${currencyLabel}`]],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: blueHeader, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 90 }, 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' } }
  });
  
  yPos = doc.lastAutoTable.finalY + 5;
  
  // ============== TOTAUX ==============
  const xTotaux = 130;
  doc.setFont('helvetica', 'bold');
  doc.text('SOUS-TOTAL', xTotaux, yPos + 4);
  doc.text(`${subtotal.toLocaleString()} ${currencyLabel}`, 195, yPos + 4, { align: 'right' });
  yPos += 6;
  doc.text('TAXE (TVA 16%)', xTotaux, yPos + 4);
  doc.text(`${taxe.toLocaleString()} ${currencyLabel}`, 195, yPos + 4, { align: 'right' });
  yPos += 6;
  doc.setFillColor(...blueHeader);
  doc.rect(xTotaux - 2, yPos, 67, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL DEVIS', xTotaux, yPos + 5);
  doc.text(`${total.toLocaleString()} ${currencyLabel}`, 195, yPos + 5, { align: 'right' });
  
  yPos += 15;
  doc.setTextColor(0, 0, 0);
  const currencyWords = { 'MRU': 'Ouguiyas', 'EUR': 'Euros', 'DOLLAR': 'Dollars', 'XOF': 'Francs CFA' };
  const totalWords = numberToFrenchWords(Math.round(total)) + ' ' + (currencyWords[facture.devise] || 'Ouguiyas');
  doc.setFont('helvetica', 'normal');
  doc.text(`Arrêté le présent devis à la somme de : ${totalWords}`, 14, yPos);

  yPos += 15;

  // ============== SIGNATURES & CACHETS ==============
  doc.setFont('helvetica', 'bold');
  doc.text('Service d\'exploitation', 30, yPos);
  doc.text('Service Financier', 140, yPos);
  
  // Ajout du cachet automatique si validé
  if (facture.status === 'valide') {
    let signatureImg = null;
    switch (facture.valideur.type) {
      case 'directeur_general': signatureImg = sigDG; break;
      case 'directeur_operations': signatureImg = sigDO; break;
      case 'comptable': signatureImg = sigComptable; break;
    }

    if (signatureImg) {
      // Signature placée sous "Service d'exploitation"
      doc.addImage(signatureImg, 'PNG', 25, yPos, 45, 45);
    }
  }
  
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPos + 22, 80, yPos + 22); 
  doc.line(130, yPos + 22, 190, yPos + 22);
  
  yPos += 60;
  
  // ============== PIED DE PAGE ==============
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text('EXCULDING: ALL CUSTOMS DUTIES AND TAXES', 14, yPos);
  
  doc.text('Siège social : SOCO BMCI N°0190 Moughata de Tevragh Zeina - Nouakchott - Mauritanie', 105, pageHeight - 10, { align: 'center' });
  doc.text('Tél : 26 31 98 31 / 31 31 98 31 | NIF : 01328566', 105, pageHeight - 6, { align: 'center' });
  
  doc.save(`${facture.reference}.pdf`);
};