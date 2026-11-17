import { createFileRoute } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { pageMeta } from "@/lib/page-meta";
export const Route = createFileRoute("/app/ajuda")({ head: () => pageMeta("Ajuda", "Dúvidas sobre projetos temporários e documentação técnica da LEMBO."), component: Help });
function Help() {
  return <div className="mx-auto max-w-3xl space-y-6"><h1 className="text-2xl font-bold text-primary">Ajuda</h1><Accordion type="single" collapsible defaultValue="session">
    <AccordionItem value="session"><AccordionTrigger>Os meus projetos estão salvos?</AccordionTrigger><AccordionContent>Os projetos são temporários e ficam disponíveis enquanto você navega nesta sessão. Recarregar a página ou sair descarta os projetos criados e restaura os exemplos. Não há gravação nem exclusão no banco de dados nesta etapa.</AccordionContent></AccordionItem>
    <AccordionItem value="analysis"><AccordionTrigger>Por que o projeto ainda não tem análise?</AccordionTrigger><AccordionContent>A análise real ainda não está conectada. Novos projetos permanecem como rascunho, sem resultados técnicos. Os exemplos são identificados e não devem ser usados para fabricação.</AccordionContent></AccordionItem>
    <AccordionItem value="dimensions"><AccordionTrigger>Qual é a confiabilidade das dimensões?</AccordionTrigger><AccordionContent>Observadas são medidas informadas ou lidas na referência. Calculadas são derivadas matematicamente. Estimadas são aproximações que precisam de confirmação. Desconhecidas não possuem valor determinado.</AccordionContent></AccordionItem>
  </Accordion></div>;
}