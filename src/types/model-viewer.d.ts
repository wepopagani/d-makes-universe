declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      src?: string;
      'auto-rotate'?: boolean;
      'camera-controls'?: boolean;
      'shadow-intensity'?: string;
      'exposure'?: string;
      'environment-image'?: string;
      alt?: string;
      loading?: 'eager' | 'lazy';
      poster?: string;
      'disable-zoom'?: boolean;
      'ar'?: boolean;
      'ar-modes'?: string;
      'ar-status'?: string;
      'camera-orbit'?: string;
      'field-of-view'?: string;
      reveal?: 'auto' | 'manual';
      'interaction-prompt'?: 'auto' | 'none';
      'interaction-prompt-style'?: 'basic' | 'wiggle';
      'interaction-prompt-threshold'?: string;
      'quick-look-browsers'?: string;
      skybox?: string;
    }, HTMLElement>;
  }
}

declare module '@google/model-viewer' {
  export default interface HTMLModelViewerElement extends HTMLElement {
    src: string;
    alt: string;
    poster: string;
    loading: 'auto' | 'lazy' | 'eager';
    reveal: 'auto' | 'interaction' | 'manual';
    'auto-rotate': boolean;
    'camera-controls': boolean;
    'ar': boolean;
    'shadow-intensity': string;
    'camera-orbit': string;
    'environment-image': string;
    'exposure': string;
    'interaction-prompt': string;
    cameraTarget: string;
    fieldOfView: string;
    exposure: number;

    // Metodi
    play(): void;
    pause(): void;
    getDimensions(): { x: number; y: number; z: number };
    getCameraOrbit(): { theta: number; phi: number; radius: number };
    resetTurntableRotation(): void;
    toBlob(options?: { mimeType?: string; qualityArgument?: number; idealAspect?: boolean }): Promise<Blob>;

    // Eventi
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }
} 