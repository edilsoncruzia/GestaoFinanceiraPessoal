BRIEFING DO PROJETO — Gestão Financeira Pessoal
Nome do projeto: Gestão Financeira Pessoal — pacote gestao-financeira v1.0.0 [verificado]

Tipo de produto: Aplicativo web (SPA React) de finanças pessoais, arquitetado mobile-first, com persistência em Supabase e fallback para LocalStorage [verificado: package.json, README.md]

Stack: React 18.3 + Vite 5.4 · Supabase JS 2.45 · Recharts · lucide-react · html5-qrcode · 100% de estilos inline (só src/main.jsx importa src/index.css) [verificado]

Público-alvo: uso pessoal/do casal. [PENDENTE quanto a confirmar] — o código aponta nessa direção (MemberFilterBar, MemberBadge, MEMBERS em seedData.js, descrição "pessoal/do casal" no README).

Objetivo principal: controle de contas, transações, orçamento, metas, regra 50/30/20, projeções e IR, com um motor de priorização de contas (src/services/prioritizador/: score, gravidade, pacing, fluxo diário, agrupamento) [verificado]

Dispositivo: AMBOS — e é exatamente aí que mora o problema.

Situação arquitetural atual [verificado]
O app inteiro roda dentro de um shell de celular, inclusive no desktop:

Copy
<body> display:flex; align-items:center; justify-content:center   → fundo #e5dec9
  <div class="app-shell">            max-width:430px; height:700px  → telefone
     └ <div position:absolute; inset:0; overflow-y:auto>   ← único scroller
        └ <div class="tab-content" padding:20px 18px 96px>
     └ <BottomNav position:absolute; bottom:0>              ← presa dentro do shell
     └ modais position:absolute; inset:0                     ← presas dentro do shell

@media (min-width:900px):
  .app-shell   → max-width:960px; height:calc(100vh - 40px)
  .tab-content → max-width:720px; margin:0 auto
Fatos que decorrem disso:

Existe exatamente 1 breakpoint no app inteiro — @media (min-width: 900px), em src/index.css:125. Não há nenhum matchMedia/useMediaQuery no código.
A faixa de 431px a 899px não é tratada: notebooks pequenos, tablets e janelas redimensionadas ganham o shell de 430px flutuando num fundo bege vazio.
No desktop o shell só estica, não se reorganiza: a mesma coluna de 720px, a mesma barra de abas inferior, o mesmo modal que sobe de baixo para cima.
ModalSheet é um bottom-sheet (align-items:flex-end, border-radius:20px 20px 0 0) com position:absolute dentro do shell — em 960px de largura isso vira uma gaveta gigante e achatada.
BottomNav é uma tab bar de celular com 5 slots, FAB central de 54px e labels de 9.5px, ancorada em absolute bottom dentro do shell.
Tudo é position:absolute relativo ao shell — nav e modais não têm como escapar da caixa de 430/960px. Qualquer layout desktop "de verdade" (sidebar, modal centralizado, painel lateral) exige mexer nessa premissa.
Paleta duplicada: COLORS em src/constants/tokens.js repete os --color-* de src/index.css. Já estão sincronizados hoje, mas qualquer mudança de tema tem dois lugares.
App.jsx tem 804 linhas concentrando todo o estado do app — fator de risco para qualquer refatoração de shell.
Identidade visual a preservar: paper #F1EDDF, card #FBF9F1, ink #1B2A2F, green #1F5D4C, line #E1DAC4, amber, rust, muted; títulos em Fraunces (classe .serif) e corpo em Inter; cantos arredondados, sombra suave, números tabulares [verificado]

Problema que quero resolver [suas respostas]
No desktop o app parece um celular esticado, com muito espaço vazio.
No celular o layout quebra, aperta ou exige rolagem demais.
Navegação/abas e modais não se comportam bem em telas grandes.
[hipótese a validar em navegador] A quebra no celular provavelmente vem do height: 700px fixo do .app-shell combinado com overflow:hidden e o body centralizando: em viewports mais baixos que 700px (iPhone SE, Android compacto, qualquer celular em modo paisagem) o shell fica maior que a tela e o topo/base são cortados, em vez de o app simplesmente ocupar 100dvh.

Tela/componente em foco [suas respostas]
Shell do app + navegação — App.jsx, BottomNav.jsx, MonthNav.jsx
InicioView (dashboard)
TransacoesView / ExtratoView (listas densas)
PriorizacaoView / ProjecaoView (dados e gráficos)
Você marcou também "Outra — escrevo no campo livre", mas o campo veio vazio. Se havia uma tela específica, me diga qual.

Campos ainda PENDENTES
Campo	Situação
O que deve ser preservado	Não informado. Sugestão de ponto de partida: identidade visual, paleta, tipografia, comportamento no celular, regras do motor de priorização.
O que deve ser removido	Não informado.
Diferenças desejadas entre desktop e mobile	Não informado — é a decisão central desta rodada.
Referências visuais	Existem idea_20.jpeg, idea_21.png e Documentacao_Motor_Priorizacao_v1.1.pdf na raiz, mas não consigo abrir imagens neste modelo. Preciso que você descreva o que elas mostram.
Restrições	Não informado. Restrições técnicas reais que já identifiquei: estilos 100% inline (não há cascata/CSS modules para trabalhar), App.jsx monolítico, e o shell absolute que aprisiona nav e modais.
