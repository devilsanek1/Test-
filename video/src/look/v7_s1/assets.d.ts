// v7's baked light maps, bundled by Remotion's webpack as asset URLs (src/look/v7_s1/maps/v7a/*.v7map.png).
declare module '*.v7map.png' {
  const src: string;
  export default src;
}
// v7's painted pieces (step 3: src/look/v7_s1/bake/paint_v7.py -> src/look/v7_s1/paint/*.v7piece.png), bundled the same way.
declare module '*.v7piece.png' {
  const src: string;
  export default src;
}
