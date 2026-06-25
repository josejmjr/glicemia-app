import {
  calculateStatistics,
  findCriticalHours,
  analyzeMealImpact,
  analyzeExerciseImpact,
  analyzeByWeekday,
  generateInsights,
} from '../utils/analytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Analytics({ registros }) {
  if (registros.length === 0) {
    return null;
  }

  const stats = calculateStatistics(registros);
  const criticas = findCriticalHours(registros);
  const refeicao = analyzeMealImpact(registros);
  const exercicio = analyzeExerciseImpact(registros);
  const porDia = analyzeByWeekday(registros);
  const insights = generateInsights(registros);

  const getStatusColor = (valor) => {
    if (valor < 70) return 'bg-red-100 text-red-800';
    if (valor < 100) return 'bg-orange-100 text-orange-800';
    if (valor <= 180) return 'bg-green-100 text-green-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">💡 Insights</h2>
          <div className="space-y-2">
            {insights.map((insight, idx) => {
              const colors = {
                alerta: 'bg-red-50 border-red-200 text-red-800',
                aviso: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                info: 'bg-blue-50 border-blue-200 text-blue-800',
                sucesso: 'bg-green-50 border-green-200 text-green-800',
              };
              return (
                <div key={idx} className={`p-3 rounded border ${colors[insight.tipo]}`}>
                  {insight.mensagem}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Estatísticas Gerais */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">📊 Estatísticas Gerais</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-gray-600 text-sm">Média</p>
            <p className={`text-2xl font-bold ${getStatusColor(stats.media).split(' ')[1]}`}>
              {stats.media}
            </p>
            <p className="text-xs text-gray-500">mg/dL</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-gray-600 text-sm">Mínimo</p>
            <p className="text-2xl font-bold text-green-600">{stats.minimo}</p>
            <p className="text-xs text-gray-500">mg/dL</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-gray-600 text-sm">Máximo</p>
            <p className="text-2xl font-bold text-red-600">{stats.maximo}</p>
            <p className="text-xs text-gray-500">mg/dL</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-gray-600 text-sm">Mediana</p>
            <p className="text-2xl font-bold text-purple-600">{stats.mediana}</p>
            <p className="text-xs text-gray-500">mg/dL</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600 text-sm">Registros</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-xs text-gray-500">total</p>
          </div>
        </div>
      </div>

      {/* Horários Críticos */}
      {criticas.criticas.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <h2 className="text-xl font-bold mb-4 text-red-600">⚠️ Horários Críticos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {criticas.criticas.map((hora) => (
              <div key={hora.hora} className="p-4 bg-red-50 rounded-lg">
                <p className="font-bold text-lg">{hora.hora}</p>
                <p className="text-sm text-gray-600">
                  Média: <span className="font-bold text-red-600">{hora.media}</span> mg/dL
                </p>
                <p className="text-xs text-gray-500">
                  Variação: {hora.min}-{hora.max} mg/dL ({hora.ocorrencias}x)
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Horários com Glicemia Alta */}
      {criticas.altas.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <h2 className="text-xl font-bold mb-4 text-yellow-600">⚡ Horários com Glicemia Alta</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {criticas.altas.map((hora) => (
              <div key={hora.hora} className="p-4 bg-yellow-50 rounded-lg">
                <p className="font-bold text-lg">{hora.hora}</p>
                <p className="text-sm text-gray-600">
                  Média: <span className="font-bold text-yellow-600">{hora.media}</span> mg/dL
                </p>
                <p className="text-xs text-gray-500">
                  Variação: {hora.min}-{hora.max} mg/dL ({hora.ocorrencias}x)
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Impacto de Refeições */}
      {!refeicao.semDados && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">🍽️ Impacto de Refeições</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Glicemia COM refeição registrada</p>
              <p className="text-3xl font-bold text-blue-600">{refeicao.mediaComRefeicao}</p>
              <p className="text-xs text-gray-500">mg/dL ({refeicao.registrosComRefeicao} registros)</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Glicemia SEM refeição registrada</p>
              <p className="text-3xl font-bold text-green-600">{refeicao.mediaSemRefeicao}</p>
              <p className="text-xs text-gray-500">mg/dL ({refeicao.registrosSemRefeicao} registros)</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <p className="text-sm">
              <span className="font-bold">Diferença: </span>
              {refeicao.diferencaPercentual > 0
                ? `Refeições aumentam glicemia em ~${refeicao.diferencaPercentual}%`
                : `Refeições reduzem glicemia em ~${Math.abs(refeicao.diferencaPercentual)}%`}
            </p>
          </div>
        </div>
      )}

      {/* Impacto de Exercício */}
      {!exercicio.semDados && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">🏃 Impacto de Exercício</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Glicemia COM exercício registrado</p>
              <p className="text-3xl font-bold text-blue-600">{exercicio.mediaComExercicio}</p>
              <p className="text-xs text-gray-500">mg/dL ({exercicio.registrosComExercicio} registros)</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Glicemia SEM exercício registrado</p>
              <p className="text-3xl font-bold text-red-600">{exercicio.mediaSemExercicio}</p>
              <p className="text-xs text-gray-500">mg/dL ({exercicio.registrosSemExercicio} registros)</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-green-50 rounded">
            <p className="text-sm">
              <span className="font-bold">Redução de glicemia: </span>
              Exercício reduz glicemia em ~{exercicio.reducao} mg/dL
            </p>
          </div>
        </div>
      )}

      {/* Glicemia por Dia da Semana */}
      {porDia.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">📅 Glicemia por Dia da Semana</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={porDia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="media" fill="#3b82f6" name="Média (mg/dL)" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {porDia.map((dia) => (
              <div key={dia.dia} className="p-3 bg-gray-50 rounded">
                <p className="font-bold">{dia.dia}</p>
                <p className="text-sm text-gray-600">
                  Média: <span className="font-bold">{dia.media}</span> mg/dL
                </p>
                <p className="text-xs text-gray-500">
                  Instabilidade: {dia.instabilidade} mg/dL ({dia.ocorrencias} registros)
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
