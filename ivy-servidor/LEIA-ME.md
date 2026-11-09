# Servidor do chat da Ivy

O site é estático, então a chave da IA fica neste pequeno servidor (Cloudflare Worker) e nunca no código do site.
O chat só responde dúvidas sobre a Visioarte, não guarda conversas e não pede dados pessoais.

## Sem este servidor
O chat já funciona com as **6 perguntas prontas** (respostas fixas, sem IA e sem custo). A caixa de texto livre fica desativada até o servidor ser ligado.

## Para ligar a pergunta livre (passos do dono da conta, no computador)
Por padrão o chat usa a **IA gratuita da Cloudflare (Workers AI)**: sem chave de API e sem cartão.
1. Criar conta gratuita na Cloudflare (dash.cloudflare.com).
2. Neste diretório: `npx wrangler login`.
3. `npx wrangler kv namespace create LIMITES`, e colar o `id` em `wrangler.toml` (descomentar o bloco `kv_namespaces`). Isso liga os limites por dia.
4. `npx wrangler deploy`.
5. Copiar o endereço que o deploy mostrar (`https://ivy-chat-visioarte.<conta>.workers.dev`) e colocar no `index.html`, dentro do `<head>`:
   `<meta name="ivy-chat-url" content="https://ivy-chat-visioarte.<conta>.workers.dev">`

### Se um dia quiser mais qualidade (Claude, pago)
Em `wrangler.toml` troque `PROVEDOR = "anthropic"`, crie a chave em console.anthropic.com com o crédito mínimo e rode `npx wrangler secret put ANTHROPIC_API_KEY` e `npx wrangler deploy`.

## Cota gratuita
O Workers AI dá 10.000 "neurons" por dia de graça (reinicia à 00:00 UTC). Passando disso, no plano gratuito ele **falha sem cobrar**, e a Ivy diz que está descansando. Estimativa: com o texto de conhecimento atual, cada resposta consome algumas dezenas de neurons, o que dá na ordem de 150 mensagens por dia. Confira o consumo real no painel da Cloudflare depois dos primeiros testes.

## Limites (em `wrangler.toml`, sem mexer no código)
- `MAX_IP_DIA`: mensagens por visitante por dia (inicial 15).
- `MAX_DIA`: teto de mensagens por dia no site todo (inicial 150).
- `MAX_TOKENS`: tamanho máximo da resposta (inicial 300).
- `PROVEDOR` e `MODELO_AI`: IA usada (inicial Workers AI com `@cf/google/gemma-3-12b-it`). `MODELO` vale só para o provedor Anthropic.
Teto extra de segurança: a cota gratuita diária (ou o saldo pré-pago, se usar a Anthropic). Ao acabar, a Ivy diz que está descansando.

## O que a Ivy sabe
Só o que está em `conhecimento.js` (extraído do que já está publicado no site). Para ensinar algo novo, edite esse arquivo e rode `npx wrangler deploy`. Preço, prazo, contato e garantias estão marcados como "não sabe" até serem publicados.

## Teste local (sem rede, sem custo)
`node ivy-servidor/teste.mjs`
