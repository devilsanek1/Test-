// v8's painted planes (src/look/v8_s1/bake/paint_v8.py -> src/look/v8_s1/paint/*.v8piece.png) and their baked light maps
// (src/look/v8_s1/bake/light_v8.py -> src/look/v8_s1/maps/*.v8map.png), bundled by Remotion's webpack as asset URLs.
declare module '*.v8piece.png' {
  const src: string;
  export default src;
}
declare module '*.v8map.png' {
  const src: string;
  export default src;
}
