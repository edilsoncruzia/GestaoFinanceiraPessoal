# Aplicar o design definitivo no app

Esta é a rodada em que o design aprovado no protótipo (`home-mobile-hero-v3.html`)
vira código do app. Não é um pacote de telas novas: é a **camada visual** — tokens,
tema, navegação inferior e os três componentes que carregam a identidade — mais o
mapa exato de onde cada um entra.

Nada de regra de negócio, dado, motor de priorização ou fluxo mudou. Tudo o que
está aqui é apresentação.

---

## 0. Onde estes arquivos estão (leia antes de procurar)

Os seis arquivos **existem e estão prontos**, mas eles vivem no **projeto do Open
Design**, não na pasta do app. Quem procurar por eles dentro de
`…\Trabalho\App GestaoFinanceira\` não vai achar nada — é o esperado.

```
C:\Users\edils\AppData\Roaming\Open Design\namespaces\release-stable-win\data\projects\fdc7c9d5-808c-49fe-a420-d403738bc2a0\
├── src\constants\tokens.js
├── src\index.css
├── src\components\shell\AppShell.jsx
├── src\components\ui\BalanceHero.jsx
├── src\components\ui\BalanceChart.jsx
├── src\components\ui\BillCard.jsx
├── aplicar-design.ps1
├── PACOTE-DESIGN-V3.md      ← os 6 arquivos na íntegra, num arquivo só
└── pacote-design-v3.zip     ← os 6 + os guias, com a árvore src\ pronta
```

Três formas de levar para o app, da melhor para a pior:

**1. Rodar o script** (confere o hash de cada arquivo depois de copiar):

```powershell
& "C:\Users\edils\AppData\Roaming\Open Design\namespaces\release-stable-win\data\projects\fdc7c9d5-808c-49fe-a420-d403738bc2a0\aplicar-design.ps1" -Repo "C:\Users\edils\OneDrive\Edilson\Trabalho\App GestaoFinanceira"
```

**2. Extrair o zip** por cima da raiz do repositório — dentro dele a árvore já é
`src\…`, então nada precisa ser renomeado.

**3. Copiar do `PACOTE-DESIGN-V3.md`** — cada seção é um arquivo completo, na
ordem, com o caminho no título.

> **Não recrie estes arquivos "a partir da especificação".** Este guia descreve a
> migração e os pontos de integração, mas não carrega os valores da paleta. Um
> arquivo reescrito a partir dele vira uma segunda versão do design, com outro
> violeta e outros cinzas, e as duas divergem no primeiro ajuste. Se algum
> arquivo se perder, ele se recupera do zip ou do pacote — não do texto.

---

## 1. Arquivos desta rodada

| Arquivo | O que é | Substitui |
|---|---|---|
| `src/constants/tokens.js` | Paleta v3 + aliases de migração + rotas/categorias | o tokens.js bege/verde |
| `src/index.css` | Tema, fontes e o CSS da barra inferior nova | o index.css da v1 |
| `src/components/shell/AppShell.jsx` | Sidebar, topbar e a barra inferior flutuante | o AppShell com FAB solto |
| `src/components/ui/BalanceHero.jsx` | **novo** — o bloco de destaque da Início | — |
| `src/components/ui/BalanceChart.jsx` | **novo** — gráfico dia a dia com eixo e leitura | o `LineChart` do Recharts |
| `src/components/ui/BillCard.jsx` | **novo** — o cartão de conta em aberto | o visual do `PlannedCard` |

Copie os seis para os mesmos caminhos dentro do projeto
(`…\Trabalho\App GestaoFinanceira\`). Os **três primeiros são substituição
direta**; os **três últimos são arquivos novos**.

Há um script para isso, na raiz deste projeto: `aplicar-design.ps1`. Ele copia
os seis, confere o hash de cada um e avisa se algum não bater.


```powershell
.\aplicar-design.ps1            # copia para o caminho padrão do app
.\aplicar-design.ps1 -WhatIf    # só mostra o que faria
```

`src/components/ui/BottomNav.jsx` continua como está (ponte para `AppTabBar`).

---

## 2. A regra que organiza a paleta

A mesma do `design-system-v2.md`, agora com o violeta da marca aprovado:

| Cor | Significa | Nunca significa |
|---|---|---|
| Violeta `--color-accent` | marca e **ação** — botão, aba ativa, destaque | valor financeiro |
| Verde `--color-income` | dinheiro que **entra** | ação, marca |
| Vermelho `--color-expense` | dinheiro que **sai** | erro, exclusão |
| Âmbar `--color-warn` | atenção e prazo | valor financeiro |
| Azul `--color-info` | informação | — |

Fundo frio (`#F7F6FB`), nunca bege. Títulos e valores em **Plus Jakarta Sans**,
corpo em **Inter** — a serifa saiu: número grande em serifa desalinha coluna de
valores.

