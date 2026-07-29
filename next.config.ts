import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * pdf-parse carrega o pdfjs-dist, que precisa de um arquivo de worker em
   * disco. Empacotado pelo Turbopack, o worker vira um chunk com outro nome e
   * o pdfjs não acha o caminho — a rota do extrato falhava com
   * "Setting up fake worker failed: Cannot find module .../pdf.worker.mjs".
   *
   * Marcar como externo faz o Next carregar os dois de node_modules em tempo
   * de execução, com a árvore de arquivos intacta. Vale só para código de
   * servidor, que é onde a leitura do PDF acontece.
   *
   * Isso NÃO aparece em teste unitário: rodando o mesmo PDF direto no Node o
   * caminho do worker resolve normalmente. Só quebra atravessando a rota.
   */
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],

  /**
   * NÃO reintroduza outputFileTracingIncludes apontando para dentro de
   * node_modules aqui.
   *
   * Havia um bloco assim, com globs para o worker do pdfjs. Ele derrubava o
   * build na Vercel com:
   *   ENOTDIR: not a directory, mkdir '.../node_modules/.pnpm/node_modules/pdfjs-dist'
   *
   * Motivo: na árvore do pnpm, `.pnpm/node_modules/<pacote>` é um SYMLINK, não
   * uma pasta. O glob atravessava essa árvore e o empacotador da Vercel tentava
   * criar diretório em cima do symlink ao montar a função.
   *
   * Era belt-and-braces: serverExternalPackages sozinho já basta para o pdfjs
   * carregar o worker. Se algum dia o worker faltar de fato na função, o
   * sintoma agora é um JSON com codigo e motivo (a rota inteira está
   * protegida), não um 500 mudo — dá para diagnosticar antes de mexer aqui.
   */
};

export default nextConfig;
