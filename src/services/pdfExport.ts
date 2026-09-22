import { Certificate, Course, StudentGradeRecord } from '../types';

function printHtmlContent(htmlContent: string) {
  // Try hidden iframe approach first for iframe sandboxes
  try {
    const existingIframe = document.getElementById('radbio-print-frame');
    if (existingIframe) existingIframe.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'radbio-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 400);
      return;
    }
  } catch {
    // Iframe print blocked, proceed to popup fallback
  }

  // Fallback to window.open if available
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}

export const pdfExportService = {
  exportDiploma(cert: Certificate): void {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Diploma Oficial - ${cert.studentName}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 12mm;
          }
          body {
            font-family: 'Times New Roman', serif;
            margin: 0;
            padding: 24px;
            background: #fff;
            color: #111;
            text-align: center;
            box-sizing: border-box;
          }
          .border-outer {
            border: 8px double #0a2540;
            padding: 30px;
            position: relative;
            background: #fcfcfd;
            height: calc(100vh - 80px);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-sizing: border-box;
          }
          .header {
            margin-top: 10px;
          }
          .title-inst {
            font-size: 26px;
            font-weight: bold;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #064e3b;
            margin: 0;
          }
          .subtitle-inst {
            font-size: 13px;
            color: #4b5563;
            letter-spacing: 1px;
            margin-top: 4px;
          }
          .diploma-title {
            font-size: 38px;
            font-family: 'Georgia', serif;
            letter-spacing: 4px;
            color: #032b43;
            margin: 25px 0 15px;
            text-transform: uppercase;
          }
          .certify-text {
            font-size: 16px;
            line-height: 1.8;
            max-width: 820px;
            margin: 0 auto;
            color: #1f2937;
          }
          .student-name {
            font-size: 28px;
            font-weight: bold;
            color: #044e54;
            display: block;
            margin: 10px 0;
            font-family: 'Georgia', serif;
            text-decoration: underline;
          }
          .course-name {
            font-size: 20px;
            font-weight: bold;
            color: #065f46;
          }
          .signatures {
            display: flex;
            justify-content: space-around;
            margin-top: 30px;
            padding: 0 40px;
          }
          .signature-box {
            text-align: center;
            width: 260px;
          }
          .signature-line {
            border-top: 1px solid #111;
            margin-bottom: 6px;
          }
          .footer-info {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 8px;
            font-family: monospace;
          }
          .seal-badge {
            display: inline-block;
            padding: 6px 16px;
            background: #f0fdf4;
            border: 1px solid #10b981;
            color: #065f46;
            font-weight: bold;
            font-size: 12px;
            border-radius: 9999px;
            margin-top: 10px;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="border-outer">
          <div class="header">
            <div class="title-inst">Faculdade de Ciências Médicas & Radiologia RadBio</div>
            <div class="subtitle-inst">Centro de Excelência em Diagnóstico por Imagem e Tomografia Computadorizada</div>
            <div class="diploma-title">Certificado Acadêmico</div>
          </div>

          <div class="certify-text">
            Certificamos, para os devidos fins legais e acadêmicos, que o discente
            <span class="student-name">${cert.studentName}</span>
            inscrito sob o registro <strong>${cert.studentDocument}</strong>, concluiu com aproveitamento de excelência
            e média final <strong>${cert.finalScore.toFixed(1)} / 10.0</strong> o curso de especialização profissional:
            <br /><br />
            <span class="course-name">${cert.courseName}</span>
            <br />
            com carga horária total comprovada de <strong>${cert.workloadHours} horas</strong> teóricas e práticas em simulador tomográfico para alunos de radiologia.
          </div>

          <div>
            <div class="seal-badge">AUTENTICAÇÃO DIGITAL VERIFICADA • SISTEMA RADBIO V2.4</div>
          </div>

          <div class="signatures">
            <div class="signature-box">
              <div class="signature-line"></div>
              <strong>${cert.instructorName}</strong><br />
              <span style="font-size: 12px; color: #4b5563;">${cert.instructorRole}</span>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <strong>Dra. Helena Vasconcelos</strong><br />
              <span style="font-size: 12px; color: #4b5563;">Diretora Acadêmica Geral • CRTR/CBR</span>
            </div>
          </div>

          <div class="footer-info">
            <span>CÓDIGO DE REGISTRO: ${cert.code}</span>
            <span>DATA DE EXPEDIÇÃO: ${cert.completionDate}</span>
            <span>HASH CRIPTOGRÁFICO SHA-256: ${cert.sha256Hash.substring(0, 24)}...</span>
          </div>
        </div>
      </body>
      </html>
    `;

    printHtmlContent(htmlContent);
  },

  exportTranscript(courses: Course[], studentName: string, enrollmentId: string): void {
    const rowsHtml = courses.map(c => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${c.code} - ${c.title}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${c.credits}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center; font-weight: bold; color: #0891b2;">${c.grade.toFixed(1)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${c.progress}%</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #059669; font-weight: bold;">${c.status === 'completed' ? 'Aprovado' : 'Em Curso'}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Histórico Escolar Oficial - ${studentName}</title>
        <style>
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
          .header { border-bottom: 2px solid #0891b2; padding-bottom: 16px; margin-bottom: 24px; }
          h1 { margin: 0; color: #0f172a; font-size: 24px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #f1f5f9; padding: 12px; font-size: 12px; text-align: left; text-transform: uppercase; }
          .stamp { margin-top: 40px; padding: 16px; border: 1px solid #10b981; background: #ecfdf5; border-radius: 8px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RadBio Academic Portal • Histórico Escolar Oficial</h1>
          <p>Aluno: <strong>${studentName}</strong> | Matrícula: <strong>${enrollmentId}</strong> | Emissão: ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Disciplina</th>
              <th style="text-align: center;">Créditos</th>
              <th style="text-align: center;">Média Final</th>
              <th style="text-align: center;">Frequência</th>
              <th style="text-align: center;">Situação</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <div class="stamp">
          <strong>DOCUMENTO AUTÊNTICO ASSINADO DIGITALMENTE</strong><br/>
          Assinatura acadêmica com carimbo de tempo verificado no portal RadBio. Válido para comprovação curricular e estágio hospitalar de radiologia.
        </div>
      </body>
      </html>
    `;

    printHtmlContent(html);
  },

  exportClassSheetPdf(grades: StudentGradeRecord[], classTitle: string): void {
    const rows = grades.map(g => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; font-family: monospace;">${g.enrollmentId}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: 600;">${g.studentName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${g.attendance}%</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${g.gradeN1.toFixed(1)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${g.gradeN2.toFixed(1)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${g.gradePractice.toFixed(1)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center; font-weight: bold; color: ${g.calculatedAverage >= 7 ? '#059669' : '#d97706'};">
          ${g.calculatedAverage.toFixed(1)}
        </td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Pauta Oficial - ${classTitle}</title>
        <style>
          body { font-family: sans-serif; padding: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #f3f4f6; padding: 8px; font-size: 12px; }
        </style>
      </head>
      <body>
        <h2>RadBio - Pauta de Avaliação da Turma</h2>
        <p>Disciplina: <strong>${classTitle}</strong> | Data: ${new Date().toLocaleDateString('pt-BR')}</p>
        <table>
          <thead>
            <tr>
              <th>Matrícula</th>
              <th>Aluno</th>
              <th>Frequência</th>
              <th>Nota N1</th>
              <th>Nota N2</th>
              <th>Prática TC</th>
              <th>Média</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
      </html>
    `;

    printHtmlContent(html);
  }
};
