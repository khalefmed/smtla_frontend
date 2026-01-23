// Installation requise: npm install jspdf jspdf-autotable

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '@/assets/logo.png';

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

export const generateFacturePDF = async (facture, client) => {
  const doc = new jsPDF();
  
  // Couleurs personnalisées
  const blueHeader = [15, 117, 188]; // Bleu pour les en-têtes
  const lightBlue = [15, 117, 188]; // Bleu clair pour les lignes
  
  let yPos = 15;
  
// ============== EN-TÊTE ==============

// Dimensions du logo
const logoWidth = 30;
const logoHeight = 15;

// Ajouter le logo (PNG ou JPG)
doc.addImage(
  logo,
  'PNG',
  14,          // X (gauche)
  yPos - 10,   // Y (aligné verticalement)
  logoWidth,
  logoHeight
);

// Titre DEVIS (sur la même ligne)
doc.setFontSize(20);
doc.setTextColor(...lightBlue);
doc.setFont('helvetica', 'bold');
doc.text(
  'FACTURE',
  14 + logoWidth + 100, // à droite du logo
  yPos
);
  
  // Informations de l'entreprise
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
  
  // Cadre N° DEVIS et DATE
  yPos += 2;
  doc.setFillColor(...lightBlue);
  doc.rect(140, yPos, 55, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('N° FACTURE', 142, yPos + 5);
  doc.text('DATE', 175, yPos + 5);
  
  yPos += 10;
  doc.setFont('helvetica', 'normal');
  doc.text(facture.reference, 142, yPos + 3);
  const invoiceDate = facture.date_creation ? new Date(facture.date_creation).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
  doc.text(invoiceDate, 175, yPos + 3);
  
  yPos += 10;
  
  // ============== SECTION CLIENT ==============
  // En-tête FACTURER À et RÉF CLIENT
  doc.setFillColor(...blueHeader);
  doc.rect(14, yPos, 90, 7, 'F');
  doc.setFillColor(...blueHeader);
  doc.rect(105, yPos, 90, 7, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURER À', 16, yPos + 5);
  doc.text('RÉF CLIENT', 107, yPos + 5);
  
  yPos += 7;
  
  // Informations client (gauche) et détails logistiques (droite)
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  const leftCol = 16;
  const rightCol = 107;
  
  // Colonne gauche - Client
  doc.setFont('helvetica', 'bold');
  doc.text('Client :', leftCol, yPos + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(client.nom || facture.client_nom, leftCol + 15, yPos + 5);
  
  doc.setFont('helvetica', 'bold');
  doc.text('NIF', leftCol, yPos + 10);
  doc.setFont('helvetica', 'normal');
  doc.text(client.nif || '', leftCol + 15, yPos + 10);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Adresse', leftCol, yPos + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(client.adresse || '', leftCol + 15, yPos + 15);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Tel', leftCol, yPos + 20);
  doc.setFont('helvetica', 'normal');
  doc.text(client.telephone || '', leftCol + 15, yPos + 20);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Email :', leftCol, yPos + 25);
  doc.setFont('helvetica', 'normal');
  doc.text(client.email || '', leftCol + 15, yPos + 25);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Port d\'arrivée :', leftCol, yPos + 30);
  doc.setFont('helvetica', 'normal');
  doc.text(facture.port_arrive || '', leftCol + 25, yPos + 30);
  
  // Colonne droite - Détails logistiques
  const etaDate = facture.eta ? new Date(facture.eta).toLocaleDateString('fr-FR') : '';
  const etdDate = facture.etd ? new Date(facture.etd).toLocaleDateString('fr-FR') : '';
  
  doc.setFont('helvetica', 'bold');
  doc.text('Vessel', rightCol, yPos + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(facture.vessel || '', rightCol + 20, yPos + 5);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Voyage', rightCol, yPos + 10);
  doc.setFont('helvetica', 'normal');
  doc.text(facture.voyage || '', rightCol + 20, yPos + 10);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Port d\'arrivé', rightCol, yPos + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(facture.port_arrive || '', rightCol + 25, yPos + 15);
  
  doc.setFont('helvetica', 'bold');
  doc.text('ETA', rightCol, yPos + 20);
  doc.setFont('helvetica', 'normal');
  doc.text(etaDate, rightCol + 20, yPos + 20);
  
  doc.setFont('helvetica', 'bold');
  doc.text('ETD', rightCol, yPos + 25);
  doc.setFont('helvetica', 'normal');
  doc.text(etdDate, rightCol + 20, yPos + 25);
  
  doc.setFont('helvetica', 'bold');
  doc.text('BL NO', rightCol, yPos + 30);
  doc.setFont('helvetica', 'normal');
  doc.text(facture.bl || '', rightCol + 20, yPos + 30);
  
  yPos += 38;
  
  // ============== TABLEAU DES ITEMS ==============
  const currencyLabel = facture.devise || 'MRU';
  
  // Préparer les données pour le tableau
  const tableData = facture.items.map(item => [
    item.libelle,
    item.quantite,
    `${Number(item.prix_unitaire).toLocaleString()} ${currencyLabel}`,
    `${Number(item.montant_total).toLocaleString()} ${currencyLabel}`
  ]);
  
  // Calculer les totaux
  const subtotal = facture.items.reduce((sum, item) => sum + Number(item.montant_total || 0), 0);
  const taxeRate = facture.tva ? 0.16 : 0;
  const taxe = subtotal * taxeRate;
  const total = subtotal + taxe;
  
  autoTable(doc, {
    startY: yPos,
    head: [[
      'DESCRIPTION',
      'QTÉ',
      `PRIX UNITAIRE ${currencyLabel}`,
      `MONTANT ${currencyLabel}`
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: blueHeader,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' }
    },
    margin: { left: 14, right: 14 }
  });
  
  yPos = doc.lastAutoTable.finalY + 5;
  
  // ============== SECTION REMERCIEMENTS ET TOTAUX ==============
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(41, 98, 255);
  doc.text('Nous vous remercions de votre confiance.', 14, yPos + 5);
  
  // Tableau des totaux
  const xTotaux = 130;
  yPos += 2;
  
  doc.setFillColor(...lightBlue);
  doc.rect(xTotaux, yPos, 40, 6, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('SOUS-TOTAL', xTotaux + 2, yPos + 4);
  doc.text(`${subtotal.toLocaleString()}`, 195, yPos + 4, { align: 'right' });
  
  yPos += 6;
  doc.rect(xTotaux, yPos, 40, 6);
  doc.text('TAUX TVA', xTotaux + 2, yPos + 4);
  doc.text(`${(taxeRate * 100).toFixed(0)}%`, 195, yPos + 4, { align: 'right' });
  
  yPos += 6;
  doc.rect(xTotaux, yPos, 40, 6);
  doc.text('TAXE', xTotaux + 2, yPos + 4);
  doc.text(`${taxe.toLocaleString()}`, 195, yPos + 4, { align: 'right' });
  
  yPos += 6;
  doc.setFillColor(...blueHeader);
  doc.rect(xTotaux, yPos, 40, 7, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL', xTotaux + 2, yPos + 5);
  doc.text(`${total.toLocaleString()} ${currencyLabel}`, 195, yPos + 5, { align: 'right' });
  
  yPos += 12;
  
  // Total en lettres
  const currencyWords = {
    'MRU': 'Ouguiyas',
    'EUR': 'Euros',
    'DOLLAR': 'Dollars',
    'XOF': 'Francs CFA'
  };
  const currency = currencyWords[facture.devise] || 'Ouguiyas';
  const totalWords = numberToFrenchWords(Math.round(total)) + ' ' + currency;
  
  doc.setFillColor(230, 230, 250);
  doc.rect(14, yPos, 180, 8, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`Total T.T.C. ${currencyLabel}`, 16, yPos + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(totalWords, 55, yPos + 5);
  
  yPos += 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('EXCULDING: ALL CUSTOMS DUTIES AND TAXES', 14, yPos);
  
  yPos += 10;
  
  // ============== SIGNATURES ==============
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Service d\'exploitation', 30, yPos);
  doc.text('Service Financier', 140, yPos);
  
  // Ligne de signature
  doc.line(20, yPos + 15, 80, yPos + 15);
  doc.line(130, yPos + 15, 190, yPos + 15);
  
  yPos += 25;
  
  // ============== COORDONNÉES BANCAIRES ==============
  doc.setFont('helvetica', 'bold');
  doc.text('Coordonnés bancaires :', 14, yPos);
  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Banque : BMCI', 14, yPos);
  yPos += 4;
  doc.text('IBAN : MR1300010000010485740015102', 14, yPos);
  yPos += 4;
  doc.text('CODE SWIFT : MBICMRMRXXX', 14, yPos);
  
  // ============== PIED DE PAGE ==============
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text('Siège social : SOCO BMCI N°0190 Moughata de Tevragh Zeina -Nouakchott-Mauritanie', 14, pageHeight - 10);
  doc.text('Tél : 26 31 98 31/31 31 98 31 / RC N° BP :', 14, pageHeight - 6);
  
  // Sauvegarder le PDF
  doc.save(`${facture.reference}.pdf`);
};