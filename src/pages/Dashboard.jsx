import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Analytics from '../components/Analytics';
import { exportarPDF } from '../utils/pdf-export';
import { formatarDataHora, formatarDataHoraGrafico } from '../utils/formatters';

export default function Dashboard({ session }) {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('historico');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    glicemia: '',
    medicacao_tipo: '',
    medicacao_dose: '',
    refeicao_descricao: '',
    exercicio_tipo: '',
    exercicio_duracao: '',
    sintomas: '',
  });

  useEffect(() => {
    fetchUserRole();
    fetchRegistros();
  }, [session]);

  const fetchUserRole = async () => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    setUserRole(data?.role);
  };

  const fetchRegistros = async () => {
    setLoading(true);

    let query = supabase
      .from('registros_glicemia')
      .select('*')
      .order('data', { ascending: false })
      .order('hora', { ascending: false });

    const { data: userRoleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (userRoleData?.role === 'responsavel') {
      const { data: pacienteData } = await supabase
        .from('acessos')
        .select('paciente_id')
        .eq('responsavel_id', session.user.id)
        .limit(1)
        .single();

      if (pacienteData) {
        const { data: paciente } = await supabase
          .from('pacientes')
          .select('user_id')
          .eq('id', pacienteData.paciente_id)
          .single();

        query = query.eq('user_id', paciente.user_id);
      }
    } else {
      query = query.eq('user_id', session.user.id);
    }

    const { data } = await query.limit(30);
    setRegistros(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      const { error } = await supabase
        .from('registros_glicemia')
        .update({
          glicemia: parseInt(formData.glicemia),
          medicacao_tipo: formData.medicacao_tipo || null,
          medicacao_dose: formData.medicacao_dose ? parseFloat(formData.medicacao_dose) : null,
          refeicao_descricao: formData.refeicao_descricao || null,
          exercicio_tipo: formData.exercicio_tipo || null,
          exercicio_duracao: formData.exercicio_duracao ? parseInt(formData.exercicio_duracao) : null,
          sintomas: formData.sintomas || null,
        })
        .eq('id', editingId);

      if (!error) {
        setEditingId(null);
        setFormData({
          glicemia: '',
          medicacao_tipo: '',
          medicacao_dose: '',
          refeicao_descricao: '',
          exercicio_tipo: '',
          exercicio_duracao: '',
          sintomas: '',
        });
        setShowForm(false);
        fetchRegistros();
      }
    } else {
      const { error } = await supabase.from('registros_glicemia').insert([
        {
          user_id: session.user.id,
          data: new Date().toISOString().split('T')[0],
          hora: new Date().toTimeString().split(' ')[0],
          glicemia: parseInt(formData.glicemia),
          medicacao_tipo: formData.medicacao_tipo || null,
          medicacao_dose: formData.medicacao_dose ? parseFloat(formData.medicacao_dose) : null,
          refeicao_descricao: formData.refeicao_descricao || null,
          exercicio_tipo: formData.exercicio_tipo || null,
          exercicio_duracao: formData.exercicio_duracao ? parseInt(formData.exercicio_duracao) : null,
          sintomas: formData.sintomas || null,
        },
      ]);

      if (!error) {
        setFormData({
          glicemia: '',
          medicacao_tipo: '',
          medicacao_dose: '',
          refeicao_descricao: '',
          exercicio_tipo: '',
          exercicio_duracao: '',
          sintomas: '',
        });
        setShowForm(false);
        fetchRegistros();
      }
    }
  };

  const handleDelete = async (registroId) => {
    if (window.confirm('Tem certeza que deseja deletar este registro?')) {
      const { error } = await supabase.from('registros_glicemia').delete().eq('id', registroId);
      if (!error) {
        fetchRegistros();
      } else {
        alert('Erro ao deletar registro');
      }
    }
  };

  const handleEdit = (registro) => {
    setEditingId(registro.id);
    setFormData({
      glicemia: registro.glicemia,
      medicacao_tipo: registro.medicacao_tipo || '',
      medicacao_dose: registro.medicacao_dose || '',
      refeicao_descricao: registro.refeicao_descricao || '',
      exercicio_tipo: registro.exercicio_tipo || '',
      exercicio_duracao: registro.exercicio_duracao || '',
      sintomas: registro.sintomas || '',
    });
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      glicemia: '',
      medicacao_tipo: '',
      medicacao_dose: '',
      refeicao_descricao: '',
      exercicio_tipo: '',
      exercicio_duracao: '',
      sintomas: '',
    });
    setShowForm(false);
  };

  const chartData = registros
    .slice()
    .reverse()
    .map((r) => ({
      time: formatarDataHoraGrafico(r.data, r.hora),
      glicemia: r.glicemia,
    }))
    .slice(-30);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Glicemia</h1>
            <p className="text-blue-100 text-sm mt-1">{session.user.email}</p>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            📊 Histórico
          </button>
          <button
            onClick={() => setActiveTab('analises')}
            className={`px-6 py-2 rounded-lg font-bold transition ${
              activeTab === 'analises'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            💡 Análises
          </button>
        </div>

        {/* Botões de Ação */}
        {activeTab === 'historico' && (
          <div className="mb-6 flex gap-3">
            {userRole === 'paciente' && (
              <button
                onClick={() => handleCancelEdit()}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg"
              >
                {showForm ? 'Cancelar' : '+ Novo Registro'}
              </button>
            )}
            <button
              onClick={() => exportarPDF(registros, 'Meu Acompanhamento')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2"
            >
              📥 Exportar PDF
            </button>
          </div>
        )}

        {/* Conteúdo da Aba Histórico */}
        {activeTab === 'historico' && (
          <>
        {/* Formulário */}
        {showForm && userRole === 'paciente' && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Editar Registro' : 'Novo Registro'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Glicemia (mg/dL)*</label>
                <input
                  type="number"
                  required
                  value={formData.glicemia}
                  onChange={(e) => setFormData({ ...formData, glicemia: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Medicação</label>
                <input
                  type="text"
                  value={formData.medicacao_tipo}
                  onChange={(e) => setFormData({ ...formData, medicacao_tipo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ex: Insulina Rápida"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dose</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.medicacao_dose}
                  onChange={(e) => setFormData({ ...formData, medicacao_dose: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ex: 10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Refeição</label>
                <input
                  type="text"
                  value={formData.refeicao_descricao}
                  onChange={(e) => setFormData({ ...formData, refeicao_descricao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ex: Arroz e feijão"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Exercício</label>
                <input
                  type="text"
                  value={formData.exercicio_tipo}
                  onChange={(e) => setFormData({ ...formData, exercicio_tipo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ex: Corrida"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Duração (min)</label>
                <input
                  type="number"
                  value={formData.exercicio_duracao}
                  onChange={(e) => setFormData({ ...formData, exercicio_duracao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ex: 30"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Sintomas</label>
                <input
                  type="text"
                  value={formData.sintomas}
                  onChange={(e) => setFormData({ ...formData, sintomas: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ex: Tontura, Normal, etc"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
                >
                  {editingId ? 'Atualizar Registro' : 'Salvar Registro'}
                </button>
              </div>
            </form>
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
                <Line type="monotone" dataKey="glicemia" stroke="#3b82f6" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Lista de Registros */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold">Últimos Registros</h2>
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
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Medicação</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Refeição</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Exercício</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Sintomas</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {registros.map((reg) => (
                    <tr key={reg.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">{formatarDataHora(reg.data, reg.hora)}</td>
                      <td className="px-6 py-4 text-sm font-bold text-blue-600">{reg.glicemia} mg/dL</td>
                      <td className="px-6 py-4 text-sm">{reg.medicacao_tipo} {reg.medicacao_dose ? `(${reg.medicacao_dose}UI)` : ''}</td>
                      <td className="px-6 py-4 text-sm">{reg.refeicao_descricao || '-'}</td>
                      <td className="px-6 py-4 text-sm">{reg.exercicio_tipo} {reg.exercicio_duracao ? `(${reg.exercicio_duracao}min)` : ''}</td>
                      <td className="px-6 py-4 text-sm">{reg.sintomas || '-'}</td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <button
                          onClick={() => handleEdit(reg)}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-xs"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(reg.id)}
                          className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-xs"
                        >
                          Deletar
                        </button>
                      </td>
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
