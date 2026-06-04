// components/OneSignalInit.tsx — v1.0
// Trikaal Vaani Web Push initializer (OneSignal v16, Next.js App Router)
// Changelog v1.0: initial OneSignal SDK load + init via next/script.
// Placement: components/OneSignalInit.tsx
// Wiring: import into app/layout.tsx and render <OneSignalInit /> inside <body>.

"use client";

import Script from "next/script";

export default function OneSignalInit() {
  return (
    <>
      <Script
        id="onesignal-sdk"
        src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
        strategy="afterInteractive"
      />
      <Script id="onesignal-init" strategy="afterInteractive">
        {`
          window.OneSignalDeferred = window.OneSignalDeferred || [];
          OneSignalDeferred.push(async function (OneSignal) {
            await OneSignal.init({
              appId: "aeedcde6-122e-46d9-994c-2cd3b522e6ca",
            });
          });
        `}
      </Script>
    </>
  );
}
