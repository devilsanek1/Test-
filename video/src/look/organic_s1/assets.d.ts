// The organic proof's baked pieces are imported as bundle URLs (Remotion's webpack), so they need no public/ folder.
// Its own suffix ('.ocpaint.png'), so this never collides with another folder's '*.png' declaration.
declare module '*.ocpaint.png' {
  const url: string;
  export default url;
}
