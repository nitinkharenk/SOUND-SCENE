import Link from "next/link";
import type { ElementType, ReactNode } from "react";

type SplitHeadingProps = {
  kicker?: string;
  leadTitle: string;
  outlineTitle?: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
  as?: "h1" | "h2" | "h3";
  mode?: "inline" | "detail";
};

export function SplitHeading({
  kicker,
  leadTitle,
  outlineTitle,
  description,
  action,
  compact = false,
  as,
  mode = "inline",
}: SplitHeadingProps) {
  const Tag = (as ?? (compact ? "h2" : "h1")) as ElementType;
  const outlinedWordStyle = {
    WebkitTextStroke: "1.8px var(--outlined-stroke)",
    WebkitTextFillColor: "transparent",
  } as const;
  const titleClassName = `font-heading uppercase leading-[1.25] tracking-[0.01em] ${
    compact
      ? "text-2xl font-extrabold"
      : "text-2xl font-extrabold sm:text-3xl"
  }`;

  return (
    <div className="route-heading-shell">
      {kicker ? <p className="route-kicker">{kicker}</p> : null}
      {mode === "detail" ? (
        <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-1">
          <Tag className={titleClassName}>
            <span className="text-black">{leadTitle}</span>
          </Tag>
          {outlineTitle ? (
            <p
              className={`${titleClassName} section-outline-word whitespace-nowrap`}
              style={outlinedWordStyle}
            >
              {outlineTitle}
            </p>
          ) : null}
        </div>
      ) : (
        <Tag className={`${titleClassName} mt-3 flex flex-wrap items-end gap-x-4 gap-y-1 sm:flex-nowrap`}>
          <span className="text-black">{leadTitle}</span>
          {outlineTitle ? (
            <>
              {" "}
              <span className="section-outline-word whitespace-nowrap" style={outlinedWordStyle}>
                {outlineTitle}
              </span>
            </>
          ) : null}
        </Tag>
      )}
      {description ? <p className="route-description mt-5 max-w-3xl">{description}</p> : null}
      {action ? <div className="mt-7">{action}</div> : null}
    </div>
  );
}

type RouteMetaProps = {
  items?: Array<string | number>;
};

export function RouteMeta({ items = [] }: RouteMetaProps) {
  return (
    <div className="route-meta-row">
      {items.filter(Boolean).map((item) => (
        <span key={String(item)} className="route-meta-item">
          {item}
        </span>
      ))}
    </div>
  );
}

type RouteTagListProps = {
  items?: Array<string | { label: string; href: string }>;
  tone?: "default" | "accent";
};

export function RouteTagList({
  items = [],
  tone = "default",
}: RouteTagListProps) {
  const toneClass = tone === "accent" ? "route-tag route-tag-accent" : "route-tag";

  return (
    <div className="route-tag-list">
      {items.map((item) => (
        typeof item === "string" ? (
          <span key={item} className={toneClass}>
            {item}
          </span>
        ) : (
          <Link key={`${item.label}-${item.href}`} href={item.href} className={`${toneClass} focus-ring`}>
            {item.label}
          </Link>
        )
      ))}
    </div>
  );
}
