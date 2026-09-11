import React from 'react';
import { FeaturePlaceholder } from '@/components/shared/FeaturePlaceholder';
import { Truck } from 'lucide-react';

export const ShipmentsPage: React.FC = () => {
  return (
    <FeaturePlaceholder
      title="Cryogenic Freight & Shipment Tracking"
      category="Dashboard / Logistics"
      description="Monitor live ISO-tank truck fleets, pipeline pressure sensors, route ETAs, and internal container temperature telematics."
      expectedCapabilities={[
        'Real-time GPS Fleet Telematics',
        'ISO Tank Internal Pressure Tracking',
        'Dynamic ETA & Traffic Rerouting',
        'Destination Delivery Sign-Off',
        'Cryogenic Transport Logs'
      ]}
      icon={Truck}
    />
  );
};

export default ShipmentsPage;
