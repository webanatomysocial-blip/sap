/**
 * Utility to export data to CSV and trigger a download in the browser.
 * @param {Array} data - Array of objects to export.
 * @param {Array} headers - Array of header objects { label: string, key: string }.
 * @param {string} fileName - Suggestion for the filename (without extension).
 */
export const downloadCSV = (data, headers, fileName = "export") => {
  if (!data || data.length === 0) {
    alert("No data available to export.");
    return;
  }

  // Create the header row
  const headerRow = headers.map((h) => `"${h.label.replace(/"/g, '""')}"`).join(",");

  // Create the data rows
  const dataRows = data.map((item) => {
    return headers
      .map((h) => {
        const value = item[h.key] ?? "";
        // Handle strings, escaping quotes and handling commas
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      })
      .join(",");
  });

  // Combine header and data
  const csvContent = [headerRow, ...dataRows].join("\n");

  // Create a blob and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  const timestamp = new Date().toISOString().split('T')[0];
  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName}_${timestamp}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
