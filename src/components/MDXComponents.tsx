import React, { ComponentPropsWithoutRef } from "react";

const PixelBox = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) => (
  <div className="my-8 bg-card border-2 border-border p-4 relative pt-6">
    {title && (
      <div className="absolute -top-3 left-4 bg-accent text-accent-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
        {title}
      </div>
    )}
    {children}
  </div>
);

const ALERT_STYLES: Record<string, string> = {
  NOTE: "bg-muted/70 border-border text-foreground",
  TIP: "bg-secondary/80 border-border text-foreground",
  IMPORTANT: "bg-accent/80 border-accent text-foreground",
  WARNING: "bg-destructive/10 border-destructive/40 text-foreground",
  CAUTION: "bg-destructive/20 border-destructive/50 text-foreground",
  DEFAULT: "bg-muted/60 border-border text-muted-foreground",
};

const Callout = ({
  children,
  type = "DEFAULT",
}: {
  children: React.ReactNode;
  type?: string;
}) => {
  const currentStyle = ALERT_STYLES[type] || ALERT_STYLES.DEFAULT;

  return (
    <div className={`my-6 p-4 border-l-4 ${currentStyle} text-sm`}>
      <div className="font-bold mb-1 text-[10px] uppercase tracking-widest opacity-80">
        {type}
      </div>
      {children}
    </div>
  );
};

export const MDXComponents = {
  h1: (props: ComponentPropsWithoutRef<"h1">) => (
    <h1 className="text-2xl font-bold mt-10 mb-8 text-foreground" {...props} />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      className="text-xl font-bold mt-10 mb-8 pb-2 border-b border-border text-foreground"
      {...props}
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="text-lg font-bold mt-8 mb-8 text-foreground" {...props} />
  ),
  h4: (props: ComponentPropsWithoutRef<"h4">) => (
    <h4 className="text-base font-bold mt-8 mb-8 text-foreground" {...props} />
  ),
  h5: (props: ComponentPropsWithoutRef<"h5">) => (
    <h5 className="text-sm font-bold mt-8 mb-8 text-foreground" {...props} />
  ),
  h6: (props: ComponentPropsWithoutRef<"h6">) => (
    <h6 className="text-xs font-bold mt-8 mb-8 text-foreground" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="leading-7 mb-8 text-muted-foreground" {...props} />
  ),
  a: ({ href, ...props }: ComponentPropsWithoutRef<"a">) => {
    const isHashLink = typeof href === "string" && href.startsWith("#");

    return (
      <a
        href={href}
        target={isHashLink ? undefined : "_blank"}
        rel={isHashLink ? undefined : "noopener noreferrer"}
        {...props}
      />
    );
  },
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul
      className="list-disc list-inside mb-8 text-muted-foreground pl-4"
      {...props}
    />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol
      className="list-decimal list-inside mb-8 text-muted-foreground pl-4"
      {...props}
    />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li className="mb-3 leading-7" {...props} />
  ),
  hr: (props: ComponentPropsWithoutRef<"hr">) => (
    <hr className="my-12 border-border" {...props} />
  ),
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="overflow-x-auto mb-8">
      <table
        className="w-full text-left text-sm text-muted-foreground"
        {...props}
      />
    </div>
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th
      className="border-b border-border pb-2 font-bold text-foreground uppercase tracking-wider"
      {...props}
    />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td className="py-4 border-b border-border" {...props} />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="mb-8 overflow-x-auto rounded-lg border border-border bg-card p-4"
      {...props}
    />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => {
    const children = React.Children.toArray(props.children);
    const firstChild = children[0];

    // Helpfully extract text from the first child (usually a 'p' tag)
    const extractText = (node: any): string => {
      if (typeof node === "string") return node;
      if (typeof node === "number") return String(node);
      if (Array.isArray(node)) return node.map(extractText).join("");
      if (React.isValidElement(node))
        return extractText((node as React.ReactElement<any>).props.children);
      return "";
    };

    const firstChildText = extractText(firstChild).trim();
    const match = firstChildText.match(
      /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)/i,
    );

    if (match) {
      const type = match[1].toUpperCase() as keyof typeof ALERT_STYLES;
      const text = match[2];
      const remainingChildren = children.slice(1);

      return (
        <Callout type={type}>
          {text && <p className="mb-2">{text}</p>}
          {remainingChildren}
        </Callout>
      );
    }

    return (
      <blockquote
        className="border-l-2 border-border pl-4 italic text-muted-foreground my-6"
        {...props}
      />
    );
  },
  Callout,
  PixelBox,
};
