// Renders public/og.png (1200×630), the picture link previews show: node scripts/og.mjs public/og.png
import sharp from "sharp";

const rings = (cx, op) =>
	Array.from(
		{ length: 22 },
		(_, i) =>
			`<circle cx="${cx}" cy="315" r="${20 + i * 26}" fill="none" stroke="#3fd6c6" stroke-width="1.4" opacity="${op}"/>`,
	).join("");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><radialGradient id="f" cx="78%" cy="50%" r="45%"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><mask id="m"><rect width="1200" height="630" fill="url(#f)"/></mask></defs>
<rect width="1200" height="630" fill="#0b1012"/>
<g mask="url(#m)" opacity="0.5">${rings(860, 1)}${rings(1010, 0.6)}</g>
<g transform="translate(80 92)">
  <circle cx="22" cy="22" r="16" fill="none" stroke="#3fd6c6" stroke-width="4.5"/>
  <circle cx="38" cy="22" r="16" fill="none" stroke="#3fd6c6" stroke-width="4.5" opacity="0.55"/>
  <text x="74" y="33" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="32" font-weight="700" fill="#e8eeee">Berk Önder</text>
</g>
<text font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-weight="700" font-size="64" fill="#e8eeee" letter-spacing="-1.5">
  <tspan x="80" y="290">AI systems that work</tspan><tspan x="80" y="368">in production, and a team</tspan><tspan x="80" y="446">that can run them.</tspan>
</text>
<text x="80" y="540" font-family="Menlo, monospace" font-size="24" fill="#3fd6c6">LLM &amp; agent systems · MLOps · Team training</text>
</svg>`;
await sharp(Buffer.from(svg))
	.png({ compressionLevel: 9 })
	.toFile(process.argv[2]);
