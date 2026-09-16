---
name: "Gestão Financeira Pessoal (Mobile)"
version: "3.0.0"
target: "mobile-web"
platform: "mobile"
description: "Design system contract and visual specification for the mobile version of Gestão Financeira Pessoal, strictly adhering to Google Stitch DESIGN.md standard."
tokens:
  colors:
    palette:
      violet-950: "#2A0A63"
      violet-900: "#3B1483"
      violet-800: "#4C1D95"
      violet-700: "#5B21B6"
      violet-600: "#6D28D9"
      violet-500: "#7C3AED"
      violet-400: "#8B5CF6"
      violet-300: "#A78BFA"
      violet-200: "#DDD6FE"
      violet-100: "#EDE9FE"
      emerald-700: "#047857"
      emerald-600: "#059669"
      emerald-400: "#34D399"
      emerald-200: "#A7F3D0"
      emerald-100: "#CBEBDA"
      emerald-50: "#E4F5EE"
      red-700: "#B91C1C"
      red-400: "#F87171"
      red-300: "#FCA5A5"
      red-200: "#F7D2D2"
      red-50: "#FCEAEA"
      amber-800: "#9C500A"
      amber-400: "#FBBF24"
      amber-200: "#F1DFB2"
      amber-50: "#FBF0E0"
      orange-400: "#FB923C"
      orange-300: "#FDBA74"
      blue-700: "#1D4ED8"
      blue-200: "#CBDCFB"
      blue-50: "#E7EFFE"
      slate-900: "#15132A"
      gray-600: "#4B5563"
      gray-500: "#6B7280"
      gray-200: "#E9E6F2"
      gray-100: "#F1EFF8"
      canvas: "#F7F6FB"
      page: "#EDEBF3"
      white: "#FFFFFF"
    semantic:
      brand:
        primary: "#6D28D9"
        deep: "#4C1D95"
        bright: "#7C3AED"
        soft: "#EDE9FE"
      action:
        primary: "#6D28D9"
        hover: "#7C3AED"
        active: "#4C1D95"
        soft: "#EDE9FE"
        fab-gradient-start: "#8B5CF6"
        fab-gradient-end: "#6D28D9"
        tab-active: "#FB923C"
      income:
        text: "#047857"
        surface: "#E4F5EE"
        border: "#CBEBDA"
        indicator: "#34D399"
      expense:
        text: "#B91C1C"
        surface: "#FCEAEA"
        border: "#F7D2D2"
      warning:
        text: "#9C500A"
        surface: "#FBF0E0"
        border: "#F1DFB2"
      info:
        text: "#1D4ED8"
        surface: "#E7EFFE"
        border: "#CBDCFB"
      neutral:
        canvas: "#F7F6FB"
        surface: "#FFFFFF"
        surface-subtle: "#F1EFF8"
        page: "#EDEBF3"
        border: "#E9E6F2"
        border-soft: "#EFEDF5"
        text-primary: "#15132A"
        text-secondary: "#4B5563"
        text-muted: "#6B7280"
        text-inverse: "#FFFFFF"
      hero:
        background-start: "#2A0A63"
        background-mid: "#4C1D95"
        background-end: "#6D28D9"
        glow-cyan: "rgba(56, 189, 248, 0.30)"
        glow-magenta: "rgba(217, 70, 239, 0.26)"
        glow-violet: "rgba(124, 58, 237, 0.50)"
        card-glass: "rgba(255, 255, 255, 0.10)"
        card-border: "rgba(255, 255, 255, 0.17)"
        card-highlight: "rgba(255, 255, 255, 0.20)"
        text-label: "#DDD6FE"
        text-value: "#FFFFFF"
  typography:
    families:
      display: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
      body: "'Inter', system-ui, -apple-system, sans-serif"
    weights:
      regular: 400
      medium: 500
      semibold: 600
      bold: 700
      extrabold: 800
    scale:
      micro: { size: "9.5px", lineHeight: "12px", letterSpacing: "0.06em", uppercase: true }
      caption: { size: "11px", lineHeight: "14px", letterSpacing: "0.02em" }
      body-sm: { size: "12px", lineHeight: "16px", letterSpacing: "0" }
      body: { size: "13.5px", lineHeight: "19px", letterSpacing: "0" }
      subheading: { size: "15px", lineHeight: "20px", letterSpacing: "-0.02em" }
      heading-sm: { size: "17px", lineHeight: "22px", letterSpacing: "-0.025em" }
      heading: { size: "21px", lineHeight: "26px", letterSpacing: "-0.03em" }
      heading-lg: { size: "24px", lineHeight: "30px", letterSpacing: "-0.03em" }
      hero-balance: { size: "clamp(31px, 9.6vw, 38px)", lineHeight: "1.04", letterSpacing: "-0.035em" }
    rules:
      tabularNumbers: true
  spacing:
    unit: 4
    scale:
      0: "0px"
      1: "4px"
      2: "8px"
      3: "12px"
      4: "16px"
      5: "20px"
      6: "24px"
      8: "32px"
      10: "40px"
      12: "48px"
    touchTargetMin: "44px"
    screenPadding: "16px"
    tabbarTotalHeight: "112px"
    fabDiameter: "62px"
    fabCutoutRadius: "34px"
  shapes:
    radii:
      control: "12px"
      iconbtn: "14px"
      card: "18px"
      hero-card: "22px"
      sheet: "24px"
      tabbar: "28px"
      hero-bottom: "32px"
      pill: "999px"
    borders:
      hairline: "1px solid var(--color-border)"
      glass: "1px solid rgba(255, 255, 255, 0.17)"
  elevation:
    shadows:
      card: "0 1px 2px rgba(21, 19, 42, 0.04)"
      raised: "0 6px 20px -6px rgba(21, 19, 42, 0.10), 0 2px 6px rgba(21, 19, 42, 0.04)"
      tabbar: "0 14px 34px -14px rgba(46, 16, 101, 0.70), 0 2px 8px -3px rgba(21, 19, 42, 0.35)"
      fab: "0 12px 24px -6px rgba(46, 16, 101, 0.75), 0 3px 8px -2px rgba(21, 19, 42, 0.35)"
      hero: "0 26px 50px -18px rgba(46, 16, 101, 0.55)"
      glass-card: "inset 0 1px 0 rgba(255, 255, 255, 0.20), 0 14px 30px -14px rgba(10, 4, 30, 0.55)"
      bill-card-indicator: "-8px 8px 0"
  layout:
    viewport: "mobile-first"
    minWidth: "320px"
    targetWidth: "390px"
    maxWidth: "559px"
    viewportHeight: "100dvh"
