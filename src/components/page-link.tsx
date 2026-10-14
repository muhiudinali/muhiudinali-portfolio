import NextLink from "next/link";
import type { ComponentProps } from "react";

export default function PageLink(props: ComponentProps<typeof NextLink>) {
  const hash = typeof props.href === "string" ? props.href.includes("#") : !!props.href.hash;
  // NavigationScroll owns ordinary page scroll; hash links keep their anchor.
  return <NextLink {...props} scroll={props.scroll ?? hash} />;
}
