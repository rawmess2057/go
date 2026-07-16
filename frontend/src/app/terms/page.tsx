"use client";

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mt-1">Last updated: July 16, 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          By accessing or using Gig (&ldquo;the Platform&rdquo;), you agree to be bound by these Terms of Service
          (&ldquo;Terms&rdquo;). If you do not agree, you must not use the Platform. These Terms apply to all users,
          including bounty creators, workers, and moderators.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">2. Platform Overview</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Gig is a non-custodial escrow platform built on Solana. Bounty creators deposit rewards into a program-owned
          escrow account. Workers submit work via on-chain submissions. Moderators review submissions and authorize
          payouts. The Platform does not hold private keys and cannot unilaterally release funds.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">3. Wallet Authentication</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your Solana wallet serves as your identity on the Platform. You are solely responsible for the security of
          your wallet and private keys. Any action signed by your wallet constitutes your authorization. The Platform
          is not liable for losses resulting from compromised wallets.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">4. Bounty Creation</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Creators must fund the escrow in full at the time of bounty creation. Rewards are released exclusively by
          the designated moderator upon approval. Creators may not withdraw funds unilaterally after a submission is
          accepted. All bounties must comply with applicable laws and must not facilitate illegal activity.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">5. Submissions &amp; Work</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Workers retain ownership of their submitted work unless otherwise agreed. By submitting, you grant the
          bounty creator a non-exclusive, royalty-free license to use the work for the bounty&rsquo;s purpose. You
          represent that your submission does not infringe third-party rights.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">6. Moderator Role</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Moderators act as independent reviewers. They evaluate submissions and decide whether to release rewards or
          reject work. Moderators must act in good faith. The Platform is not responsible for moderator decisions.
          Disputes may be resolved through on-chain governance mechanisms where available.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">7. Fees</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The Platform may charge a nominal protocol fee on bounty rewards. Any fees will be disclosed at the time of
          creation. Solana network transaction fees (gas) are borne by the user initiating each transaction.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">8. Prohibited Conduct</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Users may not: (a) use the Platform for illegal purposes; (b) submit malicious or fraudulent work;
          (c) attempt to manipulate the escrow program or exploit vulnerabilities; (d) impersonate others;
          (e) harass moderators or other users. Violations may result in permanent blacklisting from the Platform.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">9. Disclaimers</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The Platform is provided &ldquo;as is&rdquo; without warranties of any kind. Smart contract risk, blockchain
          network congestion, and market volatility may affect reward values. The Platform is not responsible for
          losses due to smart contract bugs, network outages, or user error.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">10. Limitation of Liability</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          To the fullest extent permitted by law, the Platform and its contributors shall not be liable for any
          indirect, incidental, or consequential damages arising from your use of the Platform, including loss of
          funds, lost bounties, or missed opportunities.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">11. Changes to Terms</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We may update these Terms from time to time. Material changes will be announced through the Platform.
          Continued use after changes take effect constitutes acceptance of the updated Terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">12. Contact</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          For questions about these Terms, reach out on the Platform&rsquo;s Discord or open an issue in the project
          repository.
        </p>
      </section>

      <p className="text-xs text-muted-foreground pt-4 border-t border-border">
        These terms are provided as a template and do not constitute legal advice. Consult a qualified attorney for
        advice specific to your jurisdiction.
      </p>
    </div>
  );
}
