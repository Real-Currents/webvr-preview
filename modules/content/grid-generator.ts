
export default function generateFace(ctx, gridColor, gridSpacing) {
    ctx.strokeStyle = gridColor;
    const w = ctx.canvas.width,
        h = ctx.canvas.height;
    ctx.beginPath();
    for (let x=0; x<=w; x+=gridSpacing){
        ctx.moveTo(x-0.5,0);      // 0.5 offset so that 1px lines are crisp
        ctx.lineTo(x-0.5,h);
    }
    for (let y=0;y<=h;y+=gridSpacing){
        ctx.moveTo(0,y-0.5);
        ctx.lineTo(w,y-0.5);
    }
    ctx.stroke();
}
