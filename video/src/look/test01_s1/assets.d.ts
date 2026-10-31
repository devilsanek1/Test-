// test01_s1's painted planes (bake/paint_t01.py -> paint/*.t01piece.png) and their baked light maps (bake/light_t01.py ->
// maps/*.t01map.png), bundled by Remotion's webpack as asset URLs.
declare module '*.t01piece.png' {
  const src: string;
  export default src;
}
declare module '*.t01map.png' {
  const src: string;
  export default src;
}
