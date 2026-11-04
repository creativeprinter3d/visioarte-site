# Testes reais no navegador — 04/11/2026

## Escopo e ambiente

Chrome real conectado à sessão no Windows. Site publicado: https://teste.visioarte.com.br. Código-base inspecionado: `55ee8c7469d17c3881994906b273277ac0996ba5`. As correções foram executadas também por HTTP local, em `127.0.0.1:8766`. Não houve publicação nem alteração da main nesta etapa.

Desktop de 1536 px; viewport móvel de 320 px para varredura de rotas e 390 px para menu, simulador e correção do formulário. Isto é teste responsivo em Chrome desktop, não teste em aparelho Android/iOS físico ou Safari. Não houve emulação de CPU ou rede móvel.

## Falhas reproduzidas e corrigidas

1. **Contato → Abrir formulário:** no site publicado, clicar no link mantém `#contato`, com `projectForm` dentro de uma página `hidden`. A interceptação de âncoras em `neon.js` tentava apenas rolar até o formulário oculto. Agora o roteador resolve a página proprietária antes de rolar e focar a seção. Sete âncoras conhecidas passam pelo mesmo caminho, inclusive entrada direta por URL. O hash da seção é preservado no histórico. Validado localmente: `#projectForm`, formulário visível, foco em `projectForm`, topo a aproximadamente 96 px em 390 px, overflow horizontal zero; Voltar retorna a Contato e Avançar ao formulário. Recarregar `#projectForm` também mantém o formulário visível.
2. **Comparador de design:** os dois iframes carregavam `tema=original`, inclusive o rotulado como refinado. Corrigido apenas o endereço inicial do iframe refinado. Validado localmente: original com `tema=original`, refinado sem esse parâmetro, seleção de Luminárias nos dois e alternância dos botões.

Atualizados os identificadores de versão de `site.js` e `neon.js` no HTML para evitar mistura dos scripts em cache. Nenhum CSS, imagem, vídeo ou versão em `previas/` foi alterado. O commit-base e o histórico preservam os arquivos anteriores; também foram guardadas cópias locais dos scripts antes da edição.

## Resultados observados

| Verificação | Resultado e limite |
| --- | --- |
| 28 destinos publicados | Percorridos por hash em 1536 e 320 px com `experiencias=on`; título principal correspondente, overflow horizontal zero. Detalhes em `evidencias/rotas-2026-11-04.json`. A observação é imediata; não certifica o término de animações ou todos os recursos lazy. |
| Menu | Em 390 px: abre, navega para Arquitetura, fecha após escolha; Voltar retorna à página anterior. |
| Navegação SPA | Casa → Luminárias → pedido Onda → Projetos; Tecnologia → Materiais; menu e histórico sem recarga completa. Âncora Coleções posicionou a seção a 90 px do topo no publicado. |
| Filtros de luminárias | Pendentes: 3; mesa: 2; parede: 1; todas: 6. Referências exibidas correspondem aos grupos. |
| Formulário publicado | Campos obrigatórios impediram revisão vazia. Pedido Onda preenche a necessidade. Com nome sintético e `teste@example.com`, revisão abriu e informou que o pedido não foi enviado. Voltar e editar funcionou. |
| Luz experimental | Suave 25%, Ambiente 65%, Intensa 100%; teclado Home leva a 0%, End a 100%; apagar e reacender recupera 100%. Estado, saída e variáveis visuais acompanharam os controles. Em 390 px, overflow zero. |
| Reciclagem | Cinco botões atualizaram legenda, imagem e seleção: Coleta, Limpeza e seleção, Trituração, Preparação dos pellets e Impressão 3D. Em 320 px, overflow zero. |
| Comparador de iluminação | Alternância anterior/nova carregou o controle real no iframe; `luz=anterior` somente na versão anterior. |
| Comparador de experiências | Luminárias, Reciclagem e Máquina carregaram suas seções experimentais; versão atual retirou `experiencias=on`. Não foi validada a qualidade visual de cada etapa da máquina. |
| Comparadores GSAP | Piloto: endereço alterna `experimento=gsap`. Comparador geral: Casa carrega com e sem `animacoes=off`; iframe real e layout móvel conferidos. Não houve medição de FPS ou auditoria de todas as animações. |
| Console | Consultas de warnings/errors retornaram listas vazias nos pontos inspecionados do publicado, comparadores e prévia corrigida. Isto não prova ausência de erro em todos os cenários. |
| Imagens | Nas varreduras, nenhuma imagem visível já concluída estava com dimensão natural zero. Imagens fora da tela ainda não carregadas não são aprovadas por esse teste. |
| Auditoria estática local | Zero erros; um aviso referente a três vídeos acima de 5 MiB. |

## Pendências e restrições honestas

- **Rede e desempenho não concluídos.** A interface disponível expôs console e DOM, mas não forneceu HAR, status de todas as requisições nem Performance API. Uma tentativa adicional de acesso à interface do Chrome expirou. Não há números válidos de Lighthouse, LCP, CLS, INP, FPS, transferência ou tempo total nesta entrega. Listas de console vazias não substituem Network.
- Os vídeos `abertura-teste.mp4` (6,5 MiB), `moveis-exteriores.mp4` (6,3 MiB) e `tecnologia.mp4` (5,3 MiB) merecem medição de carregamento antes de escolher otimizações. Tamanho em disco não prova download nem impacto na navegação atual.
- Testar aparelho físico, Safari/iOS, movimento reduzido, falha/bloqueio do CDN GSAP, rede lenta, breakpoint intermediário e navegação completa só por teclado.
- A revisão do pedido foi confirmada; a tentativa adicional de validar download do resumo expirou e não teve conclusão verificável. Anexos, formatos inválidos, limite de 20 MB e envio real não foram validados.
- E-mail e WhatsApp oficiais continuam pendentes no produto. Links de Política de Privacidade e LGPD apontam para Projetos; precisam de conteúdo/destino definido pelo responsável, sem inventar textos ou contatos.
- As imagens são provisórias/conceituais. Esta revisão não aprova fidelidade física da simulação nem mídia definitiva.
- Depois de revisar e incorporar o PR, repetir os dois caminhos corrigidos no domínio publicado e confirmar o CI do commit final. Não foi feito merge nesta etapa.

## Repetição da regressão corrigida

1. Abrir `/#contato`; clicar em Abrir formulário. Deve resultar em `/#projectForm`, formulário visível e foco nele.
2. Usar Voltar e Avançar; recarregar a URL do formulário. Deve continuar acessível.
3. Abrir diretamente `/#colecoes-casa`, `/#aplicacoes-arq`, `/#solucoes-tec`, `/#teknaToolsTitle`, `/#areas-colecoes` e `/#ficha-maquina`. Conferir página proprietária e seção visíveis.
4. Em `comparar-design.html`, conferir que somente o iframe original contém `tema=original`. Escolher Luminárias e alternar as versões.
