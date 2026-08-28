import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/primitives";
import { BookingWizard } from "@/components/booking/BookingWizard";

export const metadata: Metadata = {
  title: "Book Now",
  description:
    "Check availability and reserve your wellness stay at Centurion Wellness Eco Tourism, Paralakhemundi.",
};

export default function BookNowPage() {
  return (
    <div className="pt-36">
      <Container className="py-10">
        <p className="eyebrow text-terracotta">Reservations</p>
        <h1 className="mt-2 text-4xl sm:text-5xl">Book your stay</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Choose your dates and programme, tell us a little about yourself, and
          reserve your dates. Your on-site physician confirms the plan after a
          consultation on arrival.
        </p>
        <div className="mt-10">
          <Suspense fallback={<p className="font-ui text-sm text-muted-foreground">Loading…</p>}>
            <BookingWizard />
          </Suspense>
        </div>
      </Container>
    </div>
  );
}
