export interface Style {
  width?: string;
  height?: string;
}

export interface State {
  ready: Boolean;
  items: Array<CustomComponent>;
  touch: {
    mouseDown: Boolean;
    dragging: Boolean;
    activeSplitter: number;
  };
}

export interface CustomComponent {
  [key: string]: any;
}
