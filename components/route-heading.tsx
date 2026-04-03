import type { ElementType, ReactNode } from "react";

type SplitHeadingProps = {
  kicker?: string;
  leadTitle: string;
  outlineTitle?: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
  as?: "h1" | "h2" | "h3";
};

export function SplitHeading({
  kicker,
  leadTitle,
  outlineTitle,
  description,
  action,
  compact = false,
  as,
}: SplitHeadingProps) {
  const Tag = (as ?? (compact ? "h2" : "h1")) as ElementType;
  const outlinedWordStyle = {
    WebkitTextStroke: "2.3px var(--outlined-stroke)",
    WebkitTextFillColor: "transparent",
  } as const;

  return (
    <div className="route-heading-shell">
      {kicker ? <p className="route-kicker">{kicker}</p> : null}
      <Tag
        className={`font-heading mt-3 flex flex-wrap items-end gap-x-4 gap-y-1 uppercase leading-[0.95] tracking-tight ${
          compact
            ? "text-2xl font-bold"
            : "text-2xl font-bold sm:text-3xl sm:flex-nowrap"
        }`}
      >
        <span className="whitespace-nowrap text-black">{leadTitle}</span>
        {outlineTitle ? (
          <span className="section-outline-word whitespace-nowrap" style={outlinedWordStyle}>
            {outlineTitle}
          </span>
        ) : null}
      </Tag>
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
  items?: string[];
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
        <span key={item} className={toneClass}>
          {item}
        </span>
      ))}
    </div>
  );
}
