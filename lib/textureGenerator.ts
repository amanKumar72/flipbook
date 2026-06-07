import * as THREE from "three";
import { SpreadData } from "@/data/album";

// Cache for generated textures to prevent duplicate work
const textureCache: Record<string, THREE.Texture> = {};

// Helper to load an image asynchronously
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Fallback if Unsplash fails or is blocked
      console.warn("Failed to load image, using fallback: ", src);
      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#221a15";
        ctx.fillRect(0, 0, 100, 100);
      }
      const fallbackImg = new Image();
      fallbackImg.src = canvas.toDataURL();
      fallbackImg.onload = () => resolve(fallbackImg);
    };
  });
}

// Generate the leather cover texture
export function generateCoverTexture(isFront: boolean): THREE.Texture {
  const cacheKey = `cover_${isFront ? "front" : "back"}`;
  if (textureCache[cacheKey]) return textureCache[cacheKey];

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.Texture();

  // 1. Dark premium leather background gradient
  const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
  grad.addColorStop(0, "#1c1410");
  grad.addColorStop(0.5, "#130d0a");
  grad.addColorStop(1, "#080605");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // 2. Leather grain (fine random noise)
  const imgData = ctx.getImageData(0, 0, 1024, 1024);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 8;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // 3. Subtle leather cellular pattern
  ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 200; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * 1024, Math.random() * 1024);
    ctx.lineTo(Math.random() * 1024, Math.random() * 1024);
    ctx.stroke();
  }

  // 4. Gold foil embossed borders
  ctx.strokeStyle = "rgba(218, 165, 32, 0.4)";
  ctx.lineWidth = 4;
  ctx.strokeRect(50, 50, 924, 924);
  
  ctx.strokeStyle = "rgba(218, 165, 32, 0.15)";
  ctx.lineWidth = 1;
  ctx.strokeRect(62, 62, 900, 900);

  // 5. Embossed Gold Logo/Title on front cover
  if (isFront) {
    // Elegant frame in center
    ctx.strokeStyle = "rgba(218, 165, 32, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(512, 450, 120, 0, Math.PI * 2);
    ctx.stroke();

    // Inner ring
    ctx.strokeStyle = "rgba(218, 165, 32, 0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(512, 450, 110, 0, Math.PI * 2);
    ctx.stroke();

    // Laurel leaves in wreath shape
    ctx.fillStyle = "rgba(218, 165, 32, 0.45)";
    ctx.font = "24px 'Georgia', serif";
    ctx.textAlign = "center";
    ctx.fillText("🌿 OUR WEDDING 🌿", 512, 455);

    // Main Title
    ctx.fillStyle = "rgba(218, 165, 32, 0.8)";
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;
    
    ctx.font = "bold 48px 'Georgia', serif";
    ctx.fillText("OUR WEDDING ALBUM", 512, 650);

    ctx.font = "italic 24px 'Georgia', serif";
    ctx.fillStyle = "rgba(218, 165, 32, 0.6)";
    ctx.fillText("A Story of Love & Togetherness", 512, 700);

    ctx.font = "20px 'Georgia', serif";
    ctx.fillStyle = "rgba(218, 165, 32, 0.4)";
    ctx.fillText("DEMO VERSION", 512, 850);
  } else {
    // Back Cover: Simple crest
    ctx.fillStyle = "rgba(218, 165, 32, 0.3)";
    ctx.font = "bold 32px 'Georgia', serif";
    ctx.textAlign = "center";
    ctx.fillText("✦", 512, 512);
  }

  // Create texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache[cacheKey] = texture;
  return texture;
}

