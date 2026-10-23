// Política de privacidade (LGPD, Lei nº 13.709/2018) do site do Grupo Larssen. Usada por build.js.
module.exports = function ({ CONTATO, esc }) {
  const sec = (t, c) => `<h2>${t}</h2>${c}`;
  return `
<section class="capa clara"><div class="miolo"><nav class="migalhas" aria-label="Você está em"><a href="index.html">Grupo Larssen</a><span>/</span><span>Privacidade</span></nav><h1>Política de privacidade.</h1><p>Como o site do Grupo Larssen trata os seus dados, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Atualizada em outubro de 2026.</p></div></section>
<section class="bloco" style="padding-top:40px"><div class="miolo"><div class="texto-legal">
${sec("Resumo em poucas linhas", `<ul>
<li>Este site <b>não tem cadastro, não usa cookies de propaganda e não faz rastreamento</b> (sem Google Analytics, pixel do Facebook ou similares).</li>
<li>Os formulários de contato e de orçamento <b>não enviam nada para um servidor nosso</b>: eles só montam uma mensagem que abre no seu WhatsApp, e você decide se envia.</li>
<li>A lista do romaneio de orçamento fica guardada <b>apenas no seu navegador</b>, para não se perder se você trocar de página.</li>
</ul>`)}
${sec("Quem é o responsável pelos dados", `<p>O controlador dos dados tratados por este site é o <b>Grupo Larssen</b>, formado pela Madeireira Larssen, Larssen Madeiras Tratadas, Larssen Florestal, Larssen Escavações e Log Larssen Transportes, com atendimento na ${esc(CONTATO.endereco)}, ${esc(CONTATO.bairro)}, ${esc(CONTATO.cidade)}, CEP ${esc(CONTATO.cep)}.</p>
<p>Para qualquer assunto sobre os seus dados, fale com o Grupo Larssen pelo WhatsApp <a href="https://wa.me/${CONTATO.whats}" target="_blank" rel="noopener">${esc(CONTATO.whatsTexto)}</a>, pelo telefone ${esc(CONTATO.telefone)} ou pelo e-mail <a href="mailto:${CONTATO.emails.madeireira}">${CONTATO.emails.madeireira}</a>.</p>`)}
${sec("Quais dados e para quê", `<ul>
<li><b>Mensagens de contato e pedidos de orçamento</b>: nome, telefone, cidade de entrega, produtos e observações que você escreve. Servem para responder o seu pedido e preparar o orçamento (art. 7º, V, da LGPD: procedimentos preliminares a um contrato, a pedido do titular). Esses dados só chegam ao Grupo Larssen quando você envia a mensagem pelo WhatsApp.</li>
<li><b>Registros técnicos de acesso</b> (endereço IP, data e hora, navegador): guardados pela empresa de hospedagem para segurança e funcionamento do site (art. 7º, IX: legítimo interesse; e Marco Civil da Internet, art. 15).</li>
<li><b>Preferências no seu navegador</b>: a lista do romaneio e a forma de ver o catálogo (lista ou fotos) ficam no armazenamento local do navegador. Não são enviadas a ninguém e você pode apagá-las limpando os dados do site no navegador.</li>
</ul>`)}
${sec("Com quem os dados são compartilhados", `<ul>
<li><b>Vercel Inc.</b>: hospedagem do site (registros técnicos de acesso).</li>
<li><b>WhatsApp (Meta)</b>: somente se você escolher enviar a mensagem por lá, conforme os termos do próprio WhatsApp.</li>
<li><b>Google</b>: a página de contato mostra o mapa do Google Maps com o endereço de atendimento. Ao exibir o mapa, o Google recebe dados técnicos do seu acesso, conforme a política de privacidade do próprio Google.</li>
<li><b>Supabase</b>: guarda o cadastro dos produtos exibidos no catálogo. Quando o catálogo carrega, recebe só os dados técnicos da conexão (como o endereço IP); nenhum dado que você digita no site vai para lá.</li>
<li>Autoridades públicas, quando houver obrigação legal ou ordem judicial.</li>
</ul>
<p>O Grupo Larssen não vende nem aluga dados pessoais.</p>`)}
${sec("Por quanto tempo", `<p>As conversas de WhatsApp ficam pelo tempo necessário para atender o pedido e cumprir obrigações legais (por exemplo, fiscais, quando há venda). Os registros técnicos de acesso seguem o prazo do Marco Civil da Internet (6 meses). As preferências do navegador ficam até você apagá-las.</p>`)}
${sec("Seus direitos", `<p>Pelo art. 18 da LGPD, você pode pedir a confirmação de que tratamos seus dados, o acesso a eles, a correção de dados incompletos ou errados, a eliminação de dados desnecessários, informações sobre com quem foram compartilhados e a revogação do consentimento, quando for o caso.</p>
<p>Os pedidos são atendidos pelo WhatsApp ${esc(CONTATO.whatsTexto)}, pelo e-mail ${CONTATO.emails.madeireira} ou no atendimento, em até 15 dias. Se não ficar satisfeito, você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD), em <a href="https://www.gov.br/anpd" target="_blank" rel="noopener">gov.br/anpd</a>.</p>`)}
${sec("Segurança", `<p>O site é servido somente por conexão segura (HTTPS), com regras que impedem a execução de códigos de terceiros, o uso do site dentro de outras páginas e o envio de informações a endereços não autorizados. As bibliotecas usadas no site são servidas pelo próprio site, sem depender de serviços externos.</p>`)}
${sec("Crianças e adolescentes", `<p>O site é voltado a clientes que compram madeira e serviços e não é direcionado a menores de 18 anos.</p>`)}
${sec("Mudanças nesta política", `<p>Esta política pode ser atualizada quando o site mudar. A data da última atualização fica sempre no topo da página.</p>`)}
</div></div></section>`;
};
