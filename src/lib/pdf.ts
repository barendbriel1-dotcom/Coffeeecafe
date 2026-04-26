export async function exportDamageReportPdf(report: any, profileMap: Record<string, string>) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const primaryColor = [34, 197, 94]; // Matrix green

  // Header
  doc.setFillColor(5, 10, 7);
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(22);
  doc.text("DAMAGE REPORT", 20, 25);
  
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated on ${new Date().toLocaleString()}`, 140, 25);

  // Body
  let y = 55;
  const addField = (label: string, value: string) => {
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(label.toUpperCase(), 20, y);
    y += 6;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(value || "N/A", 20, y);
    y += 12;
  };

  addField("Asset Tag", report.asset_code);
  addField("Asset Name", report.asset_name);
  addField("Current Status", report.status.toUpperCase());
  addField("Assigned User", profileMap[report.assigned_to] ?? "Unknown");
  addField("Reported By", profileMap[report.reported_by] ?? "Admin");
  addField("Date Damaged", report.damaged_date ? new Date(report.damaged_date).toLocaleDateString() : "Unknown");
  if (report.damaged_time) {
    addField("Time Damaged", report.damaged_time);
  }
  addField("Damage Type", report.damage_type || "General");
  addField("Report Date", new Date(report.created_at).toLocaleDateString());
  
  if (report.completed_at) {
    addField("Completed On", new Date(report.completed_at).toLocaleString());
  }

  if (report.admin_conclusion_status) {
    y += 5;
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("ADMIN CONCLUSION", 20, y);
    y += 8;
    addField("Final Resolution", report.admin_conclusion_status.toUpperCase().replace(/_/g, " "));
    addField("Conclusion Notes", report.admin_conclusion_notes || "No additional notes.");
  }

  y += 5;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("OPERATIVE DESCRIPTION / EXPLANATION", 20, y);
  y += 8;
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  
  const lines = doc.splitTextToSize(report.description || "No description provided.", 170);
  doc.text(lines, 20, y);

  doc.save(`Damage-Report-${report.asset_code}-${new Date().getTime()}.pdf`);
}
