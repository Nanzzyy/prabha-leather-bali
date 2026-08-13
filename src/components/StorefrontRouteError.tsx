'use client';

import Icon from '@/components/Icon';

export default function StorefrontRouteError({ reset }: { reset: () => void }) {
  return (
    <main className="maintenance-state" role="alert">
      <Icon>wifi_off</Icon>
      <div className="maintenance-state__line" />
      <span className="eyebrow">Connection interrupted</span>
      <h1>This page is temporarily unavailable</h1>
      <p>We could not load the latest storefront data. Please try again in a moment.</p>
      <div className="maintenance-state__actions">
        <button className="button button--dark" type="button" onClick={reset}>Try again</button>
      </div>
    </main>
  );
}
