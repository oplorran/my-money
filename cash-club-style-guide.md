# Cash Club --- Style Guide

**Versão:** 1.0\
**Escopo:** identidade visual, componentes e padrões de interface
identificados nas cinco referências enviadas.\
**Direção visual:** Dark Premium + Neon Green.

------------------------------------------------------------------------

## 1. Visão geral

O Cash Club utiliza uma linguagem visual fintech/tecnológica,
minimalista e premium. A interface combina fundos quase pretos,
superfícies em carvão, bordas discretas, tipografia clara e verde neon
aplicado de forma seletiva.

Os princípios centrais são:

-   O preto é a base e deve dominar a composição.
-   O branco estabelece a hierarquia e destaca informações importantes.
-   O verde neon comunica ação, seleção, progresso e estado ativo.
-   Cinzas organizam informações secundárias e elementos inativos.
-   Cards têm bordas finas e cantos arredondados; sombras são mínimas.
-   A interface deve manter bastante respiro e alinhamentos
    consistentes.

## 2. Paleta de cores

Os códigos abaixo são aproximações visuais extraídas das imagens de
referência. Devem ser refinados com os arquivos originais ou tokens CSS,
caso estejam disponíveis.

  ---------------------------------------------------------------------------
  Token                       HEX                     Uso
  --------------------------- ----------------------- -----------------------
  `color.background`          `#090909`               Fundo principal da
                                                      aplicação

  `color.surface`             `#111111`               Cards, painéis e campos

  `color.surface.secondary`   `#1B1B1D`               Botões secundários,
                                                      itens inativos e
                                                      superfícies elevadas

  `color.surface.selected`    `#151B0D`               Fundo sutil de
                                                      componentes
                                                      selecionados

  `color.accent`              `#A8FF16`               Ações primárias,
                                                      estados ativos,
                                                      progresso e destaques

  `color.text.primary`        `#FFFFFF`               Títulos, valores e
                                                      conteúdo principal

  `color.text.secondary`      `#888888`               Descrições, subtítulos
                                                      e placeholders

  `color.text.muted`          `#666666`               Ícones e informações de
                                                      menor prioridade

  `color.border`              `#303030`               Bordas de cards e
                                                      componentes

  `color.divider`             `#292929`               Divisores e separadores
  ---------------------------------------------------------------------------

### Regras de aplicação

1.  Não usar o verde como cor de fundo de grandes áreas sem necessidade.
2.  Reservar o verde para elementos que precisam chamar atenção.
3.  Manter textos principais em branco e textos auxiliares em cinza.
4.  Usar bordas escuras para separar superfícies sem criar contraste
    excessivo.
5.  Em fundos verdes, utilizar texto e ícones quase pretos (`#090909`)
    para manter legibilidade.

## 3. Tipografia

A referência sugere uma família sans-serif moderna, geométrica e de boa
legibilidade. A fonte exata não pode ser determinada apenas pelas
imagens.

### Hierarquia recomendada

  -----------------------------------------------------------------------
  Estilo                  Aplicação               Tratamento
  ----------------------- ----------------------- -----------------------
  Display / Hero          Valores financeiros e   Grande, branco, peso
                          títulos de destaque     forte

  Heading 1               Títulos principais de   Grande, branco, bold
                          página                  

  Heading 2               Títulos de cards        Médio/grande, branco,
                                                  bold

  Body                    Textos e descrições     Regular, branco ou
                                                  cinza

  Label                   Labels de campos e      Pequena, uppercase,
                          seções                  tracking ampliado

  Metadata                Duração, ticker,        Pequena, cinza
                          empresa e avisos        

  Badge                   Status e                Uppercase, bold,
                          identificadores         tracking ampliado
  -----------------------------------------------------------------------

### Regras tipográficas

-   Usar títulos fortes e com hierarquia clara.
-   Labels técnicas podem usar letras maiúsculas e espaçamento ampliado.
-   Textos auxiliares não devem competir com o título.
-   Valores financeiros devem ter destaque maior que sua unidade
    monetária.
-   Evitar excesso de pesos, tamanhos e estilos diferentes na mesma
    tela.

## 4. Layout, espaçamento e formas

As medidas são referências iniciais aproximadas, não especificações
medidas do código original.

  Elemento                  Recomendação
  ------------------------- -------------------
  Card principal            Raio de 28--36 px
  Card compacto             Raio de 18--24 px
  Input                     Raio de 18--22 px
  Botão                     Raio de 16--20 px
  Badge                     Formato pill
  Borda                     1 px
  Ícone em container        56--64 px
  Espaçamento entre cards   16--24 px
  Padding de card           20--32 px

### Composição

-   Priorizar layouts organizados em uma coluna no mobile.
-   Usar grids de três colunas quando o conteúdo for compacto, como na
    seleção de ativos.
-   Centralizar conteúdos de onboarding e telas de escolha quando isso
    reforçar a hierarquia.
-   Alinhar valores e metadados em linhas consistentes.
-   Manter espaçamento vertical previsível entre seções.
-   Evitar sombras fortes, gradientes chamativos e efeitos 3D.

