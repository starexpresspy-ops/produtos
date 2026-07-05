import { LegalPage } from "@/components/public/LegalPage";
import { STORE } from "@/constants/store";

export default function PrivacyPage() {
  return (
    <LegalPage title="Politica de privacidade">
      <p>
        A {STORE.name} valoriza a privacidade dos visitantes deste site e coleta
        o minimo de informacoes necessario para o funcionamento da vitrine
        digital.
      </p>
      <p>
        Ao entrar em contato comercial pelo WhatsApp ou outros canais informados
        pela loja, os dados fornecidos pelo cliente sao tratados diretamente
        pela {STORE.name}, que e responsavel pelo atendimento e pela guarda
        dessas informacoes.
      </p>
      <p>
        Para o funcionamento tecnico da aplicacao, podem ser processados dados
        basicos de navegacao e registros tecnicos de acesso, como endereco IP,
        tipo de navegador e paginas visitadas, exclusivamente para seguranca,
        desempenho e estabilidade do servico.
      </p>
      <p>
        A {STORE.name} nao vende dados pessoais e nao utiliza informacoes alem
        do necessario para exibir o catalogo e viabilizar o contato comercial.
      </p>
      <p>
        Para solicitar informacoes sobre dados fornecidos em atendimento, entre
        em contato pelos canais oficiais da loja informados na pagina de
        contato.
      </p>
    </LegalPage>
  );
}
