export function calculateStatistics(registros) {
  if (registros.length === 0) {
    return {
      media: 0,
      minimo: 0,
      maximo: 0,
      mediana: 0,
      total: 0,
    };
  }

  const valores = registros.map((r) => r.glicemia);
  const soma = valores.reduce((a, b) => a + b, 0);
  const media = Math.round(soma / valores.length);
  const minimo = Math.min(...valores);
  const maximo = Math.max(...valores);

  const sorted = [...valores].sort((a, b) => a - b);
  const mediana =
    sorted.length % 2 === 0
      ? Math.round((sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2)
      : sorted[Math.floor(sorted.length / 2)];

  return {
    media,
    minimo,
    maximo,
    mediana,
    total: registros.length,
  };
}

export function findCriticalHours(registros) {
  if (registros.length === 0) return [];

  const horasPorHora = {};

  registros.forEach((reg) => {
    const hora = reg.hora.substring(0, 2);
    if (!horasPorHora[hora]) {
      horasPorHora[hora] = [];
    }
    horasPorHora[hora].push(reg.glicemia);
  });

  const analiseHoras = Object.entries(horasPorHora)
    .map(([hora, glicemias]) => ({
      hora: `${hora}:00`,
      media: Math.round(glicemias.reduce((a, b) => a + b, 0) / glicemias.length),
      ocorrencias: glicemias.length,
      min: Math.min(...glicemias),
      max: Math.max(...glicemias),
    }))
    .sort((a, b) => b.media - a.media);

  const criticas = analiseHoras.filter((h) => h.media > 200 || h.media < 70);
  const altas = analiseHoras.filter((h) => h.media > 180 && h.media <= 200);

  return {
    criticas,
    altas,
    todas: analiseHoras,
  };
}

export function analyzeMealImpact(registros) {
  const comRefeicao = registros.filter((r) => r.refeicao_descricao);
  const semRefeicao = registros.filter((r) => !r.refeicao_descricao);

  if (comRefeicao.length === 0 || semRefeicao.length === 0) {
    return { semDados: true };
  }

  const mediaComRefeicao = Math.round(
    comRefeicao.reduce((a, b) => a + b.glicemia, 0) / comRefeicao.length
  );
  const mediaSemRefeicao = Math.round(
    semRefeicao.reduce((a, b) => a + b.glicemia, 0) / semRefeicao.length
  );

  return {
    mediaComRefeicao,
    mediaSemRefeicao,
    diferencaPercentual: Math.round(
      ((mediaComRefeicao - mediaSemRefeicao) / mediaSemRefeicao) * 100
    ),
    registrosComRefeicao: comRefeicao.length,
    registrosSemRefeicao: semRefeicao.length,
  };
}

export function analyzeExerciseImpact(registros) {
  const comExercicio = registros.filter((r) => r.exercicio_tipo);
  const semExercicio = registros.filter((r) => !r.exercicio_tipo);

  if (comExercicio.length === 0 || semExercicio.length === 0) {
    return { semDados: true };
  }

  const mediaComExercicio = Math.round(
    comExercicio.reduce((a, b) => a + b.glicemia, 0) / comExercicio.length
  );
  const mediaSemExercicio = Math.round(
    semExercicio.reduce((a, b) => a + b.glicemia, 0) / semExercicio.length
  );

  return {
    mediaComExercicio,
    mediaSemExercicio,
    reducao: mediaSemExercicio - mediaComExercicio,
    registrosComExercicio: comExercicio.length,
    registrosSemExercicio: semExercicio.length,
  };
}

export function analyzeByWeekday(registros) {
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  const porDia = {
    Dom: [],
    Seg: [],
    Ter: [],
    Qua: [],
    Qui: [],
    Sex: [],
    Sab: [],
  };

  registros.forEach((reg) => {
    const [ano, mes, dia] = reg.data.split('-');
    const data = new Date(ano, mes - 1, dia);
    const diaNumero = diasSemana[data.getDay()];
    porDia[diaNumero].push(reg.glicemia);
  });

  return diasSemana.map((dia) => {
    const glicemias = porDia[dia];
    return {
      dia,
      media: glicemias.length > 0 ? Math.round(glicemias.reduce((a, b) => a + b, 0) / glicemias.length) : 0,
      ocorrencias: glicemias.length,
      instabilidade: glicemias.length > 0 ? Math.max(...glicemias) - Math.min(...glicemias) : 0,
    };
  });
}

export function generateInsights(registros) {
  if (registros.length === 0) return [];

  const stats = calculateStatistics(registros);
  const insights = [];

  if (stats.media > 200) {
    insights.push({
      tipo: 'alerta',
      mensagem: `Média de glicemia está alta (${stats.media} mg/dL). Considere consultar o médico.`,
    });
  }

  if (stats.media < 100) {
    insights.push({
      tipo: 'alerta',
      mensagem: `Média de glicemia está baixa (${stats.media} mg/dL). Verifique medicação com médico.`,
    });
  }

  const criticas = findCriticalHours(registros);
  if (criticas.criticas.length > 0) {
    insights.push({
      tipo: 'aviso',
      mensagem: `Horários críticos identificados: ${criticas.criticas.map((h) => h.hora).join(', ')}`,
    });
  }

  const refeicao = analyzeMealImpact(registros);
  if (!refeicao.semDados && refeicao.diferencaPercentual > 15) {
    insights.push({
      tipo: 'info',
      mensagem: `Refeições aumentam glicemia em ~${refeicao.diferencaPercentual}%. Considere ajustar portions ou tipo de alimento.`,
    });
  }

  const exercicio = analyzeExerciseImpact(registros);
  if (!exercicio.semDados && exercicio.reducao > 10) {
    insights.push({
      tipo: 'sucesso',
      mensagem: `Exercício reduz glicemia em ~${exercicio.reducao} mg/dL. Continue praticando!`,
    });
  }

  return insights;
}