## 5. Componentes

### 5.1 Header global

Composição identificada:

-   Logo à esquerda.
-   Ação de notificações com ícone de sino e borda.
-   Botão de perfil em container quadrado arredondado.
-   Divisor horizontal inferior.
-   Fundo integrado ao background principal.

O header deve ser reutilizado nas telas internas para manter
consistência.

### 5.2 Bottom navigation

A navegação inferior possui quatro destinos observados:

-   Home
-   Accelerator
-   Trade
-   Ranking

**Estado ativo:** - Fundo ligeiramente mais claro. - Ícone verde neon. -
Texto branco. - Pequeno indicador verde na borda superior, quando
aplicável.

**Estado inativo:** - Ícone e texto em cinza. - Sem destaque de fundo
forte.

A barra deve permanecer visualmente separada do conteúdo por um divisor
superior.

### 5.3 Botões

  -----------------------------------------------------------------------
  Variante                Aparência               Uso
  ----------------------- ----------------------- -----------------------
  Primary                 Fundo `#A8FF16`, texto  Ação principal
                          escuro                  

  Secondary               Fundo escuro, borda     Ação alternativa
                          `#303030`, texto        
                          claro/cinza             

  Tertiary                Texto sem container     Navegação complementar
  -----------------------------------------------------------------------

Regras: - Preferir uma única ação primária dominante por seção. - Botões
principais podem ocupar toda a largura disponível. - Ícones podem
acompanhar o texto, mantendo alinhamento central. - Estados
desabilitados devem reduzir contraste sem perder legibilidade.

### 5.4 Inputs

-   Fundo `#111111`.
-   Borda fina `#303030`.
-   Cantos arredondados.
-   Ícone opcional à esquerda.
-   Placeholder em cinza.
-   Label pequena, uppercase e com tracking ampliado.
-   Texto auxiliar abaixo do campo em cinza.

O foco deve ser perceptível, preferencialmente com borda ou detalhe
verde discreto.

### 5.5 Badges e status

Usos observados: `MEMBERS ACCESS`, `ACCESS ACTIVE`, `AI ACTIVE`,
`PLANNING BASELINE` e `RISK PLANNER`.

Padrão: - Formato cápsula. - Borda discreta. - Texto uppercase. -
Tracking ampliado. - Indicador circular ou ícone opcional. - Verde para
status ativo; cinza para categorias neutras.

### 5.6 Indicadores circulares

Usados para identificar motores ou categorias, com iniciais
centralizadas.

-   Formato circular.
-   Ativo: fundo verde neon e texto escuro.
-   Inativo: fundo carvão e texto branco.
-   Tamanho e espaçamento consistentes.

### 5.7 Cards de roadmap / etapas

Composição: - Label da seção. - Lista vertical de etapas. - Número em
container quadrado arredondado. - Descrição à esquerda. - Duração ou
metadado à direita.

Estado ativo: - Borda e número em verde. - Texto com maior destaque.

Estado inativo: - Borda e número em cinza. - Conteúdo com contraste
secundário.

### 5.8 Cards de seleção

Usados para opções de capital ou escolhas em fluxos de onboarding.

Estrutura: - Ícone em container à esquerda. - Título/valor em
destaque. - Descrição abaixo. - Chevron à direita.

Estado normal: - Fundo `#111111`. - Borda `#303030`.

Estado selecionado: - Fundo discretamente mais claro ou esverdeado. -
Borda verde. - Destaque lateral verde, quando aplicável. - Não alterar
as dimensões do card ao selecionar.

### 5.9 Wizard / multi-step

Estrutura de tela observada:

1.  Header global.
2.  Badge da funcionalidade.
3.  Indicador de etapa.
4.  Pergunta principal.
5.  Texto de apoio.
6.  Opções selecionáveis.
7.  Navegação inferior.

O indicador de progresso usa segmentos horizontais: verde para etapa
atual/concluída e cinza escuro para etapas futuras.

### 5.10 Metric Hero

Card de destaque para valores financeiros:

-   Card escuro independente.
-   Badge na parte superior.
-   Valor principal muito grande e branco.
-   Unidade monetária em tamanho menor e cinza.
-   Explicação abaixo, centralizada.

O valor deve ser o elemento de maior hierarquia do card.

### 5.11 Allocation bars

Componente de distribuição percentual:

-   Título acompanhado de ícone.
-   Linhas por categoria.
-   Nome da categoria à esquerda.
-   Barra horizontal no centro.
-   Percentual à direita.
-   Aviso ou disclaimer separado por divisor.

A categoria em destaque usa verde neon; as demais usam cinza. A barra
não preenchida permanece em carvão.

### 5.12 AI Engine Selector

Componente para seleção ou apresentação de provedores de IA:

-   Badge de status no topo.
-   Provedores distribuídos horizontalmente.
-   Ícones ou iniciais em containers quadrados.
-   Linha conectando os provedores.
-   Nome do produto em branco.
-   Empresa em cinza.
-   Provedor ativo com fundo neon; inativos em carvão.

### 5.13 Asset cards / grid financeiro

Grid observado com três colunas:

