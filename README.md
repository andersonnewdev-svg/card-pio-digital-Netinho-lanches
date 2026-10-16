🍔 MenuHub SaaS — Plataforma de Cardápio Digital

Plataforma SaaS de cardápio digital desenvolvida com HTML, CSS, JavaScript e Supabase.

O MenuHub permite gerenciar múltiplos estabelecimentos, oferecendo cardápio online, painel administrativo, controle de pedidos, mesas, garçons e gerenciamento de assinaturas.

O projeto começou com o cardápio digital do Nettinho Lanches e evoluiu para uma plataforma multi-loja.

🌐 Demonstração

Primeira loja oficial: Nettinho Lanches

Acessar o cardápio oficial

🚀 Funcionalidades

🛒 Cardápio digital

* Layout responsivo para celular e computador
* Produtos organizados por categorias
* Busca e ordenação de produtos
* Carrinho de compras
* Controle de quantidades
* Observações nos produtos
* Cálculo automático de valores
* Taxas de entrega por região
* Formas de pagamento
* Finalização de pedidos pelo WhatsApp

🔐 Painel administrativo

* Autenticação de usuários
* Cadastro, edição e exclusão de produtos
* Gerenciamento de categorias
* Controle de disponibilidade
* Imagens dos produtos
* Gerenciamento de pedidos
* Atualizações em tempo real com Supabase
* Configurações individuais por estabelecimento

🍽️ Mesas e garçons

* Cadastro e gerenciamento de mesas
* Controle de comandas
* Acompanhamento de mesas ocupadas
* Gerenciamento de itens das contas
* Registro de pagamentos
* Fechamento de contas
* Histórico de contas fechadas
* Interface específica para garçons

Status: funcionalidades implementadas e testadas no ambiente de desenvolvimento. A publicação no painel oficial do Nettinho Lanches ainda está pendente.

🏢 Plataforma SaaS

* Estrutura multi-loja
* Identificação de estabelecimentos por slug
* Isolamento de dados por loja
* Painel central de gerenciamento
* Visualização de estabelecimentos cadastrados
* Controle de planos e assinaturas
* Ativação e bloqueio de lojas
* Renovação manual de assinaturas por 30 dias
* Controle de vencimentos
* Histórico de renovações
* Aviso de proximidade do vencimento no painel administrativo

💳 Planos

* Basic: plano inicial da plataforma
* Pro: plano utilizado pelo Nettinho Lanches

As assinaturas são gerenciadas manualmente pelo administrador do SaaS.

🛠️ Tecnologias utilizadas

* HTML5
* CSS3
* JavaScript
* Supabase (PostgreSQL, Authentication e Realtime)
* Vercel
* Git
* GitHub
* Visual Studio Code

📁 Estrutura do projeto

Nettinho-Lanches/
├── index.html
├── style.css
├── script.js
├── admin.html
├── admin.css
├── admin.js
├── garcom.html
├── garcom.css
├── garcom.js
├── saas-admin.html
├── saas-admin.css
├── saas-admin.js
├── saas-login.html
├── saas-login.js
├── config/
│   └── supabase.js
├── imagens/
└── README.md

🗄️ Banco de dados

O Supabase é utilizado para armazenar e gerenciar dados da plataforma.

Entre os recursos implementados estão:

* Configurações das lojas
* Produtos e categorias
* Pedidos
* Assinaturas
* Histórico de renovações
* Mesas e comandas
* Pagamentos e histórico de contas

🏪 Primeira loja oficial

Nettinho Lanches

* Integração ao gerenciamento de assinaturas do MenuHub
* Plano Pro ativo
* Cardápio oficial funcionando na Vercel
* Gerenciamento de produtos e pedidos
* Módulo de mesas disponível no ambiente de desenvolvimento

🔄 Status do projeto

MenuHub SaaS — Em desenvolvimento

A plataforma já possui funcionalidades multi-loja e gerenciamento de assinaturas implementadas.

O próximo objetivo é concluir os testes, publicar as funcionalidades administrativas atualizadas e preparar a plataforma para receber novos estabelecimentos.

👨‍💻 Desenvolvedor

Anderson da Silva Medeiros

Estudante de Ciência da Computação e desenvolvedor de aplicações web.

GitHub

⸻

Projeto desenvolvido para aplicação prática de conhecimentos em desenvolvimento web, banco de dados e arquitetura SaaS.