import { valueProps } from "@/data/valueProps";
import { getOrder, applyOrder } from "@/lib/order";
import Reveal from "./Reveal";
import Field from "./edit/Field";
import OrderedGrid, { type OrderedItem } from "./edit/OrderedGrid";

export default async function ValueProps() {
  const order = await getOrder(
    "valueProps",
    valueProps.map((v) => v.id),
  );
  const ordered = applyOrder(valueProps, order);

  const items: OrderedItem[] = ordered.map((v, i) => ({
    id: v.id,
    node: (
      <Reveal key={v.id} delay={i * 0.08}>
        <div>
          <span className="font-display text-3xl font-semibold text-sage">
            {String(i + 1).padStart(2, "0")}
          </span>
          <Field
            id={`home.value.${v.n}.title`}
            as="h3"
            className="mt-3 font-display text-h3 font-semibold text-forest"
          />
          <Field
            id={`home.value.${v.n}.desc`}
            as="p"
            className="mt-2 whitespace-pre-line text-[0.95rem] leading-relaxed text-forest/70"
          />
        </div>
      </Reveal>
    ),
  }));

  return (
    <OrderedGrid
      collection="valueProps"
      items={items}
      className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4"
    />
  );
}
