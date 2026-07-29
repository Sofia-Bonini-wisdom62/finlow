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
};

export default nextConfig;
