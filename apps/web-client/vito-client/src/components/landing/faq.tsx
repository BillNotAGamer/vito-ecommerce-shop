"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  {
    q: "Chính sách đổi trả như thế nào?",
    a: "Bạn có thể đổi trả trong 7 ngày kể từ khi nhận hàng, sản phẩm còn nguyên tag và chưa qua sử dụng.",
  },
  { q: "Thời gian giao hàng?", a: "Hà Nội & TP.HCM trong 48h. Tỉnh khác từ 3-5 ngày làm việc." },
  { q: "Bảo hành sản phẩm?", a: "Bảo hành đường may, hỗ trợ sửa chữa cơ bản trong 30 ngày." },
];

export function FAQ() {
  return (
    <section className="container py-16">
      <div className="mx-auto max-w-2xl">
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

