export function drawRect(x: number, y: number, w: number, h: number, fill: string = '#e2e8f0', stroke: string = '#000') {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="1" />`;
}

export function drawLine(x1: number, y1: number, x2: number, y2: number, stroke: string = '#000', strokeWidth: number = 1) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;
}

export function drawText(x: number, y: number, text: string, anchor: string = 'middle', fontSize: number = 12, fill: string = '#333') {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="sans-serif" font-size="${fontSize}px" fill="${fill}">${text}</text>`;
}

export function drawCircle(cx: number, cy: number, r: number, fill: string = '#000') {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" />`;
}

export function drawPath(d: string, stroke: string = '#000', strokeWidth: number = 2, fill: string = 'none') {
  return `<path d="${d}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}" />`;
}
