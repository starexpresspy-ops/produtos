import { LegalPage } from "@/components/public/LegalPage";
import { STORE } from "@/constants/store";

export default function TermsPage() {
  return (
    <LegalPage title="Termos de uso">
      <p>
        Este site e uma vitrine digital da {STORE.name}. Nao e necessario criar
        conta ou fazer login para navegar pelos produtos e precos.
      </p>
      <p>
        Os produtos, imagens, descricoes, precos, disponibilidade e demais
        informacoes comerciais sao cadastrados e mantidos exclusivamente pela{" "}
        {STORE.name}.
      </p>
      <p>
        A navegacao no site nao representa compra finalizada, reserva de produto
        ou confirmacao automatica de disponibilidade. Toda negociacao, pagamento,
        entrega, retirada, garantia, troca ou devolucao deve ser confirmada
        diretamente com a {STORE.name} pelos canais oficiais de atendimento.
      </p>
      <p>
        O site nao processa pagamentos online, nao possui checkout e nao
        intermedia transacoes financeiras. O contato comercial ocorre
        diretamente pelo WhatsApp informado pela loja.
      </p>
      <p>
        A {STORE.name} e responsavel pela veracidade das informacoes publicadas,
        pela procedencia dos produtos, pela politica comercial adotada e pelo
        cumprimento das obrigacoes legais, fiscais e consumeristas aplicaveis.
      </p>
    </LegalPage>
  );
}
