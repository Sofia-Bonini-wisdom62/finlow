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
   * serverExternalPackages resolve o empacotamento, mas não garante que o
   * arquivo do worker entre na função serverless: ele é carregado por caminho
   * construído em runtime, e o rastreador de dependências não enxerga isso.
   * Sem estas entradas o deploy sobe sem o worker e a rota morre com 500 sem
   * corpo — que foi o sintoma em produção.
   */
  outputFileTracingIncludes: {
    "/api/extrato": [
      "./node_modules/.pnpm/pdfjs-dist@*/node_modules/pdfjs-dist/legacy/build/**",
      "./node_modules/pdfjs-dist/legacy/build/**",
    ],
  },
};

export default nextConfig;
