import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoImg from '@/assets/logo.png'; 
import sigDO from '@/assets/signatures/directeur_operations.png';

/**
 * Génère le Rapport Journalier avec gestion intelligente des retours à la ligne
 */
export function generateDailyReportPdf(reportData) {
  const doc = new jsPDF('p', 'mm', 'a4'); 
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  
  const isSortie = reportData.mouvementType === 'sorties';
  const actionText = isSortie ? 'OUT OF STOCK' : 'DISCHARGING';

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
  doc.text(mainTitle, pageWidth / 2, 45, { align: 'center' });
    doc.setFontSize(12);
  doc.text((reportData.navire || ''), pageWidth / 2, 53, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(reportData.date || '', pageWidth / 2, 60, { align: 'center' });

  // --- 3. DÉTAILS DES MOUVEMENTS (TABLEAU) ---
  const clients = reportData.colonnes || [];
  const dayLine = reportData.lignes ? reportData.lignes[0] : null;
  const tableBody = [];

  if (dayLine && dayLine.clients) {
    clients.forEach((client, index) => {
      tableBody.push([
        { 
          content: `${index + 1}. ${client.toUpperCase()}:`, 
          styles: { fontStyle: 'bold', fontSize: 11, textColor: deepBlack, padding: [4, 0, 2, 5] } 
        }
      ]);

      const details = dayLine.clients[client];
      let itemsToDisplay = [];

      if (Array.isArray(details)) {
        itemsToDisplay = details.map(mvt => `${mvt.quantite || '0'} ${mvt.type || ''} ${actionText}`);
      } else if (typeof details === 'string' && details.trim() !== '') {
        itemsToDisplay = details.split('\n');
      }

      if (itemsToDisplay.length > 0) {
        itemsToDisplay.forEach(text => {
          tableBody.push([
            { 
              content: `${text}`, 
              styles: { fontSize: 10, textColor: textGrey, padding: [1, 0, 1, 12] } 
            }
          ]);
        });
      } else {
        tableBody.push([{ content: `      - No activity`, styles: { fontSize: 10, fontStyle: 'italic', padding: [1, 0, 1, 12] } }]);
      }
    });
  }

  autoTable(doc, {
    startY: 65,
    body: tableBody,
    theme: 'plain',
    styles: { overflow: 'linebreak', cellPadding: 1 },
    margin: { left: 15, right: 15 },
  });

  let currentY = doc.lastAutoTable.finalY + 12;

  // --- 4. RÉSUMÉ (AVEC GESTION DU OVERFLOW) ---
  // Sécurité pour éviter de commencer le résumé tout en bas de page
  if (currentY > pageHeight - 60) {
    doc.addPage();
    currentY = 25;
  }

  doc.setDrawColor(220, 220, 220).setLineWidth(0.2);
  doc.line(margin, currentY - 5, pageWidth - margin, currentY - 5);

  // --- TOTAL DISCHARGED / OUT OF STOCK ---
  doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(deepBlack[0], deepBlack[1], deepBlack[2]);
  const totalLabel = `${isSortie ? 'TOTAL OUT OF STOCK' : 'TOTAL DISCHARGING CARGO'}: ${reportData.totalDischarged || '0'}`;
  
  // Split du texte pour s'adapter à la largeur
  const splitTotal = doc.splitTextToSize(totalLabel, maxWidth);
  doc.text(splitTotal, margin, currentY);
  
  // On décale Y selon le nombre de lignes (interligne de 6mm)
  currentY += (splitTotal.length * 6) + 2;

  // --- REMAINING ON BOARD ---
  doc.setFont('helvetica', 'bold').setTextColor(smtlaBlue[0], smtlaBlue[1], smtlaBlue[2]);
  const robLabel = `REMAINING ON BOARD: ${reportData.remainingOnBoard || '---'}`;
  
  const splitRob = doc.splitTextToSize(robLabel, maxWidth);
  doc.text(splitRob, margin, currentY);

  // --- 5. SIGNATURE ---
  const signatureY = pageHeight - 65; 
  const signatureText = "Directeur des Opérations";
  // Calcul dynamique de X pour aligner le texte de signature à droite
  const signatureX = pageWidth - doc.getTextWidth(signatureText) - 25;
  
  doc.setFontSize(11).setTextColor(deepBlack[0], deepBlack[1], deepBlack[2]).setFont('helvetica', 'bold');
  doc.text(signatureText, signatureX, signatureY);

  try {
    // Signature positionnée sous le texte "Directeur des Opérations"
    doc.addImage(sigDO, 'PNG', signatureX, signatureY + 2, 45, 45);
  } catch (e) { console.warn("Signature manquante"); }

  // --- 6. PIED DE PAGE ---
  doc.setFontSize(7).setTextColor(150, 150, 150).setFont('helvetica', 'normal');
  const footerText = "Siège social: SOCO BMCI N°0190 Moughata de Tevragh Zeina - Nouakchott - Mauritanie";
  doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Sauvegarde
  const fileName = `Daily_Report_${isSortie ? 'Sorties' : 'Entrees'}_${reportData.date}.pdf`;
  doc.save(fileName);
}