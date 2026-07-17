import { MapPin, Clock, Phone, AtSign } from "lucide-react";

export const metadata = {
  title: "About & Location | Ali Baba Smoke Shop",
};

const HOURS = [
  { day: "Monday – Thursday", time: "10:00 AM – 10:00 PM" },
  { day: "Friday – Saturday", time: "10:00 AM – 12:00 AM" },
  { day: "Sunday", time: "11:00 AM – 9:00 PM" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold sm:text-4xl">About Ali Baba Smoke Shop</h1>
      <p className="mt-4 leading-relaxed text-foreground/70">
        Ali Baba Smoke Shop is Tampa&apos;s destination for vapes, tobacco
        accessories, hookah, glass, and everything in between. We carry a
        wide selection of quality products and pride ourselves on friendly,
        knowledgeable service &mdash; in store and online.
      </p>
      <p className="mt-3 text-sm text-foreground/40">
        (Placeholder copy &mdash; replace with your shop&apos;s real story.)
      </p>

      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center gap-2 text-accent">
            <MapPin className="h-5 w-5" />
            <h2 className="font-semibold text-foreground">Location</h2>
          </div>
          <p className="mt-3 text-sm text-foreground/70">
            123 Placeholder Ave
            <br />
            Tampa, FL 33602
          </p>
          <p className="mt-2 text-xs text-foreground/40">
            (Update with the real store address.)
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center gap-2 text-accent">
            <Clock className="h-5 w-5" />
            <h2 className="font-semibold text-foreground">Store Hours</h2>
          </div>
          <ul className="mt-3 flex flex-col gap-1 text-sm text-foreground/70">
            {HOURS.map((h) => (
              <li key={h.day} className="flex justify-between gap-4">
                <span>{h.day}</span>
                <span>{h.time}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-foreground/40">
            (Update with the real store hours.)
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center gap-2 text-accent">
            <Phone className="h-5 w-5" />
            <h2 className="font-semibold text-foreground">Contact</h2>
          </div>
          <p className="mt-3 text-sm text-foreground/70">(813) 555-0100</p>
          <p className="mt-1 text-sm text-foreground/70">
            hello@alibabasmoketampa.com
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center gap-2 text-accent">
            <AtSign className="h-5 w-5" />
            <h2 className="font-semibold text-foreground">Follow Us</h2>
          </div>
          <a
            href="https://www.instagram.com/alibabasmoketampa/"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-sm text-foreground/70 hover:text-accent"
          >
            @alibabasmoketampa
          </a>
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-gold/30 bg-gold/10 p-6 text-sm text-foreground/70">
        <strong className="text-gold">Age restriction notice:</strong> All
        products on this site are intended for adults 21 years of age or
        older. Valid government-issued ID is required to complete a purchase
        and may be required upon delivery.
      </div>
    </div>
  );
}
