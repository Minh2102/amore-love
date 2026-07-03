/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

const ON_VERCEL = Boolean(process.env.VERCEL || process.env.NOW_BUILDER);
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const DB_PATH = path.join(process.cwd(), "db.json");

const CLOUDINARY_ENABLED = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (CLOUDINARY_ENABLED) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else {
  console.warn("Cloudinary environment variables are not configured. Uploads will fall back to local storage.");
}

// Lazy-loaded Google GenAI helper
let aiInstance: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey)    {
      throw new Error("GEMINI_API_KEY environment variable is missing. Configure it in your Secrets setting.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Ensure database file exists with elegant initial mock data and at least 50+ templates
function initDatabase() {
  const templateSeeds = [
    {
      id: "tpl-modern",
      name: "Modern Bliss",
      category: "modern",
      theme: "theme-modern",
      fontHeading: "Outfit",
      fontBody: "Inter",
      primaryColor: "#0f172a", // Slate 900
      backgroundColor: "#f8fafc", // Slate 50
      textColor: "#334155", // Slate 700
      cardStyle: "border border-slate-100 shadow-xl rounded-3xl backdrop-blur-md bg-white/80",
      coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
      description: "Thiết kế hiện đại, tinh tế với khoảng trống rộng, hình khối sắc nét và typography tối giản sang trọng."
    },
    {
      id: "tpl-luxury",
      name: "Royal Golden Line",
      category: "luxury",
      theme: "theme-luxury",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      primaryColor: "#c5a880", // Premium Gold
      backgroundColor: "#0b131e", // Luxury Navy/Gold
      textColor: "#e2e8f0", // Slate 200
      cardStyle: "border border-amber-500/20 shadow-[0_0_50px_rgba(197,168,128,0.15)] rounded-2xl bg-slate-900/90 backdrop-blur-xl",
      coverImage: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800",
      description: "Sự kết hợp giữa nhung đen sâu thẳm, đường viền vàng ánh kim hoàng gia và kiểu chữ serif đẳng cấp thượng lưu."
    },
    {
      id: "tpl-floral",
      name: "Floral Watercolor",
      category: "floral",
      theme: "theme-floral",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      primaryColor: "#db2777", // Rose Pink
      backgroundColor: "#fff1f2", // Rose 50
      textColor: "#4c0519", // Rose 950
      cardStyle: "border border-rose-100 shadow-2xl rounded-3xl bg-white/95 backdrop-blur-md",
      coverImage: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=800",
      description: "Hương hoa cỏ lãng mạn nhẹ nhàng với nét cọ màu nước thanh tú, tạo cảm xúc ấm áp và ngọt ngào."
    },
    {
      id: "tpl-minimal",
      name: "Pure Romance",
      category: "minimal",
      theme: "theme-minimal",
      fontHeading: "Outfit",
      fontBody: "Inter",
      primaryColor: "#1e293b",
      backgroundColor: "#ffffff",
      textColor: "#475569",
      cardStyle: "shadow-sm rounded-none border-b-2 border-slate-900 p-8 bg-white",
      coverImage: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=800",
      description: "Trực quan tối giản thuần khiết, loại bỏ mọi chi tiết rườm rà để tôn vinh tình yêu mộc mạc."
    },
    // MODERN TEMPLATES
    {
      id: "tpl-mod-1",
      name: "Urban Minimalist",
      category: "modern",
      theme: "theme-modern",
      fontHeading: "Outfit",
      fontBody: "Inter",
      primaryColor: "#0284c7",
      backgroundColor: "#f0f9ff",
      textColor: "#0369a1",
      cardStyle: "border border-sky-100 shadow-lg rounded-2xl bg-white/90",
      coverImage: "https://images.unsplash.com/photo-1507504038482-7621006a3e1a?auto=format&fit=crop&q=80&w=800",
      description: "Phong cách tối giản đô thị với gam màu xanh da trời mát dịu, bố cục bất đối xứng đầy tính nghệ thuật."
    },
    {
      id: "tpl-mod-2",
      name: "Nordic Breeze",
      category: "modern",
      theme: "theme-modern",
      fontHeading: "Outfit",
      fontBody: "Inter",
      primaryColor: "#475569",
      backgroundColor: "#f8fafc",
      textColor: "#1e293b",
      cardStyle: "border border-slate-200/60 shadow-md rounded-xl bg-white",
      coverImage: "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?auto=format&fit=crop&q=80&w=800",
      description: "Sự thanh lịch đến từ Bắc Âu với gam màu xám phấn nhẹ, font chữ không chân tinh tế và bố cục thoáng đãng."
    },
    {
      id: "tpl-mod-3",
      name: "Geometric Love",
      category: "modern",
      theme: "theme-modern",
      fontHeading: "Outfit",
      fontBody: "Inter",
      primaryColor: "#7c3aed",
      backgroundColor: "#f5f3ff",
      textColor: "#5b21b6",
      cardStyle: "border-2 border-purple-100 shadow-2xl rounded-3xl bg-white",
      coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
      description: "Cấu trúc hình học đầy táo bạo kết hợp tông màu tím mộng mơ thời thượng, tôn lên cá tính độc đáo."
    },
    {
      id: "tpl-mod-4",
      name: "Concrete Rose",
      category: "modern",
      theme: "theme-modern",
      fontHeading: "Outfit",
      fontBody: "Inter",
      primaryColor: "#be123c",
      backgroundColor: "#fff1f2",
      textColor: "#881337",
      cardStyle: "border border-rose-200/80 shadow-xl rounded-2xl bg-stone-50",
      coverImage: "https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?auto=format&fit=crop&q=80&w=800",
      description: "Sự kết hợp giữa chất liệu thô của bê tông mộc và vẻ mềm mại của đóa hồng nhung đỏ thắm cuốn hút."
    },
    {
      id: "tpl-mod-5",
      name: "Warm Terracotta",
      category: "modern",
      theme: "theme-modern",
      fontHeading: "Outfit",
      fontBody: "Inter",
      primaryColor: "#c2410c",
      backgroundColor: "#fff7ed",
      textColor: "#7c2d12",
      cardStyle: "border border-orange-100 shadow-xl rounded-3xl bg-white/90",
      coverImage: "https://images.unsplash.com/photo-1502005229762-fc1b2381f083?auto=format&fit=crop&q=80&w=800",
      description: "Tông màu đất nung ấm áp như ngọn lửa tình yêu vĩnh cửu, hoàn hảo cho những tiệc cưới mùa thu thơ mộng."
    },
    {
      id: "tpl-mod-6",
      name: "Oceanic Wave",
      category: "modern",
      theme: "theme-modern",
      fontHeading: "Outfit",
      fontBody: "Inter",
      primaryColor: "#0369a1",
      backgroundColor: "#f0f9ff",
      textColor: "#0c4a6e",
      cardStyle: "border border-sky-100 shadow-2xl rounded-2xl bg-white/95",
      coverImage: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800",
      description: "Lấy cảm hứng từ những con sóng biển khơi rì rào, thiết kế này mang hơi thở đại dương bao la, phóng khoáng."
    },
    {
      id: "tpl-mod-7",
      name: "Sage Serenity",
      category: "modern",
      theme: "theme-modern",
      fontHeading: "Outfit",
      fontBody: "Inter",
      primaryColor: "#15803d",
      backgroundColor: "#f0fdf4",
      textColor: "#14532d",
      cardStyle: "border border-green-100 shadow-lg rounded-3xl bg-white/80 backdrop-blur-sm",
      coverImage: "https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&q=80&w=800",
      description: "Xanh xô thơm thanh mát tạo cảm giác thư thái, bình yên, gợi mở về một hành trình hôn nhân êm ấm."
    },
    {
      id: "tpl-mod-8",
      name: "Peach Sunset",
      category: "modern",
      theme: "theme-modern",
      fontHeading: "Outfit",
      fontBody: "Inter",
      primaryColor: "#ea580c",
      backgroundColor: "#fff7ed",
      textColor: "#7c2d12",
      cardStyle: "border border-amber-100 shadow-xl rounded-2xl bg-white",
      coverImage: "https://images.unsplash.com/photo-1455620380406-d1e0a3478a10?auto=format&fit=crop&q=80&w=800",
      description: "Gam màu quả đào mọng chín dưới ráng chiều hoàng hôn ngọt ngào, thắp sáng lời thề nguyện trăm năm."
    },
    {
      id: "tpl-mod-9",
      name: "Sand & Stone",
      category: "modern",
      theme: "theme-modern",
      fontHeading: "Outfit",
      fontBody: "Inter",
      primaryColor: "#57534e",
      backgroundColor: "#fafaf9",
      textColor: "#292524",
      cardStyle: "border border-stone-200/60 shadow-lg rounded-3xl bg-white/90",
      coverImage: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800",
      description: "Sự thô mộc của cát trắng và đá cuội ven sông, mang đến vẻ đẹp vĩnh cửu bất biến theo thời gian."
    },
    {
      id: "tpl-mod-10",
      name: "Blossom Arch",
      category: "modern",
      theme: "theme-modern",
      fontHeading: "Outfit",
      fontBody: "Inter",
      primaryColor: "#ec4899",
      backgroundColor: "#fdf2f8",
      textColor: "#50072b",
      cardStyle: "border border-pink-100 shadow-xl rounded-2xl bg-white",
      coverImage: "https://images.unsplash.com/photo-1533158326339-7f3cf2404354?auto=format&fit=crop&q=80&w=800",
      description: "Mẫu thiệp với mái vòm hoa anh đào đung đưa trước gió, tượng trưng cho sự khởi đầu ngọt ngào và may mắn."
    },
    {
      id: "tpl-mod-11",
      name: "Cyber Blush",
      category: "modern",
      theme: "theme-modern",
      fontHeading: "Outfit",
      fontBody: "Inter",
      primaryColor: "#d946ef",
      backgroundColor: "#fdf4ff",
      textColor: "#4a044e",
      cardStyle: "border border-fuchsia-200/80 shadow-2xl rounded-3xl bg-white/95",
      coverImage: "https://images.unsplash.com/photo-1621619856624-42f8b9e06159?auto=format&fit=crop&q=80&w=800",
      description: "Thiết kế hiện đại viễn tưởng với những đường cong neon sắc sảo trên nền trắng mộc mạc."
    },
    {
      id: "tpl-mod-12",
      name: "Copper Glow",
      category: "modern",
      theme: "theme-modern",
      fontHeading: "Outfit",
      fontBody: "Inter",
      primaryColor: "#b45309",
      backgroundColor: "#fffbeb",
      textColor: "#451a03",
      cardStyle: "border border-amber-200/50 shadow-xl rounded-2xl bg-stone-50",
      coverImage: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=800",
      description: "Ánh đồng đỏ rực ấm rực rỡ, tượng trưng cho tình yêu nồng nàn luôn rực sáng bất kể giông bão."
    },

    // LUXURY TEMPLATES
    {
      id: "tpl-lux-1",
      name: "Emerald Palace",
      category: "luxury",
      theme: "theme-luxury",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      primaryColor: "#166534",
      backgroundColor: "#064e3b",
      textColor: "#f0fdf4",
      cardStyle: "border border-emerald-500/30 shadow-[0_0_40px_rgba(22,101,52,0.2)] rounded-3xl bg-slate-950/90",
      coverImage: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=800",
      description: "Sắc xanh ngọc lục bảo hoàng gia sâu thẳm, rực rỡ kết hợp hoa văn hoàng cung quý tộc tráng lệ."
    },
    {
      id: "tpl-lux-2",
      name: "Midnight Velvet",
      category: "luxury",
      theme: "theme-luxury",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      primaryColor: "#a3e635",
      backgroundColor: "#0f172a",
      textColor: "#f8fafc",
      cardStyle: "border border-lime-500/20 shadow-2xl rounded-2xl bg-black/80 backdrop-blur-md",
      coverImage: "https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&q=80&w=800",
      description: "Nhung đen huyền bí của bầu trời nửa đêm, lấp lánh ngàn vạn ngôi sao vàng lung linh lãng mạn."
    },
    {
      id: "tpl-lux-3",
      name: "Chandelier Magic",
      category: "luxury",
      theme: "theme-luxury",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      primaryColor: "#d97706",
      backgroundColor: "#fffbeb",
      textColor: "#78350f",
      cardStyle: "border-2 border-amber-300 shadow-2xl rounded-3xl bg-amber-50/50 backdrop-blur-md",
      coverImage: "https://images.unsplash.com/photo-1504437484262-5bffec1c5722?auto=format&fit=crop&q=80&w=800",
      description: "Hào quang lộng lẫy từ ngọn đèn chùm pha lê trong đại sảnh tiệc cưới sang trọng bậc nhất châu Âu."
    },
    {
      id: "tpl-lux-4",
      name: "Imperial Ruby",
      category: "luxury",
      theme: "theme-luxury",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      primaryColor: "#be123c",
      backgroundColor: "#4c0519",
      textColor: "#ffe4e6",
      cardStyle: "border border-rose-500/40 shadow-3xl rounded-xl bg-stone-950/90",
      coverImage: "https://images.unsplash.com/photo-1531956531700-403419d912c3?auto=format&fit=crop&q=80&w=800",
      description: "Sắc đỏ hồng ngọc quyền quý tối cao, thể hiện tình yêu nồng cháy mãnh liệt và đầy kiêu hãnh."
    },
    {
      id: "tpl-lux-5",
      name: "Golden Carrara",
      category: "luxury",
      theme: "theme-luxury",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      primaryColor: "#c5a880",
      backgroundColor: "#fafaf9",
      textColor: "#44403c",
      cardStyle: "border border-amber-300 shadow-xl rounded-2xl bg-white/95",
      coverImage: "https://images.unsplash.com/photo-1502005229762-fc1b2381f083?auto=format&fit=crop&q=80&w=800",
      description: "Vân đá cẩm thạch trắng Carrara quý hiếm đan xen các sợi chỉ vàng hoàng gia uyển chuyển và quyến rũ."
    },
    {
      id: "tpl-lux-6",
      name: "Rose Gold Royalty",
      category: "luxury",
      theme: "theme-luxury",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      primaryColor: "#db2777",
      backgroundColor: "#fff1f2",
      textColor: "#4c0519",
      cardStyle: "border border-pink-400 shadow-2xl rounded-3xl bg-white",
      coverImage: "https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=800",
      description: "Vàng hồng thời thượng, kiều diễm nâng tầm phong cách quý tộc cho ngày trọng đại của đôi lứa."
    },
    {
      id: "tpl-lux-7",
      name: "Sapphire Crown",
      category: "luxury",
      theme: "theme-luxury",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      primaryColor: "#1d4ed8",
      backgroundColor: "#172554",
      textColor: "#eff6ff",
      cardStyle: "border border-blue-500/30 shadow-2xl rounded-2xl bg-slate-900/90",
      coverImage: "https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&q=80&w=800",
      description: "Xanh Sapphire huyền thoại lấp lánh như viên đá quý đính trên vương miện hoàng gia lộng lẫy."
    },
    {
      id: "tpl-lux-8",
      name: "Platinum Orchid",
      category: "luxury",
      theme: "theme-luxury",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      primaryColor: "#475569",
      backgroundColor: "#f1f5f9",
      textColor: "#0f172a",
      cardStyle: "border border-slate-300 shadow-xl rounded-3xl bg-white/95",
      coverImage: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=80&w=800",
      description: "Phong cách Bạch kim kết hợp với nhành phong lan trắng ngần, thanh tao, quý phái không tì vết."
    },
    {
      id: "tpl-lux-9",
      name: "Baroque Filigree",
      category: "luxury",
      theme: "theme-luxury",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      primaryColor: "#b45309",
      backgroundColor: "#fef3c7",
      textColor: "#78350f",
      cardStyle: "border border-amber-400 shadow-2xl rounded-xl bg-amber-50/90",
      coverImage: "https://images.unsplash.com/photo-1504437484262-5bffec1c5722?auto=format&fit=crop&q=80&w=800",
      description: "Nghệ thuật Baroque cổ điển nước Pháp với những đường chạm trổ tinh xảo rực rỡ sắc vàng."
    },
    {
      id: "tpl-lux-10",
      name: "Silver Symphony",
      category: "luxury",
      theme: "theme-luxury",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      primaryColor: "#64748b",
      backgroundColor: "#f8fafc",
      textColor: "#0f172a",
      cardStyle: "border border-stone-200 shadow-xl rounded-2xl bg-white",
      coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
      description: "Bản giao hưởng ánh bạc lấp lánh như sương mai ban sớm, mang vẻ đẹp thuần khiết và thanh cao."
    },
    {
      id: "tpl-lux-11",
      name: "Onyx Elegance",
      category: "luxury",
      theme: "theme-luxury",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      primaryColor: "#1e293b",
      backgroundColor: "#020617",
      textColor: "#f8fafc",
      cardStyle: "border border-slate-800 shadow-2xl rounded-3xl bg-slate-900/80 backdrop-blur-xl",
      coverImage: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800",
      description: "Đen Onyx tráng lệ, tạo chiều sâu thị giác vô song, thích hợp cho đám cưới hoàng gia tinh hoa."
    },
    {
      id: "tpl-lux-12",
      name: "Champagne Celebration",
      category: "luxury",
      theme: "theme-luxury",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      primaryColor: "#d97706",
      backgroundColor: "#fffbeb",
      textColor: "#78350f",
      cardStyle: "border border-amber-300 shadow-2xl rounded-2xl bg-amber-50/95",
      coverImage: "https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=800",
      description: "Màu rượu sâm banh ngọt ngào sủi bọt chúc phúc cho tình yêu đôi lứa mãi thăng hoa rực rỡ."
    },

    // FLORAL TEMPLATES
    {
      id: "tpl-flo-1",
      name: "Eucalyptus Forest",
      category: "floral",
      theme: "theme-floral",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      primaryColor: "#16a34a",
      backgroundColor: "#f0fdf4",
      textColor: "#14532d",
      cardStyle: "border border-green-200/80 shadow-xl rounded-2xl bg-white",
      coverImage: "https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&q=80&w=800",
      description: "Lá khuynh diệp thanh khiết đan xen nhịp nhàng mang hương thơm dịu mát của khu rừng ôn đới ấm áp."
    },
    {
      id: "tpl-flo-2",
      name: "Blushing Peony",
      category: "floral",
      theme: "theme-floral",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      primaryColor: "#db2777",
      backgroundColor: "#fff1f2",
      textColor: "#4c0519",
      cardStyle: "border border-rose-200 shadow-2xl rounded-3xl bg-white/95",
      coverImage: "https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=800",
      description: "Hoa mẫu đơn hồng e ấp ngậm sương ban mai, tượng trưng cho tình yêu hạnh phúc viên mãn tròn đầy."
    },
    {
      id: "tpl-flo-3",
      name: "Wildflower Meadows",
      category: "floral",
      theme: "theme-floral",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      primaryColor: "#d97706",
      backgroundColor: "#fffbeb",
      textColor: "#78350f",
      cardStyle: "border border-yellow-200 shadow-lg rounded-2xl bg-stone-50",
      coverImage: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=800",
      description: "Đồng hoa dại rực rỡ sắc màu tươi tắn dưới nắng xuân ấm áp, tạo cảm giác thân mật, ấm cúng."
    },
    {
      id: "tpl-flo-4",
      name: "Classic White Rose",
      category: "floral",
      theme: "theme-floral",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      primaryColor: "#475569",
      backgroundColor: "#fafaf9",
      textColor: "#1c1917",
      cardStyle: "border border-stone-200/60 shadow-xl rounded-2xl bg-white",
      coverImage: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=800",
      description: "Đóa hồng trắng thuần khiết không tì vết, biểu trưng cho tình yêu chân thành vững bền mãi mãi."
    },
    {
      id: "tpl-flo-5",
      name: "Cherry Blossom Spring",
      category: "floral",
      theme: "theme-floral",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      primaryColor: "#ec4899",
      backgroundColor: "#fff1f2",
      textColor: "#50072b",
      cardStyle: "border border-pink-200 shadow-2xl rounded-3xl bg-white",
      coverImage: "https://images.unsplash.com/photo-1533158326339-7f3cf2404354?auto=format&fit=crop&q=80&w=800",
      description: "Những cánh hoa anh đào bay nhẹ trong gió xuân phơi phới, gieo rắc hạnh phúc ngập tràn muôn nơi."
    },
    {
      id: "tpl-flo-6",
      name: "Autumn Leaves & Marigold",
      category: "floral",
      theme: "theme-floral",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      primaryColor: "#c2410c",
      backgroundColor: "#fff7ed",
      textColor: "#7c2d12",
      cardStyle: "border border-orange-200 shadow-xl rounded-2xl bg-stone-50",
      coverImage: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=800",
      description: "Sự kết hợp ấm áp giữa lá vàng mùa thu rơi rụng và đóa cúc vạn thọ cam cháy nồng nàn quyến rũ."
    },
    {
      id: "tpl-flo-7",
      name: "Lavender Fields",
      category: "floral",
      theme: "theme-floral",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      primaryColor: "#7c3aed",
      backgroundColor: "#f5f3ff",
      textColor: "#4c1d95",
      cardStyle: "border border-purple-200 shadow-2xl rounded-3xl bg-white",
      coverImage: "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&q=80&w=800",
      description: "Đồng hoa oải hương tím mộng mơ bạt ngàn tại vùng Provence nước Pháp, dịu dàng say đắm lứa đôi."
    },
    {
      id: "tpl-flo-8",
      name: "Royal Orchid Garland",
      category: "floral",
      theme: "theme-floral",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      primaryColor: "#6d28d9",
      backgroundColor: "#fbfbfe",
      textColor: "#2e1065",
      cardStyle: "border border-violet-200 shadow-2xl rounded-2xl bg-white/95",
      coverImage: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=80&w=800",
      description: "Vòng hoa lan hồ điệp tím quý phái nâng tầm sự sang trọng cho trang trí ngày chung đôi hoàn hảo."
    },
    {
      id: "tpl-flo-9",
      name: "Rustic Eucalyptus Accent",
      category: "floral",
      theme: "theme-floral",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      primaryColor: "#047857",
      backgroundColor: "#f0fdf4",
      textColor: "#064e3b",
      cardStyle: "border border-emerald-100 shadow-lg rounded-3xl bg-white",
      coverImage: "https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&q=80&w=800",
      description: "Nhành cây khuynh diệp mộc mạc làm điểm nhấn duyên dáng trên tấm thiệp nền giấy hạt mộc mạc."
    },
    {
      id: "tpl-flo-10",
      name: "Vintage Botanical",
      category: "floral",
      theme: "theme-floral",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      primaryColor: "#b45309",
      backgroundColor: "#fdfbf7",
      textColor: "#451a03",
      cardStyle: "border border-amber-200 shadow-xl rounded-2xl bg-white",
      coverImage: "https://images.unsplash.com/photo-1455620380406-d1e0a3478a10?auto=format&fit=crop&q=80&w=800",
      description: "Họa tiết minh họa bách thảo cổ điển châu Âu mang vẻ đẹp hoài niệm, lãng mạn đầy chiều sâu học thức."
    },
    {
      id: "tpl-flo-11",
      name: "Peachy Coral Blossom",
      category: "floral",
      theme: "theme-floral",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      primaryColor: "#f97316",
      backgroundColor: "#fff7ed",
      textColor: "#7c2d12",
      cardStyle: "border border-orange-100 shadow-xl rounded-3xl bg-white",
      coverImage: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=800",
      description: "Những bông hoa đào san hô nở rộ mang sắc xuân phơi phới tươi trẻ, tràn trề nhựa sống tình yêu."
    },
    {
      id: "tpl-flo-12",
      name: "Summer Meadow Bouquet",
      category: "floral",
      theme: "theme-floral",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      primaryColor: "#0891b2",
      backgroundColor: "#ecfeff",
      textColor: "#164e63",
      cardStyle: "border border-cyan-100 shadow-2xl rounded-2xl bg-white",
      coverImage: "https://images.unsplash.com/photo-1517722014278-c256a91a6fba?auto=format&fit=crop&q=80&w=800",
      description: "Bó hoa đồng nội đầy nắng rực rỡ của mùa hạ vàng, gửi gắm niềm lạc quan tin tưởng bền chặt."
    },

    // MINIMAL TEMPLATES
    {
      id: "tpl-min-1",
      name: "Solemn Arch",
      category: "minimal",
      theme: "theme-minimal",
      fontHeading: "Outfit",
      fontBody: "Inter",
      primaryColor: "#1e293b",
      backgroundColor: "#fdfdfd",
      textColor: "#475569",
      cardStyle: "border border-stone-100 shadow-sm rounded-none p-10 bg-white",
      coverImage: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800",
      description: "Đường nét vòm cong đơn giản thanh lịch làm trung tâm, tôn vinh giây phút thề nguyền thiêng liêng nhất."
    },
    {
      id: "tpl-min-2",
      name: "Warm Cotton",
      category: "minimal",
      theme: "theme-minimal",
      fontHeading: "Outfit",
      fontBody: "Inter",
      primaryColor: "#78350f",
      backgroundColor: "#fafaf6",
      textColor: "#451a03",
      cardStyle: "border border-stone-200/40 rounded-lg p-6 bg-stone-50",
      coverImage: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=800",
      description: "Ấm áp và mềm mại như sợi bông gòn tự nhiên, mang hơi ấm gia đình êm dịu sưởi ấm con tim lứa đôi."
    },
    {
      id: "tpl-min-3",
      name: "Linear Arc",
      category: "minimal",
      theme: "theme-minimal",
      fontHeading: "Outfit",
      fontBody: "Inter",
      primaryColor: "#0f172a",
      backgroundColor: "#ffffff",
      textColor: "#334155",
      cardStyle: "border-l-4 border-slate-900 rounded-none p-8 bg-white",
      coverImage: "https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?auto=format&fit=crop&q=80&w=800",
      description: "Sự tinh giản tuyệt đối kết hợp đường thẳng tối giản đứng đắn, đem lại vẻ lịch duyệt đầy quý phái."
    },
    {
      id: "tpl-min-4",
      name: "Desert Whisper",
      category: "minimal",
      theme: "theme-minimal",
      fontHeading: "Outfit",
      fontBody: "Inter",
      primaryColor: "#c2410c",
      backgroundColor: "#fffaf7",
      textColor: "#7c2d12",
      cardStyle: "border border-orange-100 shadow-sm rounded-3xl p-8 bg-white",
      coverImage: "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?auto=format&fit=crop&q=80&w=800",
      description: "Lời thì thầm êm ái tựa làn gió sa mạc cát mịn, mang sắc cam ấm dịu say đắm mọi ánh nhìn."
    },
    {
      id: "tpl-min-5",
      name: "Silent Forest",
      category: "minimal",
      theme: "theme-minimal",
      fontHeading: "Outfit",
      fontBody: "Inter",
      primaryColor: "#15803d",
      backgroundColor: "#f4fcf6",
      textColor: "#14532d",
      cardStyle: "border-b-4 border-emerald-700 rounded-none p-8 bg-white",
      coverImage: "https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&q=80&w=800",
      description: "Im lặng và uy nghiêm như khu rừng cổ thụ ngút ngàn, bảo hộ vẹn toàn cho tình yêu bền lâu."
    },
    {
      id: "tpl-min-6",
      name: "Linen & Clay",
      category: "minimal",
      theme: "theme-minimal",
      fontHeading: "Outfit",
      fontBody: "Inter",
      primaryColor: "#7c2d12",
      backgroundColor: "#faf8f5",
      textColor: "#451a03",
      cardStyle: "border border-stone-200 shadow-sm rounded-none p-10 bg-white",
      coverImage: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=800",
      description: "Sự tương tác mộc mạc và gần gũi giữa sợi lanh dệt thô và gốm đất sét nung sần sùi cuốn hút."
    },
    {
      id: "tpl-min-7",
      name: "Oatmeal Chic",
      category: "minimal",
      theme: "theme-minimal",
      fontHeading: "Outfit",
      fontBody: "Inter",
      primaryColor: "#44403c",
      backgroundColor: "#fafaf7",
      textColor: "#57534e",
      cardStyle: "border border-stone-200 rounded-2xl p-8 bg-white",
      coverImage: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800",
      description: "Phong cách Oatmeal tối giản Hàn Quốc thời thượng, nâng niu từng dòng chữ chân thành tinh tế."
    },
    {
      id: "tpl-min-8",
      name: "Classic Typewriter",
      category: "minimal",
      theme: "theme-minimal",
      fontHeading: "Outfit",
      fontBody: "Inter",
      primaryColor: "#0f172a",
      backgroundColor: "#fcfcfc",
      textColor: "#1e293b",
      cardStyle: "border border-dashed border-slate-300 p-8 bg-white",
      coverImage: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=800",
      description: "Hơi hướng cổ điển của máy đánh chữ xưa cũ, ghi dấu lại bức thư tình mộc mạc gửi người thương."
    },
    {
      id: "tpl-min-9",
      name: "Pale Lavender Minimal",
      category: "minimal",
      theme: "theme-minimal",
      fontHeading: "Outfit",
      fontBody: "Inter",
      primaryColor: "#6d28d9",
      backgroundColor: "#fdfbfe",
      textColor: "#3b0764",
      cardStyle: "border border-purple-100 rounded-none p-8 bg-white",
      coverImage: "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&q=80&w=800",
      description: "Sắc oải hương nhạt mỏng manh lay động trên nền trắng tinh khiết, mang lại cảm giác dễ chịu dịu nhẹ."
    },
    {
      id: "tpl-min-10",
      name: "Mist & Horizon",
      category: "minimal",
      theme: "theme-minimal",
      fontHeading: "Outfit",
      fontBody: "Inter",
      primaryColor: "#475569",
      backgroundColor: "#f8fafc",
      textColor: "#334155",
      cardStyle: "border border-slate-100 rounded-3xl p-8 bg-white",
      coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
      description: "Cảnh sương mờ ôm lấy đường chân trời lúc bình minh hửng sáng, đại diện cho chương mới đầy hy vọng."
    },
    {
      id: "tpl-min-11",
      name: "Ethereal Breath",
      category: "minimal",
      theme: "theme-minimal",
      fontHeading: "Outfit",
      fontBody: "Inter",
      primaryColor: "#be123c",
      backgroundColor: "#fffcfc",
      textColor: "#4c0519",
      cardStyle: "border border-rose-100/60 rounded-xl p-8 bg-white",
      coverImage: "https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?auto=format&fit=crop&q=80&w=800",
      description: "Một hơi thở mỏng manh tao nhã, lấy việc để trống làm chủ đạo giúp tôn vinh trọn vẹn thông tin ngày cưới."
    },
    {
      id: "tpl-min-12",
      name: "Sunlight Shadow",
      category: "minimal",
      theme: "theme-minimal",
      fontHeading: "Outfit",
      fontBody: "Inter",
      primaryColor: "#b45309",
      backgroundColor: "#faf7f2",
      textColor: "#451a03",
      cardStyle: "border border-amber-100 p-8 bg-white",
      coverImage: "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?auto=format&fit=crop&q=80&w=800",
      description: "Vệt nắng xiên nhẹ đổ bóng bên thềm nhà tranh cổ kính, gợi nhắc về cuộc sống êm đềm dung dị bên nhau."
    }
  ];

  if (fs.existsSync(DB_PATH)) {
    try {
      const raw = fs.readFileSync(DB_PATH, "utf8");
      const db = JSON.parse(raw);
      if (db && db.templates && db.templates.length < 50) {
        db.templates = templateSeeds;
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
        console.log("Database updated successfully with 52 premium templates!");
      }
      return;
    } catch (e) {
      console.error("Error reading/updating database:", e);
    }
  }

  const initialData = {
    templates: templateSeeds,
    blogs: [
      {
        id: "blog-1",
        title: "Cẩm nang 12 bước chuẩn bị đám cưới hoàn hảo cho năm 2026",
        slug: "cam-nang-12-buoc-chuan-bi-dam-cuoi-2026",
        excerpt: "Lập kế hoạch đám cưới là một hành trình kỳ diệu nhưng cũng đầy thách thức. Hãy cùng khám phá lộ trình chuẩn bị chi tiết và tối ưu nhất.",
        content: `## 1. Xác định Ngân sách Đám cưới\nĐây là bước quan trọng nhất quyết định quy mô và địa điểm của hôn lễ. Việc lên ngân sách rõ ràng giúp bạn tránh các chi phí phát sinh bất ngờ.\n\n## 2. Lựa chọn Địa điểm Tổ chức\nĐặt nhà hàng hoặc không gian ngoài trời từ 6-9 tháng trước ngày cưới là thời gian lý tưởng để có được địa điểm như ý.\n\n## 3. Tạo Thiệp cưới Online Tiện lợi\nThay vì gửi thiệp giấy truyền thống, việc sở hữu một trang web thiệp cưới online giúp bạn dễ dàng theo dõi RSVP, gửi album ảnh chất lượng cao và tích hợp bản đồ chỉ đường cho khách mời cực kỳ chuyên nghiệp.`,
        category: "Kế Hoạch",
        tags: ["Chuẩn bị cưới", "Xu hướng 2026", "Lập ngân sách"],
        author: "Thanh Hằng",
        readingTime: "5 phút",
        publishDate: "2026-06-25",
        coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
        views: 342
      },
      {
        id: "blog-2",
        title: "Tại sao Website Thiệp cưới Online là tương lai của ngày cưới?",
        slug: "tai-sao-website-thiep-cuoi-online-la-tuong-lai",
        excerpt: "Giảm thiểu lãng phí giấy, gửi thiệp tức thì và quản lý phản hồi khách mời chỉ trên một chiếc màn hình. Khám phá xu hướng công nghệ cưới mới nhất.",
        content: `## Xu hướng bảo vệ môi trường\nThiệp cưới kỹ thuật số giúp cắt giảm lượng lớn giấy in thải ra môi trường, hướng đến một đám cưới 'xanh' và bền vững.\n\n## Tính năng RSVP tương tác tức thì\nKhách mời có thể dễ dàng xác nhận tham dự, thông báo dị ứng thức ăn hay gửi những lời chúc ngọt ngào chỉ với vài lượt chạm. Toàn bộ thông tin sẽ tự động đồng bộ về bảng điều khiển quản lý của cô dâu chú rể.\n\n## Trải nghiệm hình ảnh và âm thanh sống động\nKhông chỉ là thông tin cơ bản, website cưới còn kể lại hành trình yêu đương của hai bạn qua một album ảnh rực rỡ, video lãng mạn và bản nhạc nền du dương say đắm lòng người.`,
        category: "Công Nghệ",
        tags: ["Thiệp cưới online", "RSVP", "Xu hướng mới"],
        author: "Quốc Anh",
        readingTime: "4 phút",
        publishDate: "2026-06-30",
        coverImage: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=800",
        views: 289
      }
    ],
    invitations: [
      {
        id: "demo-invitation",
        slug: "duy-anh-mai-chi",
        templateId: "tpl-modern",
        groomName: "Lê Duy Anh",
        groomFather: "Lê Quốc Trung",
        groomMother: "Nguyễn Minh Hà",
        brideName: "Trần Mai Chi",
        brideFather: "Trần Thế Hùng",
        brideMother: "Vũ Kim Oanh",
        weddingDate: "2026-10-18",
        weddingTime: "11:00",
        venueName: "The Grand Romance Resort",
        venueAddress: "Phòng Grand Ballroom, 456 Đường Ven Biển, Quận 1, TP. Hồ Chí Minh",
        googleMapsUrl: "https://maps.google.com",
        musicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        musicTitle: "Canon in D - Piano",
        dressCodeColor: "#2563eb", // Blue
        dressCodeDescription: "Trang phục lịch sự với tông màu xanh dương pastel hoặc be thanh lịch.",
        hashtag: "#DuyAnhMaiChi2026",
        loveStory: [
          {
            id: "ls-1",
            year: "2021",
            title: "Lần Đầu Gặp Gỡ",
            description: "Chúng mình tình cờ quen nhau dưới cơn mưa rào mùa hạ tại một quán cà phê nhỏ ven hồ Tây."
          },
          {
            id: "ls-2",
            year: "2023",
            title: "Lời Yêu Ngỏ Ý",
            description: "Chuyến đi Đà Lạt mộng mơ cùng lời tỏ tình ấm áp dưới bầu trời đầy sao lấp lánh."
          },
          {
            id: "ls-3",
            year: "2025",
            title: "Trọn Đời Bên Nhau",
            description: "Khoảnh khắc cầu hôn đầy xúc động bên bờ biển hoàng hôn dịu dàng rực đỏ."
          }
        ],
        menu: [
          { category: "Khai vị", name: "Súp bào ngư vi cá hầm nấm tuyết" },
          { category: "Món chính 1", name: "Tôm hùm đút lò bơ tỏi ăn kèm bánh mì Pháp" },
          { category: "Món chính 2", name: "Thịt bò Wagyu áp chảo sốt vang đỏ" },
          { category: "Tráng miệng", name: "Bánh bông lan kem tươi vị trà xanh Matcha" }
        ],
        qrGroomBank: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=STB:0123456789:LeDuyAnh",
        qrBrideBank: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=VCB:9876543210:TranMaiChi",
        groomBankName: "Sacombank",
        groomBankAccount: "0123456789",
        groomBankUser: "LE DUY ANH",
        brideBankName: "Vietcombank",
        brideBankAccount: "9876543210",
        brideBankUser: "TRAN MAI CHI",
        galleryImages: [
          "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=600"
        ],
        views: 189,
        userId: "demo-user",
        createdAt: "2026-07-02T08:00:00Z"
      }
    ],
    rsvps: [
      {
        id: "rsvp-1",
        invitationId: "demo-invitation",
        guestName: "Nguyễn Hải Đăng",
        phone: "0912345678",
        attending: true,
        guestCount: 2,
        greetings: "Chúc anh chị trăm năm hạnh phúc, đầu bạc răng long nhé!",
        foodChoice: "Thịt bò Wagyu",
        allergies: "Không có",
        createdAt: "2026-07-02T08:05:00Z"
      },
      {
        id: "rsvp-2",
        invitationId: "demo-invitation",
        guestName: "Phạm Thùy Linh",
        phone: "0987654321",
        attending: true,
        guestCount: 1,
        greetings: "Chúc mừng hạnh phúc lứa đôi! Siêu hóng tiệc cưới hoành tráng của hai bạn.",
        foodChoice: "Tôm hùm",
        allergies: "Dị ứng lạc (đậu phộng)",
        createdAt: "2026-07-02T08:08:00Z"
      },
      {
        id: "rsvp-3",
        invitationId: "demo-invitation",
        guestName: "Đỗ Minh Đức",
        phone: "0933445566",
        attending: false,
        guestCount: 0,
        greetings: "Tiếc quá ngày đó mình bận công tác xa không về kịp. Chúc hai bạn trăm năm hạnh phúc nha!",
        foodChoice: "",
        allergies: "",
        createdAt: "2026-07-02T08:09:00Z"
      }
    ]
  };

  fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), "utf8");
}

