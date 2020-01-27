export default function generateFace(ctx, faceColor, textColor, text) {
    const { width, height } = ctx.canvas;
    ctx.fillStyle = faceColor;
    ctx.fillRect(0, 0, width, height);
    ctx.font = `${width * 0.7}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = textColor;
    ctx.fillText(text, width / 2, height / 2);
}
//# sourceMappingURL=face-generator.js.map