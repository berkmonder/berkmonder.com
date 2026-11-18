// Renders public/og.png (1200×630), the picture link previews show: node scripts/og.mjs public/og.png
import sharp from "sharp";

const rings = (cx, op) =>
	Array.from(
		{ length: 22 },
		(_, i) =>
			`<circle cx="${cx}" cy="315" r="${20 + i * 26}" fill="none" stroke="#2bb8a9" stroke-width="1.4" opacity="${op}"/>`,
	).join("");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><radialGradient id="f" cx="78%" cy="50%" r="45%"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><mask id="m"><rect width="1200" height="630" fill="url(#f)"/></mask></defs>
<rect width="1200" height="630" fill="#0e0e0e"/>
<g mask="url(#m)" opacity="0.5">${rings(860, 1)}${rings(1010, 0.6)}</g>
<g transform="translate(80 92)">
  <circle cx="22" cy="22" r="16" fill="none" stroke="#2bb8a9" stroke-width="4.5"/>
  <circle cx="38" cy="22" r="16" fill="none" stroke="#2bb8a9" stroke-width="4.5" opacity="0.55"/>
  <text x="74" y="33" font-family="Menlo, monospace" font-size="30" font-weight="500" fill="#f2f2f2">Berk Önder</text>
</g>
<text font-family="Menlo, monospace" font-weight="500" font-size="58" fill="#f2f2f2" letter-spacing="-1">
  <tspan x="80" y="290">AI systems that work</tspan><tspan x="80" y="368">in production, and a team</tspan><tspan x="80" y="446">that can run them.</tspan>
</text>
<text x="80" y="540" font-family="Menlo, monospace" font-size="24" fill="#a3a3a3">LLM &amp; agent systems · MLOps · Team training</text>
</svg>`;
await sharp(Buffer.from(svg))
	.png({ compressionLevel: 9 })
	.toFile(process.argv[2]);
