import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '@/assets/logo.png';
import sigDG from '@/assets/signatures/directeur_general.png';
import sigDO from '@/assets/signatures/directeur_operations.png';

export const generateFDAPDF = async (fda) => {
  const doc = new jsPDF();
  let yPos = 20;
  const lightGray = [240, 240, 240]; 
  const currency = fda.currency || 'EUR';

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
  doc.text(`FDA N°: ${fda.fda_number || '---'} - ${fda.vessel_name}`, 105, yPos + 6, { align: 'center' });

  yPos += 15;

  // ============== INFOS CLIENT & NAVIRE ==============
  const infoData = [
    ['Customer:', fda.client?.nom || fda.client_nom || '---'],
    ['Port d\'arrivée:', fda.port_of_arrival || 'NOUAKCHOTT'],
    // ['Vessel:', fda.vessel_name || '---'],
    ['Cargo:', fda.cargo_description || 'AS PER CARGO LIST ATTACHED'],
    ['Weight (GRT):', fda.weight || '----'],
    ['Trip Number:', fda.voyage || '----']
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
    const items = fda.items.filter(i => i.category === cat.id);
    if (items.length === 0) return;

    let headers = [];
    let tableData = [];
    let colStyles = {};

    if (cat.id === 'PORT_DUES') {
      // Configuration adaptée à l'image précédente
      headers = [[ 
        cat.label, 
        'PORT INV', 
        'GRT', 
        'RATE', 
        'PRICE MRU', 
        `PRICE ${currency}` 
      ]];
      
      tableData = items.map(item => [
        item.label,
        item.port_inv || '---',
        Number(item.grt_value || 0).toLocaleString('en-US'),
        Number(item.rate || 0).toFixed(3),
        Number(item.price_mru || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }),
        Number(item.price_devise || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })
      ]);

      colStyles = { 
        0: { cellWidth: 50 }, // Désignation
        1: { halign: 'center' }, // Port Inv
        2: { halign: 'center' }, // GRT
        3: { halign: 'center' }, // Rate
        4: { halign: 'right' },  // Price MRU
        5: { halign: 'right' }   // Price Devise
      };
    } else {
      // Configuration standard pour les autres catégories
      headers = [[ cat.label, 'UNIT', `RATE (${currency})`, `TOTAL (${currency})` ]];
      tableData = items.map(item => [
        item.label,
        cat.id === 'STEVEDORING' ? (item.grt_value || '1') : '1',
        Number(item.rate || 0).toFixed(3),
        (Number(item.grt_value || 1) * Number(item.rate || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })
      ]);
      colStyles = { 0: { cellWidth: 90 }, 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' } };
    }

    // Calcul du sous-total basé sur price_devise pour PORT_DUES, sinon calcul classique
    const subTotalCat = items.reduce((sum, i) => {
        if (cat.id === 'PORT_DUES') return sum + Number(i.price_devise || 0);
        return sum + (Number(i.grt_value || 1) * Number(i.rate || 0));
    }, 0);
    
    const vatCat = fda.apply_vat ? subTotalCat * 0.16 : 0;
    const totalCat = subTotalCat + vatCat;
    grandTotal += totalCat;

    if (yPos > 240) { doc.addPage(); yPos = 20; }

    autoTable(doc, {
      startY: yPos + 2,
      head: headers,
      body: tableData,
      theme: 'plain', 
      styles: { fontSize: 7, cellPadding: 2, lineColor: [200, 200, 200], lineWidth: 0.1 },
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

  // ============== SIGNATURES ==============
  const sigImage = fda.createur?.type === 'directeur_general' ? sigDG : sigDO;
  if (sigImage) {
    const sigY = Math.min(yPos + 5, 230);
    doc.addImage(sigImage, 'PNG', 135, sigY, 50, 50);
  }

  // ============== PIED DE PAGE ==============
  const pageHeight = doc.internal.pageSize.height;
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(7);
  doc.text('Siège social : SOCO BMCI N°0190 Moughata de Tevragh Zeina - Nouakchott - Mauritanie', 105, pageHeight - 10, { align: 'center' });
  doc.text('Tél : 24 34 40 01 / 24 34 40 00 | NIF : 01328566', 105, pageHeight - 6, { align: 'center' });

  doc.save(`${fda.fda_number || 'FDA'}.pdf`);
};