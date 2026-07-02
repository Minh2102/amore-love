/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  X, Copy, Check, Share2, Facebook, QrCode, ExternalLink, Send, ArrowRight, Sparkles, FileDown, Download 
} from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  groomName: string;
  brideName: string;
  invite?: any;
}

export default function ShareModal({ isOpen, onClose, slug, groomName, brideName, invite }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [localInvite, setLocalInvite] = useState<any>(invite || null);

  useEffect(() => {
    if (invite) {
      setLocalInvite(invite);
    } else if (slug && isOpen) {
      fetch(`/api/invitations/${slug}/dashboard`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.invitation) {
            setLocalInvite(data.invitation);
          }
        })
        .catch((err) => console.error("Error loading invite data for download:", err));
    }
  }, [slug, invite, isOpen]);

  if (!isOpen) return null;

  // Generate the real live link
  const shareUrl = `${window.location.origin}/?id=${slug}`;
  const actualDevUrl = shareUrl;

  // Pre-configured message for sharing
  const shareMessage = `Trân trọng kính mời quý khách tới dự lễ thành hôn của hai chúng tôi: ${groomName} & ${brideName}. Vui lòng mở thiệp điện tử của chúng tôi dưới đây để xem chi tiết thông tin sự kiện, thực đơn và gửi phản hồi RSVP nhé: ${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      alert("Đã sao chép tin nhắn mời kèm liên kết thành công!");
    } catch (err) {
      console.error("Failed to copy message:", err);
    }
  };

  // Offline HTML template generator
  const generateOfflineHTML = (inviteData: any) => {
    const groom = inviteData.groomName || "Chú rể";
    const bride = inviteData.brideName || "Cô dâu";
    const dateStr = inviteData.weddingDate || "";
    const timeStr = inviteData.weddingTime || "11:00";
    const venue = inviteData.venueName || "Nơi tổ chức hôn lễ";
    const address = inviteData.venueAddress || "";
    
    const storyHtml = (inviteData.loveStory || []).map((s: any) => `
      <div style="position: relative; padding-left: 2rem; border-left: 1px solid #fecdd3; margin-bottom: 1.5rem;">
        <div style="position: absolute; left: -0.5rem; top: 0.25rem; width: 1rem; height: 1rem; background-color: #f43f5e; border-radius: 9999px; box-shadow: 0 0 0 4px #fff1f2;"></div>
        <span style="font-size: 0.75rem; font-weight: 700; color: #f43f5e; letter-spacing: 0.05em; font-family: monospace;">${s.year || ""}</span>
        <h4 style="font-family: 'Playfair Display', serif; font-size: 1.125rem; font-weight: 700; color: #292524; margin-top: 0.125rem; margin-bottom: 0.25rem;">${s.title || ""}</h4>
        <p style="color: #57534e; font-size: 0.875rem; line-height: 1.6; margin: 0;">${s.description || ""}</p>
      </div>
    `).join("");

    const menuHtml = (inviteData.menu || []).map((m: any) => `
      <div style="display: flex; flex-direction: column; border-bottom: 1px solid #f5f5f4; padding-bottom: 0.75rem; margin-bottom: 0.75rem;">
        <span style="font-size: 0.65rem; font-weight: 700; color: #fb7185; text-transform: uppercase; letter-spacing: 0.1em;">${m.category || ""}</span>
        <h5 style="color: #292524; font-size: 0.95rem; font-weight: 600; margin: 0.125rem 0 0 0;">${m.name || ""}</h5>
      </div>
    `).join("");

    const galleryHtml = (inviteData.galleryImages || []).map((img: any) => `
      <div style="position: relative; aspect-ratio: 3/4; border-radius: 1rem; overflow: hidden; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); border: 1px solid #f5f5f4; cursor: pointer;" onclick="openLightbox('${img}')">
        <img src="${img}" alt="Wedding Gallery" style="width: 100%; height: 100%; object-fit: cover;">
      </div>
    `).join("");

    const groomBankHtml = inviteData.groomBankName ? `
      <div style="padding: 1.25rem; background-color: #fafaf9; border: 1px solid #f5f5f4; border-radius: 1.25rem; text-align: center;">
        <span style="font-size: 0.75rem; font-weight: 700; color: #f43f5e; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 0.5rem;">Mừng Chú Rể</span>
        <p style="color: #292524; font-size: 0.875rem; font-weight: 600; margin: 0 0 0.25rem 0;">${inviteData.groomBankUser || ""}</p>
        <p style="color: #78716c; font-size: 0.75rem; font-family: monospace; margin: 0 0 0.5rem 0;">${inviteData.groomBankName || ""}: ${inviteData.groomBankAccount || ""}</p>
        ${inviteData.qrGroomBank ? `<img src="${inviteData.qrGroomBank}" style="width: 9rem; height: 9rem; margin: 0.5rem auto 0 auto; border-radius: 0.75rem; border: 1px solid #e7e5e4;" />` : ''}
      </div>
    ` : '';

    const brideBankHtml = inviteData.brideBankName ? `
      <div style="padding: 1.25rem; background-color: #fafaf9; border: 1px solid #f5f5f4; border-radius: 1.25rem; text-align: center;">
        <span style="font-size: 0.75rem; font-weight: 700; color: #f43f5e; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 0.5rem;">Mừng Cô Dâu</span>
        <p style="color: #292524; font-size: 0.875rem; font-weight: 600; margin: 0 0 0.25rem 0;">${inviteData.brideBankUser || ""}</p>
        <p style="color: #78716c; font-size: 0.75rem; font-family: monospace; margin: 0 0 0.5rem 0;">${inviteData.brideBankName || ""}: ${inviteData.brideBankAccount || ""}</p>
        ${inviteData.qrBrideBank ? `<img src="${inviteData.qrBrideBank}" style="width: 9rem; height: 9rem; margin: 0.5rem auto 0 auto; border-radius: 0.75rem; border: 1px solid #e7e5e4;" />` : ''}
      </div>
    ` : '';

    return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thiệp Cưới Điện Tử - ${groom} & ${bride}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Outfit:wght@100..900&family=Inter:wght@100..900&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', sans-serif;
    }
    .font-serif {
      font-family: 'Playfair Display', serif;
    }
    .font-sans-outfit {
      font-family: 'Outfit', sans-serif;
    }
  </style>
</head>
<body class="bg-stone-50/70 text-stone-700 min-h-screen">
  
  <!-- Outer Floating Heart Animation Particles -->
  <div class="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-20">
    <div class="absolute top-10 left-10 w-4 h-4 bg-rose-400 rounded-full animate-bounce" style="animation-duration: 3s"></div>
    <div class="absolute top-1/3 right-12 w-3 h-3 bg-rose-400 rounded-full animate-bounce" style="animation-duration: 5s"></div>
    <div class="absolute bottom-1/4 left-16 w-5 h-5 bg-rose-400 rounded-full animate-bounce" style="animation-duration: 4s"></div>
  </div>

  <div class="relative z-10 max-w-xl mx-auto px-4 py-8 space-y-8">
    
    <!-- HEADER INTRO CARD -->
    <div class="bg-white rounded-[32px] p-6 text-center border border-stone-200 shadow-xl space-y-4">
      <span class="text-xs font-bold text-rose-500 uppercase tracking-widest block">Trân Trọng Kính Mời</span>
      <h1 class="font-serif text-3xl sm:text-4xl font-black text-stone-800 tracking-wide">
        ${groom} <span class="text-rose-500">&</span> ${bride}
      </h1>
      <p class="text-stone-500 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
        Kính mời quý khách tới tham dự lễ thành hôn chung vui cùng gia đình và chúc phúc cho đôi bạn trẻ chúng tôi!
      </p>

      <!-- Countdown segment -->
      <div class="grid grid-cols-4 gap-2 pt-2 max-w-sm mx-auto font-sans-outfit">
        <div class="bg-rose-50 border border-rose-100 p-2.5 rounded-xl text-center shadow-inner">
          <span id="offline-days" class="block text-xl font-bold text-rose-600">00</span>
          <span class="text-[9px] text-stone-500 uppercase font-bold tracking-wider">Ngày</span>
        </div>
        <div class="bg-rose-50 border border-rose-100 p-2.5 rounded-xl text-center shadow-inner">
          <span id="offline-hours" class="block text-xl font-bold text-rose-600">00</span>
          <span class="text-[9px] text-stone-500 uppercase font-bold tracking-wider">Giờ</span>
        </div>
        <div class="bg-rose-50 border border-rose-100 p-2.5 rounded-xl text-center shadow-inner">
          <span id="offline-minutes" class="block text-xl font-bold text-rose-600">00</span>
          <span class="text-[9px] text-stone-500 uppercase font-bold tracking-wider">Phút</span>
        </div>
        <div class="bg-rose-50 border border-rose-100 p-2.5 rounded-xl text-center shadow-inner">
          <span id="offline-seconds" class="block text-xl font-bold text-rose-600">00</span>
          <span class="text-[9px] text-stone-500 uppercase font-bold tracking-wider">Giây</span>
        </div>
      </div>
    </div>

    <!-- FAMILY DETAIL CARD -->
    <div class="bg-white rounded-[32px] p-6 border border-stone-200 shadow-lg space-y-6">
      <h3 class="font-serif text-xl font-bold text-stone-800 text-center border-b border-stone-100 pb-3">Đại Diện Hai Bên Gia Đình</h3>
      <div class="grid grid-cols-2 gap-4 text-center">
        <!-- Nhà Trai -->
        <div class="space-y-1">
          <span class="text-xs font-bold text-rose-500 uppercase tracking-wider block">Nhà Trai</span>
          <p class="text-xs text-stone-500">Thân phụ: ${inviteData.groomFather || ""}</p>
          <p class="text-xs text-stone-500">Thân mẫu: ${inviteData.groomMother || ""}</p>
          <p class="text-sm font-serif font-bold text-stone-800 mt-2">Chú Rể: ${groom}</p>
        </div>
        <!-- Nhà Gái -->
        <div class="space-y-1">
          <span class="text-xs font-bold text-rose-500 uppercase tracking-wider block">Nhà Gái</span>
          <p class="text-xs text-stone-500">Thân phụ: ${inviteData.brideFather || ""}</p>
          <p class="text-xs text-stone-500">Thân mẫu: ${inviteData.brideMother || ""}</p>
          <p class="text-sm font-serif font-bold text-stone-800 mt-2">Cô Dâu: ${bride}</p>
        </div>
      </div>
    </div>

    <!-- TIME & PLACE EVENT CARD -->
    <div class="bg-white rounded-[32px] p-6 border border-stone-200 shadow-lg space-y-5 text-center">
      <h3 class="font-serif text-xl font-bold text-stone-800 border-b border-stone-100 pb-3">Thời Gian & Địa Điểm</h3>
      
      <div class="space-y-2">
        <p class="text-rose-500 font-serif text-2xl font-bold tracking-wide">${timeStr} - ${dateStr}</p>
        <p class="font-serif text-lg font-bold text-stone-800">${venue}</p>
        <p class="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto">${address}</p>
      </div>

      ${inviteData.googleMapsUrl ? `
        <div class="pt-2">
          <a href="${inviteData.googleMapsUrl}" target="_blank" class="inline-flex items-center gap-1.5 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-full transition-all shadow-md">
            <span>Mở Google Maps</span>
          </a>
        </div>
      ` : ''}
    </div>

    <!-- BACKGROUND MUSIC BOX -->
    ${inviteData.musicUrl ? `
      <div class="bg-rose-500 rounded-[32px] p-5 text-white shadow-lg flex items-center justify-between gap-4">
        <div class="space-y-0.5">
          <span class="text-[9px] font-bold uppercase tracking-wider text-rose-200">Nhạc nền hôn lễ</span>
          <h4 class="text-sm font-bold truncate max-w-[200px] sm:max-w-xs">${inviteData.musicTitle || "Mfiles Instrumental Piano"}</h4>
        </div>
        <audio id="offline-audio" src="${inviteData.musicUrl}" loop></audio>
        <button id="audio-toggle-btn" onclick="toggleAudio()" class="px-4 py-2 bg-white text-rose-500 font-bold text-xs rounded-full transition-all active:scale-95 shadow-sm">
          Phát Nhạc 🎵
        </button>
      </div>
    ` : ''}

    <!-- GALLERY IMAGES -->
    ${inviteData.galleryImages && inviteData.galleryImages.length > 0 ? `
      <div class="bg-white rounded-[32px] p-6 border border-stone-200 shadow-lg space-y-4">
        <h3 class="font-serif text-xl font-bold text-stone-800 text-center border-b border-stone-100 pb-3">Album Ảnh Cưới Của Chúng Mình</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          ${galleryHtml}
        </div>
      </div>
    ` : ''}

    <!-- LOVE STORY TIMELINE -->
    ${inviteData.loveStory && inviteData.loveStory.length > 0 ? `
      <div class="bg-white rounded-[32px] p-6 border border-stone-200 shadow-lg space-y-6">
        <h3 class="font-serif text-xl font-bold text-stone-800 text-center border-b border-stone-100 pb-3">Hành Trình Yêu Thương</h3>
        <div class="space-y-6">
          ${storyHtml}
        </div>
      </div>
    ` : ''}

    <!-- WEDDING MENU -->
    ${inviteData.menu && inviteData.menu.length > 0 ? `
      <div class="bg-white rounded-[32px] p-6 border border-stone-200 shadow-lg space-y-4">
        <h3 class="font-serif text-xl font-bold text-stone-800 text-center border-b border-stone-100 pb-3">Thực Đơn Tiệc Cưới</h3>
        <div class="space-y-4 max-w-sm mx-auto">
          ${menuHtml}
        </div>
      </div>
    ` : ''}

    <!-- GIFT / BANK CONGRATULATIONS -->
    ${(inviteData.groomBankName || inviteData.brideBankName) ? `
      <div class="bg-white rounded-[32px] p-6 border border-stone-200 shadow-lg space-y-5">
        <h3 class="font-serif text-xl font-bold text-stone-800 text-center border-b border-stone-100 pb-3">Hộp Mừng Cưới</h3>
        <p class="text-stone-500 text-xs text-center max-w-xs mx-auto pb-2">
          Sự hiện diện của quý khách là niềm vinh hạnh lớn của hai chúng tôi. Nếu quý khách có nhu cầu gửi quà chúc mừng mừng cưới, xin vui lòng gửi về:
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${groomBankHtml}
          ${brideBankHtml}
        </div>
      </div>
    ` : ''}

    <!-- RSVP BUTTON -->
    <div class="text-center pt-2">
      <button onclick="openRSVP()" class="w-full py-4 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold rounded-full shadow-lg transition-transform active:scale-95 text-sm uppercase tracking-wider">
        Xác Nhận Tham Dự (RSVP)
      </button>
    </div>

  </div>

  <!-- LIGHTBOX IMAGE MODAL -->
  <div id="lightbox" class="fixed inset-0 z-50 hidden bg-black/95 flex items-center justify-center p-4" onclick="closeLightbox()">
    <img id="lightbox-img" src="" alt="Zoomed view" class="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl">
  </div>

  <!-- RSVP OFFLINE MODAL -->
  <div id="rsvp-modal" class="fixed inset-0 z-50 hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-stone-200 text-center space-y-4 shadow-2xl relative">
      <h3 class="font-serif text-2xl font-bold text-stone-800">Xác Nhận Phản Hồi</h3>
      <p class="text-stone-600 text-xs sm:text-sm leading-relaxed">
        Chào bạn! Hiện tại bạn đang mở thiệp cưới ở chế độ <strong>Offline (Không có mạng internet)</strong>.
      </p>
      <div class="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-left space-y-2.5">
        <p class="text-xs font-semibold text-rose-800">Vui lòng liên hệ trực tiếp cho cô dâu hoặc chú rể:</p>
        <ul class="text-stone-700 text-xs space-y-1 font-medium">
          <li>📞 Liên hệ Chú rể: <strong>${inviteData.groomBankAccount ? 'Số tài khoản nhà trai: ' + inviteData.groomBankAccount : 'Đại diện nhà trai'}</strong></li>
          <li>📞 Liên hệ Cô dâu: <strong>${inviteData.brideBankAccount ? 'Số tài khoản nhà gái: ' + inviteData.brideBankAccount : 'Đại diện nhà gái'}</strong></li>
        </ul>
      </div>
      <button onclick="closeRSVP()" class="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-full transition-colors w-full">
        Đóng phản hồi
      </button>
    </div>
  </div>

  <script>
    // Countdown Timer logic
    const weddingDateStr = "${dateStr}";
    const weddingTimeStr = "${timeStr}";
    if (weddingDateStr) {
      const weddingDateTime = new Date(weddingDateStr + "T" + weddingTimeStr + ":00").getTime();
      
      function updateTimer() {
        const now = new Date().getTime();
        const distance = weddingDateTime - now;
        
        if (distance < 0) {
          document.getElementById('offline-days').innerText = "00";
          document.getElementById('offline-hours').innerText = "00";
          document.getElementById('offline-minutes').innerText = "00";
          document.getElementById('offline-seconds').innerText = "00";
          return;
        }
        
        const d = Math.floor(distance / (1000 * 60 * 60 * 24));
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById('offline-days').innerText = String(d).padStart(2, '0');
        document.getElementById('offline-hours').innerText = String(h).padStart(2, '0');
        document.getElementById('offline-minutes').innerText = String(m).padStart(2, '0');
        document.getElementById('offline-seconds').innerText = String(s).padStart(2, '0');
      }
      
      setInterval(updateTimer, 1000);
      updateTimer();
    }

    // Interactive Audio controls
    function toggleAudio() {
      const audio = document.getElementById('offline-audio');
      const btn = document.getElementById('audio-toggle-btn');
      if (!audio) return;
      
      if (audio.paused) {
        audio.play().then(() => {
          btn.innerText = "Tạm Dừng ⏸️";
        }).catch(err => {
          alert("Vui lòng tương tác với trang trước để trình duyệt cho phép phát âm thanh!");
        });
      } else {
        audio.pause();
        btn.innerText = "Phát Nhạc 🎵";
      }
    }

    // Lightbox Modal functions
    function openLightbox(url) {
      const lightbox = document.getElementById('lightbox');
      const img = document.getElementById('lightbox-img');
      img.src = url;
      lightbox.classList.remove('hidden');
    }
    
    function closeLightbox() {
      const lightbox = document.getElementById('lightbox');
      lightbox.classList.add('hidden');
    }

    // RSVP functions
    function openRSVP() {
      document.getElementById('rsvp-modal').classList.remove('hidden');
    }
    function closeRSVP() {
      document.getElementById('rsvp-modal').classList.add('hidden');
    }
  </script>
</body>
</html>`;
  };

  const handleDownloadOfflineHTML = () => {
    if (!localInvite) {
      alert("Đang tải dữ liệu thiệp cưới, vui lòng thử lại sau giây lát!");
      return;
    }
    const htmlContent = generateOfflineHTML(localInvite);
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slug || "thiep-cuoi"}-offline.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Free QR Code generation API using real local dev URL for QR scanning/viewing
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=0f172a&data=${encodeURIComponent(actualDevUrl)}`;

  return (
    <div id="share-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        id="share-modal-container"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden transform transition-all duration-300 scale-100 flex flex-col max-h-[90vh]"
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 h-2 w-full" />
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
          title="Đóng"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Header section */}
          <div className="text-center space-y-1">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
              <Share2 className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-stone-800 pt-2">Xuất Link Gửi Khách</h3>
            <p className="text-stone-500 text-xs sm:text-sm">
              Chia sẻ liên kết thiệp cưới của <span className="font-semibold text-rose-500">{groomName} & {brideName}</span>
            </p>
          </div>

          {/* Quick Share Link Box */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">Đường dẫn liên kết thiệp</label>
            <div className="flex rounded-2xl border border-stone-200 overflow-hidden bg-stone-50 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100 transition-all">
              <input 
                type="text" 
                readOnly 
                value={shareUrl}
                className="flex-1 px-4 py-3 text-xs sm:text-sm text-stone-700 bg-transparent font-mono outline-none"
              />
              <button 
                onClick={handleCopyLink}
                className={`px-5 py-3 font-semibold text-xs transition-colors flex items-center gap-1 shrink-0 ${
                  copied 
                    ? "bg-emerald-500 text-white" 
                    : "bg-rose-500 hover:bg-rose-600 text-white"
                }`}
              >
                {copied ? <Check className="h-4 w-4 animate-bounce" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? "Đã chép!" : "Sao chép"}</span>
              </button>
            </div>
          </div>

          {/* Preset message generator */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                Mẫu tin nhắn mời khách gợi ý
              </span>
              <button 
                onClick={handleCopyMessage}
                className="text-[11px] text-rose-500 hover:text-rose-600 font-bold transition-colors"
              >
                Sao chép tin nhắn
              </button>
            </div>
            <p className="text-stone-600 text-xs leading-relaxed italic bg-white p-3 rounded-xl border border-stone-150">
              "{shareMessage}"
            </p>
          </div>

          {/* Download Offline HTML card section */}
          <div className="bg-gradient-to-r from-rose-50 to-amber-50 p-5 rounded-2xl border border-rose-100/50 space-y-3.5">
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-white rounded-xl text-rose-500 shadow-sm border border-rose-100 shrink-0">
                <FileDown className="h-5 w-5 animate-pulse text-rose-500" />
              </div>
              <div className="space-y-0.5 text-left">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Tải Thiệp Cưới Offline (.html)</h4>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Tải ngay tệp thiệp cưới lộng lẫy dưới dạng <strong>một tệp tin duy nhất (.html)</strong>. Bạn có thể lưu trữ trong điện thoại hoặc gửi cho bạn bè để mở trực tiếp offline không cần kết nối mạng!
                </p>
              </div>
            </div>

            <button 
              onClick={handleDownloadOfflineHTML}
              className="w-full py-3 bg-white hover:bg-stone-50 text-rose-600 border border-rose-200 hover:border-rose-300 font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Tải Xuống Tệp Thiệp Cưới Offline (.html)</span>
            </button>
          </div>

          {/* Share methods shortcuts Grid */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank")}
              className="py-3 px-4 rounded-2xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Facebook className="h-4 w-4" />
              <span>Chia sẻ Facebook</span>
            </button>
            
            <button 
              onClick={() => setShowQR(!showQR)}
              className={`py-3 px-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer ${
                showQR 
                  ? "bg-stone-900 border-stone-900 text-white" 
                  : "bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-700"
              }`}
            >
              <QrCode className="h-4 w-4" />
              <span>{showQR ? "Ẩn Mã QR" : "Tạo Mã QR Code"}</span>
            </button>
          </div>

          {/* QR Code Section */}
          {showQR && (
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center space-y-3 animate-fade-in flex flex-col items-center">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Mã QR Code cho tấm thiệp cưới</span>
              <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-md">
                <img 
                  src={qrCodeUrl} 
                  alt="Wedding Invitation QR Code" 
                  className="w-44 h-44 sm:w-48 sm:h-48 rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="text-[11px] text-stone-500 max-w-xs mx-auto">
                Khách mời có thể trực tiếp dùng camera điện thoại quét mã này để truy cập vào thiệp cưới điện tử của hai bạn ngay lập tức!
              </p>
            </div>
          )}

          {/* Quick guidelines */}
          <div className="border-t border-stone-100 pt-4 text-center">
            <a 
              href={actualDevUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 font-bold hover:underline"
            >
              <span>Xem trực tiếp tấm thiệp của bạn</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
