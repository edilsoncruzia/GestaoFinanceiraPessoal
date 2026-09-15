# Patch 01 — o que faltou depois do deploy

Análise feita sobre o **site publicado** (`gestao-financeira-pessoal-tawny.vercel.app`)
e sobre o **repositório**, comparando com o protótipo `home-mobile-hero-v3.html`.

---

## O que chegou certo (verificado no bundle publicado)

Conferido nos arquivos que o Vercel serve, não no que foi combinado:

- **CSS publicado:** `--color-accent:#6D28D9`, `--fab-d:62px`, `.app-tabbar-bg`
  com `mask:radial-gradient(circle …)`, `Plus Jakarta Sans`. Nenhum resquício da
  v1: zero `#F1EDDF`, `#1F5D4C`, `#FBF9F1`, `Fraunces` ou `.app-fab`.
- **JS publicado:** os três componentes estão lá e **montados** —
  `InicioView.jsx:316` monta o `BalanceHero` com `dias`, `hojeDia`, `mes`,
  `saude` e `alertas`; `InicioView.jsx:148` monta o `BillCard` dentro do
  `PlannedCard`, com `Icone`, `hoje`, `prioridade`, `recorrencia` e `pessoa`.
- O cartão branco de saldo saiu (o único `card-saldo-disponivel` que existe agora
  é o do herói) e o `LineChart` de "dia a dia" do Recharts foi removido — o
  gráfico não aparece duas vezes.
- Os 6 arquivos do pacote estão no repositório **idênticos** aos entregues. A
  única diferença é em `tokens.js`, e ela é uma correção: faltava a rota `mais` em
  `ROUTES`, que a `AppTabBar` lê em `ROUTES[MAIN_TABS[4]]`. Sem ela a barra
  quebraria. Boa pegada.

## O que faltou

### 1. O herói não sangra até a borda ← é a diferença que mais aparece

`.tab-content` tem `padding: 16px 16px 32px`, e o `BalanceHero` traz
`margin: "0 0 16px"` no próprio estilo inline. Resultado no celular: o bloco
violeta é um cartão de cantos inferiores arredondados **com 16px de fundo claro
em volta** — nas laterais e em cima.

No protótipo o bloco violeta encosta nas laterais e no topo: é ele que define a
borda da tela. Sem isso, a tela lê como "um cartão violeta dentro de uma página
cinza" em vez de "o app é violeta no topo".

### 2. O cartão "Saldo previsto no fim do mês" é um botão que não faz nada

O `BalanceHero` recebe `onAbrirPrevisto` e usa no `onClick` do cartão, mas a
`InicioView` não passa nada. Resultado: ele aparece como botão, tem hover, e o
toque não leva a lugar nenhum.

**Não é regressão.** No código anterior o previsto era um `<Kpi>` — um `<div>`
sem `onClick`. Nunca houve ação para perder. Mas o cartão do herói *parece*
tocável, e um controle que não responde é pior do que um número parado.

### 3. `index.html` ainda carrega a Fraunces

O `<link>` da v1 continua lá, e é a única folha de fontes declarada no HTML. A
Plus Jakarta entra pelo `@import` do CSS (que está correto, na primeira linha do
bundle). Efeito: toda visita baixa a Fraunces — que o `.serif` não usa mais —
antes de descobrir a fonte que realmente importa.

### 4. Mês e filtro de pessoa ficam fora do herói

O `BalanceHero` tem um slot `contexto` feito para receber o `MonthNav` e o
`MemberFilterBar`, e ele nunca é usado: `App.jsx:852-857` continua montando os
dois acima da `InicioView`. No protótipo, o seletor de mês e o filtro vivem
dentro do bloco violeta.

**Este não é um ajuste de uma linha.** O `MonthNav` e o `MemberFilterBar` são
desenhados para fundo claro: dentro do herói ficariam com texto escuro sobre
violeta. Para fazer como no protótipo é preciso uma variante de tom escuro dos
dois — é a próxima peça, não um patch. Fica registrado aqui para não se perder.

### 5. As outras telas

Priorização, Transações, Orçamento e os modais herdaram a paleta nova, mas
seguem com o layout antigo. Isso estava previsto no guia: só a Início recebeu o
tratamento do protótipo.

---

## Patch — três edições

### 1. O herói sangra (celular e tablet)

Em `src/components/ui/BalanceHero.jsx`, no `<section>` do herói:

```diff
-    <section
-      data-od-id="hero-saldo"
-      aria-label="Saldo disponível"
-      style={{
-        position: "relative",
-        color: "#fff",
-        borderRadius: "0 0 32px 32px",
-        margin: "0 0 16px",
+    <section
+      className="hero-bleed"
+      data-od-id="hero-saldo"
+      aria-label="Saldo disponível"
+      style={{
+        position: "relative",
+        color: "#fff",
+        borderRadius: "0 0 32px 32px",
+        marginBottom: 16,
```

A margem horizontal sai do estilo inline (que venceria o CSS) e passa a ser da
classe. Em `src/index.css`, junto das regras de `.tab-content`:

```css
/* O herói é a única superfície que sangra: no celular e no tablet ele encosta
   nas laterais, como no protótipo. No desktop ele fica dentro da coluna, que é
   onde o app já tem barra lateral. O topo NÃO sangra enquanto o mês e o filtro
   estiverem acima dele — sangrar ali puxaria o bloco por cima dos dois. */
@media (max-width: 979px) {
  .hero-bleed { margin-left: -16px; margin-right: -16px; }
}
@media (min-width: 560px) and (max-width: 979px) {
  .hero-bleed { margin-left: -24px; margin-right: -24px; }
}
```

### 2. O previsto passa a responder — ou deixa de parecer botão

Duas saídas, escolha uma. **A primeira** liga o cartão ao resumo do mês, que já
existe e é o conteúdo mais próximo do número:

Em `src/components/views/InicioView.jsx`, na montagem do herói (por volta da
linha 327):

```diff
       alertas={alerts.length}
       onAbrirAlertas={() => setShowAlerts(true)}
+      onAbrirPrevisto={onCloseMonth}
     />
```

Se a intenção for a projeção dos meses seguintes, aponte para a rota
`projecao` em vez disso — nesse caso a `InicioView` precisa receber um
`onNavigate` do `App.jsx`.

**A segunda** é assumir que ali não há destino: em `BalanceHero.jsx`, troque o
`<button … onClick={onAbrirPrevisto}>` do cartão por um `<div>` (mantendo o
visual) e apague a prop. Um número que não leva a lugar nenhum deve parecer um
número.

### 3. A fonte

Em `index.html`, troque o `<link>`:

```diff
-    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
+    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

Com isso a fonte é descoberta no `<head>`, em paralelo com o CSS. O `@import` do
`index.css` pode ficar (não atrapalha) ou sair — se sair, a declaração é uma só.

---

## Como conferir depois

1. No celular: o bloco violeta encosta nas duas laterais, sem faixa clara.
   O topo continua claro, porque o mês e o filtro estão lá.
2. Tocar em "Saldo previsto no fim do mês" abre o detalhe.
3. Na aba Network, numa janela anônima: `Plus+Jakarta+Sans` carrega e
   `Fraunces` não aparece.
4. Nada de rolagem horizontal em 360, 390, 430, 768, 1024 e 1366px.
