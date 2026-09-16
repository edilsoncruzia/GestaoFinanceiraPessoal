# Patch 02 — ajustes apontados na revisão

Suas sete observações, uma por uma, com o ponto exato onde cada uma se resolve.
Os três componentes novos vêm junto: `MemberFilterIcon`, `ResumoCards` e
`MonthAnalysis` (em `src/components/ui/`).

## 0. Onde estes arquivos estão (leia antes de procurar)

Os três componentes **existem e estão prontos**, mas vivem no **projeto do Open
Design**, não na pasta do app. Procurar por eles dentro de
`…\Trabalho\App GestaoFinanceira\` não acha nada — e é o esperado.

```
C:\Users\edils\AppData\Roaming\Open Design\namespaces\release-stable-win\data\projects\fdc7c9d5-808c-49fe-a420-d403738bc2a0\
├── src\components\ui\MemberFilterIcon.jsx     (novo)
├── src\components\ui\ResumoCards.jsx          (novo)
├── src\components\ui\MonthAnalysis.jsx        (novo)
├── src\components\ui\BalanceHero.jsx          ├─ os seis do pacote anterior,
├── src\components\ui\BalanceChart.jsx         │  que o app JÁ tem
├── src\components\ui\BillCard.jsx             │
├── src\components\shell\AppShell.jsx          │
├── src\index.css                              │
├── src\constants\tokens.js                    ┘
├── aplicar-design.ps1
├── PACOTE-DESIGN-V3.md      ← os 9 arquivos na íntegra, um por seção
├── pacote-design-v3.zip     ← os 9 + os guias, com a árvore src\ pronta
├── PATCH-01-AJUSTES-HERO.md
└── PATCH-02-INICIO.md       (este arquivo)
```

Três formas de trazer, da melhor para a pior:

**1. Copiar direto** — não precisa de intermediário, o script lê o projeto do
Open Design e escreve na pasta do app:

```powershell
& "C:\Users\edils\AppData\Roaming\Open Design\namespaces\release-stable-win\data\projects\fdc7c9d5-808c-49fe-a420-d403738bc2a0\aplicar-design.ps1" -SomenteNovos
```

Se a política de execução bloquear o `.ps1`:

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\edils\AppData\Roaming\Open Design\namespaces\release-stable-win\data\projects\fdc7c9d5-808c-49fe-a420-d403738bc2a0\aplicar-design.ps1" -SomenteNovos
```

**2. Descompactar** `pacote-design-v3.zip` por cima da raiz do repositório — a
árvore dentro dele já é `src\…`.

**3. Copiar do `PACOTE-DESIGN-V3.md`** — cada seção é um arquivo completo, com o
caminho no título. É o caminho quando nem a pasta nem o zip estão alcançáveis.

> **Não recrie os três componentes a partir deste patch.** Este documento
> descreve o comportamento e os pontos de integração; ele não carrega o código.
> Um componente reescrito a partir daqui vira uma segunda versão do design — com
> outro espaçamento, outros tokens, outras decisões de contraste — e as duas
> divergem no primeiro ajuste. Use o zip, o pacote ou o script.

> **Copie só os três novos.** O app já tem os outros seis arquivos do pacote, e
> um deles evoluiu por lá — o `tokens.js` ganhou a rota `mais`, sem a qual a
> barra quebraria. Rodar o script sem filtro reescreveria os seis com a versão
> deste projeto e desfaria isso.
>
> ```powershell
> .\aplicar-design.ps1 -SomenteNovos
> ```
>
> Ele copia o que não existe no app e pula o que já existe, listando o que
> pulou. O resto deste patch é edição em dois arquivos que **não** são copiados:
> `InicioView.jsx` e `App.jsx`.

Ordem final da tela depois dos ajustes:

```
herói violeta        marca · [filtro] · anel · sino · saldo · previsto · gráfico
reserva + mercado    dois cards pequenos, lado a lado
contas em aberto     título + resumo + ordenar · 5 cartões · Ver todas as transações
                     novo previsto · fechar o mês
cartão alimentação   (só quando existe)
análise do mês       12 barras, uma linha de leitura
```

---

## 1. Filtro no topo não virou ícone

**Hoje:** `MemberFilterBar` é uma barra de três pílulas de largura inteira,
montada **acima** do herói (`App.jsx:855-857`), empurrando o saldo para baixo.

**Depois:** o mesmo estado, montado como ícone na linha da marca — ao lado do
anel de saúde e do sino, como no protótipo. O componente novo é
`MemberFilterIcon.jsx`: ele traz o ícone, o ponto quando há filtro ativo e a
folha "Ver dados de" com as opções.

Em `App.jsx`:

