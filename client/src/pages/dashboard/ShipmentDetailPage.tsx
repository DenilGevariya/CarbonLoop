import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShipmentDetail } from '@/features/shipments/hooks/useShipments';
import { shipmentApi } from '@/features/shipments/api/shipmentApi';
import { ShipmentHeader } from '@/features/shipments/components/ShipmentHeader';
import { ShipmentTimeline } from '@/features/shipments/components/ShipmentTimeline';
import { ShipmentMap } from '@/features/shipments/components/ShipmentMap';
import { TrackingEventList } from '@/features/shipments/components/TrackingEventList';
import { ExceptionPanel } from '@/features/shipments/components/ExceptionPanel';
import { ArrowLeft, AlertTriangle, ShieldCheck } from 'lucide-react';

export const ShipmentDetailPage: React.FC = () => {
  const { shipmentNumber } = useParams<{ shipmentNumber: string }>();
  const navigate = useNavigate();

  const { shipment, loading, error, refetch } = useShipmentDetail(shipmentNumber);

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isExceptionOpen, setIsExceptionOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventLocation, setEventLocation] = useState('');
  const [eventNotes, setEventNotes] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] p-8 flex items-center justify-center font-mono text-xs">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#173D32] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#55524D]">Loading shipment tracking telemetry for {shipmentNumber}...</p>
        </div>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] p-8 font-mono text-xs">
        <div className="max-w-xl mx-auto bg-rose-50 border border-rose-200 rounded-lg p-6 text-rose-900 text-center">
          <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
          <h3 className="font-bold text-sm uppercase">Shipment Tracking Unavailable</h3>
          <p className="text-xs text-rose-700 mt-1">{error || 'Shipment not found'}</p>
          <button
            onClick={() => navigate('/dashboard/shipments')}
            className="mt-4 px-4 py-2 bg-rose-700 text-white rounded font-semibold"
          >
            Back to Shipments Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Handle Lifecycle Transitions
  const handlePickup = async () => {
    try {
      setActionLoading('pickup');
      await shipmentApi.pickupShipment(shipment.id, 'Cargo inspected and loaded at origin facility.');
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDepart = async () => {
    try {
      setActionLoading('depart');
      await shipmentApi.departShipment(shipment.id, 'ISO Tank Truck departed origin corridor.');
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeliver = async () => {
    try {
      setActionLoading('deliver');
      await shipmentApi.deliverShipment(shipment.id, 'CO₂ offloading complete and custody transferred.');
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmReceipt = async () => {
    try {
      setActionLoading('confirm');
      await shipmentApi.confirmReceipt(shipment.id, 'Buyer quality audit and quantity verified.');
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReportException = async (reason: string, notes?: string) => {
    await shipmentApi.reportException(shipment.id, reason, notes);
    refetch();
  };

  const handleAddEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await shipmentApi.addTrackingEvent(
        shipment.id,
        'CHECKPOINT',
        eventLocation || 'Highway Checkpoint',
        undefined,
        undefined,
        eventNotes
      );
      setIsEventModalOpen(false);
      setEventLocation('');
      setEventNotes('');
      refetch();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] p-6 space-y-6">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard/shipments')}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#55524D] hover:text-[#171A18] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Shipments</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExceptionOpen(true)}
            className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono font-semibold rounded hover:bg-rose-100 transition"
          >
            ⚠️ Report Exception
          </button>
        </div>
      </div>

      {/* Signature Hero Summary Header */}
      <ShipmentHeader shipment={shipment} />

      {/* Stepper Progress Timeline */}
      <ShipmentTimeline status={shipment.status} statusHistory={shipment.status_history} />

      {/* Action Control Panel based on shipment status */}
      <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-5 flex flex-wrap items-center justify-between gap-4 font-mono text-xs shadow-2xs">
        <div>
          <span className="text-xs font-bold text-[#171A18] uppercase tracking-wide">Operational Lifecycle Controls</span>
          <p className="text-[11px] text-[#55524D] mt-0.5">Authorized provider & buyer actions for status transitions</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(shipment.status === 'SCHEDULED' || shipment.status === 'TRANSPORTER_ASSIGNED') && (
            <button
              onClick={handlePickup}
              disabled={actionLoading === 'pickup'}
              className="px-4 py-2 bg-[#5D87FF] text-white text-xs font-bold rounded-lg hover:bg-[#4570EA] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {actionLoading === 'pickup' ? 'Processing Pickup...' : '✓ Mark Picked Up'}
            </button>
          )}

          {shipment.status === 'PICKED_UP' && (
            <button
              onClick={handleDepart}
              disabled={actionLoading === 'depart'}
              className="px-4 py-2 bg-[#5D87FF] text-white text-xs font-bold rounded-lg hover:bg-[#4570EA] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {actionLoading === 'depart' ? 'Marking In Transit...' : '🚀 Mark In Transit'}
            </button>
          )}

          {shipment.status === 'IN_TRANSIT' && (
            <>
              <button
                onClick={() => setIsEventModalOpen(true)}
                className="px-3 py-2 bg-white border border-[#E5EAEF] text-[#2A3547] text-xs font-semibold rounded-lg hover:bg-[#F6F9FC] cursor-pointer"
              >
                + Checkpoint Event
              </button>
              <button
                onClick={handleDeliver}
                disabled={actionLoading === 'deliver'}
                className="px-4 py-2 bg-[#13DEB9] text-white text-xs font-bold rounded-lg hover:bg-[#0EBA9B] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {actionLoading === 'deliver' ? 'Processing Delivery...' : '📦 Mark Delivered'}
              </button>
            </>
          )}

          {shipment.status === 'ARRIVING' && (
            <button
              onClick={handleDeliver}
              disabled={actionLoading === 'deliver'}
              className="px-4 py-2 bg-[#13DEB9] text-white text-xs font-bold rounded-lg hover:bg-[#0EBA9B] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {actionLoading === 'deliver' ? 'Processing Delivery...' : '📦 Mark Delivered'}
            </button>
          )}

          {shipment.status === 'DELIVERED' && (
            <button
              onClick={handleConfirmReceipt}
              disabled={actionLoading === 'confirm'}
              className="px-4 py-2 bg-[#2A3547] text-white text-xs font-bold rounded-lg hover:bg-[#1A2332] flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {actionLoading === 'confirm' ? 'Confirming...' : '🛡️ Confirm Receipt (Buyer Action)'}
            </button>
          )}

          {(shipment.status === 'COMPLETED' || shipment.status === 'BUYER_CONFIRMED_RECEIPT') && (
            <span className="px-3 py-1.5 bg-[#E6FFFA] text-[#13DEB9] border border-[#13DEB9]/30 text-xs font-bold rounded-lg flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#13DEB9]" />
              BUYER CONFIRMED RECEIPT & COMPLETED
            </span>
          )}
        </div>
      </div>

      {/* Route Visualization Map */}
      <ShipmentMap
        routes={shipment.routes}
        originCity={shipment.origin_city || shipment.origin_facility_name || 'Ahmedabad'}
        destinationCity={shipment.destination_city || shipment.destination_facility_name || 'Vadodara'}
        distanceKm={shipment.distance_km || 120}
        status={shipment.status}
        transportMode={shipment.transport_mode}
      />

      {/* Historical Tracking Event Stream */}
      <TrackingEventList
        events={shipment.events}
        canAddEvent={shipment.status === 'IN_TRANSIT'}
        onAddEvent={() => setIsEventModalOpen(true)}
      />

      {/* Exception Modal */}
      <ExceptionPanel
        isOpen={isExceptionOpen}
        onClose={() => setIsExceptionOpen(false)}
        onSubmit={handleReportException}
      />

      {/* Custom Checkpoint Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs font-mono text-xs">
          <div className="bg-[#FAF8F5] border border-[#E2DDD5] w-full max-w-md rounded-lg shadow-xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-[#171A18] uppercase">Log Checkpoint Tracking Event</h3>
            <form onSubmit={handleAddEventSubmit} className="space-y-3">
              <div>
                <label className="block text-[#171A18] mb-1 uppercase font-semibold">Checkpoint Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nadiad Toll Plaza, Highway NH48"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="w-full bg-[#F7F5EF] border border-[#E2DDD5] rounded p-2.5 text-[#171A18]"
                />
              </div>
              <div>
                <label className="block text-[#171A18] mb-1 uppercase font-semibold">Notes / Status Details</label>
                <textarea
                  rows={3}
                  placeholder="Passed safety inspection, tank pressure 18.2 bar..."
                  value={eventNotes}
                  onChange={(e) => setEventNotes(e.target.value)}
                  className="w-full bg-[#F7F5EF] border border-[#E2DDD5] rounded p-2.5 text-[#171A18]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2DDD5]">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-3 py-1.5 bg-[#E2DDD5]/50 text-[#55524D] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#173D32] text-white font-semibold rounded"
                >
                  Append Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
