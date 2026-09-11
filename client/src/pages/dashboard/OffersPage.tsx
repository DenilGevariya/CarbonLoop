import React from 'react';
import { FeaturePlaceholder } from '@/components/shared/FeaturePlaceholder';
import { Handshake } from 'lucide-react';

export const OffersPage: React.FC = () => {
  return (
    <FeaturePlaceholder
      title="Offers & Off-Take Negotiations"
      category="Dashboard / Trading"
      description="Manage bilateral negotiations, submit formal price counter-offers, specify delivery windows, and finalize smart off-take contracts."
      expectedCapabilities={[
        'Bilateral Off-take Offer Submissions',
        'Counter-proposal Negotiator',
        'Custom Purity Guarantee Clauses',
        'Expiration & Validity Timers',
        'Smart Contract Execution'
      ]}
      icon={Handshake}
    />
  );
};

export default OffersPage;
