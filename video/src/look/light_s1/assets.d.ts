// The light proof's baked maps, bundled by Remotion's webpack as asset URLs (src/look/light_s1/maps/*.lmap.png).
declare module '*.lmap.png' {
  const src: string;
  export default src;
}
