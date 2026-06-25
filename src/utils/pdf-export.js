import { jsPDF } from 'jspdf';
import { calculateStatistics } from './analytics';
import { formatarDataHora } from './formatters';

export async function exportarPDF(registros, pacienteNome = 'Paciente') {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 15;

    // Cores
    const corPrimaria = [63, 81, 181];
    const corTexto = [50, 50, 50];

    // Cabeçalho
    doc.setFillColor(...corPrimaria);
    doc.rect(0, 0, pageWidth, 25, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Glicemia', 15, 15);

    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text(`Relatório de Acompanhamento - ${pacienteNome}`, 15, 22);

    yPosition = 35;

    // Data do relatório
    doc.setTextColor(...corTexto);
    doc.setFontSize(9);
    doc.text(`Data do relatório: ${new Date().toLocaleDateString('pt-BR')}`, 15, yPosition);
    yPosition += 8;

    if (registros.length === 0) {
      doc.text('Nenhum registro disponível', 15, yPosition);
      doc.save(`relatorio-glicemia-${pacienteNome}.pdf`);
      return;
    }

    // Estatísticas
    const stats = calculateStatistics(registros);

    doc.setFontSize(12);
    doc.setTextColor(...corPrimaria);
    doc.text('Estatísticas', 15, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setTextColor(...corTexto);
    doc.text(`Média: ${stats.media} mg/dL`, 15, yPosition);
    yPosition += 6;
    doc.text(`Mínimo: ${stats.minimo} mg/dL`, 15, yPosition);
    yPosition += 6;
    doc.text(`Máximo: ${stats.maximo} mg/dL`, 15, yPosition);
    yPosition += 6;
    doc.text(`Mediana: ${stats.mediana} mg/dL`, 15, yPosition);
    yPosition += 6;
    doc.text(`Total de registros: ${stats.total}`, 15, yPosition);
    yPosition += 12;

    // Últimos Registros em Tabela (manual)
    doc.setFontSize(12);
    doc.setTextColor(...corPrimaria);
    doc.text('Últimos Registros', 15, yPosition);
    yPosition += 8;

    // Dimensões da tabela
    const colWidths = [30, 20, 30, 25, 30];
    const rowHeight = 12;
    const headers = ['Data/Hora', 'Glicemia', 'Medicação', 'Refeição', 'Sintomas'];
    const totalWidth = colWidths.reduce((a, b) => a + b, 0);
    let xPos = 15;

    // Cabeçalho da tabela com fundo colorido
    doc.setFillColor(63, 81, 181);
    doc.rect(xPos, yPosition - 6, totalWidth, rowHeight, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');

    let headerXPos = xPos + 2;
    headers.forEach((header, i) => {
      doc.text(header, headerXPos, yPosition - 1, { maxWidth: colWidths[i] - 4 });
      headerXPos += colWidths[i];
    });

    yPosition += rowHeight + 2;

    // Linhas da tabela com bordas
    doc.setTextColor(...corTexto);
    doc.setFont(undefined, 'normal');

    registros.slice(0, 10).forEach((reg, regIndex) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 15;
      }

      const rowData = [
        formatarDataHora(reg.data, reg.hora),
        `${reg.glicemia}`,
        reg.medicacao_tipo ? `${reg.medicacao_tipo}${reg.medicacao_dose ? ` (${reg.medicacao_dose}UI)` : ''}` : '-',
        reg.refeicao_descricao || '-',
        reg.sintomas || '-',
      ];

      // Desenhar linha de fundo alternada
      if (regIndex % 2 === 0) {
        doc.setFillColor(240, 240, 240);
        doc.rect(xPos, yPosition - 6, totalWidth, rowHeight, 'F');
      }

      // Desenhar bordas
      doc.setDrawColor(200, 200, 200);
      doc.rect(xPos, yPosition - 6, totalWidth, rowHeight);

      // Desenhar texto
      let cellXPos = xPos + 2;
      rowData.forEach((text, i) => {
        doc.text(String(text), cellXPos, yPosition - 1, { maxWidth: colWidths[i] - 4 });
        cellXPos += colWidths[i];
      });

      yPosition += rowHeight + 1;
    });

    yPosition += 5;

    // Interpretação
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 15;
    }

    doc.setFontSize(12);
    doc.setTextColor(...corPrimaria);
    doc.text('Análise', 15, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setTextColor(...corTexto);

    const interpretacao = [];
    if (stats.media > 180) {
      interpretacao.push('• Glicemia média elevada - Considere consultar seu médico para ajuste de medicação');
    } else if (stats.media < 100) {
      interpretacao.push('• Glicemia média baixa - Verifique medicação com seu médico');
    } else {
      interpretacao.push('• Glicemia média dentro do esperado - Continue monitorando');
    }

    interpretacao.push(`• Variação de ${stats.maximo - stats.minimo} mg/dL entre máximo e mínimo`);

    interpretacao.forEach((texto) => {
      doc.text(texto, 15, yPosition, { maxWidth: pageWidth - 30 });
      yPosition += 8;
    });

    // Recomendações
    yPosition += 5;
    doc.setFontSize(12);
    doc.setTextColor(...corPrimaria);
    doc.text('Recomendações', 15, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setTextColor(...corTexto);
    const recomendacoes = [
      '• Manter registro diário de glicemia',
      '• Registrar refeições e exercícios para identificar padrões',
      '• Consultar médico regularmente (a cada 3 meses)',
      '• Levar este relatório na próxima consulta',
    ];

    recomendacoes.forEach((texto) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 15;
      }
      doc.text(texto, 15, yPosition);
      yPosition += 7;
    });

    // Rodapé
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      'Este relatório foi gerado automaticamente pelo app Glicemia. Consulte seu médico para interpretações clínicas.',
      15,
      pageHeight - 10,
      { maxWidth: pageWidth - 30 }
    );

    // Salvar
    doc.save(`relatorio-glicemia-${pacienteNome}-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    alert('Erro ao gerar PDF. Verifique o console para mais detalhes.');
  }
}
