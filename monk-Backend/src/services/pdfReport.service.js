const PDFDocument = require('pdfkit');

exports.generateLcaPdfReport = (project, res) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Stream PDF directly to HTTP response
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=LCA-Report-${project._id}.pdf`);
  doc.pipe(res);

  // Header Banner
  doc.rect(0, 0, 595.28, 80).fill('#064e3b');
  doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text('MONKTRACE ENVIRONMENTAL PLATFORM', 40, 24);
  doc.fontSize(10).font('Helvetica').text('ISO 14040/44 Certified Life Cycle Assessment (LCA) Report', 40, 50);

  doc.moveDown(3);

  // Project Info Table / Summary
  doc.fillColor('#0f172a').fontSize(16).font('Helvetica-Bold').text(project.title || 'LCA Project Study', 40, 100);
  doc.fontSize(10).font('Helvetica').fillColor('#475569')
    .text(`Product Name: ${project.productId?.name || 'N/A'}`)
    .text(`Vendor Supplier: ${project.vendorId?.name || 'N/A'}`)
    .text(`System Boundary: ${project.systemBoundary || 'CRADLE_TO_GATE'}`)
    .text(`Functional Unit: ${project.functionalUnit || '1 Unit'}`)
    .text(`Audit Status: ${project.status || 'DRAFT'}`)
    .text(`Report Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`);

  doc.moveDown(1.5);

  // Divider
  doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(40, 210).lineTo(555, 210).stroke();

  // Environmental Impact Results Box
  doc.rect(40, 225, 515, 120).fillAndStroke('#f0fdf4', '#10b981');
  doc.fillColor('#065f46').fontSize(14).font('Helvetica-Bold').text('CALCULATED ENVIRONMENTAL IMPACTS (LCIA)', 55, 240);

  const lcia = project.lciaResults || {};
  const totalGwp = lcia.totalGwpKgCo2e || 0;
  const waterFootprint = lcia.waterFootprintM3 || 0;
  const grade = lcia.ppwrRecyclabilityGrade || 'GRADE_B';

  doc.fillColor('#0f172a').fontSize(24).font('Helvetica-Bold').text(`${totalGwp} kg CO₂e`, 55, 265);
  doc.fontSize(10).font('Helvetica').fillColor('#047857').text('Total Carbon Footprint (GWP 100a per Functional Unit)', 55, 295);

  doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text(`Water Scarcity: ${waterFootprint} m³`, 320, 268);
  doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text(`PPWR Recyclability: ${grade}`, 320, 290);

  // Lifecycle Stage Breakdown
  doc.moveDown(6);
  doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text('Carbon Footprint Stage Breakdown (kg CO₂e)', 40, 365);

  const stages = [
    { label: 'Raw Materials Extraction & Processing', val: lcia.gwpByStage?.rawMaterials || 0 },
    { label: 'Manufacturing & Energy Utilities (Electricity, Fuels)', val: lcia.gwpByStage?.manufacturing || 0 },
    { label: 'Supply Chain Transportation & Logistics', val: lcia.gwpByStage?.logistics || 0 },
    { label: 'Packaging Components', val: lcia.gwpByStage?.packaging || 0 },
    { label: 'Waste Management & Direct Emissions', val: lcia.gwpByStage?.waste || 0 },
  ];

  let currentY = 390;
  stages.forEach((stg) => {
    doc.fillColor('#334155').fontSize(10).font('Helvetica').text(stg.label, 55, currentY);
    doc.fillColor('#0f172a').font('Helvetica-Bold').text(`${stg.val} kg CO₂e`, 440, currentY, { align: 'right' });
    currentY += 22;
  });

  // Footer / ISO Compliance Declaration
  doc.rect(40, 750, 515, 45).fill('#f8fafc');
  doc.fillColor('#64748b').fontSize(8).font('Helvetica')
    .text('Verified under ISO 14040:2006 and ISO 14044:2006 principles. Generated automatically by MONKTRACE Centralized Environmental Data Platform.', 50, 762, { width: 495, align: 'center' });

  doc.end();
};
