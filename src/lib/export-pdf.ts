export type PdfSection = {
  title: string;
  headers: string[];
  rows: Array<Array<string | number>>;
};

function escapeHtml(value: string | number) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function exportSectionsToPdf(title: string, sections: PdfSection[]) {
  const printWindow = window.open("", "_blank", "width=1024,height=768");

  if (!printWindow) {
    window.print();
    return;
  }

  const generatedAt = new Date().toLocaleString("id-ID");
  const body = sections
    .map(
      (section) => `
        <section>
          <h2>${escapeHtml(section.title)}</h2>
          <table>
            <thead>
              <tr>${section.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${
                section.rows.length > 0
                  ? section.rows
                      .map(
                        (row) =>
                          `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`,
                      )
                      .join("")
                  : `<tr><td colspan="${section.headers.length}">Tidak ada data</td></tr>`
              }
            </tbody>
          </table>
        </section>
      `,
    )
    .join("");

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          body {
            color: #111827;
            font-family: Arial, sans-serif;
            margin: 32px;
          }

          h1 {
            font-size: 24px;
            margin: 0;
          }

          .meta {
            color: #6b7280;
            font-size: 12px;
            margin: 6px 0 28px;
          }

          section {
            break-inside: avoid;
            margin-bottom: 28px;
          }

          h2 {
            border-bottom: 1px solid #d1d5db;
            font-size: 16px;
            margin: 0 0 10px;
            padding-bottom: 8px;
          }

          table {
            border-collapse: collapse;
            font-size: 12px;
            width: 100%;
          }

          th, td {
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: left;
          }

          th {
            background: #f3f4f6;
            font-weight: 700;
          }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <div class="meta">Generated: ${escapeHtml(generatedAt)}</div>
        ${body}
        <script>
          window.onload = () => {
            window.print();
            window.onafterprint = () => window.close();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
