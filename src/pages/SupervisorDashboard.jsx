import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Analytics from '../components/Analytics';
import { exportarPDF } from '../utils/pdf-export';
import { formatarDataHora, formatarDataHoraGrafico } from '../utils/formatters';

export default function SupervisorDashboard({ session }) {
  const [registros, setRegistros] = useState([]);
  const [pacienteNome, setPacienteNome] = useState('Carregando...');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('historico');

  useEffect(() => {
    fetchPacienteInfo();
    fetchRegistros();
  }, [session]);

  const fetchPacienteInfo = async () => {
    try {
      const { data: acessoData, error: acessoError } = await supabase
        .from('acessos')
        .select('paciente_id')
        .eq('responsavel_id', session.user.id)
        .limit(1);

      if (acessoError || !acessoData || acessoData.length === 0) {
        console.log('Erro ao buscar acesso:', acessoError);
        setPacienteNome('Paciente');
        return;
      }

      const { data: pacienteData } = await supabase
        .from('pacientes')
        .select('nome')
        .eq('id', acessoData[0].paciente_id)
        .limit(1);

      setPacienteNome(pacienteData?.[0]?.nome || 'Paciente');
    } catch (error) {
      console.error('Erro ao buscar info do paciente:', error);
    }
  };

  const fetchRegistros = async () => {
    setLoading(true);

    try {
      const { data: acessoData, error: acessoError } = await supabase
        .from('acessos')
        .select('paciente_id')
        .eq('responsavel_id', session.user.id)
        .limit(1);

      if (acessoError || !acessoData || acessoData.length === 0) {
        console.log('Erro ao buscar acesso:', acessoError);
        setRegistros([]);
        setLoading(false);
        return;
      }

      const { data: pacienteData, error: pacienteError } = await supabase
        .from('pacientes')
        .select('user_id')
        .eq('id', acessoData[0].paciente_id)
        .limit(1);

      if (pacienteError || !pacienteData || pacienteData.length === 0) {
        console.log('Erro ao buscar paciente:', pacienteError);
        setRegistros([]);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('registros_glicemia')
        .select('*')
        .eq('user_id', pacienteData[0].user_id)
        .order('data', { ascending: false })
        .order('hora', { ascending: false })
        .limit(30);

      setRegistros(data || []);
    } catch (error) {
      console.error('Erro ao buscar registros:', error);
    }

    setLoading(false);
  };

  const chartData = registros
    .slice()
    .reverse()
    .map((r) => ({
      time: formatarDataHoraGrafico(r.data, r.hora),
      glicemia: r.glicemia,
    }))
    .slice(-30);

  const getStatusIcon = (glicemia) => {
    if (glicemia < 70) return '🔴'; // Crítico
    if (glicemia < 100) return '🟠'; // Baixo
    if (glicemia <= 180) return '🟢'; // Normal
    return '🟡'; // Alto
  };

  const getStatusTexto = (glicemia) => {
    if (glicemia < 70) return 'Crítico - Hipoglicemia';
    if (glicemia < 100) return 'Baixo';
    if (glicemia <= 180) return 'Normal';
    return 'Alto - Hiperglicemia';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-purple-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Glicemia</h1>
            <p className="text-purple-100 text-sm mt-1">Supervisionando: <span className="font-bold">{pacienteNome}</span></p>
            <p className="text-purple-100 text-xs mt-1">{session.user.email}</p>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Sair
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Abas */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('historico')}
            className={`px-6 py-2 rounded-lg font-bold transition ${
              activeTab === 'historico'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            📊 Histórico
          </button>
          <button
            onClick={() => setActiveTab('analises')}
            className={`px-6 py-2 rounded-lg font-bold transition ${
              activeTab === 'analises'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            💡 Análises
          </button>
        </div>

        {/* Aviso de Supervisionamento */}
        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6 rounded">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-800 font-bold">👁️ Você está vendo dados de {pacienteNome} em tempo real</p>
              <p className="text-purple-700 text-sm">Qualquer novo registro será atualizado automaticamente</p>
            </div>
            <button
              onClick={() => exportarPDF(registros, pacienteNome)}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded text-sm flex items-center gap-2 whitespace-nowrap"
            >
              📥 PDF
            </button>
          </div>
        </div>

        {/* Conteúdo da Aba Histórico */}
        {activeTab === 'historico' && (
          <>
            {/* Último registro */}
            {registros.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow mb-6 border-l-4 border-purple-500">
                <h2 className="text-xl font-bold mb-4">📍 Último Registro</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded">
                    <p className="text-gray-600 text-sm">Data/Hora</p>
                    <p className="text-lg font-bold">{formatarDataHora(registros[0].data, registros[0].hora)}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded">
                    <p className="text-gray-600 text-sm">Glicemia</p>
                    <p className="text-3xl font-bold text-purple-600">{registros[0].glicemia}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {getStatusIcon(registros[0].glicemia)} {getStatusTexto(registros[0].glicemia)}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded">
                    <p className="text-gray-600 text-sm">Medicação</p>
                    <p className="text-lg font-bold text-blue-600">
                      {registros[0].medicacao_tipo || '-'}
                    </p>
                    {registros[0].medicacao_dose && (
                      <p className="text-xs text-gray-500 mt-1">{registros[0].medicacao_dose} UI</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Gráfico */}
            {chartData.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-xl font-bold mb-4">Histórico de Glicemia</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="glicemia" stroke="#a855f7" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Lista de Registros */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold">Todos os Registros</h2>
              </div>
              {loading ? (
                <div className="p-6 text-center text-gray-500">Carregando...</div>
              ) : registros.length === 0 ? (
                <div className="p-6 text-center text-gray-500">Nenhum registro ainda</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Data/Hora</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Glicemia</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Medicação</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Refeição</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Exercício</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Sintomas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registros.map((reg) => (
                        <tr key={reg.id} className="border-t border-gray-200 hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm">{formatarDataHora(reg.data, reg.hora)}</td>
                          <td className="px-6 py-4 text-sm font-bold text-purple-600">{reg.glicemia} mg/dL</td>
                          <td className="px-6 py-4 text-sm">
                            <span className="px-2 py-1 rounded text-xs font-bold bg-purple-100 text-purple-800">
                              {getStatusIcon(reg.glicemia)} {getStatusTexto(reg.glicemia)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {reg.medicacao_tipo} {reg.medicacao_dose ? `(${reg.medicacao_dose}UI)` : ''}
                          </td>
                          <td className="px-6 py-4 text-sm">{reg.refeicao_descricao || '-'}</td>
                          <td className="px-6 py-4 text-sm">
                            {reg.exercicio_tipo} {reg.exercicio_duracao ? `(${reg.exercicio_duracao}min)` : ''}
                          </td>
                          <td className="px-6 py-4 text-sm">{reg.sintomas || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Conteúdo da Aba Análises */}
        {activeTab === 'analises' && (
          <Analytics registros={registros} />
        )}
      </div>
    </div>
  );
}
