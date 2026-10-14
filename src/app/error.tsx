"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <main id="main" className="not-found"><h1>Something went wrong.</h1><p>Please try loading the page again.</p><button className="button blue" onClick={reset}>Try again ↗</button></main>; }
