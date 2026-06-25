# 🩺 Glicemia - App de Acompanhamento de Glicose

Um aplicativo web moderno para acompanhamento de glicemia (açúcar no sangue) com análises inteligentes, gráficos em tempo real e acesso supervisionado para pais/responsáveis.

**Desenvolvido para:** Pacientes diabéticos e seus responsáveis monitorarem glicemia de forma organizada e com insights automáticos.

---

## ✨ Funcionalidades

### 👩‍⚕️ Para o Paciente (Afilhada)
- ✅ **Registrar Glicemia** - Adicione medições de glicose com data, hora e contexto
- ✅ **Histórico Completo** - Veja todos os registros em uma tabela organizada
- ✅ **Editar/Deletar** - Corrija ou remova registros quando necessário
- ✅ **Gráficos em Tempo Real** - Visualize tendências de glicemia nos últimos 30 registros
- ✅ **Análises Inteligentes** - Insights automáticos sobre:
  - Glicemia média, mínima, máxima e mediana
  - Horários críticos (períodos com glicemia alta)
  - Impacto de refeições na glicemia
  - Efeito do exercício na redução de glicose
  - Variações por dia da semana
- ✅ **Exportar PDF** - Gere relatórios para levar ao médico
- ✅ **Contexto Completo** - Registre medicações, refeições, exercícios e sintomas

### 👨‍👩‍👧 Para os Pais/Responsáveis
- 👁️ **Dashboard de Supervisão** - Acompanhe glicemia em tempo real
- 📊 **Mesmas Análises** - Veja as mesmas inteligências do paciente
- 📥 **Exportar PDF** - Relatórios para consultas médicas
- 🔒 **Acesso Restrito** - Só veem dados de quem é responsável (não podem editar)

---

## 🛠️ Stack Tecnológico

| Camada | Tecnologia | Propósito |
|--------|-----------|----------|
| **Frontend** | React 18 + Vite | Interface moderna e rápida |
| **Estilo** | Tailwind CSS | Design responsivo e profissional |
| **Gráficos** | Recharts | Visualizações de dados interativas |
| **Backend** | Supabase | Banco de dados PostgreSQL + Autenticação |
| **Autenticação** | Supabase Auth | Login seguro com email/senha |
| **PDF** | jsPDF + jspdf-autotable | Geração de relatórios |
| **Versionamento** | Git + GitHub | Controle de versão |

---

