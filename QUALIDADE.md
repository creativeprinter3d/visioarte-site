# Qualidade técnica — VISIOARTE

## Verificação automática

O repositório inclui uma auditoria estática sem dependências externas:

```bash
node scripts/verificar-site.mjs
```

Ela confere:

- IDs duplicados, imagens sem texto alternativo e links externos abertos sem `noopener`;
- arquivos locais referenciados por `src`, `href` e `poster` no HTML;
- recursos locais referenciados com `url(...)` no CSS;
- sintaxe dos arquivos JavaScript com `node --check` e sintaxe de scripts inline;
- integridade das 13 páginas principais e das 5 áreas, além de arquivos essenciais e logotipo;
- aviso sobre arquivos de mídia com mais de 5 MiB (aviso, não falha).

O workflow `.github/workflows/verificar-site.yml` executa essas verificações em *pull requests*, alterações na `main` e manualmente por `workflow_dispatch`. Falhas reais encerram o job com erro.

## O que a auditoria NÃO garante

Não substitui testes de navegador, testes de toque, leitura de tela, acessibilidade avançada, desempenho em rede real ou validação visual. Links externos podem estar temporariamente indisponíveis e não são consultados automaticamente. O script não percorre referências construídas dinamicamente em JavaScript.

## Checklist manual de regressão

1. Em desktop e celular, abrir Início, Casa e Decoração, Arquitetura e Tecnologia pelo menu.
2. Abrir Luminárias, explorar filtros e solicitar uma peça (sem realizar envio real).
3. Visitar Materiais, A Máquina que Fizemos, Tekna, Firmware, Sobre e Projetos.
4. Navegar com teclado; conferir foco visível e ausência de conteúdo invisível.
5. Testar com `?animacoes=off`, `?tema=original` e `?experiencias=on`.
6. Conferir o comparador de animações e os comparadores de experiências.
7. Testar em largura pequena (320 px e 390 px), tela intermediária e desktop.
8. Verificar console e rede no DevTools; medir Core Web Vitals em dispositivo e rede representativos.

## Regra de aprovação

O resultado do CI precisa estar verde antes de incorporar alterações. Em mudanças visuais ou interativas, registrar também a conferência manual. Manter o site atual e as cópias de segurança até aprovação.
