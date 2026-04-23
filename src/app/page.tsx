"use client";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Page() {
  return (
    <div>
      <h1>test</h1>
      <Button className="bg-primary text-primary-foreground">click me</Button>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Konten 1</AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="bg-primary text-primary-foreground p-4">TEST PRIMARY</div>
    </div>
  );
}
