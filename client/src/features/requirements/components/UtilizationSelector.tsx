import React from 'react';
import type { UtilizationType } from '../types/requirement';
import {
  Zap,
  Building2,
  Sprout,
  Waves,
  FlaskConical,
  Gem,
  Utensils,
  Layers,
  Check,
} from 'lucide-react';

interface UtilizationSelectorProps {
  types: UtilizationType[];
  selectedId?: string;
  onSelect: (typeId: string) => void;
  className?: string;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  SYNTHETIC_FUEL: Zap,
  CONCRETE_AND_CONSTRUCTION: Building2,
  GREENHOUSE: Sprout,
  ALGAE: Waves,
  CHEMICALS: FlaskConical,
  MINERALIZATION: Gem,
  FOOD_AND_BEVERAGE: Utensils,
  OTHER: Layers,
};

export const UtilizationSelector: React.FC<UtilizationSelectorProps> = ({
  types,
  selectedId,
  onSelect,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${className}`}>
      {types.map((type) => {
        const IconComponent = CATEGORY_ICONS[type.code] || Layers;
        const isSelected = selectedId === type.id;

        return (
          <button
            type="button"
            key={type.id}
            onClick={() => onSelect(type.id)}
            className={`p-4 border text-left transition-all relative flex flex-col justify-between group cursor-pointer ${
              isSelected
                ? 'bg-[#173D32]/5 border-[#173D32] ring-1 ring-[#173D32]'
                : 'bg-white hover:bg-[#FAF8F5] border-[#E2DDD5] hover:border-[#173D32]/50'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div
                className={`p-2 rounded-none ${
                  isSelected ? 'bg-[#173D32] text-white' : 'bg-[#EFECE4] text-[#173D32] group-hover:bg-[#173D32] group-hover:text-white transition-colors'
                }`}
              >
                <IconComponent className="w-4 h-4" />
              </div>

              {isSelected && (
                <span className="p-0.5 bg-[#173D32] text-white rounded-full">
                  <Check className="w-3 h-3" />
                </span>
              )}
            </div>

            <div>
              <h4 className="font-sans font-bold text-sm text-[#171A18] mb-1">
                {type.name}
              </h4>
              <p className="font-sans text-xs text-stone-500 line-clamp-2 leading-relaxed">
                {type.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
