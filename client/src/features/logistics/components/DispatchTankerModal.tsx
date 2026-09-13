import React, { useState } from 'react';
import { Truck, CheckCircle2, Scale, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TankerVehicle {
  id: string;
  code: string;
  type: string;
  capacityTonnes: number;
  location: string;
  certificationStatus: 'CERTIFIED' | 'EXPIRED';
  availability: 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE';
  currentAssignment?: string | null;
}

const DEMO_FLEET: TankerVehicle[] = [
  {
    id: 'tk-1',
    code: 'TK-CRY-902',
    type: 'Cryogenic Liquid CO₂ Tanker',
    capacityTonnes: 25,
    location: 'Vadodara Logistics Depot',
    certificationStatus: 'CERTIFIED',
    availability: 'AVAILABLE',
  },
  {
    id: 'tk-2',
    code: 'TK-CRY-884',
    type: 'Cryogenic Supercritical Tanker',
    capacityTonnes: 30,
    location: 'Bharuch Industrial Hub',
    certificationStatus: 'CERTIFIED',
    availability: 'AVAILABLE',
  },
  {
    id: 'tk-3',
    code: 'TK-ISO-412',
    type: 'High-Pressure ISO Cylinder Cascade',
    capacityTonnes: 15,
    location: 'Surat Depot',
    certificationStatus: 'CERTIFIED',
    availability: 'AVAILABLE',
  },
  {
    id: 'tk-4',
    code: 'TK-CRY-710',
    type: 'Cryogenic Liquid CO₂ Tanker',
    capacityTonnes: 25,
    location: 'Ahmedabad Highway',
    certificationStatus: 'EXPIRED',
    availability: 'MAINTENANCE',
  },
];

interface DispatchTankerModalProps {
  isOpen: boolean;
  shipmentNumber?: string;
  onClose: () => void;
  onAssignTanker: (tankerCode: string) => void;
}

export const DispatchTankerModal: React.FC<DispatchTankerModalProps> = ({
  isOpen,
  shipmentNumber,
  onClose,
  onAssignTanker,
}) => {
  const [selectedTanker, setSelectedTanker] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!selectedTanker) return;
    onAssignTanker(selectedTanker);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white border border-[#E5EAEF] p-6 rounded-xl">
        <DialogHeader className="border-b border-[#E5EAEF] pb-4">
          <DialogTitle className="text-base font-bold text-[#2A3547] flex items-center gap-2">
            <Truck className="size-5 text-[#5D87FF]" /> Dispatch Tanker Fleet Assignment
          </DialogTitle>
          <DialogDescription className="text-xs text-[#5A6A85]">
            Select an available certified cryogenic tanker vehicle for Shipment {shipmentNumber || 'Transfer'}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-4 max-h-[60vh] overflow-y-auto">
          {DEMO_FLEET.map((vehicle) => {
            const isAssignable = vehicle.availability === 'AVAILABLE' && vehicle.certificationStatus === 'CERTIFIED';
            const isSelected = selectedTanker === vehicle.code;

            return (
              <div
                key={vehicle.id}
                onClick={() => {
                  if (isAssignable) setSelectedTanker(vehicle.code);
                }}
                className={`p-4 rounded-xl border transition-all ${
                  !isAssignable
                    ? 'bg-[#F6F9FC] border-[#E5EAEF] opacity-60 cursor-not-allowed'
                    : isSelected
                    ? 'bg-[#ECF2FF] border-[#5D87FF] ring-2 ring-[#5D87FF]/20 cursor-pointer'
                    : 'bg-white border-[#E5EAEF] hover:border-[#5D87FF] cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-[#2A3547]">{vehicle.code}</span>
                    <Badge className={`text-[10px] font-extrabold uppercase px-2 py-0.5 ${
                      vehicle.certificationStatus === 'CERTIFIED'
                        ? 'bg-[#E8F9F5] text-[#13DEB9] border border-[#13DEB9]/20'
                        : 'bg-[#FDEDE8] text-[#FA896B] border border-[#FA896B]/20'
                    }`}>
                      {vehicle.certificationStatus}
                    </Badge>
                    <Badge className={`text-[10px] font-extrabold uppercase px-2 py-0.5 ${
                      vehicle.availability === 'AVAILABLE'
                        ? 'bg-[#ECF2FF] text-[#5D87FF] border border-[#5D87FF]/20'
                        : 'bg-[#FEF5E5] text-[#FFAE1F] border border-[#FFAE1F]/20'
                    }`}>
                      {vehicle.availability}
                    </Badge>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="size-5 text-[#5D87FF]" />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-[#5A6A85]">
                  <div className="flex items-center gap-1.5">
                    <Truck className="size-3.5 text-[#5D87FF]" />
                    <span className="font-semibold text-[#2A3547]">{vehicle.type}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Scale className="size-3.5 text-[#5D87FF]" />
                    <span>Capacity: <strong className="text-[#2A3547]">{vehicle.capacityTonnes} Tonnes</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <MapPin className="size-3.5 text-[#5D87FF]" />
                    <span>Location: <strong className="text-[#2A3547]">{vehicle.location}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-[#E5EAEF] pt-4">
          <span className="text-xs text-[#5A6A85]">
            {selectedTanker ? `Selected Vehicle: ${selectedTanker}` : 'Please select a certified vehicle'}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!selectedTanker}
              onClick={handleConfirm}
              className="bg-[#5D87FF] hover:bg-[#4570EA] text-white text-xs font-bold shadow-xs"
            >
              Assign & Dispatch Tanker
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
