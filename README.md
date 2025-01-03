# SiGeF - Sistema de Gestão Financeira 🚀

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

## 🌟 Visão Geral

O SiGeF é uma solução moderna e intuitiva para gestão financeira, desenvolvida para atender às necessidades de organizações que buscam eficiência e controle em suas operações financeiras. Com uma interface elegante e recursos poderosos, o sistema oferece uma experiência completa para gerenciamento de movimentações financeiras, relatórios e análises.

## ✨ Principais Características

- 📊 **Dashboard Intuitivo**: Visualize seus dados financeiros com gráficos e métricas em tempo real
- 💰 **Gestão de Movimentações**: Controle entradas e saídas com facilidade
- 📈 **Relatórios Detalhados**: Análises completas e exportação de dados
- 👥 **Gestão de Usuários**: Controle de acesso com diferentes níveis de permissão
- 🔒 **Segurança Avançada**: Autenticação robusta e políticas de segurança em nível de linha
- 💬 **Sistema de Comentários**: Colaboração em tempo real nas movimentações
- 📱 **Design Responsivo**: Acesse de qualquer dispositivo
- 🔄 **Importação/Exportação**: Suporte para importação e exportação de dados em Excel
- 📋 **Auditoria Completa**: Registro detalhado de todas as operações
- 🔐 **Perfis de Acesso**: Administrador, Tesoureiro, Auditor e Assistente

## 🚀 Stack Tecnológica

### Frontend
- **Framework**: React 18 com TypeScript
- **Build Tool**: Vite
- **Estilização**: Tailwind CSS + shadcn/ui
- **Gráficos**: Recharts
- **Formulários**: React Hook Form + Zod
- **Gerenciamento de Estado**: TanStack Query
- **Roteamento**: React Router DOM

### Backend (Supabase)
- **Banco de Dados**: PostgreSQL
- **Autenticação**: Supabase Auth
- **Storage**: Supabase Storage
- **Segurança**: Row Level Security (RLS)
- **APIs**: REST + Real-time subscriptions
- **Edge Functions**: Deno Runtime

### DevOps
- **CI/CD**: Vercel
- **Versionamento**: Git
- **Ambiente**: Node.js

## 🛠️ Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/sigef.git

# Entre no diretório
cd sigef

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Inicie o servidor de desenvolvimento
npm run dev
```

## 🔑 Configuração do Supabase

1. Crie uma conta no [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Configure as variáveis de ambiente no arquivo `.env`:

```env
VITE_SUPABASE_URL=sua-url-do-supabase
VITE_SUPABASE_ANON_KEY=sua-chave-anon-do-supabase
```

## 👥 Perfis de Acesso

- **Administrador**: Gerenciamento completo do sistema
- **Tesoureiro**: Gestão de movimentações financeiras
- **Auditor**: Aprovação e auditoria de movimentações
- **Assistente**: Visualização e exportação de dados

## 🔒 Segurança

- Autenticação robusta via Supabase Auth
- Políticas de segurança em nível de linha (RLS)
- Registro de auditoria para todas as operações
- Backup automático dos dados
- Controle granular de permissões

## 📊 Recursos de Dados

- **Movimentações Financeiras**
  - Registro de entradas e saídas
  - Categorização por plano de contas
  - Sistema de aprovação
  - Comentários e anexos

- **Relatórios**
  - Dashboard em tempo real
  - Análises comparativas
  - Gráficos interativos
  - Exportação em diversos formatos

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📧 Suporte

Para sugestões, dúvidas ou feedback:
- Email: [suporte@sigef.com](mailto:suporte@sigef.com)
- Issues: [GitHub Issues](https://github.com/seu-usuario/sigef/issues)

---

<p align="center">
  Desenvolvido com ❤️ pela equipe SiGeF
</p>