```diff
-        <div className="only-phone" style={{ marginBottom: 12 }}>
-          <MemberFilterBar value={memberFilter} onChange={setMemberFilter} />
-        </div>
         <InicioView balance={balance} availableBalance={availableBalance} …
+          onChangeMemberFilter={setMemberFilter}
         />
```

Em `InicioView.jsx`, na assinatura da função, aceite a prop nova:

```diff
-export function InicioView({ balance, availableBalance, …, memberFilter, hideBalance, …
+export function InicioView({ balance, availableBalance, …, memberFilter, onChangeMemberFilter, hideBalance, …
```

E monte no topo do herói (o slot `topo` já existe nele):

```jsx
<BalanceHero
  …
  topo={<MemberFilterIcon value={memberFilter} onChange={onChangeMemberFilter} />}
/>
```

> O `MonthNav` **não** entra no herói. Ele é um controle de contexto largo
> (setas + rótulo + selo) e ficaria apertado na linha dos ícones; acima do
> bloco, no fundo claro, ele lê melhor. O que subiu para o ícone foi o filtro,
> que é uma escolha de três opções.

---

## 2. Reserva e mercado fora do lugar

**Hoje:** a reserva é um `SupportCard` grande no **fim** da coluna de apoio
(linhas 445-469) e o mercado é a seção "Ritmo de gasto do mercado", escondida
dentro do bloco recolhível (linhas 532-541).

**Depois:** os dois viram os quadros pequenos do protótipo, lado a lado, logo
abaixo do gráfico. Insira logo depois do `</BalanceHero>`, ainda dentro da
coluna de decisão:

```jsx
<ResumoCards
  moeda={mask}
  reserva={temReserva ? {
    disponivel: reservaDisponivel,
    total: reservaMinima,
    usado: reservaUsada,
    onAbrir: onOpenReserva,
  } : null}
  mercado={pacing ? {
    restante: pacing.saldoSemanalRestante,
    total: pacing.envelopeSemanal,
  } : null}
/>
```

O card do mercado fica **sem ação** de propósito: não existe tela de orçamento
de mercado para abrir, e um card que parece botão sem levar a lugar nenhum é
pior do que um número parado. Se quiser dar destino a ele, aponte para a tela
de Orçamento.

Depois disso, **apague** o `SupportCard` da reserva (linhas 445-469) e os três
`Kpi` do mercado dentro do bloco recolhível (linhas 532-541).

---

## 3. Cards de "saldo fim do mês / a receber / a pagar" abaixo do gráfico

**Hoje:** a faixa de três KPIs (linhas 330-341) repete o que o herói já diz — o
saldo do fim do mês está lá em cima, em 21px.

**Depois:** apague a faixa inteira, **incluindo** o parágrafo
"No ritmo atual, o mês fecha negativo…" logo abaixo dela (linhas 337-341). Esse
aviso volta como uma linha na Análise do mês, junto do gráfico que o comprova.

O que **não** se perde: "a receber" e "a pagar" continuam na tela, no resumo do
cabeçalho de Contas em aberto (item 5 abaixo) — que é onde eles são acionáveis,
porque é a lista que os resolve.

---

## 4. Muitos textos

Exclusões, todas no `InicioView.jsx`. Nenhuma delas carrega informação que não
esteja em outro lugar da tela:

| Linhas | O que sai | Por quê |
|---|---|---|
| 337-341 | "No ritmo atual, o mês fecha negativo…" | vira linha da Análise do mês |
| 356-359 | "R$ X em aberto · N vencem esta semana" | o resumo do item 5 substitui |
| 433-435 | "**Boa** · 34% da renda do mês já usada" | a nota já está no anel do herói; o detalhe, no ⓘ |
| 438-442 | "N fatores estão descontando pontos — toque no ⓘ" | idem |
| 461-467 | o parágrafo inteiro da reserva | vira "de R$ X" no card |
| 479-482 | "Fora do saldo disponível — este valor não pode pagar…" | explicação que o próprio nome do card já dá |
| 495 | "saldo mês a mês, dia a dia e ritmo de gasto" | o gráfico diz o que é |
| 519-530 | os três parágrafos condicionais do gráfico | viram UMA linha na Análise do mês |
| 520-521 | "Barras mais claras são previsão. Toque duas vezes…" | a legenda nomeada substitui |

Regra para o resto: **uma linha de leitura por bloco.** Onde houver duas frases
dizendo o mesmo número, fica a que diz o número.

---

## 5. Contas em aberto: 5 e o botão

**Hoje:** a lista renderiza **todos** os itens abertos do mês (`openItems.map`,
linha 380) e o botão "Ver todas as transações" está lá embaixo, no fim da coluna
de apoio (linhas 547-549) — longe de onde a lista termina.

