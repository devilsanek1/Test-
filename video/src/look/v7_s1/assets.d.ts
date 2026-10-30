// v7's baked light maps, bundled by Remotion's webpack as asset URLs (src/look/v7_s1/maps/v7a/*.v7map.png).
declare module '*.v7map.png' {
  const src: string;
  export default src;
}