-   Card com fundo `#111111`.
-   Borda fina.
-   Container pequeno com iniciais ou símbolo.
-   Ticker/nome em branco e negrito.
-   Empresa em cinza.
-   Estado selecionado com fundo esverdeado e borda verde.

Em telas menores, adaptar o número de colunas para preservar
legibilidade e área de toque.

### 5.14 Notification card

-   Card escuro com borda discreta.
-   Ícone grande em container verde.
-   Título em branco.
-   Descrição em cinza.
-   Botão primário de largura total.

### 5.15 Disclaimers

-   Texto pequeno e cinza.
-   Geralmente centralizado.
-   Sem container próprio.
-   Posicionado próximo ao conteúdo que esclarece.
-   Deve manter legibilidade e contraste suficiente.

## 6. Estados de interação

Todo componente interativo deve prever, quando aplicável:

  Estado     Tratamento visual
  ---------- --------------------------------------------------------
  Default    Aparência padrão do componente
  Hover      Pequena mudança de superfície ou borda
  Focus      Indicador de foco visível e acessível
  Active     Verde neon ou contraste reforçado
  Selected   Fundo/borda verde discreta e destaque lateral opcional
  Disabled   Contraste reduzido, mantendo legibilidade
  Loading    Indicador de carregamento sem deslocar o layout

O estado selecionado não deve depender exclusivamente da cor: combinar
cor, borda, ícone ou outro sinal visual.

## 7. Responsividade

As referências são predominantemente mobile. Para adaptar o sistema a
desktop:

-   Preservar a hierarquia e a proporção dos componentes.
-   Definir largura máxima para conteúdos muito extensos.
-   Usar grids responsivos.
-   Evitar esticar cards de seleção além do necessário.
-   Manter áreas de toque confortáveis.
-   Adaptar a bottom navigation conforme o contexto do produto, sem
    perder a linguagem visual.
-   Evitar que títulos longos comprimam ícones ou metadados.

## 8. Acessibilidade e consistência

-   Garantir contraste adequado entre texto e superfície.
-   Não usar apenas verde/cinza para comunicar estados.
-   Incluir foco visível para navegação por teclado.
-   Usar áreas de toque confortáveis.
-   Preservar labels e descrições em campos e controles.
-   Não reduzir excessivamente o tamanho de avisos importantes.
-   Manter consistência de bordas, raios, espaçamentos e tipografia.

## 9. Diretrizes de uso da identidade

### Fazer

-   Usar o preto como base dominante.
-   Aplicar verde neon em ações e estados relevantes.
-   Usar cards escuros com bordas discretas.
-   Criar hierarquia clara entre títulos, descrições e metadados.
-   Reutilizar componentes e padrões entre telas.
-   Manter ícones lineares e simples.

### Evitar

-   Grandes áreas verdes sem função clara.
-   Sombras fortes e efeitos 3D.
-   Muitos gradientes.
-   Bordas claras e contrastantes em todos os elementos.
-   Excesso de cores de destaque.
-   Misturar estilos de ícones.
-   Criar variações desnecessárias de botões e cards.

## 10. Tokens CSS iniciais

``` css
:root {
  color-scheme: dark;

  --color-background: #090909;
  --color-surface: #111111;
  --color-surface-secondary: #1B1B1D;
  --color-surface-selected: #151B0D;

  --color-accent: #A8FF16;
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #888888;
  --color-text-muted: #666666;

  --color-border: #303030;
  --color-divider: #292929;

  --radius-card: 28px;
  --radius-card-compact: 20px;
  --radius-input: 20px;
  --radius-button: 18px;
  --radius-pill: 999px;

  --border-width: 1px;
}
```

## 11. Checklist para novas telas

Antes de considerar uma tela pronta, verificar:

-   [ ] Background e superfícies seguem a paleta.
-   [ ] Verde neon está reservado para ações e estados relevantes.
-   [ ] Títulos e descrições possuem hierarquia clara.
-   [ ] Cards seguem os raios e bordas definidos.
-   [ ] Botões respeitam a hierarquia de ações.
-   [ ] Estados normal, ativo, selecionado e desabilitado foram
    considerados.
-   [ ] Ícones mantêm o mesmo estilo.
-   [ ] Espaçamentos e alinhamentos são consistentes.
-   [ ] Layout funciona em mobile e desktop.
-   [ ] Contraste e foco são acessíveis.

------------------------------------------------------------------------

## 12. Referências analisadas

Este documento consolida cinco referências visuais enviadas:

1.  **Login:** autenticação, identidade, inputs e badges.
2.  **Home:** header, roadmap, notificações, aulas e navegação.
3.  **Risk Planner --- seleção de capital:** wizard, progresso e cards
    selecionáveis.
4.  **Risk Planner --- resultado:** métrica principal, distribuição
    percentual e hierarquia de ações.
5.  **Trade / AI Engine:** seleção de motores de IA, grade de ativos e
    navegação ativa.

**Observação:** este Style Guide descreve padrões inferidos visualmente
a partir das imagens. Não representa a extração do CSS, das fontes ou
das medidas originais do produto.