---

# Design System Specification — Gestão Financeira Pessoal (Mobile)

> **Google Stitch `DESIGN.md` Contract**  
> Fonte de verdade canônica do design system mobile (v3 definitivo).  
> Este documento governa a geração de código, layout e identidade visual por agentes de IA e desenvolvedores.

---

## 1. Overview

### 1.1 Propósito do Produto
O **Gestão Financeira Pessoal** é um aplicativo web progressivo (PWA / Mobile-First SPA) focado no controle financeiro pessoal e familiar (casal). O produto entrega domínio total de fluxo de caixa, orçamento mensal (50/30/20), reserva de emergência e um **motor analítico de priorização de contas** que define o momento ideal de pagamento de cada boleto para preservar a saúde financeira e evitar juros.

### 1.2 Filosofia de Design Mobile
1. **Clareza de Ação vs. Sinal do Dinheiro:** A cor nunca é decorativa. Violeta é **marca e ação**; Verde é **dinheiro entrando**; Vermelho é **dinheiro saindo**; Âmbar é **atenção e prazo**.
2. **Postura Ergonômica Polegar-First:** Em dispositivos móveis, a ação mais frequente (adicionar lançamento) vive no centro da barra de navegação flutuante inferior (`--fab-d: 62px`), ao alcance natural do polegar, eliminando alcances forçados no topo ou botões flutuantes perdidos nas pontas da tela.
3. **Sensação Premium & Fria:** O app abandonou paletas beges e amareladas obsoletas. A experiência utiliza superfícies em cinza-azulado frio (`#F7F6FB`), contraste glassmorphic no cabeçalho hero imersivo, tipografia moderna sem serifa e sombras puramente funcionais.
4. **Respeito aos Limites Físicos da Tela:** Viewport dinâmico real com `100dvh`, suporte estrito a `safe-area-inset-top` e `safe-area-inset-bottom`, alvos de toque com área útil mínima de 44×44px e padding inferior reservado (`--tabbar-height: 112px`) para garantir que nenhum conteúdo seja encoberto pela barra de abas.

---

## 2. Colors

### 2.1 Princípio de Uso e Semântica Estrita
Cada cor possui **um único papel sistemático**. Nunca subverta a semântica de uma cor para uso meramente estético:

