# FinTrack

Aplicativo web responsivo e instalável para registro local de movimentações pessoais. Projeto criado do zero. O ZIP antigo foi consultado somente como referência funcional; nenhum arquivo-fonte dele foi reutilizado.

## Rodar localmente

Sirva esta pasta em HTTP (service workers não funcionam em `file://`). Com Node.js instalado, por exemplo:

```sh
npm start
```

Abra o endereço informado no navegador. Não há dependências de runtime nem etapa de build neste MVP.

## Publicação

Aplicação publicada em [https://fluppyk3.github.io/fintrack/](https://fluppyk3.github.io/fintrack/). O workflow `.github/workflows/pages.yml` publica os arquivos estáticos na branch `main` após cada atualização.

## Recursos

- Primeiro acesso com criação de perfil local (nome e e-mail), edição do perfil e opção de sair/entrar no mesmo navegador.
- Lançamentos de receita, despesa e transferência entre contas; pesquisa, filtro, edição, cópia e exclusão.
- Estados realizado e pendente; lançamentos pendentes não afetam saldo real nem totais realizados.
- Saldos por conta e total consolidado; ocultação do saldo.
- Contas a pagar e compromissos editáveis: contas normais, água, luz, internet, empréstimos, compras parceladas, assinaturas e outras obrigações.
- Frequência única, diária, semanal, quinzenal, mensal, trimestral, semestral e anual; quantidade de saídas restantes ou recorrência contínua.
- Pagamentos totais ou parciais, histórico por obrigação, pausa/retomada e geração de uma despesa no extrato apenas após confirmação.
- Limites mensais por categoria, resumo do mês e gráfico derivado dos lançamentos locais.
- Cadastro de contas e cartões (compras e faturas de cartão ainda não implementadas).
- Importação CSV com validação e detecção de duplicatas; exportação CSV e backup JSON restaurável, com confirmação e cópia de segurança automática.
- Tema claro/escuro, interface responsiva e cache do aplicativo para acesso offline após a primeira visita.
- Testes automatizados das regras de saldo, transferências, orçamento, calendário e pagamento parcelado/parcial.

## Dados, sincronização e privacidade

Os dados e o perfil são salvos em `localStorage` no navegador/dispositivo atual. O primeiro acesso é uma tela de perfil local, não uma autenticação segura: o e-mail não protege os dados e não há senha, backend ou sincronização entre dispositivos. O botão Sair encerra a sessão visual local, não bloqueia o navegador. Limpe os dados do navegador somente depois de exportar o backup. A sincronização exige configurar backend, autenticação real e políticas de acesso; nenhuma credencial ou serviço externo está embutido.

## Limitações conhecidas

Este é um app de controle local, não um banco conectado. Obrigações não disparam pagamentos automaticamente; é necessário confirmar cada pagamento. Ainda não implementa compras/faturas de cartão, criptoativos, projeção de fluxo de caixa por 12 meses, sincronização, autenticação segura ou testes de isolamento entre usuários. Não são exibidos preços cripto nem movimentações financeiras demonstrativas.

O service worker armazena apenas os arquivos do app; os dados locais permanecem no armazenamento do navegador. Para instalar no Android, abra a aplicação servida em HTTPS no Chrome e use “Instalar app”/“Adicionar à tela inicial”. No PC, abra o endereço no navegador; instalação PWA é oferecida por navegadores compatíveis.

