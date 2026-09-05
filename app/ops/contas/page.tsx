import { BuscaDeContas } from "@/components/ops/BuscaDeContas"
import { EMAIL_CONTATO } from "@/lib/constantes"

export const dynamic = "force-dynamic"

/**
 * O atendimento de "esqueci minha senha", enquanto não existe o autoatendimento.
 *
 * O backlog registrou em 30/08/2026 que quem esquece a senha perde a conta
 * inteira, e que o recurso de verdade trava numa decisão que não se toma aqui
 * dentro: escolher provedor de e-mail. Esta tela é a rede de segurança que o
 * próprio item apontou como a saída independente dessa decisão — a mesma que
 * a escola já tinha desde 18/08, agora alcançando também a assinante adulta.
 *
 * Ela não é o recurso e não deve ser confundida com ele: não atende quem
 * esqueceu a senha às 23h de um domingo, porque depende de uma pessoa ler o
 * e-mail do suporte. Tira da mesa o "perdeu a conta para sempre", que é outra
 * coisa e era o que doía.
 */
export default function OpsContas() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide text-fl-ink/50">Senha</h2>
        <p className="mt-2 text-sm text-fl-ink/70">
          Quem esquece a senha escreve para <span className="font-semibold">{EMAIL_CONTATO}</span>,
          porque ainda não existe link de redefinição por e-mail no produto. Aqui a conta é achada
          e a senha é reposta.
        </p>
      </section>

      <BuscaDeContas />

      <section className="rounded-2xl border border-fl-sand bg-fl-card p-5">
        <h3 className="text-base font-semibold text-fl-ink">Antes de repor, confere três coisas</h3>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-fl-ink/70">
          <li>
            <strong>Que é mesmo a pessoa.</strong> Nada nesta tela prova identidade — só a pessoa
            que atende prova. O jeito mais barato é pedir na resposta do e-mail algo que só o dono
            saberia e que dê para conferir (data aproximada em que criou a conta, se tem
            assinatura, de que banco subiu o último extrato). Vir do e-mail cadastrado já é o
            sinal mais forte, e é o único que a lista aqui confirma.
          </li>
          <li>
            <strong>Se a conta é de escola.</strong> Login terminado em <code>.invalid</code> é
            aluno criado em lote, e quem repõe normalmente é a própria escola, pela tela dela.
          </li>
          <li>
            <strong>Se a conta entra pelo Google.</strong> Aí não há senha esquecida: há um botão
            que a pessoa não achou. Sortear senha resolve, mas cria um segundo jeito de entrar que
            não existia — só faça se ela perdeu o acesso ao próprio Google.
          </li>
        </ol>
      </section>

      <p className="text-xs text-fl-ink/50">
        Toda reposição vai para o log com o e-mail de quem operou. A senha sorteada aparece uma
        vez, aqui, e não é gravada em claro em lugar nenhum — se a tela fechar antes de você
        copiar, sorteia de novo.
      </p>
    </div>
  )
}