| Token | Hex | Papel Semântico | O que NUNCA pode representar |
|---|---|---|---|
| `--color-accent` | `#6D28D9` | **Ação e Marca:** Botão primário, CTA, seleção ativa de contexto, brandmark. | Valores financeiros, saldos ou ganhos monetários. |
| `--color-accent-bright` | `#7C3AED` | Hover, realce secundário e gradiente superior de botões de ação. | Erros ou alertas. |
| `--color-accent-soft` | `#EDE9FE` | Pílulas ativas, fundos de seleção e badges de contexto. | Fundo geral de cards financeiros. |
| `--color-income` | `#047857` | **Dinheiro que ENTRA:** Salários, receitas, rendimentos, saldo positivo. | Botões de ação, links ou marca institucional. |
| `--color-income-soft` | `#E4F5EE` | Fundo de badges e chips de receita recebida ou a receber. | Superfícies neutras de formulários. |
| `--color-expense` | `#B91C1C` | **Dinheiro que SAI:** Despesas, contas a pagar, faturas, saldo negativo. | Botões genéricos de cancelamento ou exclusão comum. |
| `--color-expense-soft` | `#FCEAEA` | Fundo de cartões e alertas de contas vencidas/atrasadas. | Destaque de botões. |
| `--color-warn` | `#9C500A` | **Atenção e Prazos:** Contas vencendo hoje ou nos próximos 7 dias. | Saldo financeiro ou balanço de conta. |
| `--color-warn-soft` | `#FBF0E0` | Fundo do chip de urgência/prazo imediato. | Fundo de cards concluídos. |
| `--color-info` | `#1D4ED8` | **Informação e Categorias Neutras:** Prioridade flexível, notas. | Indicador de ganho ou perda financeira. |
| `--color-canvas` | `#F7F6FB` | **Fundo do App:** Cinza-azulado frio e limpo. | Fundo bege, amarelado ou off-white quente. |
| `--color-surface` | `#FFFFFF` | Superfície primária de cards, listas e modais. | Elementos de destaque sem borda. |
| `--color-surface-2` | `#F1EFF8` | Superfície afundada, trilhas de barra de progresso, chips inativos. | Fundo principal da página. |
| `--color-ink` | `#15132A` | Texto principal, títulos e valores monetários. | Fundo escuro. |
| `--color-muted` | `#6B7280` | Rótulos secundários, metadados, prazos neutros. | Textos essenciais de leitura rápida. |

### 2.2 Cores de Navegação da Barra Inferior
- **Fundo da barra (`.app-tabbar-bg`):** Gradiente violeta imperial profundo `linear-gradient(165deg, #6D28D9 0%, #4C1D95 52%, #3B0764 100%)`.
- **Abas inativas:** Branco com opacidade de 82% (`rgba(255, 255, 255, 0.82)`), sem corte de rótulo.
- **Aba ativa:** Laranja luminoso (`#FB923C`), stroke 2.4 no ícone.
- **Pastilha central (Ação de Lançamento):** Gradiente `linear-gradient(158deg, #8B5CF6, #6D28D9)` com texto/ícone em branco puro.

### 2.3 Contraste e Acessibilidade (WCAG AA)
- Todos os pares de texto atendem ou superam a relação de contraste de **4.5:1** (texto normal) e **3.0:1** (textos grandes / números > 20px).
- O Anel de Saúde Financeira no topo do hero possui substrato escuro (`rgba(15, 23, 42, 0.55)`) para que as faixas amarela e vermelha atinjam índice de contraste superior a **4.96:1** contra o fundo violeta.

---

## 3. Typography

### 3.1 Famílias Tipográficas
1. **Display & Números:** `Plus Jakarta Sans`, sans-serif geométrica contemporânea.  
   - Empregada em: Marca, cabeçalhos, títulos de cards, rótulos de abas, valores em reais e percentuais.  
   - **Regra inviolável:** Valores numéricos monetários **NUNCA** usam fonte com serifa. Fontes serifadas desalinhadas quebram a escaneabilidade de colunas monetárias em telas de celular.
2. **Corpo & Interface:** `Inter`, sans-serif neutra com alta legibilidade em pequenas escalas.  
   - Empregada em: Textos corridos, instruções, formulários, badges de categorias e metadados.

### 3.2 Escala Tipográfica Mobile

