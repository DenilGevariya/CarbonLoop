# CarbonLoop Design System & Motion Framework

## Palette & Visual Language
- **Brand Personality**: Intelligent, Industrial, Futuristic, Precise, Environmental.
- **Deep Carbon Forest Background**: `#090E0C`
- **Electric Mint Accent**: `#00E599`
- **Teal / Cyan Highlights**: `#00A896` / `#028090`
- **Muted Slate Neutrals**: `#8B9B93`

## Motion System (`src/animations/index.tsx`)
1. `FadeIn`: Smooth opacity transition (150–400ms).
2. `FadeUp`: Distance-based entrance animation for scroll reveal.
3. `ScaleIn`: Subtle scale zoom (0.94 -> 1.00).
4. `StaggerContainer` & `StaggerItem`: Sequenced card lists.
5. `AnimatedCounter`: Count-up animation for metrics.
6. `HoverLift`: Micro-interaction for interactive cards.

## Signature Visual Motif
**Carbon Flow Network (`src/components/landing/CarbonFlow.tsx`)**: An interactive node-and-stream visualization illustrating captured CO₂ flowing from Emitters through CarbonLoop matching to Utilization pathways.
