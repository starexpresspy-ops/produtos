import { LegalPage } from "@/components/public/LegalPage";
import { STORE } from "@/constants/store";

export default function ExchangeWarrantyPage() {
  return (
    <LegalPage title="Trocas e garantia">
      <p>
        Troca, garantia, retirada, entrega e devolucao sao tratadas diretamente
        com a {STORE.name}, pelos canais oficiais de atendimento.
      </p>
      <p>
        Antes de concluir qualquer compra, o cliente deve confirmar
        disponibilidade, preco, prazo, forma de pagamento, entrega ou retirada,
        garantia e demais condicoes comerciais diretamente com a loja.
      </p>
      <p>
        A disponibilidade e o preco exibidos na vitrine podem ser confirmados
        pelo WhatsApp antes da negociacao final.
      </p>
      <p>
        Recomenda-se conferir o produto no momento do recebimento ou retirada.
        Prazos, coberturas e condicoes de garantia dependem da politica
        comercial da {STORE.name} e do tipo de produto adquirido.
      </p>
      <p>
        As informacoes de garantia, troca e entrega exibidas no site refletem a
        politica cadastrada pela loja e devem ser validadas no atendimento antes
        da compra.
      </p>
    </LegalPage>
  );
}