| Nome | Tamanho / Line Height | Peso | Família | Caso de Uso |
|---|---|---|---|---|
| `hero-balance` | `clamp(31px, 9.6vw, 38px)` / `1.04` | 800 | Plus Jakarta Sans | Saldo principal disponível no Hero |
| `heading-lg` | `24px` / `30px` | 800 | Plus Jakarta Sans | Título de modais e telas principais |
| `heading` | `21px` / `26px` | 800 | Plus Jakarta Sans | Saldo previsto e totais de agrupamento |
| `heading-sm` | `17px` / `22px` | 700 | Plus Jakarta Sans | Subtítulos de seções e mês selecionado |
| `subheading` | `15px` / `20px` | 800 | Plus Jakarta Sans | Título do `BillCard` e itens de extrato |
| `body` | `13.5px` / `19px` | 500 / 600 | Inter | Textos padrão, campos de input, opções |
| `body-sm` | `12px` / `16px` | 500 | Inter | Legendas, descrições de apoio |
| `caption` | `11px` / `14px` | 700 | Plus Jakarta Sans | Rótulos de abas inferiores e badges |
| `micro` | `9.5px` / `12px` | 800 | Inter (Uppercase) | Rótulos de progresso ("DO VALOR TOTAL") |

### 3.3 Regras de Alinhamento Numérico
- Todos os números e moedas utilizam **`font-variant-numeric: tabular-nums`** para manter larguras consistentes de dígitos ao animar ou listar transações.
- Sinais matemáticos seguem convenção gráfica: sinal de menos real (`−`), espaço não-quebrável e símbolo `R$`.

---

## 4. Layout

### 4.1 Shell Mobile e Viewport
- **Viewport Height:** O shell do aplicativo obrigatoriamente utiliza `min-height: 100dvh` no `#root` e `.app-shell`. É expressamente proibido o uso de `height: 700px` fixo ou caixas centralizadas com bordas cinzas que simulam mockup de desktop em celulares.
- **Largura:** No mobile (`< 560px`), o container principal ocupa 100% da largura da janela (`max-width: 100%`).
- **Padding Lateral Padrão:** `16px` em todo o conteúdo da `.tab-content`.
- **Área Segura e Respiro Inferior:** O `.app-shell` aplica `padding-bottom: calc(var(--tabbar-height) + env(safe-area-inset-bottom, 0px))`, onde `--tabbar-height: 112px`. Isso assegura que o último cartão da lista nunca fique escondido atrás da barra flutuante.

### 4.2 Hero Bleed (Sangria de Borda a Borda)
- O componente `BalanceHero` aplica a classe `.hero-bleed` com margens negativas (`margin: -16px -16px 0;`).
- Ele encosta exatamente no topo e nas bordas laterais do celular, com cantos inferiores arredondados em `32px` (`border-radius: 0 0 32px 32px;`).
- Os seletores de mês e filtros de membro do casal residem **dentro** do Hero no mobile, eliminando barras brancas duplicadas no topo da tela.

### 4.3 Alvos de Toque (Touch Targets)
- Todos os botões, ícones clicáveis e acionadores possuem área física mínima de **44×44px** (classe `.iconbtn` e `.icon-btn`).
- Botões de alternar visualização, sino de alertas e anel de saúde cumprem a regra sem comprometer a densidade visual.

---

## 5. Elevation & Depth

### 5.1 Filosofia de Elevação
Não utilizamos sombras difusas exageradas ou desnecessárias. A hierarquia visual é construída primariamente por **contraste de superfícies e cores**, e as sombras servem apenas para destacar elementos que realmente flutuam sobre o plano de leitura:

```css
/* Cards em superfície clara */
--shadow-card: 0 1px 2px rgba(21, 19, 42, 0.04);

/* Elementos elevados / modais */
--shadow-raised: 0 6px 20px -6px rgba(21, 19, 42, 0.10), 0 2px 6px rgba(21, 19, 42, 0.04);

/* Hero principal da Início */
--shadow-hero: 0 26px 50px -18px rgba(46, 16, 101, 0.55);

/* Barra de navegação inferior flutuante */
--shadow-nav: 0 14px 34px -14px rgba(46, 16, 101, 0.70), 0 2px 8px -3px rgba(21, 19, 42, 0.35);
```

### 5.2 Efeito Glassmorphic no Hero
Dentro do Hero escuro, os cards de "Saldo Disponível" e "Saldo Previsto" utilizam glassmorphism:
- Fundo: `rgba(255, 255, 255, 0.10)`
- Borda: `1px solid rgba(255, 255, 255, 0.17)`
- Backdrop Blur: `blur(10px)`
- Realce interno: `box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.20)`

