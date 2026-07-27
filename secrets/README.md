# secrets/

Credenciais locais: JSON de service account, chave de API, certificado.

**Tudo nesta pasta é ignorado pelo git.** A única exceção é este README —
a regra está no `.gitignore` como `secrets/*` + `!secrets/README.md`.

## Isto é só para desenvolvimento local

Em produção a Vercel não lê arquivo desta pasta: ela nem sobe no deploy. O que
vale lá é **variável de ambiente**. Então uma credencial precisa existir em
dois lugares:

| Onde | Como |
|---|---|
| Local | arquivo aqui, ou linha no `.env.local` |
| Produção | Vercel → Settings → Environment Variables |

Se o app funciona na sua máquina e quebra no deploy, quase sempre é isto:
a variável não foi para a Vercel.

### JSON não cabe direto em variável de ambiente

Um service account é um JSON de várias linhas, e variável de ambiente é uma
string. O caminho usual é guardar o conteúdo em base64:

```bash
base64 -w0 secrets/service-account.json
```

e ler no código com `Buffer.from(process.env.X, "base64").toString()`.

## Regras

- Nunca mover um arquivo daqui para dentro de `app/`, `lib/` ou `public/`.
  Qualquer coisa em `public/` é servida na web — uma chave ali vaza para
  qualquer pessoa que souber a URL.
- Nunca colar o conteúdo de uma chave em commit, issue, print ou chat.
- Se uma chave for exposta, **rotacionar é obrigatório**. Apagar o arquivo e
  refazer o commit não resolve: quem já clonou continua com ela, e o histórico
  do git guarda tudo.
- A `ENCRYPTION_KEY` (dados financeiros) vive no `.env` e na Vercel, não aqui.
  Perder essa chave é perder os dados — vale ter uma cópia num gerenciador de
  senhas, fora do repositório e fora da Vercel.