**Depois:** cinco, e o botão logo abaixo.

```diff
-            {openItems.map((item) => (
+            {openItems.slice(0, 5).map((item) => (
               <PlannedCard key={item.occId} item={item} … />
             ))}
+
+            {openItems.length > 5 && (
+              <button onClick={onSeeAll} style={{
+                width: "100%", minHeight: 48, marginTop: 4, borderRadius: 12,
+                border: "1px solid " + COLORS.line, background: COLORS.card,
+                color: COLORS.accent, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5,
+              }}>
+                Ver todas as {openItems.length} contas em aberto
+              </button>
+            )}
```

E apague o botão antigo do fim da coluna de apoio (linhas 547-549).

**No cabeçalho da seção**, troque o selo de contagem e a linha corrida (linhas
350-359) por dois chips, como no protótipo — é onde "a pagar" e "a receber"
passam a viver:

```jsx
{openItems.length > 0 && (
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "0 11px", minHeight: 30,
      borderRadius: 999, background: COLORS.surface, border: "1px solid " + COLORS.border,
      fontSize: 12, fontWeight: 600, color: COLORS.fg2 }}>
      <b className="num" style={{ color: COLORS.expense }}>{mask(openPagar)}</b> a pagar
    </span>
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "0 11px", minHeight: 30,
      borderRadius: 999, background: COLORS.surface, border: "1px solid " + COLORS.border,
      fontSize: 12, fontWeight: 600, color: COLORS.fg2 }}>
      <b className="num" style={{ color: COLORS.income }}>{mask(openReceber)}</b> a receber
    </span>
  </div>
)}
```

Com os dois totais calculados junto dos outros, antes do `return`:

```jsx
const restanteDoItem = (i) => Math.max(0, (i.amount || 0) - (i.paid || 0));
const openPagar = openItems.filter(ehDespesaItem).reduce((s, i) => s + restanteDoItem(i), 0);
const openReceber = openItems.filter((i) => !ehDespesaItem(i)).reduce((s, i) => s + restanteDoItem(i), 0);
```

---

## 6. Saúde financeira e reserva no fim, análise antiga

- **Saúde financeira** (linhas 415-443): apague o `SupportCard`. A nota já vive
  no anel do topo do herói, e o anel abre a **mesma** folha (`setShowHealthInfo`).
- **Reserva mínima** (linhas 445-469): apague — virou card no item 2.
- **Análise do mês** (linhas 486-545): substitua o `<Card><details>…</details></Card>`
  inteiro por:

```jsx
<MonthAnalysis meses={projectedBalance} moeda={mask} />
```

Duas mudanças de comportamento, para você decidir com o desenho na frente:

1. **Deixou de ser recolhível.** O painel do protótipo é visível; esconder a
   tendência atrás de um clique é o que fazia a tela parecer interminável.
2. **O toque na barra saiu.** Eram 12 alvos de ~22px, abaixo dos 44px que o dedo
   pede — e o toque era duplo, o que ninguém descobre sozinho. O mês continua
   sendo escolhido pelo seletor do topo, que é o controle desse contexto.

Se preferir manter a troca de mês pela barra, é melhor voltar com o painel
recolhível do que manter alvos de 22px.

Depois de trocar, confira se o Recharts ainda é usado no arquivo
(`grep ResponsiveContainer src/components/views/InicioView.jsx`). Se não for,
saia o import da linha 7 e as funções `renderBarLabel`, `monthBarTooltip` e
`handleBarTap` — elas existiam só para aquele gráfico.

---

## 7. Cartão alimentação

Fica (não estava na sua lista), com o parágrafo cortado — o valor e o nome
bastam. Se ele também parecer texto demais, o corte mais limpo é transformá-lo
no terceiro card pequeno da faixa reserva + mercado, e aí a coluna de apoio
some por inteiro.

---

## Como conferir

1. O filtro é um ícone na linha da marca; com "Você" selecionado, aparece o
   ponto no ícone e a folha mostra o item marcado.
2. Abaixo do gráfico: dois cards pequenos, reserva e mercado, com barra e "de R$".
3. Nenhum card de "saldo fim do mês / a receber / a pagar" solto na coluna.
4. Contas em aberto mostra no máximo 5 cartões e, embaixo deles, "Ver todas as
   N contas em aberto".
5. O fim da tela tem o cartão alimentação (quando existe) e a Análise do mês.
   Nenhuma "Saúde financeira" nem "Reserva mínima" em card no rodapé.
6. Em 360px, nada de rolagem horizontal e nenhum texto cortado.
