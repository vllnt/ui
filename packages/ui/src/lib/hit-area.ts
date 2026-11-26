/**
 * Classes that grow a small control's pointer target to at least 24 x 24 CSS
 * pixels (WCAG 2.5.8) without moving anything: a transparent `::after` box,
 * centred on the control, is never smaller than 24 px and never smaller than
 * the control. Put them on a control that is under 24 px and does not clip its
 * overflow. A control that is already positioned keeps its own position.
 */
export const HIT_AREA_24 =
  "relative after:absolute after:left-1/2 after:top-1/2 after:size-full after:min-h-6 after:min-w-6 after:-translate-x-1/2 after:-translate-y-1/2";

/**
 * The same box for a wrapper whose `[role=radio]` child is the clickable
 * control, laid over the wrapper. The box has to belong to that child: a box on
 * the wrapper would sit above the child and take its clicks and hovers.
 */
export const HIT_AREA_24_RADIO_CHILD =
  "[&>[role=radio]]:after:absolute [&>[role=radio]]:after:left-1/2 [&>[role=radio]]:after:top-1/2 [&>[role=radio]]:after:size-full [&>[role=radio]]:after:min-h-6 [&>[role=radio]]:after:min-w-6 [&>[role=radio]]:after:-translate-x-1/2 [&>[role=radio]]:after:-translate-y-1/2";
