/**
 * Export Utilities
 * Export progress data to PDF, Excel, or Image formats
 * 
 * Dependencies:
 * npm install jspdf jspdf-autotable xlsx html2canvas
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Export progress data to PDF
 * @param {Array} progressData - Progress entries
 * @param {string} month - Month name
 * @param {number} year - Year
 */
export const exportToPDF = async (progressData, month, year) => {
  try {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(24);
    doc.setTextColor(92, 71, 66);
    doc.text(`Progress Report`, 14, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(139, 115, 85);
    doc.text(`${month} ${year}`, 14, 30);

    // Summary Stats
    doc.setFontSize(12);
    doc.setTextColor(92, 71, 66);
    doc.text(`Total Progress: ${progressData.length}`, 14, 45);
    
    const withImages = progressData.filter(p => p.gambar?.length > 0).length;
    doc.text(`With Images: ${withImages}`, 14, 52);

    // Table
    const tableData = progressData.map((p, idx) => [
      idx + 1,
      new Date(p.tanggal).toLocaleDateString(),
      p.catatan.substring(0, 60) + (p.catatan.length > 60 ? '...' : ''),
      p.tags?.join(', ') || '-',
      p.gambar?.length || 0
    ]);

    // Use autoTable as function (v5.x syntax)
    autoTable(doc, {
      head: [['#', 'Date', 'Notes', 'Tags', 'Images']],
      body: tableData,
      startY: 60,
      theme: 'striped',
      headStyles: {
        fillColor: [255, 159, 127],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 5
      }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(176, 160, 144);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    const filename = `progress-${month}-${year}.pdf`;
    doc.save(filename);

    return { success: true, filename };
  } catch (error) {
    console.error('PDF Export Error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Export progress data to Excel
 * @param {Array} progressData - Progress entries
 * @param {string} filename - Output filename
 */
export const exportToExcel = async (progressData, filename = 'progress-export.xlsx') => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(
      progressData.map((p, idx) => ({
        '#': idx + 1,
        Date: new Date(p.tanggal).toLocaleDateString(),
        Notes: p.catatan,
        Tags: p.tags?.join(', ') || '',
        'Image Count': p.gambar?.length || 0,
        Created: new Date(p.dibuat).toLocaleString(),
        Updated: new Date(p.update).toLocaleString()
      }))
    );

    // Set column widths
    worksheet['!cols'] = [
      { wch: 5 },  // #
      { wch: 12 }, // Date
      { wch: 50 }, // Notes
      { wch: 20 }, // Tags
      { wch: 12 }, // Image Count
      { wch: 20 }, // Created
      { wch: 20 }  // Updated
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Progress');

    // Add summary sheet
    const summaryData = [
      { Metric: 'Total Progress', Value: progressData.length },
      { Metric: 'With Images', Value: progressData.filter(p => p.gambar?.length > 0).length },
      { Metric: 'Total Images', Value: progressData.reduce((sum, p) => sum + (p.gambar?.length || 0), 0) },
      { Metric: 'Date Range', Value: `${new Date(Math.min(...progressData.map(p => new Date(p.tanggal)))).toLocaleDateString()} - ${new Date(Math.max(...progressData.map(p => new Date(p.tanggal)))).toLocaleDateString()}` }
    ];
    
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    XLSX.writeFile(workbook, filename);

    return { success: true, filename };
  } catch (error) {
    console.error('Excel Export Error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Export calendar view as image
 * @param {string} elementId - DOM element ID to capture
 * @param {string} filename - Output filename
 */
export const exportAsImage = async (elementId, filename = 'progress-calendar.png') => {
  try {
    const html2canvas = (await import('html2canvas')).default;
    const element = document.getElementById(elementId);

    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    const canvas = await html2canvas(element, {
      backgroundColor: '#FFF8E7',
      scale: 2, // Higher quality
      logging: false
    });

    // Convert to blob and download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    });

    return { success: true, filename };
  } catch (error) {
    console.error('Image Export Error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Export as CSV (simple alternative to Excel)
 * @param {Array} progressData - Progress entries
 * @param {string} filename - Output filename
 */
export const exportToCSV = (progressData, filename = 'progress-export.csv') => {
  try {
    const headers = ['#', 'Date', 'Notes', 'Tags', 'Image Count', 'Created', 'Updated'];
    
    const rows = progressData.map((p, idx) => [
      idx + 1,
      new Date(p.tanggal).toLocaleDateString(),
      `"${p.catatan.replace(/"/g, '""')}"`, // Escape quotes
      `"${p.tags?.join(', ') || ''}"`,
      p.gambar?.length || 0,
      new Date(p.dibuat).toLocaleString(),
      new Date(p.update).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);

    return { success: true, filename };
  } catch (error) {
    console.error('CSV Export Error:', error);
    return { success: false, error: error.message };
  }
};

const exportUtils = {
  exportToPDF,
  exportToExcel,
  exportAsImage,
  exportToCSV
};

export default exportUtils;
