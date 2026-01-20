import React, { ComponentPropsWithoutRef } from "react";

const PixelBox = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) => (
  <div className="my-8 bg-gray-900 border-2 border-white p-4 relative pt-6">
    {title && (
      <div className="absolute -top-3 left-4 bg-white text-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
        {title}
      </div>
    )}
    {children}
  </div>
);

const ALERT_STYLES: Record<string, string> = {
  NOTE: "bg-blue-900/20 border-blue-800 text-blue-200",
  TIP: "bg-green-900/20 border-green-800 text-green-200",
  IMPORTANT: "bg-purple-900/20 border-purple-800 text-purple-200",
  WARNING: "bg-yellow-900/20 border-yellow-800 text-yellow-200",
  CAUTION: "bg-red-900/20 border-red-800 text-red-200",
  DEFAULT: "bg-gray-800/50 border-gray-700 text-gray-300",
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
    <h1 className="text-2xl font-bold mt-10 mb-8 text-gray-200" {...props} />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      className="text-xl font-bold mt-10 mb-8 pb-2 border-b border-gray-700 text-gray-200"
      {...props}
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="text-lg font-bold mt-8 mb-8 text-gray-200" {...props} />
  ),
  h4: (props: ComponentPropsWithoutRef<"h4">) => (
    <h4 className="text-base font-bold mt-8 mb-8 text-gray-200" {...props} />
  ),
  h5: (props: ComponentPropsWithoutRef<"h5">) => (
    <h5 className="text-sm font-bold mt-8 mb-8 text-gray-200" {...props} />
  ),
  h6: (props: ComponentPropsWithoutRef<"h6">) => (
    <h6 className="text-xs font-bold mt-8 mb-8 text-gray-200" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="leading-7 mb-8 text-gray-400" {...props} />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="list-disc list-inside mb-8 text-gray-400 pl-4" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol
      className="list-decimal list-inside mb-8 text-gray-400 pl-4"
      {...props}
    />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li className="mb-2" {...props} />
  ),
  hr: (props: ComponentPropsWithoutRef<"hr">) => (
    <hr className="my-12 border-gray-800" {...props} />
  ),
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="overflow-x-auto mb-8">
      <table className="w-full text-left text-sm text-gray-400" {...props} />
    </div>
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th
      className="border-b border-gray-700 pb-2 font-bold text-gray-200 uppercase tracking-wider"
      {...props}
    />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td className="py-4 border-b border-gray-800" {...props} />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="mb-8 overflow-x-auto rounded-lg border border-gray-800 bg-gray-950 p-4"
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
        className="border-l-2 border-gray-700 pl-4 italic text-gray-500 my-6"
        {...props}
      />
    );
  },
  Callout,
  PixelBox,
};
