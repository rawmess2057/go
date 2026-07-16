"use client";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mt-1">Last updated: July 16, 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Gig collects minimal information required to operate the Platform. When you connect your Solana wallet,
          your public wallet address is recorded. Bounty metadata (title, description, tags, reference URIs) is
          stored on-chain and may also be cached by our backend for performance.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">2. On-Chain Data</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          All bounties, submissions, and reward distributions are recorded on the Solana blockchain. This data is
          public by design and cannot be edited or deleted once confirmed. You should not include sensitive personal
          information in any on-chain data you submit.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">3. Off-Chain Data</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We may store off-chain metadata (such as bounty descriptions and thumbnails) to improve Platform
          performance and enable search. This data is stored on decentralized storage (IPFS, Arweave) where
          applicable, and cached on our servers. We do not sell or share this data with third parties.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">4. Wallet Connection</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Wallet connection is handled by your browser wallet extension (e.g., Phantom, Backpack). We never have
          access to your private keys. Your wallet provider may collect data according to its own privacy policy.
          We recommend reviewing your wallet provider&rsquo;s privacy practices.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">5. Cookies &amp; Analytics</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The Platform may use essential cookies for functionality (theme preference, language selection). We do not
          use tracking cookies or third-party analytics. If analytics are introduced in the future, you will be
          notified and given the option to opt out.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">6. Data Retention</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          On-chain data persists indefinitely as a property of the Solana ledger. Off-chain caches are retained as
          long as the Platform operates. You may request deletion of off-chain data associated with your wallet
          address by contacting the project maintainers.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">7. Third-Party Services</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The Platform integrates with Solana RPC providers, IPFS gateways, and Arweave. These services operate
          under their own privacy policies. We select providers that respect user privacy, but we are not responsible
          for their data practices.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">8. Your Rights</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Depending on your jurisdiction, you may have the right to access, correct, or delete your personal data.
          Because on-chain data is immutable, corrections and deletions apply only to off-chain records. To exercise
          your rights, contact the project maintainers through the Platform&rsquo;s communication channels.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">9. Security</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We implement reasonable security measures to protect off-chain data, including encryption at rest and in
          transit. However, no system is perfectly secure. You use the Platform at your own risk. We encourage all
          users to follow wallet security best practices.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">10. Changes to This Policy</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We may update this Privacy Policy as the Platform evolves. Material changes will be communicated through
          the Platform. Your continued use after changes take effect constitutes acceptance of the updated policy.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">11. Contact</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          For privacy-related inquiries, reach out on the Platform&rsquo;s Discord or open an issue in the project
          repository.
        </p>
      </section>

      <p className="text-xs text-muted-foreground pt-4 border-t border-border">
        This policy is provided as a template and does not constitute legal advice. Consult a qualified attorney for
        advice specific to your jurisdiction.
      </p>
    </div>
  );
}