## 📋 Requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 16+) - [Baixar aqui](https://nodejs.org/)
- **npm** (vem com Node.js)
- **Git** - [Baixar aqui](https://git-scm.com/)
- **Conta Supabase** - [Criar gratuitamente](https://supabase.com)

---

## 🚀 Instalação e Execução

### 1️⃣ Clonar o Repositório
```bash
git clone https://github.com/josejmjr/glicemia-app.git
cd glicemia-app
```

### 2️⃣ Instalar Dependências
```bash
npm install
```

**O que isso faz?** Baixa todas as bibliotecas que o projeto precisa (React, Tailwind, Recharts, etc). Pode levar 1-2 minutos.

### 3️⃣ Configurar Variáveis de Ambiente

#### Método Rápido:
1. Copie o arquivo de exemplo:
```bash
cp .env.example .env.local
```

2. Edite `.env.local` e adicione suas credenciais Supabase

#### Método Manual:
1. Crie um arquivo `.env.local` na raiz do projeto
2. Adicione as seguintes variáveis:

```env
VITE_SUPABASE_URL=sua_url_supabase_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

#### 🔑 Como obter as credenciais:
1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Vá para **Settings → API** (no menu lateral)
4. Copie:
   - **Project URL** → Cole como `VITE_SUPABASE_URL`
   - **anon public key** → Cole como `VITE_SUPABASE_ANON_KEY`

#### ⚠️ Importante:
- O arquivo `.env.local` **nunca é enviado ao GitHub** (está no `.gitignore`)
- Cada pessoa que clonar o projeto precisa criar seu próprio `.env.local`
- Nunca compartilhe seu `.env.local` com ninguém!

### 4️⃣ Rodar o Servidor de Desenvolvimento
```bash
npm run dev
```

Abrirá automaticamente em `http://localhost:5173`

---

## 📂 Estrutura do Projeto

```
glicemia-app/
├── src/
│   ├── pages/
│   │   ├── Login.jsx           # Tela de login
│   │   ├── Dashboard.jsx       # Dashboard do paciente
│   │   └── SupervisorDashboard.jsx  # Dashboard dos pais
│   ├── components/
│   │   └── Analytics.jsx       # Componente de análises
│   ├── utils/
│   │   ├── analytics.js        # Funções de cálculo e insights
│   │   ├── formatters.js       # Formatadores de data/hora
│   │   └── pdf-export.js       # Geração de PDF
│   ├── App.jsx                 # Componente principal com rotas
│   └── supabaseClient.js       # Configuração Supabase
├── index.html                  # HTML principal
├── vite.config.js             # Configuração Vite
├── tailwind.config.js         # Configuração Tailwind
└── package.json               # Dependências do projeto
```

---

## 🔐 Contas de Teste

Para testar o aplicativo localmente:

### Paciente (Afilhada)
```
Email: afilhada@email.com
Senha: Senha123!
```

### Responsável (Pai/Mãe)
```
Email: responsavel@email.com
Senha: Senha123!
```

⚠️ **Nota:** Essas credenciais são apenas para desenvolvimento local. Em produção, use contas reais.

---

## 📊 Como Usar

### Registrando Glicemia
1. Faça login como **Afilhada**
2. Clique em **"+ Novo Registro"**
3. Preencha:
   - **Glicemia** (obrigatório) - valor em mg/dL
   - **Medicação** - tipo (ex: Insulina Rápida)
   - **Dose** - quantidade em UI
   - **Refeição** - o que comeu
   - **Exercício** - tipo e duração
   - **Sintomas** - tontura, náusea, etc
4. Clique em **"Salvar Registro"**

### Visualizando Análises
1. Na aba **"Análises"** veja:
   - Gráfico de glicemia ao longo do tempo
   - Estatísticas (média, mín, máx)
   - Horários críticos
   - Impacto de refeições
   - Efeito do exercício

### Acompanhamento do Responsável
1. Faça login como **Responsável**
2. Veja dados em tempo real da afilhada
3. Mesmo acesso aos gráficos e análises
4. Pode exportar PDF para levar ao médico

### Exportando Relatório
1. Clique em **"📥 Exportar PDF"**
2. Um arquivo será baixado automáticamente
3. Abra no navegador ou leitor PDF
4. Leve à consulta com o médico

---

## 🔧 Comandos Disponíveis

```bash
# Rodar em desenvolvimento
npm run dev

# Fazer build para produção
npm run build

# Preview da build de produção
npm run preview

# Verificar código com linter
npm run lint
```

---

## 🔐 Variáveis de Ambiente e Segurança

### Por que usar variáveis de ambiente?
Credenciais (chaves, URLs, senhas) **nunca devem estar no código**. Por isso usamos `.env.local`:

| Arquivo | Descrição | Enviado ao GitHub? |
|---------|-----------|-------------------|
| `.env.example` | Modelo vazio (sem valores reais) | ✅ Sim |
| `.env.local` | Suas credenciais reais | ❌ **Não** (ignorado) |

### Estrutura de Variáveis

```env
# Desenvolvimento (.env.local)
VITE_SUPABASE_URL=https://sua-url.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_aqui

# Produção (Vercel/Netlify)
# Configure no painel do serviço de deploy
```

### ✅ Boas Práticas
- ✅ Sempre use `.env.local` em desenvolvimento
- ✅ Nunca compartilhe seu `.env.local`
- ✅ Configure variáveis de ambiente no serviço de deploy
- ✅ Use chaves **anon** (públicas) no frontend
- ✅ Use chaves **service_role** apenas no backend (não neste projeto)

### ⚠️ Segurança
- A chave `VITE_SUPABASE_ANON_KEY` é **pública** (está no código do navegador)
- Isso é seguro! O Supabase protege os dados com RLS (Row Level Security)
- Usuários só podem ver/editar seus próprios dados

---

## 🌍 Implantação (Deploy)

### Opção 1: Vercel (Recomendado - Grátis)
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Selecione seu repositório GitHub
4. Configure variáveis de ambiente (VITE_SUPABASE_URL, etc)
5. Clique em "Deploy"

### Opção 2: GitHub Pages
1. Customize `vite.config.js` com a base do repositório
2. Execute `npm run build`
3. Envie a pasta `dist/` para GitHub Pages

### Opção 3: Netlify
1. Acesse [netlify.com](https://netlify.com)
2. Conecte seu repositório GitHub
3. Defina comando de build: `npm run build`
4. Deploy automático!

---

## 🐛 Possíveis Problemas

### "Erro ao conectar ao Supabase"
**Solução:** Verifique se `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão corretos em `.env.local`

### "npm: comando não encontrado"
**Solução:** Instale Node.js de [nodejs.org](https://nodejs.org/)

### "Porta 5173 já está em uso"
**Solução:** Vite usará automaticamente a próxima porta disponível, ou execute:
```bash
npm run dev -- --port 3000
```

---

## 📚 Aprendendo Mais

- **React:** [react.dev](https://react.dev)
- **Vite:** [vitejs.dev](https://vitejs.dev)
- **Tailwind CSS:** [tailwindcss.com](https://tailwindcss.com)
- **Supabase:** [supabase.com/docs](https://supabase.com/docs)
- **Recharts:** [recharts.org](https://recharts.org)

---

## 📝 Licença

Este projeto é código aberto e gratuito. Sinta-se livre para usar, modificar e compartilhar.

---

## 🤝 Contribuições

Encontrou um bug ou tem uma ideia? Abra uma **Issue** no GitHub!

---

## 📞 Contato

Desenvolvido com ❤️ para melhorar a saúde e qualidade de vida.

**Versão:** 1.0.0  
**Última atualização:** Junho de 2026

---

## 🎯 Próximos Passos

- [ ] Adicionar notificações de lembrete para medir glicemia
- [ ] Integração com wearables (smartwatch, medidores)
- [ ] Previsões de glicemia com IA
- [ ] Chat com o médico
- [ ] App mobile (React Native)
- [ ] Integração com registros médicos