### A migração sem tocar em 65 arquivos

Os 15 nomes antigos de `COLORS` continuam existindo, com valores novos. Isso
repinta o app inteiro de uma vez, sem um único import alterado.

Um deles exige atenção: **`COLORS.green` passou a apontar para a AÇÃO (violeta)**,
que é o que ele significava no app todo — botão primário, aba ativa, marca. Mas
em ~22 pontos ele significava "dinheiro que entra". Esses precisam virar
`COLORS.income`:

| Arquivo | Linhas | O que está pintado |
|---|---|---|
| `views/InicioView.jsx` | 66, 79, 386, 395, 598, 615, 623, 639, 651 | saldo positivo, barra positiva, legenda do saldo |
| `modals/CloseMonthModal.jsx` | 22, 30, 84 | receitas do mês, sobra, reserva |
| `modals/HoleriteModal.jsx` | 77 | líquido do holerite |
| `modals/PayModal.jsx` | 73 | lançamento de receita |
| `views/ContasView.jsx` | 72 | saldo da conta |
| `views/ExtratoView.jsx` | 26, 45 | saldo atual, receita na lista |
| `views/FontesView.jsx` | 32 | receitas |
| `views/PriorizacaoView.jsx` | 107, 247 | saldo para contas, linha do gráfico |
| `views/CategoriasView.jsx` | 60 | selo de categoria de receita |

Comando para achar todos depois da troca:

```
grep -rn "COLORS\.green" src/ | grep -E "saldo|receit|income|sobra|>= 0"
```

`COLORS.rust` e `COLORS.amber` já apontam para o vermelho e o âmbar certos — ali
não há nada a corrigir.

---

## 3. A barra inferior

O que mudou, e por quê:

- **Pílula flutuante** (12px das laterais, 8px do fundo) no lugar de faixa colada
  com divisória em cima. Ela descola do conteúdo e passa a ler como controle, não
  como rodapé.
- **Ação principal no meio**, onde o polegar chega sem alcance forçado. O FAB
  solto no canto inferior direito **deixou de existir** — duas ações primárias na
  mesma tela era uma a mais. `App.jsx` não precisa mudar: `onAdd` já era passado
  ao shell.
- **Recorte na máscara** em volta do botão: o fundo é um irmão (`.app-tabbar-bg`),
  fora do `<nav>`, porque a máscara que abre o furo cortaria o próprio botão se
  ele fosse filho. O vão entre botão e recorte é 3px em qualquer largura, porque
  os dois saem das mesmas duas variáveis (`--fab-d` e `--fab-r`).
- **Vão no grid** (`1fr 1fr [botão] 1fr 1fr`) em vez de padding central: sem isso
  o rótulo de "Transações" encostaria no botão.

O `AppShell` não renderiza mais `<button className="app-fab">`. A classe saiu do
CSS e ninguém mais a usa (confira com `grep -rn "app-fab" src/`).

---

## 4. Onde cada componente entra — Início

Três pontos, em `src/components/views/InicioView.jsx`. Os números de linha são os
de hoje; use o texto de referência, não a linha, se o arquivo já tiver mudado.

### 4.1 O topo vira o herói — linhas 371–430

**Hoje:** `<Card data-od-id="card-saldo-disponivel">` com o saldo em serifa 38px,
seguido da faixa de KPIs (`<Kpi … />` × 3).

**Depois:**

```jsx
<BalanceHero
  disponivel={availableBalance}
  previsto={monthProjection.endBalance}
  escondido={hideBalance}
  onAlternarVisao={onToggleHide}
  dias={dias}
  hojeDia={isCurrentMonth ? new Date().getDate() : null}
  mes={Number(selectedMonth.slice(5, 7))}
  saude={health?.score}
  onAbrirSaude={() => setShowHealthInfo(true)}
  alertas={alerts.length}
  onAbrirAlertas={() => setShowAlerts(true)}
  onAbrirPrevisto={/* o que hoje abre o detalhe do previsto */}
/>
```

O herói já traz marca, anel de saúde, sino, saldo, saldo previsto e o gráfico.
Os três KPIs de apoio (saldo no fim do mês, a receber, disponível na semana)
saem do topo e passam para a faixa logo abaixo do herói — eles continuam
existindo, só deixam de disputar com o saldo.

