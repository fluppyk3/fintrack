# FinTrack

Aplicativo web responsivo e instalável para registro local de movimentações pessoais. Projeto criado do zero. O ZIP antigo foi consultado somente como referência funcional; nenhum arquivo-fonte dele foi reutilizado.

## FinTrack Dark Analytics

O painel segue a direção visual do pin de carteira digital fornecido pelo usuário: base verde-floresta escura, superfícies em camadas, texto claro e acentos verde-menta. A interface tem somente tema escuro, tokens de cor centralizados, estados de toque/foco, transições curtas e respeito a `prefers-reduced-motion`. O saldo usa SVG e categorias/lançamentos são filtrados pelo mês escolhido. Os cálculos continuam usando centavos inteiros e as regras de `finance.js`; o seletor só altera a visualização. A linha histórica é exibida apenas quando há movimentações realizadas suficientes para formar um histórico.

Configure o ticket alimentação pelo botão **Configurar** no cartão de saldo do painel. Informe o nome e o saldo disponível atual; o benefício fica em uma conta separada, fora do saldo bancário consolidado. Lançamentos existentes são preservados e continuam compondo o saldo do benefício. Use **Ajustar** nesse mesmo cartão para corrigir o saldo disponível mais tarde.

Os limites do planejamento descontam despesas realizadas e reservam pagamentos pendentes e compromissos ativos vencidos ou previstos até o fim do mês. Cada pagamento pode ser associado a uma conta e, opcionalmente, a uma obrigação; ao confirmar um pagamento vinculado, o saldo da conta e o compromisso são atualizados juntos, sem duplicar o orçamento.

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
- Pagamentos totais ou parciais, histórico por obrigação, pausa/retomada, desfazer o pagamento mais recente e remover obrigações sem pagamentos. O desfazer cancela o lançamento bancário associado e preserva o registro no histórico.
- Limites mensais por categoria, resumo do mês e gráfico derivado dos lançamentos locais.
- Cartões com compras no crédito à vista ou parceladas, faturas por vencimento, limite calculado dinamicamente e pagamento parcial ou total por conta bancária. A compra aparece como despesa uma única vez; a quitação da fatura só reduz o saldo bancário. Dias de fechamento e vencimento aceitam 1 a 31, limitados ao último dia real de cada mês.
- Importação CSV com validação e detecção de duplicatas; exportação CSV e backup JSON restaurável, com confirmação e cópia de segurança automática.
- Tema escuro único, foto de perfil com upload de até 10 MB (imagem reduzida localmente), interface responsiva e cache do aplicativo para acesso offline após a primeira visita.
- Testes automatizados das regras de saldo, transferências, orçamento, calendário, pagamentos parciais e cálculos de fatura/parcelas de cartão.

## Dados, sincronização e privacidade

Os dados e o perfil são salvos em `localStorage` no navegador/dispositivo atual. O primeiro acesso é uma tela de perfil local, não uma autenticação segura: o e-mail não protege os dados e não há senha, backend ou sincronização entre dispositivos. O botão Sair encerra a sessão visual local, não bloqueia o navegador. Na aba Meu perfil, “Apagar todos os dados” remove os dados do FinTrack deste navegador após confirmação digitada; exporte um backup antes se quiser guardar uma cópia. A sincronização exige configurar backend, autenticação real e políticas de acesso; nenhuma credencial ou serviço externo está embutido.

## Limitações conhecidas

Este é um app de controle local, não um banco conectado. Obrigações e faturas não disparam pagamentos automaticamente; é necessário confirmar cada pagamento. Criptoativos, cotações de mercado, projeção de fluxo de caixa de 12 meses, sincronização e autenticação segura não estão implementados. Compras de cartão com faturas já estão integradas à contabilização local. Não são exibidos preços cripto nem movimentações financeiras demonstrativas.

O service worker armazena apenas os arquivos do app; os dados locais permanecem no armazenamento do navegador. O manifesto inclui ícones PNG de 192 e 512 px, escopo relativo para GitHub Pages e tela independente. Para instalar no Android, abra a aplicação servida em HTTPS no Chrome e use “Instalar app”/“Adicionar à tela inicial”. No PC, abra o endereço no navegador; instalação PWA é oferecida por navegadores compatíveis. A instalação em um aparelho Android e o uso offline real precisam ser confirmados no dispositivo.
