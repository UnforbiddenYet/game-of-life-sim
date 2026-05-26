export interface SerializedGame {
  readonly version: 1;
  readonly size: number;
  readonly generation: number;
  readonly colorized: boolean;
  readonly palette?: readonly string[];
  readonly cells: ReadonlyArray<readonly [x: number, y: number]>;
}
