import { site } from "@/content/site";

const iconClass = "h-[19px] w-[19px]";

const IG = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const FB = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const Phone = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.98.36 1.94.68 2.86a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.22-1.22a2 2 0 0 1 2.11-.45c.92.32 1.88.55 2.86.68A2 2 0 0 1 22 16.92z" />
  </svg>
);
const Mail = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const links = [
  { label: "Instagram", href: site.socials.instagram, external: true, hover: "hover:border-[#E1306C] hover:bg-[#E1306C]", icon: IG },
  { label: "Facebook", href: site.socials.facebook, external: true, hover: "hover:border-[#1877F2] hover:bg-[#1877F2]", icon: FB },
  { label: "Call reception", href: `tel:${site.phone.replace(/\s/g, "")}`, hover: "hover:border-forest-700 hover:bg-forest-700", icon: Phone },
  { label: "Email us", href: `mailto:${site.email}`, hover: "hover:border-terracotta-600 hover:bg-terracotta-600", icon: Mail },
];

/** Fixed contact rail — social + phone + email — on every page. */
export function ContactDock() {
  return (
    <div className="fixed right-3 bottom-6 z-30 flex flex-col gap-2.5 print:hidden sm:right-4">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          aria-label={l.label}
          className={`group relative grid h-11 w-11 place-items-center rounded-full border border-border/60 bg-ivory/95 text-forest-700 shadow-lift backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:text-white ${l.hover}`}
        >
          {l.icon}
          <span className="pointer-events-none absolute right-[calc(100%+10px)] whitespace-nowrap rounded-lg bg-forest-900 px-2.5 py-1 font-ui text-[0.7rem] font-medium text-ivory opacity-0 shadow-soft transition-opacity duration-200 group-hover:opacity-100">
            {l.label}
          </span>
        </a>
      ))}
    </div>
  );
}
