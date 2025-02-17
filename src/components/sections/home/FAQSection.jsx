// components/sections/FAQSection.jsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is the Tradeboard platform?",
    answer:
      "In a world full of different technical indicators, trading courses and technical analysis tools, the Tradeboard is your one friendly platform where you can journal your thoughts and your trading patterns. Based on your trading pattern, we tell you what worked and what went against you. Using this information, you can build a strong trading psychology and focus on rules working for you.",
  },
  {
    question:
      "Do I need to add actual capital to add trades in the Tradeboard?",
    answer:
      "No, you don't need to add actual capital. Tradeboard is a journaling and analysis tool, not a trading platform.",
  },
  {
    question: "Is the Accountability Partner feature optional?",
    answer:
      "Yes, the Accountability Partner feature is optional. You can choose to use it or not based on your preferences.",
  },
  {
    question: "Will I get any rewards for journaling points and levels?",
    answer:
      "We have a gamification system that rewards consistent journaling with points and levels. These can unlock certain features or badges within the platform.",
  },
  {
    question: "I want to promote Tradeboard, how can I get benefitted?",
    answer:
      "We have an affiliate program for those interested in promoting Tradeboard. Please contact our support team for more information on how to participate and benefit from it.",
  },
];

const FAQSection = () => {
  return (
    <section className="py-24 bg-card scroll-mt-20" id="faqs">
      <div className="container mx-auto px-">
        <h2 className="font-bold text-3xl md:text-[2.5rem]  text-center mb-14">
          Frequently Asked Questions
        </h2>
        <Accordion
          type="single"
          collapsible
          className="w-full max-w-5xl mx-auto"
        >
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="px-8">
              <AccordionTrigger className="text-lg font-semibold text-foreground">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-[#53545C]">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection