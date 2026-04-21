declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg?component' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
}
declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.mp3' {
  const value: string;
  export default value;
}

declare module '*.wav' {
  const value: string;
  export default value;
}