---

## 6. Shapes

### 6.1 Geometria e Raios de Arredondamento
O vocabulário formal do app é orgânico, acolhedor e limpo:

| Token | Raio | Componentes de Aplicação |
|---|---|---|
| `--radius-control` | `12px` | Controles de formulário, inputs, tooltips, tags compactas |
| `--radius-iconbtn` | `14px` | Botões de ícone com alvo de 44×44px (`.iconbtn`, anel de saúde) |
| `--radius-card` | `18px` | `BillCard`, cartões de métricas, cards informativos |
| `--radius-hero-card` | `22px` | Cartão de Saldo Disponível dentro do Hero |
| `--radius-sheet` | `24px` | Diálogos modais, painéis de filtro |
| `--radius-tabbar` | `28px` | Pílula flutuante da barra de navegação inferior |
| `--radius-hero-bottom` | `32px` | Base do cabeçalho sangrado `BalanceHero` |
| `--radius-pill` | `999px` | Pastilha central FAB, badges de status, barras de progresso |

### 6.2 Indicador Lateral dos Cartões (`BillCard`)
- O cartão de conta utiliza sombra rígida de deslocamento no canto inferior esquerdo: `box-shadow: -8px 8px 0 [cor-sinal]`.
- Quando em aberto: Verde (`--color-income`) para receitas, Vermelho (`--color-expense`) para despesas.
- Quando quitado: Cinza neutro (`--color-border`).

---

## 7. Components

### 7.1 `BalanceHero` (Herói Financeiro da Início)
O componente unificado do topo da tela inicial.
- **Anatomia Vertical:**
  1. **Linha Superior (`.toprow`):** Brandmark (`G Finanças`) à esquerda + Seletor/Ícone de Membro + Anel de Saúde Financeira (`AnelSaude`) + Sino de Alertas com contador (`.badge`).
  2. **Navegador de Mês (`.monthnav`):** Setas anteriores/próximas com alvo de 44px e cápsula de mês centralizada em tipografia branca/translúcida.
  3. **Pílula de Pessoa Filtrada (`.hf-who`):** Exibida quando um filtro de pessoa específica estiver ativo.
  4. **Card de Saldo Disponível (`.hf-balance`):** Rótulo "Saldo disponível" com ícone de carteira, valor em tipografia hero (`clamp(31px, 9.6vw, 38px)`), e botão circular de tendência (`.hf-trend`) verde com sparkles que alterna a visibilidade (mostrar/ocultar saldo).
  5. **Card de Saldo Previsto (`.hf-proj`):** Rótulo explicativo com ícone de tendência, valor projetado para o dia 31 em verde ou vermelho claro, e chevron tocável para abrir auditoria da projeção.
  6. **Gráfico Integrado (`BalanceChart`):** Curva de evolução diária que sangra de ponta a ponta com onda estilizada na base.

### 7.2 `BalanceChart` (Gráfico Diário com Leitura Tátil)
- Substitui gráficos pesados de biblioteca genérica por SVG vetorial leve e responsivo.
- Suporte a scrubber por toque: deslizar o dedo exibe linha de mira e tooltip flutuante (`.hf-tip`) com a data e saldo exato do dia.
- Marcador visual do dia "HOJE".
- Legenda com traços de referência para Saldo em Conta, Reserva Mínima e Saldo Restrito (Cartão Alimentação).

### 7.3 `BillCard` (Cartão Apresentacional de Contas)
Componente de alta densidade visual sem poluição:
- **Ícone e Categoria:** Quadrado arredondado (`40×40px`, raio 14px) com fundo colorido suave (`soft`) e ícone semântico.
- **Cabeçalho:** Título da conta truncado com elipse, linha de metadados (`Parcela · Prioridade · Pessoa`), e valor total em destaque.
- **Linha de Liquidação:** Valores claros de "Pago / Recebido" à esquerda e "Restante" à direita.
- **Barra de Progresso:** Altura de 24px, fundo afundado (`surface2`), preenchimento na cor do sinal financeiro, com o percentual centralizado no preenchimento ou deslocado à direita conforme o espaço disponível.
- **Grade de Duas Datas:**
  - *Data de Vencimento:* Data fatal de cobrança com chip de urgência (`Atrasada`, `Hoje`, `Em Xd`).
  - *Data Recomendada (Motor de Priorização):* Data ideal calculada pelo fluxo de caixa para pagar com tranquilidade, acompanhada do selo com ícone de faísca (`Ideal` ou `Passou`).
