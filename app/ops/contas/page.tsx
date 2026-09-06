import { ReporSenhaDeConta } from "@/components/ops/ReporSenhaDeConta"
import { EMAIL_CONTATO } from "@/lib/constantes"

export const dynamic = "force-dynamic"

/**
 * Contas: a rede de segurança de quem esqueceu a senha.
 *
 * O recurso de verdade — "esqueci minha senha" com link no e-mail — está no
 * backlog e parado numa decisão que não se toma dentro do repositório
 * (provedor de envio, domínio verificado, SPF/DKIM, custo por mensagem). Esta
 * tela é a metade que não depende disso: enquanto o link não existe, a pessoa
 * escreve para o suporte e volta a entrar no mesmo dia.
 *
 * A tela pública que manda ela escrever é /recuperar-senha, e as duas se
 * obrigam: a porta aqui sem o aviso lá seria uma saída que ninguém sabe
 * pedir, e o aviso lá sem a porta aqui seria mandar a pessoa escrever para um
 * e-mail que não teria o que responder.
 */
export default function OpsContas() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide text-fl-ink/50">Contas</h2>
        <p className="mt-2 text-sm text-fl-ink/70">
          Não existe “esqueci minha senha” automático ainda. Quem esquece escreve para{" "}
          <span className="font-mono">{EMAIL_CONTATO}</span> (a tela /recuperar-senha manda), e a
          senha nova sai daqui.
        </p>
      </section>

      <ReporSenhaDeConta />

      <p className="text-xs text-fl-ink/50">
        Confere sempre que o pedido veio do e-mail da própria conta antes de repor: esta é a única
        superfície do Finlow em que uma pessoa troca a credencial de outra, e um pedido de suporte
        não prova quem escreveu. Aluno de escola também pode ser reposto pela própria escola, em
        /ops/escolas.
      </p>
    </div>
  )
}
