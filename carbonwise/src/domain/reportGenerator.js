/**
 * Generates an enriched Sustainability Report
 */
export function generatePDFReport(
  footprint,
  recommendations,
  insight,
  badges
) {
  // Ensure we have access to the library
  if (!window.jspdf) {
    console.error("jsPDF library not found");
    return;
  }
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 20;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(46, 125, 50); // Green color for sustainability
  doc.text("CarbonWise Sustainability Report", 20, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleDateString()} | Personal Impact Analysis`, 20, y);

  y += 20;

    // 2. Add Chart (New Feature)
  // We look for the canvas used by Chart.js
  const chartCanvas = document.querySelector('canvas');
  if (chartCanvas) {
    try {
      // Convert canvas to image data
      const chartImage = chartCanvas.toDataURL("image/png", 1.0);
      
      // Add a section title for the chart
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Impact Trend Analysis", 20, y);
      y += 10;

      // Add image: addImage(imageData, format, x, y, width, height)
      // We scale it to fit the page (approx 170mm wide)
      doc.addImage(chartImage, 'PNG', 20, y, 170, 80);
      
      y += 90; // Move Y down past the image
    } catch (e) {
      console.warn("Could not attach chart to PDF:", e);
      y += 10;
    }
  }

  // 1. Personal Metrics Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Personal Metrics", 20, y);
  
  y += 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Carbon Score: ${footprint.score}/100`, 20, y);
  y += 8;
  doc.text(`Monthly Footprint: ${footprint.monthlyKg.toFixed(1)} kg CO2e`, 20, y);
  y += 8;
  doc.text(`Yearly Footprint: ${(footprint.monthlyKg * 12).toFixed(1)} kg CO2e`, 20, y);

  y += 15;

  // 2. AI Insights Section (The Sustainability Coach)
  if (insight) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("AI Sustainability Coach", 20, y);
    
    y += 10;
    doc.setFontSize(11);
    doc.setFont("helvetica", "italic");
    
    // Headline
    const headlineLines = doc.splitTextToSize(insight.headline || "", 170);
    doc.text(headlineLines, 20, y);
    y += (headlineLines.length * 7);

    // Best Action
    doc.setFont("helvetica", "normal");
    const actionLines = doc.splitTextToSize(`Action Plan: ${insight.bestAction || ""}`, 170);
    doc.text(actionLines, 20, y);
    y += (actionLines.length * 7);

    // Savings
    doc.setFont("helvetica", "bold");
    doc.setTextColor(46, 125, 50);
    doc.text(`Potential annual reduction: ${insight.annualSaving || 0} kg CO2e`, 20, y);
    doc.setTextColor(0);
    
    y += 15;
  }

  // 3. Top Recommendations Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Top Recommendations", 20, y);
  
  y += 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  const topRecs = recommendations ? recommendations.slice(0, 5) : [];
  topRecs.forEach((item) => {
    if (y > 270) { doc.addPage(); y = 20; } // Basic page overflow check
    doc.text(`• ${item.title || item.text} (${item.impactKg || 0} kg/mo reduction)`, 25, y);
    y += 8;
  });

  y += 10;

  // 4. Achievements Section
  if (badges && badges.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Achievements", 20, y);
    
    y += 10;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    badges.forEach((badge) => {
      if (y > 270) { doc.addPage(); y = 20; }
      // We strip emojis for the PDF text to prevent rendering errors
      const cleanTitle = badge.title.replace(/[\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF]/g, '');
      doc.text(`- ${cleanTitle}`, 25, y);
      y += 8;
    });
  }

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text("Created with CarbonWise - Tracking your journey to Net Zero.", 20, 285);

  // Save the PDF
  doc.save(`CarbonWise_Report_${new Date().getTime()}.pdf`);
}