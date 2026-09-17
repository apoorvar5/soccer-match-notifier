import { EventType } from '../models/soccer.models';

/**
 * Generates custom rich visual scoreboard images for Chrome desktop notifications
 */
export class CardGeneratorService {
  /**
   * Render a high-resolution soccer match scoreboard banner using HTML5 Canvas (OffscreenCanvas / Document Canvas)
   */
  static async generateMatchBanner(
    title: string,
    message: string,
    eventType: EventType,
    homeTeamName: string,
    awayTeamName: string,
    homeScore: number,
    awayScore: number,
    minute: string,
    homeCrest?: string,
    awayCrest?: string
  ): Promise<string> {
    if (typeof document === 'undefined' && typeof OffscreenCanvas === 'undefined') {
      return '';
    }

    const width = 512;
    const height = 256;

    let canvas: HTMLCanvasElement | OffscreenCanvas;
    let ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;

    if (typeof document !== 'undefined') {
      canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      ctx = canvas.getContext('2d');
    } else {
      canvas = new OffscreenCanvas(width, height);
      ctx = canvas.getContext('2d');
    }

    if (!ctx) return '';

    // 1. Background Pitch Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    if (eventType === 'GOAL') {
      bgGrad.addColorStop(0, '#1e293b');
      bgGrad.addColorStop(0.5, '#0f172a');
      bgGrad.addColorStop(1, '#064e3b');
    } else if (eventType === 'RED_CARD') {
      bgGrad.addColorStop(0, '#3b0764');
      bgGrad.addColorStop(0.5, '#450a0a');
      bgGrad.addColorStop(1, '#1e1b4b');
    } else {
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(1, '#022c22');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Pitch Accent Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 70, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    // 3. Top Event Header Pill
    ctx.fillStyle = eventType === 'GOAL' ? '#fbbf24' : (eventType === 'RED_CARD' ? '#ef4444' : '#10b981');
    ctx.beginPath();
    this.roundRect(ctx, width / 2 - 80, 16, 160, 26, 13);
    ctx.fill();

    ctx.fillStyle = eventType === 'GOAL' ? '#000000' : '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const pillText = eventType === 'GOAL' ? '⚽ GOAL SCORED' : (eventType === 'RED_CARD' ? '🟥 RED CARD' : (eventType === 'KICKOFF' ? '⚽ MATCH STARTED' : '🏁 MATCH UPDATE'));
    ctx.fillText(pillText, width / 2, 29);

    // 4. Team Names & Scoreline Center
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(homeTeamName, 28, 100);

    ctx.textAlign = 'right';
    ctx.fillText(awayTeamName, width - 28, 100);

    // Score Board Box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.roundRect(ctx, width / 2 - 60, 68, 120, 56, 10);
    ctx.fill();
    ctx.strokeStyle = eventType === 'GOAL' ? '#fbbf24' : 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = eventType === 'GOAL' ? '#fbbf24' : '#34d399';
    ctx.font = 'bold 30px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${homeScore} - ${awayScore}`, width / 2, 96);

    // Clock
    ctx.fillStyle = '#9ca3af';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`${minute}`, width / 2, 114);

    // 5. Event Message / Scorer & Assister Details Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    this.roundRect(ctx, 20, 148, width - 40, 88, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const lines = message.split('\n');
    lines.forEach((line, index) => {
      ctx!.fillStyle = index === 0 ? '#f9fafb' : '#34d399';
      ctx!.font = index === 0 ? 'bold 14px sans-serif' : '13px sans-serif';
      ctx!.fillText(line, width / 2, 160 + index * 24);
    });

    // Convert to Data URL
    if ('toDataURL' in canvas) {
      return (canvas as HTMLCanvasElement).toDataURL('image/png');
    } else {
      const blob = await (canvas as OffscreenCanvas).convertToBlob({ type: 'image/png' });
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    }
  }

  private static roundRect(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}
