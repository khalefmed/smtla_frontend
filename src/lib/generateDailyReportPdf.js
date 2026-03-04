import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoImg from '@/assets/logo.png'; 
import sigDO from '@/assets/signatures/directeur_operations.png';

/**
 * Génère le Rapport Journalier (Daily Report) adapté aux Entrées/Sorties
 */
export function generateDailyReportPdf(reportData) {
  const doc = new jsPDF('p', 'mm', 'a4'); 
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  const isSortie = reportData.mouvementType === 'sorties';
  const actionText = isSortie ? 'OUT OF STOCK' : 'CARGO';
  const totalLabel = isSortie ? 'TOTAL OUT OF STOCK' : 'TOTAL DISCHARGING CARGO';

  const smtlaBlue = [52, 126, 196];
  const textGrey = [100, 100, 100];
  const deepBlack = [30, 30, 30];

  // --- 1. EN-TÊTE ---
  try {
    doc.addImage(logoImg, 'PNG', 14, 10, 35, 20);
  } catch (e) { console.warn("Logo manquant"); }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(smtlaBlue[0], smtlaBlue[1], smtlaBlue[2]);
  doc.text('SMTLA.SA', pageWidth / 2, 18, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textGrey[0], textGrey[1], textGrey[2]);
  doc.text('SOCIÉTÉ MAURITANIENNE DE TRANSIT-LOGISTIQUE-PÉTROLE', pageWidth / 2, 23, { align: 'center' });
  doc.text('TRANSPORT TERRESTRE ET AÉRIEN', pageWidth / 2, 27, { align: 'center' });

  doc.setDrawColor(smtlaBlue[0], smtlaBlue[1], smtlaBlue[2]);
  doc.setLineWidth(0.5);
  doc.line(40, 30, pageWidth - 40, 30);

  // --- 2. TITRE DU RAPPORT ---
  doc.setFontSize(18);
  doc.setTextColor(deepBlack[0], deepBlack[1], deepBlack[2]);
  doc.setFont('helvetica', 'bold');
  const mainTitle = isSortie ? 'Daily Report - Out of Stock' : 'Daily Report - Inbound';
  doc.text(mainTitle, pageWidth / 2, 40, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(deepBlack[0], deepBlack[1], deepBlack[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(reportData.date || '', pageWidth / 2, 53, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(textGrey[0], textGrey[1], textGrey[2]);
  doc.text(`NIF: ${reportData.nif || '01328556'}`, 14, 60);

  // --- 3. DÉTAILS DES MOUVEMENTS ---
  let currentY = 75;
  const dayLine = reportData.lignes[0]; 
  const clients = reportData.colonnes;

  doc.setFontSize(11);
  clients.forEach((client, index) => {
    const detail = dayLine.clients[client] || 'No activity';
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(deepBlack[0], deepBlack[1], deepBlack[2]);
    const label = `${index + 1}. ${client}: `;
    doc.text(label, 20, currentY);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textGrey[0], textGrey[1], textGrey[2]);
    const detailText = `${detail} ${actionText} ...`;
    doc.text(detailText, 25 + doc.getTextWidth(label), currentY);
    currentY += 10;
  });

  // --- 4. RÉSUMÉ DES QUANTITÉS ---
  currentY += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, currentY, pageWidth - 20, currentY);
  currentY += 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(deepBlack[0], deepBlack[1], deepBlack[2]);
  doc.text(`${totalLabel}: ${reportData.totalDischarged || '0'}`, 20, currentY); 
  currentY += 8;
  doc.setTextColor(smtlaBlue[0], smtlaBlue[1], smtlaBlue[2]);
  doc.text(`REMAINING ON BOARD: ${reportData.remainingOnBoard || '---'}`, 20, currentY); 

  // --- 5. SECTION SIGNATURE AVEC IMAGE ---
  const signatureY = pageHeight - 55; 
  doc.setFontSize(10);
  doc.setTextColor(deepBlack[0], deepBlack[1], deepBlack[2]);
  doc.setFont('helvetica', 'bold');
  
  const signatureText = "Directeur des Opérations";
  const signatureTextWidth = doc.getTextWidth(signatureText);
  const signatureX = pageWidth - signatureTextWidth - 25;

  doc.text(signatureText, signatureX, signatureY);

  // Ajout de l'image de la signature
  try {
    // addImage(imageData, format, x, y, width, height)
    // On ajuste la taille (ex: 40mm de large) et on centre sous le texte
    doc.addImage(sigDO, 'PNG', signatureX, signatureY + 2, 40, 40);
  } catch (e) {
    console.warn("Signature DO manquante ou invalide");
    // Ligne de secours si l'image ne charge pas
    doc.line(signatureX, signatureY + 2, pageWidth - 25, signatureY + 2);
  }

  // --- 6. PIED DE PAGE ---
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setTextColor(textGrey[0], textGrey[1], textGrey[2]);
  doc.setFont('helvetica', 'normal');
  
  const footerLine1 = "Siège social: SOCO BMCI N°0190 Moughata de Tevragh Zeina - Nouakchott - Mauritanie";
  const footerLine2 = `Tél: 26 31 98 31/31 31 98 31 / RC Nº BP :  |  ${reportData.navire || ''}`;
  
  doc.text(footerLine1, pageWidth / 2, footerY, { align: 'center' });
  doc.text(footerLine2, pageWidth / 2, footerY + 5, { align: 'center' });

  const fileName = `Daily_Report_${reportData.mouvementType}_Day${reportData.dayNumber || ''}.pdf`;
  doc.save(fileName);
}