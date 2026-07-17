import type { EventPrice } from "@calcom/features/bookings/types";
import { formatPrice } from "@calcom/lib/currencyConversions";
import dynamic from "next/dynamic";

const AlbyPriceComponent = dynamic(
  () => import("@calcom/app-store/alby/components/AlbyPriceComponent").then((m) => m.AlbyPriceComponent),
  {
    ssr: false,
  }
);

export const Price = ({
  price,
  currency,
  displayAlternateSymbol = true,
  locale = "en",
}: EventPrice & { locale?: string }) => {
  if (price === 0) return null;

  const formattedPrice = formatPrice(price, currency, locale);

  return currency !== "BTC" ? (
    <>{formattedPrice}</>
  ) : (
    <AlbyPriceComponent
      displaySymbol={displayAlternateSymbol}
      price={price}
      formattedPrice={formattedPrice}
    />
  );
};
