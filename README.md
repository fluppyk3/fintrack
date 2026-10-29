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

## Recursos atuais

- Lançamentos de receita, despesa e transferência entre contas.
- Pesquisa, filtros, edição, cópia e exclusão de movimentações.
- Estados realizado e pendente; valores pendentes não entram no saldo real nem no relatório realizado.
- Saldos por conta e visão consolidada; ocultação do saldo.
- Limites mensais por categoria, próximos compromissos, resumo e gráfico derivado dos registros locais.
- Cadastro simples de contas e cartões (cadastro de compras/faturas ainda não disponível).
- Importação de lançamentos pelo CSV exportado pelo app, com validação e detecção de duplicatas.
- Testes unitários das regras centrais de saldo, transferência, orçamento e calendário.
- Exportação CSV, backup JSON e restauração com confirmação e cópia de segurança automática.
- Tema escuro, layout responsivo e cache de shell para abrir offline após a primeira visita.

## Dados, sincronização e privacidade

Os dados são salvos em `localStorage` no navegador/dispositivo atual. Não há autenticação, backend ou sincronização entre dispositivos. Limpe os dados do navegador somente depois de exportar o backup. A sincronização exige configurar um backend e políticas de acesso; nenhuma credencial ou serviço externo está embutido.

## Limitações conhecidas

Este é um MVP funcional de controle local, não um banco conectado. Ainda não implementa pagamentos parciais, recorrências, parcelas, compras/faturas de cartão, cotações/operações de cripto, projeção de 12 meses, resolução de conflitos, autenticação, sincronização ou testes de isolamento. Não são exibidos preços cripto nem movimentações financeiras demonstrativas.

O service worker armazena apenas os arquivos do app; os dados locais permanecem no armazenamento do navegador. Para instalar no Android, abra a aplicação servida em HTTPS no Chrome e use “Instalar app”/“Adicionar à tela inicial”. No PC, abra o endereço no navegador; instalação PWA é oferecida por navegadores compatíveis.