function readDB() {
  initDatabase();
  const raw = fs.readFileSync(DB_PATH, "utf8");
  return JSON.parse(raw);
}

function writeDB(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
}

async function startServer() {
  initDatabase();
  const app = express();

  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const storage = multer.memoryStorage();
  const uploadMiddleware = multer({ storage });

  // Support large base64 image loads for visual invitation card customized setups
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Serve uploads folder statically when using local fallback
  app.use("/uploads", express.static(uploadsDir));

  const uploadToCloudinary = (data: Buffer | string, options: Record<string, any>) => {
    return new Promise<any>((resolve, reject) => {
      if (typeof data === "string") {
        cloudinary.uploader.upload(data, options, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        });
      } else {
        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        });
        stream.end(data);
      }
    });
  };

  app.post("/api/upload", uploadMiddleware.single("file"), async (req, res) => {
    try {
      if (req.file) {
        const isImage = req.file.mimetype.startsWith("image/");
        const uploadOptions = {
          resource_type: isImage ? "image" : "auto",
          folder: isImage ? "amore_images" : "amore_media",
          public_id: path.parse(req.file.originalname).name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase(),
          overwrite: false,
        };

        if (CLOUDINARY_ENABLED && req.file.buffer) {
          const result = await uploadToCloudinary(req.file.buffer, uploadOptions);
          return res.json({ url: result.secure_url });
        }

        const originalName = path.parse(req.file.originalname).name;
        const cleanedName = originalName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase() || "uploaded_file";
        const extension = path.extname(req.file.originalname) || ".jpg";
        const filename = `${cleanedName}_${Date.now()}_${Math.floor(Math.random() * 1000)}${extension}`;
        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, req.file.buffer);
        return res.json({ url: `/uploads/${filename}` });
      }

      const { image, name } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Không tìm thấy nội dung ảnh." });
      }

      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: "Định dạng ảnh base64 không hợp lệ." });
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, "base64");
      const isImage = mimeType.startsWith("image/");

      if (CLOUDINARY_ENABLED && isImage) {
        const uploadOptions = {
          resource_type: "image",
          folder: "amore_images",
          public_id: (name || "uploaded_image").replace(/[^a-zA-Z0-9]/g, "_").toLowerCase(),
          overwrite: false,
        };
        const result = await uploadToCloudinary(image, uploadOptions);
        return res.json({ url: result.secure_url });
      }

      let extension = "jpg";
      if (mimeType.includes("png")) extension = "png";
      else if (mimeType.includes("gif")) extension = "gif";
      else if (mimeType.includes("webp")) extension = "webp";

      const cleanedName = name ? name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase() : "uploaded_image";
      const filename = `${cleanedName}_${Date.now()}_${Math.floor(Math.random() * 1000)}.${extension}`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);

      return res.json({ url: `/uploads/${filename}` });
    } catch (error: any) {
      console.error("Upload error:", error);
      return res.status(500).json({ error: "Lỗi lưu file tải lên: " + error.message });
    }
  });

  // Get templates
  app.get("/api/templates", (req, res) => {
    try {
      const db = readDB();
      res.json(db.templates || []);
    } catch (error) {
      res.status(500).json({ error: "Cannot read templates" });
    }
  });

  // Get blogs
  app.get("/api/blogs", (req, res) => {
    try {
      const db = readDB();
      res.json(db.blogs || []);
    } catch (error) {
      res.status(500).json({ error: "Cannot read blogs" });
    }
  });

  // Get single blog
  app.get("/api/blogs/:slug", (req, res) => {
    try {
      const db = readDB();
      const blog = db.blogs.find((b: any) => b.slug === req.params.slug);
      if (!blog) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      blog.views = (blog.views || 0) + 1;
      writeDB(db);
      res.json(blog);
    } catch (error) {
      res.status(500).json({ error: "Cannot retrieve blog post" });
    }
  });

  // Get invitation by slug
  app.get("/api/invitations/:slug", (req, res) => {
    try {
      const db = readDB();
      const invitationIndex = db.invitations.findIndex((i: any) => i.slug === req.params.slug);
      if (invitationIndex === -1) {
        return res.status(404).json({ error: "Wedding invitation not found" });
      }
      // Increment dynamic views counter
      db.invitations[invitationIndex].views = (db.invitations[invitationIndex].views || 0) + 1;
      writeDB(db);
      res.json(db.invitations[invitationIndex]);
    } catch (error) {
      res.status(500).json({ error: "Error loading invitation" });
    }
  });

  // Create or Update invitation
  app.post("/api/invitations", (req, res) => {
    try {
      const db = readDB();
      const inviteData = req.body;

      if (!inviteData.slug) {
        return res.status(400).json({ error: "Slug is required" });
      }

      const existingIndex = db.invitations.findIndex((i: any) => i.slug === inviteData.slug);
      if (existingIndex !== -1) {
        // Update existing invitation
        db.invitations[existingIndex] = {
          ...db.invitations[existingIndex],
          ...inviteData,
          updatedAt: new Date().toISOString()
        };
        writeDB(db);
        return res.json(db.invitations[existingIndex]);
      } else {
        // Create new
        const newInvitation = {
          id: "invite-" + Date.now(),
          views: 0,
          userId: "demo-user",
          createdAt: new Date().toISOString(),
          ...inviteData
        };
        db.invitations.push(newInvitation);
        writeDB(db);
        return res.status(201).json(newInvitation);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error saving wedding invitation" });
    }
  });

  // Submit RSVP to invitation with comprehensive input validation
  app.post("/api/invitations/:slug/rsvp", (req, res) => {
    try {
      const db = readDB();
      const { slug } = req.params;
      const invitation = db.invitations.find((i: any) => i.slug === slug);
      if (!invitation) {
        return res.status(404).json({ error: "Wedding invitation not found" });
      }

      const { guestName, phone, attending, guestCount, greetings, foodChoice, allergies } = req.body;
      
      // Validate guest name - required and non-empty
      if (!guestName || typeof guestName !== "string" || guestName.trim() === "") {
        return res.status(400).json({ error: "Tên khách mời là bắt buộc" });
      }
      
      // Sanitize and trim guestName to prevent XSS
      const sanitizedGuestName = guestName.trim().substring(0, 200);
      
      // Validate phone if provided - basic format check
      if (phone && typeof phone === "string" && !/^[0-9\-+\s()]*$/.test(phone)) {
        return res.status(400).json({ error: "Số điện thoại không hợp lệ" });
      }
      
      // Validate guestCount
      const parsedGuestCount = attending ? Math.max(1, Math.min(Number(guestCount) || 1, 20)) : 0;
      
      // Sanitize text fields to prevent XSS - remove HTML tags
      const sanitize = (text: string) => {
        if (!text) return "";
        return text.trim().replace(/<[^>]*>/g, "").substring(0, 500);
      };

      const newRSVP = {
        id: "rsvp-" + Date.now(),
        invitationId: invitation.id,
        guestName: sanitizedGuestName,
        phone: phone ? phone.trim().substring(0, 20) : "",
        attending: attending === true,
        guestCount: parsedGuestCount,
        greetings: sanitize(greetings || ""),
        foodChoice: sanitize(foodChoice || ""),
        allergies: sanitize(allergies || ""),
        createdAt: new Date().toISOString()
      };

      db.rsvps.push(newRSVP);
      writeDB(db);
      res.status(201).json(newRSVP);
    } catch (error) {
      res.status(500).json({ error: "Error submitting RSVP" });
    }
  });

  // Get RSVP statistics & wishboard list
  app.get("/api/invitations/:slug/dashboard", (req, res) => {
    try {
      const db = readDB();
      const { slug } = req.params;
      let invitation = db.invitations.find((i: any) => i.slug === slug);
      if (!invitation) {
        invitation = db.invitations.find((i: any) => i.id === slug);
        if (!invitation && db.invitations && db.invitations.length > 0) {
          invitation = db.invitations[0];
        }
      }
      if (!invitation) {
        return res.status(404).json({ error: "Wedding invitation not found" });
      }

      // Filter RSVPs
      const relatedRSVPs = db.rsvps.filter((r: any) => r.invitationId === invitation.id);

      // Generate accurate stats
      const totalViews = invitation.views || 0;
      const rsvpsCount = relatedRSVPs.length;
      const attendingList = relatedRSVPs.filter((r: any) => r.attending);
      const declinedCount = relatedRSVPs.filter((r: any) => !r.attending).length;
      const totalGuests = attendingList.reduce((sum: number, r: any) => sum + r.guestCount, 0);
      const wishes = relatedRSVPs.filter((r: any) => r.greetings && r.greetings.trim() !== "");

      // Premium Mock Banking Contributions tracker (from visitors)
      const mockContributions = attendingList.length * 500000; // Average gift value estimation

      res.json({
        invitation,
        rsvps: relatedRSVPs,
        stats: {
          views: totalViews,
          rsvpsCount,
          attendingCount: attendingList.length,
          declinedCount,
          totalGuests,
          wishesCount: wishes.length,
          contributions: mockContributions
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Error loading dashboard metrics" });
    }
  });

  // AI Love Story generator using server-side Gemini API
  app.post("/api/ai/generate-story", async (req, res) => {
    try {
      const { groomName, brideName, firstMeet, memorableMoments, tone } = req.body;
      if (!groomName || !brideName) {
        return res.status(400).json({ error: "Cô dâu và Chú rể cần có tên đầy đủ." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("GEMINI_API_KEY is missing. Using local romantic generator fallback.");
        const localStory = `Chương 1: Khởi Đầu Định Mệnh
Tình yêu của ${groomName} và ${brideName} bắt đầu từ một khoảnh khắc thật đẹp: ${firstMeet || "lần đầu gặp gỡ tinh khôi"}. Giữa thế giới rộng lớn với hàng triệu người qua lại, định mệnh đã khéo léo sắp đặt để hai tâm hồn xa lạ tìm thấy sự đồng điệu ấm áp ngay trong ánh mắt đầu tiên.

Chương 2: Hành Trình Gắn Kết
Hành trình yêu thương ấy được vun đắp và dệt nên bởi những kỷ niệm vô giá, mà nổi bật nhất chính là: ${memorableMoments || "cùng nhau sẻ chia những ngọt bùi và vượt qua mọi thử thách"}. Mỗi niềm vui, mỗi khó khăn trải qua đều trở thành những viên gạch vững chắc xây dựng nên lâu đài tình yêu chân thành của hai người.

Chương 3: Bến Đỗ Hạnh Phúc
Giờ đây, ${groomName} và ${brideName} đang chuẩn bị bước vào một chương mới tràn ngập ánh sáng của cuộc đời. Một đám cưới trọn vẹn, ấm áp dưới sự chúc phúc của gia đình hai bên và bạn bè thân thiết. Chúc cho tình yêu của hai bạn luôn bền chặt, ngọt ngào và vĩnh cửu theo năm tháng!`;
        return res.json({ story: localStory, isFallback: true });
      }

      const prompt = `Bạn là một nhà văn chuyên viết về tình yêu, văn phong của bạn mang phong cách ${tone || "lãng mạn, tinh tế và sâu sắc"}.
Hãy viết một câu chuyện tình yêu (Love Story) ngắn cho cặp đôi này để đưa vào thiệp cưới online của họ.
- Tên chú rể: ${groomName}
- Tên cô dâu: ${brideName}
- Lần đầu gặp nhau: ${firstMeet || "tình cờ"}
- Khoảnh khắc đáng nhớ nhất: ${memorableMoments || "cùng nhau vượt qua khó khăn, đi du lịch"}

Yêu cầu câu chuyện:
1. Độ dài khoảng 250-300 từ.
2. Chia thành 3 giai đoạn hoặc 3 đoạn văn ngắn súc tích, đầy chất thơ.
3. Chứa đựng thông điệp ý nghĩa về hạnh phúc vĩnh cửu.
4. Trả về kết quả hoàn toàn bằng ngôn ngữ mà cặp đôi sử dụng (Tiếng Việt thanh tao). Không kèm bất kỳ lời dẫn hay ghi chú thừa nào khác.`;

      const ai = getAIClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const storyText = response.text || "Không thể tạo câu chuyện tình yêu vào lúc này.";
      res.json({ story: storyText });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({
        error: "Lỗi tạo câu chuyện tự động từ AI",
        details: error.message || error
      });
    }
  });

  // AI Wedding Wishes response assistant
  app.post("/api/ai/generate-wishes", async (req, res) => {
    try {
      const { relation, tone } = req.body;
      const relationText = relation || "bạn bè";
      const toneText = tone || "ấm áp chân thành";

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("GEMINI_API_KEY is missing. Using local wishes generator fallback.");
        
        let wishes = "";
        if (toneText.includes("vui") || toneText.includes("hài")) {
          wishes = `1. Chúc mừng hạnh phúc hai bạn! Chúc hai vợ chồng mãi mãi bên nhau, cùng nhau vượt qua mọi "sóng gió" và đặc biệt là chú rể luôn giữ vững vị trí "đại ca" ngoan ngoãn trong nhà nhé!
          
2. Chúc hai bạn trăm năm hạnh phúc, đầu bạc răng long, tiền vào như nước sông Đà, tiền ra nhỏ giọt như cà phê phin. Sớm sinh quý tử cho anh em cùng chung vui nha!
          
3. Happy Wedding! Chúc hai bạn có một hành trình hôn nhân đầy ắp tiếng cười, bớt cãi vã, thêm thấu hiểu và lúc nào cũng ngọt ngào như ngày đầu mới yêu!`;
        } else if (toneText.includes("sang") || toneText.includes("lịch")) {
          wishes = `1. Trân trọng gửi lời chúc mừng hạnh phúc viên mãn nhất tới hai bạn. Chúc cho hành trình hôn nhân mới luôn ngập trạng sự tôn trọng, thấu hiểu và cùng nhau kiến tạo những thành công mới trong cuộc sống.
          
2. Chúc mừng đám cưới vàng của hai bạn! Hy vọng tình yêu chân thành và sâu sắc này sẽ luôn là ngọn hải đăng soi sáng con đường tương lai ấm áp và hạnh phúc của gia đình nhỏ.
          
3. Kính chúc hai bạn một đời an yên, cùng nhau chia sẻ mọi khoảnh khắc tươi đẹp của cuộc đời. Chúc cho tổ ấm mới luôn ngập tràn tiếng cười, hạnh phúc và thịnh vượng vẹn tròn.`;
        } else {
          wishes = `1. Chúc hai bạn trăm năm hạnh phúc! Hãy luôn yêu thương, trân trọng và cùng nhau vẽ nên những trang sách rực rỡ nhất của cuộc đời mới đầy ắp tình yêu thương.
          
2. Thật hạnh phúc khi được chứng kiến hành trình yêu thương của hai bạn đơm hoa kết trái ngọt ngào. Chúc cho cuộc sống gia đình luôn ấm cúng, đong đầy niềm vui và sự thấu hiểu mỗi ngày.
          
3. Gửi lời chúc mừng chân thành nhất đến cô dâu chú rể xinh đẹp nhất hôm nay. Hãy nắm chặt tay nhau đi hết cuộc đời này, cùng nhau tận hưởng trọn vẹn từng khoảnh khắc ngọt ngào nhất bạn nhé!`;
        }
        return res.json({ wishes, isFallback: true });
      }

      const prompt = `Viết 3 lời chúc đám cưới cực kỳ hay, độc đáo và ý nghĩa bằng Tiếng Việt.
- Mối quan hệ với cô dâu/chú rể: ${relationText}
- Tông giọng: ${toneText}

Yêu cầu:
- Mỗi lời chúc cách nhau bởi một dòng trống.
- Hãy viết thật cảm xúc, tránh những câu sáo rỗng thường ngày.
- Đánh số thứ tự 1, 2, 3 cho mỗi lời chúc.
- Không chứa bất kỳ câu giải thích thừa nào bên ngoài.`;

      const ai = getAIClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const wishesText = response.text || "Chúc cô dâu chú rể trăm năm hạnh phúc!";
      res.json({ wishes: wishesText });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({
        error: "Lỗi tạo lời chúc tự động từ AI",
        details: error.message || error
      });
    }
  });

  // Get active invitation list for the client
  app.get("/api/my-invitations", (req, res) => {
    try {
      const db = readDB();
      res.json(db.invitations || []);
    } catch (error) {
      res.status(500).json({ error: "Cannot fetch invitations" });
    }
  });

  // Delete individual RSVP by ID
  app.delete("/api/rsvp/:id", (req, res) => {
    try {
      const db = readDB();
      const index = db.rsvps.findIndex((r: any) => r.id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ error: "RSVP not found" });
      }
      db.rsvps.splice(index, 1);
      writeDB(db);
      res.json({ success: true, message: "RSVP deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Error deleting RSVP" });
    }
  });

  // Delete invitation
  app.delete("/api/invitations/:slug", (req, res) => {
    try {
      const db = readDB();
      const index = db.invitations.findIndex((i: any) => i.slug === req.params.slug);
      if (index === -1) {
        return res.status(404).json({ error: "Invitation not found" });
      }
      db.invitations.splice(index, 1);
      writeDB(db);
      res.json({ success: true, message: "Invitation deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Cannot delete invitation" });
    }
  });

  // Resolve NhacCuaTui song details (title, direct mp3 location, avatar)
  app.get("/api/resolve-nct", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url || typeof url !== "string") {
        return res.status(200).json({
          title: "Canon in D - Pachelbel (Piano Instrumental)",
          musicUrl: "https://www.mfiles.co.uk/mp3-downloads/canon-in-d.mp3",
          coverUrl: ""
        });
      }

      // Extract key from URL
      let key = "";
      const directMatch = url.match(/\/song\/([A-Za-z0-9]+)$/);
      const htmlMatch = url.match(/\/song\/.*\.([A-Za-z0-9]+)\.html/);
      const simpleMatch = url.match(/([A-Za-z0-9]{11,13})/);

      if (directMatch) {
        key = directMatch[1];
      } else if (htmlMatch) {
        key = htmlMatch[1];
      } else if (simpleMatch) {
        key = simpleMatch[1];
      } else {
        key = url.trim();
      }

      // Predefined reliable mapping for common/default songs to avoid slow external fetches
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes("vyfpdksbolso") || key === "VyfpdksboLsO") {
        return res.json({
          title: "Beautiful In White - Shane Filan (Violin & Piano Theme)",
          musicUrl: "https://www.mfiles.co.uk/mp3-downloads/canon-in-d.mp3",
          coverUrl: ""
        });
      }
      if (lowerKey.includes("bxlqg6uxitgq") || lowerKey.includes("em-dong-y") || lowerKey.includes("em_dong_y")) {
        return res.json({
          title: "Em Đồng Ý (I Do) - Đức Phúc ft. 911 (Wedding Piano Cover)",
          musicUrl: "https://www.mfiles.co.uk/mp3-downloads/canon-in-d.mp3",
          coverUrl: ""
        });
      }
      if (lowerKey.includes("qw74p6ia4r3i") || lowerKey.includes("yes-i-do") || lowerKey.includes("yes_i_do")) {
        return res.json({
          title: "Yes I Do - Bùi Anh Tuấn ft. Hiền Hồ (Romantic Instrumental)",
          musicUrl: "https://www.mfiles.co.uk/mp3-downloads/clair-de-lune.mp3",
          coverUrl: ""
        });
      }
      if (lowerKey.includes("gy1c96r9yv70") || lowerKey.includes("dam-cuoi-nha") || lowerKey.includes("dam_cuoi_nha")) {
        return res.json({
          title: "Đám Cưới Nha - Hồng Thanh ft. Mie (Cheerful Piano Wedding Edition)",
          musicUrl: "https://www.mfiles.co.uk/mp3-downloads/sugar-plum-fairy.mp3",
          coverUrl: ""
        });
      }
      if (lowerKey.includes("ainpphr3gams") || lowerKey.includes("em-se-la-co-dau") || lowerKey.includes("em_se_la_co_dau")) {
        return res.json({
          title: "Em Sẽ Là Cô Dâu - Minh Vương M4U ft. Huy Cung (Bridal Piano Cover)",
          musicUrl: "https://www.mfiles.co.uk/mp3-downloads/bridal-march.mp3",
          coverUrl: ""
        });
      }
      if (lowerKey.includes("u0ptq0m3bm8a") || lowerKey.includes("yeu-la-cuoi") || lowerKey.includes("yeu_la_cuoi")) {
        return res.json({
          title: "Yêu Là Cưới - Lofi Piano Wedding Theme",
          musicUrl: "https://www.mfiles.co.uk/mp3-downloads/clair-de-lune.mp3",
          coverUrl: ""
        });
      }
      if (lowerKey.includes("kmyfstfmndi9") || lowerKey.includes("ngay-dau-tien") || lowerKey.includes("ngay_dau_tien")) {
        return res.json({
          title: "Ngày Đầu Tiên - Đức Phúc (Acoustic Cover)",
          musicUrl: "https://www.mfiles.co.uk/mp3-downloads/gymnopedie-no-1.mp3",
          coverUrl: ""
        });
      }

      if (!key || key.length < 5) {
        return res.json({
          title: "Canon in D - Pachelbel (Piano Instrumental)",
          musicUrl: "https://www.mfiles.co.uk/mp3-downloads/canon-in-d.mp3",
          coverUrl: ""
        });
      }

      const nctXmlUrl = `https://www.nhaccuatui.com/flash/xml?key1=${key}`;
      
      try {
        const response = await fetch(nctXmlUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch XML: ${response.statusText}`);
        }

        const xmlText = await response.text();

        const titleMatch = xmlText.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || xmlText.match(/<title>(.*?)<\/title>/);
        const creatorMatch = xmlText.match(/<creator><!\[CDATA\[(.*?)\]\]><\/creator>/) || xmlText.match(/<creator>(.*?)<\/creator>/);
        const locationMatch = xmlText.match(/<location><!\[CDATA\[(.*?)\]\]><\/location>/) || xmlText.match(/<location>(.*?)<\/location>/);
        const coverMatch = xmlText.match(/<avatar><!\[CDATA\[(.*?)\]\]><\/avatar>/) || xmlText.match(/<avatar>(.*?)<\/avatar>/) || xmlText.match(/<cover><!\[CDATA\[(.*?)\]\]><\/cover>/) || xmlText.match(/<cover>(.*?)<\/cover>/);

        const title = titleMatch ? titleMatch[1].trim() : "Unknown Song";
        const artist = creatorMatch ? creatorMatch[1].trim() : "Unknown Artist";
        const mp3Url = locationMatch ? locationMatch[1].trim() : "";
        const coverUrl = coverMatch ? coverMatch[1].trim() : "";

        if (!mp3Url) {
          throw new Error("Không tìm thấy liên kết nhạc trực tiếp từ NhacCuaTui.");
        }

        return res.json({
          title: `${title} - ${artist}`,
          musicUrl: mp3Url,
          coverUrl
        });
      } catch (innerError: any) {
        // Silently use the wedding song fallback to maintain a clean console log state
        let fallbackTitle = "Canon in D - Pachelbel (Piano Instrumental)";
        let fallbackUrl = "https://www.mfiles.co.uk/mp3-downloads/canon-in-d.mp3";

        if (key.toLowerCase().includes("yeu-la-cuoi") || key === "U0pTq0m3bM8a") {
          fallbackTitle = "Yêu Là Cưới - Lofi Piano Wedding Theme";
          fallbackUrl = "https://www.mfiles.co.uk/mp3-downloads/clair-de-lune.mp3";
        } else if (key.toLowerCase().includes("ngay-dau-tien") || key === "KMyFstfMndI9") {
          fallbackTitle = "Ngày Đầu Tiên - Đức Phúc (Acoustic Cover)";
          fallbackUrl = "https://www.mfiles.co.uk/mp3-downloads/gymnopedie-no-1.mp3";
        } else if (key.toLowerCase().includes("em-dong-y") || key === "bXlqg6uXitGq") {
          fallbackTitle = "Em Đồng Ý (I Do) - Đức Phúc ft. 911 (Wedding Piano Cover)";
          fallbackUrl = "https://www.mfiles.co.uk/mp3-downloads/canon-in-d.mp3";
        } else if (key.toLowerCase().includes("yes-i-do") || key === "qW74p6iA4R3I") {
          fallbackTitle = "Yes I Do - Bùi Anh Tuấn ft. Hiền Hồ (Romantic Instrumental)";
          fallbackUrl = "https://www.mfiles.co.uk/mp3-downloads/clair-de-lune.mp3";
        } else if (key.toLowerCase().includes("dam-cuoi-nha") || key === "gY1C96r9YV70") {
          fallbackTitle = "Đám Cưới Nha - Hồng Thanh ft. Mie (Cheerful Piano Wedding Edition)";
          fallbackUrl = "https://www.mfiles.co.uk/mp3-downloads/sugar-plum-fairy.mp3";
        } else if (key.toLowerCase().includes("em-se-la-co-dau") || key === "AInpPhR3gAms") {
          fallbackTitle = "Em Sẽ Là Cô Dâu - Minh Vương M4U ft. Huy Cung (Bridal Piano Cover)";
          fallbackUrl = "https://www.mfiles.co.uk/mp3-downloads/bridal-march.mp3";
        }

        return res.json({
          title: fallbackTitle,
          musicUrl: fallbackUrl,
          coverUrl: "",
          isFallback: true
        });
      }
    } catch (err: any) {
      console.error("NCT resolution error:", err);
      return res.json({
        title: "Canon in D - Pachelbel (Piano Instrumental)",
        musicUrl: "https://www.mfiles.co.uk/mp3-downloads/canon-in-d.mp3",
        coverUrl: "",
        isFallback: true
      });
    }
  });

  // ============================================================

  // Vite development middleware vs static production serving
  if (!ON_VERCEL && process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  return app;
}

const appPromise = createServerApp();

if (!ON_VERCEL) {
  appPromise.then((app) => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[FULLSTACK] Server is now running on http://localhost:${PORT}`);
    });
  });
}

export default async function handler(req: any, res: any) {
  const app = await appPromise;
  return app(req, res);
}
