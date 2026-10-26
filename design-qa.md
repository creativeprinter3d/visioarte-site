# Fundo mobile — detalhes das peças

Referência: terceira maquete, selecionada pelo usuário em 26/10/2026.
Comparação: referência e captura da implementação exibidas lado a lado em `.git/qa/`.
Capturas: `../visioarte-mobile/pecas-aplicadas-390.png` e `pecas-aplicadas-320.png`.

- Tipografia: preservada a tipografia funcional existente, serifada no título e sem serifa no corpo; nenhuma frase rasterizada. A solicitação altera o fundo, sem ampliar os textos conforme a maquete gerada.
- Espaçamento: foto superior inteira, imagem decorativa abaixo; centro livre. Ações existentes com 48 px. Navegação por círculos e setas preservada.
- Cores: fundo verde-petróleo, detalhe claro à esquerda e terracota à direita, botão ciano e texto branco, como na referência.
- Imagens: arte individual gerada a partir da maquete escolhida, sem texto ou controles, com detalhes de peças e vegetação nas bordas. Arquivo convertido para JPEG para reduzir o download. A cena superior continua sendo o vídeo existente, cujo quadro varia naturalmente.
- Conteúdo: textos e destinos existentes preservados; sem novos produtos ou informações.
- Interação: menu, navegação de categorias e seta do carrossel conferidos. Sem erros no console. Sem estouro horizontal em 390 px; leitura e botões conferidos em 320 px.
- Limites: emulação no navegador; aparelhos físicos e Safari não testados. O acabamento dos objetos decorativos é uma nova arte consistente com a referência, não uma extração exata de seus pixels.

Sem pendências P0/P1/P2 no escopo do fundo aprovado.

final result: passed

## Sincronização atual / próxima — 26/10/2026

A instrução mais recente substitui o fundo inferior fixo: a foto superior mostra a área atual, a inferior usa a imagem da próxima área na ordem canônica dos seis círculos. A troca acompanha o mesmo estado do título e da cena superior; Materiais antecipa Casa e Decoração. O editor continua sendo a fonte das imagens escolhidas pelo usuário, e os carregamentos antigos não sobrescrevem imagens novas.

Conferência em navegador: seis pares completos e URLs carregadas; avanço e retorno por setas; giro automático observado com o par correspondente; tela de 320 px e ausência de estouro horizontal em 390 px; console sem erros. Leitura protegida pelo escurecimento central; imagem superior permanece inteira. Desktop mantém o tratamento anterior e esconde a prévia inferior. Sem alteração de textos ou destinos.

Limite: a área inferior usa um recorte decorativo da foto da próxima área, em vez da arte fixa de peças. A foto superior mantém o enquadramento inteiro. Teste em aparelho físico ainda pendente.

final result: passed
