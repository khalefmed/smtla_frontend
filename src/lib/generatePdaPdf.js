import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '@/assets/logo.png';
import sigDG from '@/assets/signatures/directeur_general.png';
import sigDO from '@/assets/signatures/directeur_operations.png';

export const generatePDAPDF = async (pda) => {
  const doc = new jsPDF();
  let yPos = 20;
  const lightGray = [240, 240, 240]; 
  const currency = pda.currency || 'EUR';
  const days = Number(pda.number_of_days || 1);

  // ============== EN-TÊTE ==============
  doc.addImage(logo, 'PNG', 14, 10, 35, 18); 
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('SOCIETE MAURITANIENNE DE TRANSIT-LOGISTIQUE-PETROLE', 55, 15);
  doc.text('TRANSPORT TERRESTRE ET AERIEN', 55, 20);
  doc.setFont('helvetica', 'normal');
  doc.text('NIF : 01328566', 55, 25); 

  const dateStr = new Date().toLocaleDateString('en-GB');
  doc.text(`Nouakchott, le ${dateStr}`, 150, 25);

  yPos = 35;
  doc.setLineWidth(0.5);
  doc.rect(70, yPos, 70, 8);
  doc.setFont('helvetica', 'bold');
  doc.text(`PDA N°: ${pda.pda_number || '---'} - TBN`, 105, yPos + 6, { align: 'center' });

  yPos += 15;

  // ============== INFOS CLIENT & NAVIRE ==============
  const infoData = [
    ['Customer:', pda.client?.nom || pda.client_nom || '---'],
    ['Phone:', pda.client?.telephone || '---'],
    ['Email:', pda.client?.email || pda.client_email || '---'],
    ['Port d\'arrivée:', pda.port_of_arrival || 'NOUAKCHOTT'],
    ['Vessel:', pda.vessel_name || '---'],
    ['Stay Duration:', `${days} Days`],
    ['Cargo:', pda.cargo_description || 'AS PER CARGO LIST ATTACHED'],
    ['Weight:', pda.weight || '----'],
    ['Trip Number:', pda.voyage || '----']
  ]; 

  infoData.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), 45, yPos);
    yPos += 5;
  });

  yPos += 5;

  // ============== TABLEAUX PAR CATÉGORIES ==============
  const categories = [
    { id: 'PORT_DUES', label: 'PORTS DUES' },
    { id: 'OTHER_EXPENSES', label: 'OTHER EXPENSES' },
    { id: 'STEVEDORING', label: 'STEVEDORING/HANDLING ON BOARD' }
  ];

  let grandTotal = 0;

  categories.forEach(cat => {
    const items = pda.items.filter(i => i.category === cat.id);
    if (items.length === 0) return;

    let headers = [];
    let tableData = [];
    let colStyles = {};

    if (cat.id === 'PORT_DUES') {
      // Configuration 4 colonnes spécifique
      headers = [[ cat.label, 'GRT/QTY', `${currency}/GRT`, 'GRT/DAY', `RATE (${currency})` ]];
      
      tableData = items.map(item => {
        const grtQty = Number(item.grt_value || 0);
        const deviseGrt = Number(item.rate || 0);
        const grtDay = grtQty * deviseGrt;
        
        // Calcul du RATE final : Uniquement (GRT/DAY * Jours) si c'est BERTH DUES
        const isBerthDues = item.label.toUpperCase().includes('BERTH DUES');
        const finalRate = isBerthDues ? (grtDay * days) : grtDay;

        return [
          isBerthDues ? `${item.label} (${days} Days)` : item.label,
          grtQty.toLocaleString('en-US'),
          deviseGrt.toFixed(3),
          grtDay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          finalRate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        ];
      });
      colStyles = { 0: { cellWidth: 70 }, 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'right' }, 4: { halign: 'right' } };
    } else {
      // Configuration standard pour les autres catégories
      headers = [[ cat.label, cat.id == "STEVEDORING" ? 'UNIT (TON)' : 'UNIT', `RATE (${currency})`, `TOTAL (${currency})` ]];
      tableData = items.map(item => [
        item.label,
        cat.id === 'STEVEDORING' ? (item.grt_value || '1') : '1',
        Number(item.rate || 0).toFixed(3),
        (Number(item.grt_value || 1) * Number(item.rate || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })
      ]);
      colStyles = { 0: { cellWidth: 90 }, 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' } };
    }

    // Calcul du sous-total de la catégorie (en respectant la règle des jours pour Berth Dues)
    const subTotalCat = items.reduce((sum, i) => {
        const base = Number(i.grt_value || 0) * Number(i.rate || 0);
        const isBerthDues = i.label.toUpperCase().includes('BERTH DUES');
        return sum + (cat.id === 'PORT_DUES' && isBerthDues ? (base * days) : base);
    }, 0);
    
    const vatCat = pda.apply_vat ? subTotalCat * 0.16 : 0;
    const totalCat = subTotalCat + vatCat;
    grandTotal += totalCat;

    if (yPos > 240) { doc.addPage(); yPos = 20; }

    autoTable(doc, {
      startY: yPos + 2,
      head: headers,
      body: tableData,
      theme: 'plain', 
      styles: { fontSize: 7.5, cellPadding: 2, lineColor: [200, 200, 200], lineWidth: 0.1 },
      headStyles: { fillColor: lightGray, fontStyle: 'bold', textColor: [0, 0, 0] },
      columnStyles: colStyles,
      foot: [
        [{ content: 'Sub Total', colSpan: headers[0].length - 1, styles: { halign: 'right', fontStyle: 'bold' } }, subTotalCat.toLocaleString('en-US', { minimumFractionDigits: 2 })],
        [{ content: 'VAT 16%', colSpan: headers[0].length - 1, styles: { halign: 'right', fontStyle: 'bold' } }, vatCat.toLocaleString('en-US', { minimumFractionDigits: 2 })],
        [{ content: `TOTAL ${cat.label}`, colSpan: headers[0].length - 1, styles: { halign: 'right', fontStyle: 'bold', fillColor: [248, 248, 248] } }, totalCat.toLocaleString('en-US', { minimumFractionDigits: 2 })]
      ],
      margin: { left: 14, right: 14 },
      pageBreak: 'avoid'
    });

    yPos = doc.lastAutoTable.finalY + 10;
  });

  // ============== TOTAL GÉNÉRAL ==============
  if (yPos > 250) { doc.addPage(); yPos = 20; }
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(130, yPos, 66, 8, 'F');
  doc.text(`GRAND TOTAL:`, 132, yPos + 5.5);
  doc.text(`${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${currency}`, 194, yPos + 5.5, { align: 'right' });

  yPos += 15;

  // ============== REMARQUES ==============
  if (yPos > 220) { doc.addPage(); yPos = 20; }
  doc.setFontSize(9);
  doc.text('REMARKS:', 14, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const splitRemarks = doc.splitTextToSize(pda.remarks || 'N/A', 182);
  doc.text(splitRemarks, 14, yPos + 5);

  // ============== SIGNATURES ==============
  console.log("PDA Creator Type:", pda.createur?.type);
  const sigImage = pda.createur?.type === 'directeur_general' ? sigDG : sigDO;
  if (sigImage) {
    // Ajustement de la position pour ne pas chevaucher le texte
    const sigY = Math.min(yPos + 20, 230);
    doc.addImage(sigImage, 'PNG', 135, sigY, 50, 50);
  }

  // ============== PIED DE PAGE ==============
  const pageHeight = doc.internal.pageSize.height;
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(7);
  doc.text('Siège social : SOCO BMCI N°0190 Moughata de Tevragh Zeina - Nouakchott - Mauritanie', 105, pageHeight - 10, { align: 'center' });
  doc.text('Tél : 24 34 40 01 / 24 34 40 00 | NIF : 01328566', 105, pageHeight - 6, { align: 'center' });

  doc.save(`${pda.pda_number}.pdf`);
};