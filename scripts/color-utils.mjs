function lin(c) {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
export function luminance(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
export function ratio(a, b) {
  const L1 = luminance(a),
    L2 = luminance(b);
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}
export function mix(hex, target, amt) {
  const n = (h) => parseInt(h.replace("#", ""), 16);
  const a = n(hex),
    t = n(target);
  const ar = (a >> 16) & 255,
    ag = (a >> 8) & 255,
    ab = a & 255;
  const tr = (t >> 16) & 255,
    tg = (t >> 8) & 255,
    tb = t & 255;
  const r = Math.round(ar + (tr - ar) * amt);
  const g = Math.round(ag + (tg - ag) * amt);
  const b = Math.round(ab + (tb - ab) * amt);
  return (
    "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase()
  );
}
