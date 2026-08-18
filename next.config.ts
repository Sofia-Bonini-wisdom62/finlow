import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * NÃO traga a leitura de PDF de volta para o servidor.
   *
   * Ela morava aqui e quebrou produção três vezes seguidas, sempre pelo mesmo
   * motivo de fundo: o pdfjs precisa de um arquivo de worker em disco, e
   * nenhuma forma de fazê-lo sobreviver ao empacotamento funcionou —
   *   - `require.resolve` com variável: o bundler não resolve estaticamente,
   *     build quebrado com "Module not found";
   *   - `outputFileTracingIncludes` com glob para node_modules: atravessou os
   *     symlinks do pnpm e derrubou o deploy com
   *     "ENOTDIR: not a directory, mkdir '.../.pnpm/node_modules/pdfjs-dist'";
   *   - sem nada disso: o módulo não carregava na função e a rota morria com
   *     500 sem corpo, antes de qualquer try/catch conseguir explicar.
   *
   * Hoje a leitura acontece no navegador (lib/extrato/ler-no-navegador.ts),
   * onde o worker é um asset estático de public/ e não passa por empacotador.
   * De brinde, o arquivo do extrato nunca sai do computador da pessoa.
   *
   * Ou seja: nada de pdf-parse/pdfjs em serverExternalPackages. Se a leitura
   * um dia precisar voltar para o servidor, resolva o worker primeiro — não
   * depois.
   */

  /**
   * Cabeçalhos de segurança em todas as respostas.
   *
   * O app não emitia nenhum: sem nosniff, sem trava de moldura, sem política de
   * referenciador. Nada disso conserta um defeito sozinho, mas cada um fecha uma
   * classe de ataque que depende do navegador cooperar.
   *
   * CSP FICOU DE FORA, E ISSO É DECISÃO, NÃO ESQUECIMENTO: o layout injeta um
   * script embutido (o anti-flash de tema, app/layout.tsx) e uma política de
   * script séria exige nonce por requisição, o que obriga a renderização
   * dinâmica em página que hoje é estática. Vale fazer, com medida antes: pôr
   * CSP frouxa só para dizer que existe seria teatro.
   */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Impede o navegador de adivinhar o tipo do conteúdo. É o que evita
          // que um arquivo enviado pela pessoa seja tratado como HTML e execute.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // O app não é feito para viver dentro de moldura de terceiro, e sem
          // isto ele pode ser embutido e usado para roubar clique.
          { key: "X-Frame-Options", value: "DENY" },
          // O endereço interno (que carrega id de convite e token de partilha)
          // para de vazar no cabeçalho de quem sai do app por um link.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Nada aqui usa câmera, microfone nem localização.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ]
  },
};

export default nextConfig;
