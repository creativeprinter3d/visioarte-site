# Servidor do chat da Ivy

O site é estático, então a chave da IA fica neste pequeno servidor (Cloudflare Worker) e nunca no código do site.
O chat só responde dúvidas sobre a Visioarte, não guarda conversas e não pede dados pessoais.

## Sem este servidor
O chat já funciona com as **6 perguntas prontas** (respostas fixas, sem IA e sem custo). A caixa de texto livre fica desativada até o servidor ser ligado.

## Para ligar a pergunta livre (passos do dono da conta)
1. Criar conta na Anthropic (console.anthropic.com), **carregar o menor crédito que o painel aceitar** e criar uma chave de API. Quando o crédito acaba, o chat para sozinho.
2. Criar conta gratuita na Cloudflare.
3. Neste diretório: `npx wrangler login`, depois `npx wrangler kv namespace create LIMITES` e colar o `id` em `wrangler.toml` (descomentar o bloco `kv_namespaces`).
4. `npx wrangler secret put ANTHROPIC_API_KEY` (colar a chave quando pedir) e `npx wrangler deploy`.
5. Copiar o endereço que o deploy mostrar (`https://ivy-chat-visioarte.<conta>.workers.dev`) e colocar no `index.html`, dentro do `<head>`:
   `<meta name="ivy-chat-url" content="https://ivy-chat-visioarte.<conta>.workers.dev">`

## Limites (em `wrangler.toml`, sem mexer no código)
- `MAX_IP_DIA`: mensagens por visitante por dia (inicial 15).
- `MAX_DIA`: teto de mensagens por dia no site todo (inicial 150).
- `MAX_TOKENS`: tamanho máximo da resposta (inicial 300).
- `MODELO`: modelo usado (inicial `claude-haiku-5-5`, o menor).
Teto extra de segurança: o saldo pré-pago da API. Ao acabar, a Ivy diz que está descansando.

## O que a Ivy sabe
Só o que está em `conhecimento.js` (extraído do que já está publicado no site). Para ensinar algo novo, edite esse arquivo e rode `npx wrangler deploy`. Preço, prazo, contato e garantias estão marcados como "não sabe" até serem publicados.

## Teste local (sem rede, sem custo)
`node ivy-servidor/teste.mjs`