// Generate stylized page textures dynamically
export async function generatePageTexture(
  isLeft: boolean,
  spreadIndex: number,
  spread: SpreadData
): Promise<THREE.Texture> {
  const cacheKey = `page_${spreadIndex}_${isLeft ? "left" : "right"}`;
  if (textureCache[cacheKey]) return textureCache[cacheKey];

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.Texture();

  // 1. Premium dark background with slight radial glow from spine
  // Spine is at the right edge for left pages, left edge for right pages
  const cx = isLeft ? 1024 : 0;
  const grad = ctx.createRadialGradient(cx, 512, 10, cx, 512, 1200);
  grad.addColorStop(0, "#191310"); // Warm dark glow near center hinge
  grad.addColorStop(0.5, "#0e0a08");
  grad.addColorStop(1, "#070504");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // 2. Subtle gold dust particles
  ctx.fillStyle = "rgba(218, 165, 32, 0.04)";
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const r = Math.random() * 2 + 1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Double thin gold line page border
  ctx.strokeStyle = "rgba(218, 165, 32, 0.15)";
  ctx.lineWidth = 1;
  ctx.strokeRect(30, 30, 964, 964);
  ctx.strokeStyle = "rgba(218, 165, 32, 0.05)";
  ctx.strokeRect(36, 36, 952, 952);

  // 4. Load photo
  const imageUrl = isLeft ? spread.leftImage : spread.rightImage;
  const img = await loadImage(imageUrl);

  // 5. Render styled layout based on spreadIndex and side
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;

  const layoutType = spreadIndex % 3;

  if (isLeft) {
    // --- LEFT PAGE LAYOUTS ---
    if (layoutType === 0) {
      // Layout 0: Elegant centered portrait with title below
      const frameW = 600;
      const frameH = 680;
      const frameX = 212;
      const frameY = 100;

      // Draw photo
      ctx.save();
      ctx.beginPath();
      ctx.rect(frameX, frameY, frameW, frameH);
      ctx.clip();
      ctx.shadowColor = "transparent";
      
      // Cover fit calculations
      drawCoverImage(ctx, img, frameX, frameY, frameW, frameH);
      ctx.restore();

      // Gold frame border
      ctx.strokeStyle = "rgba(218, 165, 32, 0.6)";
      ctx.lineWidth = 4;
      ctx.strokeRect(frameX, frameY, frameW, frameH);

      // Gold text
      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 4;
      ctx.fillStyle = "rgba(218, 165, 32, 0.9)";
      ctx.font = "bold 32px 'Georgia', serif";
      ctx.textAlign = "center";
      ctx.fillText(spread.title, 512, 850);

      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "italic 20px 'Georgia', serif";
      ctx.fillText(spread.subtitle, 512, 890);

    } else if (layoutType === 1) {
      // Layout 1: Split vertical frames (like standard album pages)
      const frameW = 400;
      const frameH = 500;
      const frameX = 150;
      const frameY = 180;

      ctx.save();
      ctx.beginPath();
      ctx.rect(frameX, frameY, frameW, frameH);
      ctx.clip();
      ctx.shadowColor = "transparent";
      drawCoverImage(ctx, img, frameX, frameY, frameW, frameH);
      ctx.restore();

      ctx.strokeStyle = "rgba(218, 165, 32, 0.6)";
      ctx.lineWidth = 3;
      ctx.strokeRect(frameX, frameY, frameW, frameH);

      // Smaller polaroid or second frame on right side of left page
      ctx.save();
      ctx.translate(750, 400);
      ctx.rotate(0.08); // Slight rotation for premium scrapbook feel
      
      const pW = 220;
      const pH = 260;
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0,0,0,0.4)";
      ctx.shadowBlur = 10;
      ctx.fillRect(-pW/2, -pH/2, pW, pH);

      // Polaroid photo
      ctx.shadowColor = "transparent";
      ctx.beginPath();
      ctx.rect(-pW/2 + 15, -pH/2 + 15, pW - 30, pH - 60);
      ctx.clip();
      drawCoverImage(ctx, img, -pW/2 + 15, -pH/2 + 15, pW - 30, pH - 60);
      ctx.restore();

      // Text decoration
      ctx.fillStyle = "rgba(218, 165, 32, 0.85)";
      ctx.font = "bold 28px 'Georgia', serif";
      ctx.textAlign = "left";
      ctx.fillText(spread.title, 150, 770);
      
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "italic 18px 'Georgia', serif";
      ctx.fillText(spread.subtitle, 150, 810);

    } else {
      // Layout 2: Modern wide panel with gold leaf side decal
      const frameW = 680;
      const frameH = 500;
      const frameX = 220;
      const frameY = 220;

      ctx.save();
      ctx.beginPath();
      ctx.rect(frameX, frameY, frameW, frameH);
      ctx.clip();
      ctx.shadowColor = "transparent";
      drawCoverImage(ctx, img, frameX, frameY, frameW, frameH);
      ctx.restore();

      ctx.strokeStyle = "rgba(218, 165, 32, 0.5)";
      ctx.lineWidth = 4;
      ctx.strokeRect(frameX, frameY, frameW, frameH);

      // Side gold text
      ctx.save();
      ctx.translate(110, 500);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = "rgba(218, 165, 32, 0.6)";
      ctx.font = "bold 32px 'Georgia', serif";
      ctx.textAlign = "center";
      ctx.fillText("MOMENTS OF LOVE", 0, 0);
      ctx.restore();

      // Top text
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.font = "italic 28px 'Georgia', serif";
      ctx.textAlign = "center";
      ctx.fillText(`“ ${spread.subtitle} ”`, 512, 130);
    }
  } else {
    // --- RIGHT PAGE LAYOUTS ---
    if (layoutType === 0) {
      // Layout 0: Soft painterly masked edges (like right page in Spread 03)
      const r = 320;
      ctx.save();
      
      // Create a soft radial transparency mask
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = 1024;
      maskCanvas.height = 1024;
      const mctx = maskCanvas.getContext("2d");
      if (mctx) {
        const maskGrad = mctx.createRadialGradient(512, 450, 50, 512, 450, r);
        maskGrad.addColorStop(0, "rgba(0,0,0,1)");
        maskGrad.addColorStop(0.7, "rgba(0,0,0,0.85)");
        maskGrad.addColorStop(1, "rgba(0,0,0,0)");
        mctx.fillStyle = maskGrad;
        mctx.beginPath();
        mctx.arc(512, 450, r, 0, Math.PI * 2);
        mctx.fill();
      }

      // Draw photo with shadow off
      ctx.shadowColor = "transparent";
      ctx.beginPath();
      ctx.arc(512, 450, r, 0, Math.PI * 2);
      ctx.clip();
      
      // Draw image
      drawCoverImage(ctx, img, 512 - r, 450 - r, r * 2, r * 2);
      
      // Overlay the mask for watercolor fade out edge effect
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(maskCanvas, 0, 0);
      ctx.restore();

      // Draw thin decorative gold circular borders around the soft edge
      ctx.shadowColor = "rgba(0,0,0,0.2)";
      ctx.shadowBlur = 5;
      ctx.strokeStyle = "rgba(218, 165, 32, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(512, 450, r + 15, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(218, 165, 32, 0.1)";
      ctx.beginPath();
      ctx.arc(512, 450, r + 25, 0, Math.PI * 2);
      ctx.stroke();

      // Bottom caption
      ctx.fillStyle = "rgba(218, 165, 32, 0.7)";
      ctx.font = "italic 22px 'Georgia', serif";
      ctx.textAlign = "center";
      ctx.fillText("ETERNAL BONDS", 512, 860);

    } else if (layoutType === 1) {
      // Layout 1: Luxury frame inside double golden rectangle
      const frameW = 640;
      const frameH = 460;
      const frameX = 192;
      const frameY = 240;

      ctx.save();
      ctx.beginPath();
      ctx.rect(frameX, frameY, frameW, frameH);
      ctx.clip();
      ctx.shadowColor = "transparent";
      drawCoverImage(ctx, img, frameX, frameY, frameW, frameH);
      ctx.restore();

      ctx.strokeStyle = "rgba(218, 165, 32, 0.75)";
      ctx.lineWidth = 6;
      ctx.strokeRect(frameX, frameY, frameW, frameH);

      // Gold filigree details or inner frame
      ctx.strokeStyle = "rgba(218, 165, 32, 0.3)";
      ctx.lineWidth = 1;
      ctx.strokeRect(frameX - 15, frameY - 15, frameW + 30, frameH + 30);

      // Quote text
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.font = "bold 32px 'Georgia', serif";
      ctx.textAlign = "center";
      ctx.fillText("THE HAPPY COUPLE", 512, 140);
      
      ctx.fillStyle = "rgba(218, 165, 32, 0.5)";
      ctx.font = "16px 'Georgia', serif";
      ctx.fillText("✦ LOVE NEVER FAILS ✦", 512, 180);

    } else {
      // Layout 2: Landscape central card layout
      const frameW = 700;
      const frameH = 520;
      const frameX = 162;
      const frameY = 150;

      ctx.save();
      ctx.beginPath();
      ctx.rect(frameX, frameY, frameW, frameH);
      ctx.clip();
      ctx.shadowColor = "transparent";
      drawCoverImage(ctx, img, frameX, frameY, frameW, frameH);
      ctx.restore();

      ctx.strokeStyle = "rgba(218, 165, 32, 0.6)";
      ctx.lineWidth = 3;
      ctx.strokeRect(frameX, frameY, frameW, frameH);

      // Elegance ribbon at the bottom
      ctx.fillStyle = "rgba(218, 165, 32, 0.8)";
      ctx.font = "italic 26px 'Georgia', serif";
      ctx.textAlign = "center";
      ctx.fillText("Capturing eternal memories in our hearts.", 512, 780);

      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = "18px 'Georgia', serif";
      ctx.fillText("— ✧ —", 512, 820);
    }
  }

  // Draw Page Number at outer bottom corner
  ctx.fillStyle = "rgba(218, 165, 32, 0.4)";
  ctx.font = "16px 'Georgia', serif";
  const pageNum = (spreadIndex * 2 + (isLeft ? 1 : 2)).toString().padStart(2, "0");
  if (isLeft) {
    ctx.textAlign = "left";
    ctx.fillText(`${pageNum}a`, 60, 940);
  } else {
    ctx.textAlign = "right";
    ctx.fillText(`${pageNum}b`, 964, 940);
  }

  // Create texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache[cacheKey] = texture;
  return texture;
}

// Utility to draw cover/contain image inside canvas bounding box
function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgW = img.width;
  const imgH = img.height;
  const targetRatio = w / h;
  const imgRatio = imgW / imgH;

  let sx = 0, sy = 0, sw = imgW, sh = imgH;

  if (imgRatio > targetRatio) {
    // Image is wider, clip left/right
    sw = imgH * targetRatio;
    sx = (imgW - sw) / 2;
  } else {
    // Image is taller, clip top/bottom
    sh = imgW / targetRatio;
    sy = (imgH - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}
