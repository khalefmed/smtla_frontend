import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoImg from '@/assets/logo.png'; 
import sigDO from '@/assets/signatures/directeur_operations.png';

/**
 * Génère le Rapport Journalier avec regroupement dynamique et puces
 */
export function generateDailyReportPdf(reportData) {
  const doc = new jsPDF('p', 'mm', 'a4'); 
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
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
  doc.setFont('helvetica', 'normal');
  doc.text(reportData.date || '', pageWidth / 2, 55, { align: 'center' });

  // --- 3. DÉTAILS DES MOUVEMENTS ---
  const clients = reportData.colonnes || [];
  const dayLine = reportData.lignes ? reportData.lignes[0] : null;
  const tableBody = [];

  if (dayLine && dayLine.clients) {
    clients.forEach((client, index) => {
      // Ligne du Nom du Client
      tableBody.push([
        { 
          content: `${index + 1}. ${client.toUpperCase()}:`, 
          styles: { fontStyle: 'bold', fontSize: 11, textColor: deepBlack, padding: [4, 0, 2, 5] } 
        }
      ]);

      const details = dayLine.clients[client];
      let itemsToDisplay = [];

      // Détection robuste et formatage
      if (Array.isArray(details)) {
        itemsToDisplay = details.map(mvt => `${mvt.quantite || '0'} ${mvt.type || ''} ${actionText}`);
      } else if (typeof details === 'object' && details !== null) {
        itemsToDisplay = [`${details.quantite || '0'} ${details.type || ''} ${actionText}`];
      } else if (typeof details === 'string' && details.trim() !== '') {
        itemsToDisplay = [details];
      }

      // Ajout des lignes avec le tiret "-" devant chaque item
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

  let currentY = doc.lastAutoTable.finalY + 10;

  // --- 4. RÉSUMÉ ---
  if (currentY > pageHeight - 70) {
    doc.addPage();
    currentY = 25;
  }

  doc.setDrawColor(200, 200, 200).line(20, currentY, pageWidth - 20, currentY);
  currentY += 10;
  doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(deepBlack[0], deepBlack[1], deepBlack[2]);
  doc.text(`${isSortie ? 'TOTAL OUT OF STOCK' : 'TOTAL DISCHARGING CARGO'}: ${reportData.totalDischarged || '0'}`, 20, currentY); 
  currentY += 8;
  doc.setTextColor(smtlaBlue[0], smtlaBlue[1], smtlaBlue[2]).text(`REMAINING ON BOARD: ${reportData.remainingOnBoard || '---'}`, 20, currentY); 

  // --- 5. SIGNATURE ---
  const signatureY = pageHeight - 65; 
  const signatureText = "Directeur des Opérations";
  const signatureX = pageWidth - doc.getTextWidth(signatureText) - 25;
  doc.setFontSize(10).setTextColor(deepBlack[0], deepBlack[1], deepBlack[2]).setFont('helvetica', 'bold');
  doc.text(signatureText, signatureX, signatureY);

  try {
    doc.addImage(sigDO, 'PNG', signatureX, signatureY + 2, 40, 40);
  } catch (e) {}

  // --- 6. TRAÇABILITÉ ---
  // const yTrace = pageHeight - 25;
  // doc.setFontSize(8).setTextColor(120, 120, 120).setFont('helvetica', 'italic');
  // const createur = (reportData.createur?.prenom && reportData.createur?.nom) 
  //   ? `${reportData.createur.prenom} ${reportData.createur.nom}` : 'Système';
  // doc.text(`Rapport établi par : ${createur}`, 14, yTrace);
  // doc.text(`Document généré le : ${new Date().toLocaleString('fr-FR')}`, 14, yTrace + 4);

  // --- 7. PIED DE PAGE ---
  doc.setFontSize(7).setTextColor(150, 150, 150).setFont('helvetica', 'normal');
  doc.text("Siège social: SOCO BMCI N°0190 Moughata de Tevragh Zeina - Nouakchott - Mauritanie", pageWidth / 2, pageHeight - 10, { align: 'center' });

  doc.save(`Daily_Report_${reportData.mouvementType || 'Export'}.pdf`);
}