**Duplicidade a evitar:** no desktop o mês e o filtro de pessoa vivem na topbar.
No celular, passe os dois para dentro do herói pelo slot `contexto`, em vez de
deixar a faixa `only-phone` acima dele:

```jsx
contexto={
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
    <MonthNav month={selectedMonth} onChange={onSelectMonth} />
  </div>
}
```

### 4.2 A lista usa o cartão novo — linhas 466–467

**Hoje:** `{openItems.map((item) => <PlannedCard key={item.occId} item={item} … />)}`

**Depois:** troque o **visual** mantendo toda a lógica que já existe no
`PlannedCard` (menu de editar/excluir, confirmação, salário com descontos,
movimentos agrupados). O `BillCard` é apresentacional de propósito: ele recebe
valores prontos e devolve o cartão.

```jsx
<BillCard
  titulo={item.description}
  valor={valorMostrado}              // o mesmo netAmount do salário que o card já calcula
  pago={item.paid}
  tipo={item.type === "income" ? "income" : "expense"}
  categoria={categories[item.category]?.label}
  prioridade={PRIORITY[item.priority]?.label}
  pessoa={item.memberId == null ? "Casal" : nomeDoMembro(item.memberId)}
  recorrencia={RecIcon ? rotuloDaRecorrencia(item) : null}
  vencimentoDia={item.diaVencimento}
  indicadaDia={item.dataIndicada}
  mes={Number(selectedMonth.slice(5, 7))}
  hoje={isCurrentMonth ? new Date().getDate() : null}
  Icone={categories[item.category]?.icon || Tag}
  onAbrir={() => onEdit(item)}
  onPagar={() => onPay(item)}
  acoes={/* o menu e a confirmação de exclusão que já existem, sem mudança */}
/>
```

O caminho mais seguro é **manter o `PlannedCard` como está e trocar só o `return`
do visual dele** pelo `BillCard`, passando as props acima. Assim nada da lógica
sai do lugar e o diff fica revisável.

### 4.3 O gráfico dia a dia saiu do `<details>` — linhas 629–667

O bloco com `<LineChart data={dias}>` e as três linhas do Recharts (saldo,
reserva, cartão alimentação) some: o mesmo dado agora vive no herói, com eixo de
datas, valores de referência, marca de hoje e leitura por toque. O que era
informativo no bloco (`reserva começa em X e desce conforme é usada`) vira a
legenda do próprio gráfico, que já lista saldo, reserva e alimentação com
amostra de traço.

O gráfico de **12 meses** (`BarChart`, linhas 587–603) **fica**: é outro gráfico,
outra pergunta ("como fecho o ano"), e continua onde está.

---

## 5. Verificação depois de aplicar

1. `pnpm dev`, em 390×844:
   - o topo é o herói violeta, com o saldo grande, o previsto e o gráfico;
   - a barra inferior é uma pílula solta, com a ação no meio e o recorte em volta;
   - o conteúdo rola **por baixo** dela e o último cartão não fica escondido;
   - o gráfico: 4 datas na base, 3 valores à direita, "HOJE" sob o dia atual;
   - passar o dedo no gráfico mostra a leitura do dia e ela fica 2,6s depois de
     levantar o dedo.
2. 700px de largura: duas colunas, mesma barra inferior, nenhum rótulo truncado.
3. 980px+: barra lateral em violeta, topbar com mês e pessoa, sem barra inferior
   e sem FAB solto.
4. Abrir um modal: diálogo centralizado, ESC funcionando.
5. Conferir que nenhum texto ficou ilegível: o verde da ação antiga virou violeta
   e o de dinheiro virou verde — a lista da seção 2 é o roteiro.

Se algum ponto aparecer com **texto escuro sobre fundo escuro**, é sinal de que
um componente ainda espera o fundo claro: use `tom="escuro"` no `BalanceChart` ou
o token de texto claro (`#DDD6FE` para rótulo, `#fff` para valor) dentro do herói.

---

## 6. O que ainda não está nesta rodada

- **Priorização e Transações** continuam com o visual antigo, agora na paleta
  nova. Elas herdam os tokens, então não ficam destoando — ficam para quando
  você quiser o mesmo tratamento de cartão que a Início recebeu.
- **Modo escuro.** O `design-system-v2.md` já descreve os dois temas, mas isso
  exige trocar os tokens em runtime (classe no `<html>` + um segundo conjunto de
  valores). É uma rodada própria.
- **O badge de "hoje" na aba.** O modelo não tem; se quiser, é uma linha no
  `AppTabBar`.