- **Botão de Ação Inferior:** Botão de largura total com 52px de altura:
  - Despesa pendente: Botão na cor da despesa com texto "Registrar pagamento".
  - Receita pendente: Botão na cor da receita com texto "Registrar recebimento".
  - Quitado: Barra plana neutra informando "Pagamento concluído" / "Recebimento concluído".

### 7.4 Barra de Navegação Inferior Flutuante (`.app-tabbar`)
- **Fixação:** Pílula centralizada na base, flutuando a `8px + safe-area` da margem inferior e `12px` de cada lateral (`width: min(calc(100% - 24px), 496px)`).
- **Estrutura DOM com Máscara:** O fundo (`.app-tabbar-bg`) é elemento irmão fora da tag `<nav>`. Possui máscara circular `radial-gradient` no centro do topo (`--fab-r: 34px`) para criar o recorte onde repousa o botão central.
- **Grid de 5 Colunas:** `grid-template-columns: 1fr 1fr calc(var(--fab-d) + 8px) 1fr 1fr;`. A coluna central reserva espaço exato para a pastilha central sem empurrar as abas de "Transações" e "Orçamento".
- **Ação Central Flutuante (`.tab-fab`):** Botão circular de 62px posicionado na metade para fora da barra (`top: -31px`), com ícone de soma (`+`), gradiente violeta luminoso e sombra de alta elevação.
- **Abas do Menu:** Início, Transações, Ação Central (+), Orçamento, Mais (menu completo com rotas organizadoras e analíticas).

---

## 8. Do's and Don'ts (Diretrizes Estritas para IA e Código)

### Do's (Faça)
- **FAÇA:** Use sempre `Plus Jakarta Sans` para títulos, rótulos de botões, abas e valores numéricos monetários.
- **FAÇA:** Use `tabular-nums` em qualquer exibição de moeda (`R$`), percentual ou data.
- **FAÇA:** Garanta que todas as áreas roláveis considerem o padding inferior `--tabbar-height: 112px`.
- **FAÇA:** Mantenha alvos de toque com no mínimo 44×44px em todos os botões e ícones clicáveis.
- **FAÇA:** Utilize `--color-accent` (`#6D28D9`) para botões de ação e abas selecionadas.
- **FAÇA:** Utilize `--color-income` (`#047857`) estritamente para valores e badges que indicam dinheiro entrando.
- **FAÇA:** Utilize `--color-expense` (`#B91C1C`) estritamente para valores e badges que indicam dinheiro saindo.
- **FAÇA:** Preserve a máscara com raio sincronizado `--fab-r: 34px` quando alterar a dimensão do botão central da barra.
- **FAÇA:** Respeite as safe areas nativas com `env(safe-area-inset-top)` e `env(safe-area-inset-bottom)`.

### Don'ts (Não Faça)
- **NÃO FAÇA:** Nunca utilize fundos beges, amarelados ou off-white quente (como o antigo `#F1EDDF`). O fundo canônico é o cinza frio `#F7F6FB`.
- **NÃO FAÇA:** Nunca use fontes serifadas (`Fraunces`, `Georgia`, etc.) para valores monetários ou KPIs numéricos.
- **NÃO FAÇA:** Nunca utilize a cor verde para botões de salvar, avançar, confirmar ou ações primárias de interface (use Violeta `#6D28D9`).
- **NÃO FAÇA:** Nunca crie um FAB circular flutuando solto no canto inferior direito sobreposto à barra de navegação (o botão principal de inclusão vive no centro da barra de navegação).
- **NÃO FAÇA:** Nunca fixe a altura do aplicativo em `700px` ou envolva o mobile dentro de uma moldura simulada com borda cinza. O app deve preencher `100dvh`.
- **NÃO FAÇA:** Nunca encoste o texto das abas na pastilha central; a barra deve sempre usar a coluna dedicada no grid CSS (`calc(var(--fab-d) + 8px)`).
- **NÃO FAÇA:** Nunca exiba duas barras superiores concorrentes no celular; o seletor de mês e filtro de membro devem habitar o topo do `BalanceHero`.
- **NÃO FAÇA:** Nunca aplique sombras difusas pretas puras em cards claros; use sombras com matiz frio e baixa opacidade (`rgba(21, 19, 42, 0.04)`).
