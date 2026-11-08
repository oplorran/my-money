import type { CSSProperties } from "react";

/** Tipos do web component do VTurb SmartPlayer (usado em `components/vturb-player.tsx`). */
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "vturb-smartplayer": {
        id?: string;
        className?: string;
        style?: CSSProperties;
        "original-id"?: string;
      };
    }
  }
}
