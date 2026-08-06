import Link from 'next/link';

export default function MaintenanceState({ compact = false }: { compact?: boolean }) {
  return <main className={`maintenance-state ${compact ? 'maintenance-state--compact' : ''}`}>
    <div className="maintenance-state__mark"><span>PRABA</span><small>LEATHER BALI</small></div>
    <div className="maintenance-state__line" />
    <span className="eyebrow">A short pause</span>
    <h1>The atelier is being prepared.</h1>
    <p>We are refreshing the storefront or reconnecting to our service. Your data is safe—please try again in a moment.</p>
    <div className="maintenance-state__actions"><a className="button button--dark" href="">Try again</a><Link className="button button--outline" href="/">Return home</Link></div>
    <small className="maintenance-state__note">Praba Leather Bali · Handcrafted in Bali</small>
  </main>;
}
