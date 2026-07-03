/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  X, Copy, Check, Share2, Facebook, QrCode, ExternalLink, Send, ArrowRight, Sparkles, FileDown, Download 
} from "lucide-react";
import { Template, WeddingInvitation } from "../types";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  groomName: string;
  brideName: string;
  invite?: WeddingInvitation | null;
}

export default function ShareModal({ isOpen, onClose, slug, groomName, brideName, invite }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [localInvite, setLocalInvite] = useState<WeddingInvitation | null>(invite || null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const currentInvite = invite || localInvite;
  const liveLinkUrl = `${window.location.origin}/?id=${slug}`;
  const shareUrl = liveLinkUrl;
  const actualDevUrl = liveLinkUrl;
  const isDraft = !currentInvite || !currentInvite.createdAt || currentInvite.id?.startsWith("my-invitation");

  useEffect(() => {
    if (invite) {
      setLocalInvite(invite);
      return;
    }

    if (slug && isOpen) {
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

  useEffect(() => {
    if (!isOpen) return;

    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTemplates(data);
          if (currentInvite?.templateId) {
            const matched = data.find((tpl: Template) => tpl.id === currentInvite.templateId);
            setSelectedTemplate(matched || null);
          }
        }
      })
      .catch((err) => console.error("Error loading templates for export:", err));
  }, [isOpen, currentInvite?.templateId]);

  useEffect(() => {
    if (!currentInvite?.templateId || templates.length === 0) return;
    const matched = templates.find((tpl) => tpl.id === currentInvite.templateId);
    setSelectedTemplate(matched || null);
  }, [currentInvite?.templateId, templates]);

  if (!isOpen) return null;

  // Pre-configured message for sharing
  const shareMessage = `Trân trọng kính mời quý khách tới dự lễ thành hôn của hai chúng tôi: ${groomName} & ${brideName}. Vui lòng mở thiệp điện tử của chúng tôi dưới đây để xem chi tiết thông tin sự kiện, thực đơn và gửi phản hồi RSVP nhé: ${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(liveLinkUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      if (isDraft) {
        alert("Lưu ý: liên kết chỉ hoạt động khi thiệp đã được lưu vào hệ thống. Bạn vẫn có thể sao chép để dùng sau.");
      }
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const handleOpenLiveLink = () => {
    if (isDraft) {
      alert("Thiệp hiện tại chưa lưu. Vui lòng lưu trước khi mở đường dẫn trực tiếp.");
      return;
    }
    window.open(liveLinkUrl, "_blank");
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
    const chosenTemplate = selectedTemplate || {
      id: "tpl-fallback",
      name: "Fallback Template",
      category: "modern",
      theme: "Thiệp mẫu",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      primaryColor: "#f43f5e",
      backgroundColor: "#fff1f2",
      textColor: "#292524",
      cardStyle: "",
      coverImage: inviteData.galleryImages?.[0] || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
      description: "Thiệp mẫu khởi tạo"
    };

    const templateHeroImage = chosenTemplate.coverImage || inviteData.galleryImages?.[0] || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800";
    const storyHtml = (inviteData.loveStory || []).map((s: any) => `
      <div style="position: relative; padding-left: 2rem; border-left: 1px solid ${chosenTemplate.primaryColor}; margin-bottom: 1.5rem;">
        <div style="position: absolute; left: -0.5rem; top: 0.25rem; width: 1rem; height: 1rem; background-color: ${chosenTemplate.primaryColor}; border-radius: 9999px; box-shadow: 0 0 0 4px rgba(255,255,255,0.5);"></div>
        <span style="font-size: 0.75rem; font-weight: 700; color: ${chosenTemplate.primaryColor}; letter-spacing: 0.05em; font-family: monospace;">${s.year || ""}</span>
        <h4 style="font-family: '${chosenTemplate.fontHeading}', serif; font-size: 1.125rem; font-weight: 700; color: ${chosenTemplate.textColor}; margin-top: 0.125rem; margin-bottom: 0.25rem;">${s.title || ""}</h4>
        <p style="color: ${chosenTemplate.textColor}; font-size: 0.875rem; line-height: 1.6; margin: 0;">${s.description || ""}</p>
      </div>
    `).join("");

    const menuHtml = (inviteData.menu || []).map((m: any) => `
      <div style="display: flex; flex-direction: column; border-bottom: 1px solid rgba(15, 23, 42, 0.08); padding-bottom: 0.75rem; margin-bottom: 0.75rem;">
        <span style="font-size: 0.65rem; font-weight: 700; color: ${chosenTemplate.primaryColor}; text-transform: uppercase; letter-spacing: 0.1em;">${m.category || ""}</span>
        <h5 style="color: ${chosenTemplate.textColor}; font-size: 0.95rem; font-weight: 600; margin: 0.125rem 0 0 0;">${m.name || ""}</h5>
      </div>
    `).join("");

    const galleryHtml = (inviteData.galleryImages || []).map((img: any) => `
      <div style="position: relative; aspect-ratio: 3/4; border-radius: 1rem; overflow: hidden; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); border: 1px solid rgba(15, 23, 42, 0.08); cursor: pointer;" onclick="openLightbox('${img}')">
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
      min-height: 100vh;
      margin: 0;
      background: ${chosenTemplate.backgroundColor};
      color: ${chosenTemplate.textColor};
      font-family: '${chosenTemplate.fontBody}', Inter, sans-serif;
    }
    .font-serif { font-family: '${chosenTemplate.fontHeading}', serif; }
    .hero-bg { background-image: linear-gradient(180deg, rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.9)), url('${templateHeroImage}'); }
    .text-primary { color: ${chosenTemplate.primaryColor}; }
    .card { border-radius: 2rem; box-shadow: 0 24px 80px rgba(15, 23, 42, 0.12); border: 1px solid rgba(15, 23, 42, 0.08); }
    .tag-pill { background: rgba(249, 115, 22, 0.1); color: #c2410c; }
    .section-divider { height: 4px; width: 80px; background: ${chosenTemplate.primaryColor}; border-radius: 9999px; }
    .button-primary { background: ${chosenTemplate.primaryColor}; color: white; }
    .button-primary:hover { opacity: 0.92; }
  </style>
</head>
<body>
  <div class="min-h-screen px-4 py-10 lg:px-8">
    <div class="mx-auto max-w-5xl space-y-10">

      <div class="card overflow-hidden">
        <div class="hero-bg relative bg-cover bg-center py-20 px-6 sm:px-12">
          <div class="absolute inset-0 bg-black/40"></div>
          <div class="relative z-10 text-center text-white space-y-4">
            <span class="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.35em] text-white/80">${chosenTemplate.theme || 'Thiệp mẫu'}</span>
            <h1 class="font-serif text-4xl sm:text-5xl font-black tracking-tight">${groom} <span class="text-primary">&</span> ${bride}</h1>
            <p class="mx-auto max-w-2xl text-sm sm:text-base leading-relaxed text-white/90">${inviteData.description || 'Chúng tôi hân hạnh kính mời quý khách tham dự một buổi lễ đầy yêu thương và ấm áp.'}</p>
            <div class="mx-auto mt-8 inline-flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
              <div class="rounded-3xl bg-white/10 px-5 py-3 text-sm font-semibold backdrop-blur-sm border border-white/10">${dateStr} · ${timeStr}</div>
              <div class="rounded-3xl bg-white/10 px-5 py-3 text-sm font-semibold backdrop-blur-sm border border-white/10">${venue}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <div class="space-y-8">
          <section class="card bg-white p-8">
            <div class="flex flex-col gap-4">
              <div>
                <span class="text-[11px] uppercase tracking-[0.35em] text-stone-500">Lời mời</span>
                <h2 class="mt-3 font-serif text-3xl font-bold text-stone-900">Trân trọng kính mời</h2>
              </div>
              <p class="text-sm leading-7 text-stone-600">${inviteData.description || 'Chúng tôi hân hạnh kính mời quý khách đến dự lễ cưới của chúng tôi để chung vui cùng gia đình và chia sẻ khoảnh khắc trọn vẹn yêu thương.'}</p>
            </div>
          </section>

          <section class="card bg-white p-8">
            <div class="flex items-center justify-between gap-4">
              <div>
                <span class="text-[11px] uppercase tracking-[0.35em] text-stone-500">Thời gian & địa điểm</span>
                <h3 class="mt-2 text-xl font-semibold text-stone-900">Thông tin buổi lễ</h3>
              </div>
              <div class="section-divider"></div>
            </div>
            <div class="mt-6 grid gap-4 sm:grid-cols-2">
              <div class="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                <h4 class="text-sm font-semibold text-stone-900">Ngày giờ</h4>
                <p class="mt-2 text-sm text-stone-600">${dateStr} · ${timeStr}</p>
              </div>
              <div class="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                <h4 class="text-sm font-semibold text-stone-900">Địa điểm</h4>
                <p class="mt-2 text-sm text-stone-600">${venue}</p>
                <p class="mt-1 text-sm text-stone-500">${address}</p>
              </div>
            </div>
          </section>

          ${inviteData.loveStory && inviteData.loveStory.length > 0 ? `
            <section class="card bg-white p-8">
              <div>
                <span class="text-[11px] uppercase tracking-[0.35em] text-stone-500">Hành trình yêu thương</span>
                <h3 class="mt-2 text-xl font-semibold text-stone-900">Câu chuyện của hai chúng tôi</h3>
              </div>
              <div class="mt-6 space-y-4">
                ${storyHtml}
              </div>
            </section>
          ` : ''}

          ${inviteData.menu && inviteData.menu.length > 0 ? `
            <section class="card bg-white p-8">
              <div>
                <span class="text-[11px] uppercase tracking-[0.35em] text-stone-500">Thực đơn tiệc cưới</span>
                <h3 class="mt-2 text-xl font-semibold text-stone-900">Món ngon cho ngày vui</h3>
              </div>
              <div class="mt-6 space-y-4">
                ${menuHtml}
              </div>
            </section>
          ` : ''}
        </div>

        <aside class="space-y-6">
          <section class="card bg-white p-6">
            <span class="text-[11px] uppercase tracking-[0.35em] text-stone-500">Cặp đôi</span>
            <h3 class="mt-2 text-2xl font-semibold text-stone-900">${groom} & ${bride}</h3>
            <p class="mt-3 text-sm text-stone-600">${inviteData.hashtag ? `Hashtag ngày vui: <strong>${inviteData.hashtag}</strong>` : 'Không có hashtag mẫu.'}</p>
          </section>

          ${inviteData.musicUrl ? `
            <section class="card bg-white p-6">
              <span class="text-[11px] uppercase tracking-[0.35em] text-stone-500">Nhạc nền</span>
              <h3 class="mt-2 text-xl font-semibold text-stone-900">${inviteData.musicTitle || 'Nhạc nền thiệp'}</h3>
              <audio controls class="mt-4 w-full rounded-3xl border border-stone-200 shadow-sm">
                <source src="${inviteData.musicUrl}" />
                Trình duyệt của bạn không hỗ trợ phần tử audio.
              </audio>
            </section>
          ` : ''}

          ${(inviteData.groomBankName || inviteData.brideBankName) ? `
            <section class="card bg-white p-6">
              <span class="text-[11px] uppercase tracking-[0.35em] text-stone-500">Quà mừng</span>
              <h3 class="mt-2 text-xl font-semibold text-stone-900">Thông tin chuyển khoản</h3>
              <div class="mt-4 space-y-4">
                ${inviteData.groomBankName ? `
                  <div class="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                    <p class="text-xs uppercase tracking-[0.25em] text-stone-500">Nhà trai</p>
                    <p class="mt-2 text-sm text-stone-800 font-semibold">${inviteData.groomBankUser}</p>
                    <p class="text-xs text-stone-500">${inviteData.groomBankName}: ${inviteData.groomBankAccount}</p>
                  </div>
                ` : ''}
                ${inviteData.brideBankName ? `
                  <div class="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                    <p class="text-xs uppercase tracking-[0.25em] text-stone-500">Nhà gái</p>
                    <p class="mt-2 text-sm text-stone-800 font-semibold">${inviteData.brideBankUser}</p>
                    <p class="text-xs text-stone-500">${inviteData.brideBankName}: ${inviteData.brideBankAccount}</p>
                  </div>
                ` : ''}
              </div>
            </section>
          ` : ''}
        </aside>
      </div>

      ${inviteData.galleryImages && inviteData.galleryImages.length > 0 ? `
        <section class="card bg-white p-8">
          <div class="flex items-center justify-between gap-4">
            <div>
              <span class="text-[11px] uppercase tracking-[0.35em] text-stone-500">Ảnh cưới</span>
              <h3 class="mt-2 text-xl font-semibold text-stone-900">Khoảnh khắc tình yêu</h3>
            </div>
            <div class="section-divider"></div>
          </div>
          <div class="mt-6 grid gap-4 sm:grid-cols-3">
            ${galleryHtml}
          </div>
        </section>
      ` : ''}

    </div>
  </div>

  <div id="lightbox" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/90 p-4">
    <img id="lightbox-img" src="" alt="Zoomed view" class="max-w-full max-h-[90vh] rounded-3xl object-contain" />
  </div>

  <script>
    function openLightbox(url) {
      const lightbox = document.getElementById('lightbox');
      const img = document.getElementById('lightbox-img');
      img.src = url;
      lightbox.classList.remove('hidden');
    }
    function closeLightbox() {
      document.getElementById('lightbox').classList.add('hidden');
    }
    document.getElementById('lightbox').addEventListener('click', closeLightbox);

    const weddingDateTime = new Date('${dateStr}T${timeStr}:00').getTime();
    function updateTimer() {
      const now = new Date().getTime();
      const distance = weddingDateTime - now;
      if (distance < 0) {
        ['days','hours','minutes','seconds'].forEach((id) => document.getElementById('offline-' + id).innerText = '00');
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
    updateTimer();
    setInterval(updateTimer, 1000);
  </script>
</body>
</html>`;
  };

  const handleDownloadOfflineHTML = () => {
    if (!currentInvite) {
      alert("Đang tải dữ liệu thiệp cưới, vui lòng thử lại sau giây lát!");
      return;
    }
    const htmlContent = generateOfflineHTML(currentInvite);
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
                value={liveLinkUrl}
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

          {/* Current invitation summary */}
          {currentInvite && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Tóm tắt thiệp hiện tại</span>
                {isDraft && (
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded-full uppercase tracking-[0.2em] font-semibold">
                    Chưa lưu
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-[12px] text-stone-700">
                <div className="space-y-1">
                  <div className="font-semibold text-stone-900">Ngày</div>
                  <div>{currentInvite.weddingDate || "Chưa có"}</div>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-stone-900">Giờ</div>
                  <div>{currentInvite.weddingTime || "Chưa có"}</div>
                </div>
                <div className="col-span-2 space-y-1">
                  <div className="font-semibold text-stone-900">Địa điểm</div>
                  <div>{currentInvite.venueName || "Chưa có"}</div>
                  <div className="text-stone-500 text-[11px]">{currentInvite.venueAddress || "Chưa có địa chỉ"}</div>
                </div>
              </div>
              <button
                onClick={handleOpenLiveLink}
                className="w-full py-3 bg-stone-900 text-white rounded-2xl text-xs font-bold hover:bg-stone-800 transition-all"
              >
                Mở đường dẫn xem trực tiếp
              </button>
            </div>
          )}

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
