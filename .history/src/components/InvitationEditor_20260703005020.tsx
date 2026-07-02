/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Sparkles, Save, Eye, RefreshCw, Undo2, Redo2, Plus, Trash2, 
  Heart, Music, AlertCircle, CheckCircle2, Image as ImageIcon, MapPin, Gift, Clock, HelpCircle, Share2,
  Copy, Check, Upload, SlidersHorizontal, Settings, Users, Hourglass, Map, CheckSquare, Shirt, Calendar, BookOpen, Smile, Mail, ChevronDown, ChevronUp
} from "lucide-react";
import { WeddingInvitation, LoveStoryEvent, MenuItem } from "../types";
import { LanguageCode, translations } from "../translations";
import ShareModal from "./ShareModal";

interface InvitationEditorProps {
  selectedTemplateId: string | null;
  onPreviewInvitation: (slug: string) => void;
  lang: LanguageCode;
}

const DEFAULT_INVITATION: WeddingInvitation = {
  id: "my-invitation",
  slug: "dam-cuoi-hanh-phuc",
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
  venueAddress: "Grand Ballroom, 456 Đường Ven Biển, Quận 1, TP. Hồ Chí Minh",
  googleMapsUrl: "https://maps.google.com",
  musicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  musicTitle: "Canon in D - Piano",
  dressCodeColor: "#2563eb",
  dressCodeDescription: "Trang phục lịch sự với màu xanh pastel hoặc be ấm áp.",
  hashtag: "#DuyAnhMaiChi2026",
  loveStory: [
    {
      id: "ls-1",
      year: "2022",
      title: "Lần đầu gặp nhau",
      description: "Quen biết nhau dưới cơn mưa rào của mùa hạ tại quán cafe nhỏ."
    },
    {
      id: "ls-2",
      year: "2024",
      title: "Ngỏ lời yêu",
      description: "Chuyến đi Đà Lạt với lời tỏ tình ngọt ngào dưới ngàn ánh sao."
    }
  ],
  menu: [
    { category: "Khai vị", name: "Súp hải sâm tổ yến và cua biển" },
    { category: "Món chính", name: "Tôm hùm nướng phô mai Pháp đút lò" },
    { category: "Món chính", name: "Thịt thăn bò Úc nướng sốt tiêu đen" },
    { category: "Tráng miệng", name: "Chè yến sào hạt sen tuyết nhĩ" }
  ],
  qrGroomBank: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=STB:0123456789:LeDuyAnh",
  qrBrideBank: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=VCB:9876543210:TranMaiChi",
  groomBankName: "Sacombank",
  groomBankAccount: "0123456789",
  groomBankUser: "LE DUY ANH",
  brideBankName: "Vietcombank",
  brideBankAccount: "9876543210",
  brideBankUser: "TRAN MAI CHI",
  groomAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
  brideAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300",
  galleryImages: [
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=600"
  ],
  views: 0,
  userId: "demo-user",
  createdAt: ""
};

export default function InvitationEditor({ selectedTemplateId, onPreviewInvitation, lang }: InvitationEditorProps) {
  const t = translations[lang];

  // Editor configuration states
  const [form, setForm] = useState<WeddingInvitation>(DEFAULT_INVITATION);
  const [activeTab, setActiveTab] = useState<"basics" | "timeline" | "menu" | "extras" | "ai" | "gallery" | "uiConfig">("basics");
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error" | "loading" | null; msg: string }>({ type: null, msg: "" });
  
  // Accordion section collapse/expand states for the advanced interactive dark-themed layout
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    timeFormat: true,
    limitGuests: false,
    countdown: true,
    address: true,
    map: true,
    rsvp: true,
    dressCode: false,
    timeline: false,
    guestbook: true,
    giftBox: true,
    thankYou: true,
    music: true,
    envelope: true,
    preview: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [newBadWord, setNewBadWord] = useState("");

  const handleQuickCopyLink = async () => {
    try {
      const publicUrl = `${window.location.origin}/?id=${form.slug}`;
      await navigator.clipboard.writeText(publicUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  // Undo/Redo historical stacks
  const [history, setHistory] = useState<WeddingInvitation[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // AI generator inputs
  const [aiMeetInfo, setAiMeetInfo] = useState("");
  const [aiMomentsInfo, setAiMomentsInfo] = useState("");
  const [aiTone, setAiTone] = useState("Lãng mạn, tinh tế và sâu sắc");
  const [aiStatus, setAiStatus] = useState<{ loading: boolean; error: string | null }>({ loading: false, error: null });

  // Local image uploading states
  const [uploadingGroom, setUploadingGroom] = useState(false);
  const [uploadingBride, setUploadingBride] = useState(false);
  const [uploadingAlbum, setUploadingAlbum] = useState(false);

  const readFileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

  const uploadFileToApi = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("name", file.name.split(".")[0] || "image");

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      let message = text;
      try {
        const errorData = JSON.parse(text || "{}");
        message = errorData.error || text;
      } catch {
        // ignore parse error, use raw text
      }
      throw new Error(message || "Lỗi tải ảnh lên");
    }

    const data = await response.json();
    return data.url;
  };

  const getUploadUrl = async (file: File) => {
    try {
      return await uploadFileToApi(file);
    } catch (error: any) {
      console.warn("Upload API fallback active:", error?.message || error);
      return await readFileAsDataUrl(file);
    }
  };

  const handleImageUpload = async (
    file: File,
    fieldName: "groomAvatar" | "brideAvatar" | "album",
    setLoadingState: (loading: boolean) => void
  ) => {
    setLoadingState(true);
    try {
      const uploadedUrl = await getUploadUrl(file);

      if (fieldName === "groomAvatar" || fieldName === "brideAvatar") {
        handleFieldChange(fieldName, uploadedUrl);
      } else if (fieldName === "album") {
        const updatedImages = [...form.galleryImages, uploadedUrl];
        handleFieldChange("galleryImages", updatedImages);
      }
    } catch (error: any) {
      alert("Không thể tải ảnh lên: " + (error.message || error));
    } finally {
      setLoadingState(false);
    }
  };

  // NhacCuaTui resolver states
  const [nctUrl, setNctUrl] = useState("https://www.nhaccuatui.com/song/VyfpdksboLsO");
  const [nctLoading, setNctLoading] = useState(false);
  const [nctError, setNctError] = useState<string | null>(null);

  // Auto-resolve user's custom NhacCuaTui song on load if it's the default song
  useEffect(() => {
    if (form.musicUrl === "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3") {
      setNctLoading(true);
      fetch(`/api/resolve-nct?url=https://www.nhaccuatui.com/song/VyfpdksboLsO`)
        .then((res) => {
          if (!res.ok) throw new Error("Could not resolve default song");
          return res.json();
        })
        .then((data) => {
          setForm((prev) => ({
            ...prev,
            musicUrl: data.musicUrl || "https://www.mfiles.co.uk/mp3-downloads/canon-in-d.mp3",
            musicTitle: data.title || "Beautiful In White - Shane Filan (Piano Theme)"
          }));
          setNctUrl("https://www.nhaccuatui.com/song/VyfpdksboLsO");
          setNctLoading(false);
        })
        .catch((err) => {
          console.warn("Auto-resolve fallback applied:", err);
          // Set beautiful fallback on failure so it never blocks the editor loading state
          setForm((prev) => ({
            ...prev,
            musicUrl: "https://www.mfiles.co.uk/mp3-downloads/canon-in-d.mp3",
            musicTitle: "Beautiful In White - Shane Filan (Violin & Piano Cover)"
          }));
          setNctUrl("https://www.nhaccuatui.com/song/VyfpdksboLsO");
          setNctLoading(false);
        });
    }
  }, []);

  const resolveNctSong = async (customUrl?: string) => {
    const targetUrl = customUrl || nctUrl;
    if (!targetUrl) {
      setNctError("Vui lòng nhập đường dẫn NhacCuaTui.");
      return;
    }
    setNctLoading(true);
    setNctError(null);
    try {
      const response = await fetch(`/api/resolve-nct?url=${encodeURIComponent(targetUrl)}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Không thể tải bài hát. Vui lòng kiểm tra lại liên kết.");
      }
      const data = await response.json();
      setForm((prev) => ({
        ...prev,
        musicUrl: data.musicUrl,
        musicTitle: data.title
      }));
      setNctError(null);
    } catch (err: any) {
      setNctError(err.message || "Lỗi kết nối đến máy chủ.");
    } finally {
      setNctLoading(false);
    }
  };

  // Update selected template
  useEffect(() => {
    if (selectedTemplateId) {
      setForm((prev) => ({
        ...prev,
        templateId: selectedTemplateId
      }));
    }
  }, [selectedTemplateId]);

  // Handle tracking changes for undo/redo state
  const updateForm = (updated: WeddingInvitation) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(updated);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    setForm(updated);
  };

  const handleFieldChange = (field: keyof WeddingInvitation, value: any) => {
    const next = { ...form, [field]: value };
    updateForm(next);
  };

  // Undo operation
  const handleUndo = () => {
    if (historyIndex > 0) {
      const idx = historyIndex - 1;
      setHistoryIndex(idx);
      setForm(history[idx]);
    }
  };

  // Redo operation
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const idx = historyIndex + 1;
      setHistoryIndex(idx);
      setForm(history[idx]);
    }
  };

  // Dynamically manage timeline events
  const addTimelineEvent = () => {
    const newEvent: LoveStoryEvent = {
      id: "ls-" + Date.now(),
      year: "2026",
      title: "Cột mốc mới",
      description: "Mô tả một dấu mốc tình yêu đặc biệt..."
    };
    const next = {
      ...form,
      loveStory: [...form.loveStory, newEvent]
    };
    updateForm(next);
  };

  const removeTimelineEvent = (id: string) => {
    const next = {
      ...form,
      loveStory: form.loveStory.filter((item) => item.id !== id)
    };
    updateForm(next);
  };

  const handleTimelineChange = (id: string, field: keyof LoveStoryEvent, val: string) => {
    const updatedTimeline = form.loveStory.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: val };
      }
      return item;
    });
    const next = { ...form, loveStory: updatedTimeline };
    updateForm(next);
  };

  // Dynamically manage banquet menu items
  const addMenuItem = () => {
    const newItem: MenuItem = {
      category: "Món chính",
      name: "Tên món ăn hấp dẫn..."
    };
    const next = {
      ...form,
      menu: [...form.menu, newItem]
    };
    updateForm(next);
  };

  const removeMenuItem = (index: number) => {
    const next = {
      ...form,
      menu: form.menu.filter((_, idx) => idx !== index)
    };
    updateForm(next);
  };

  const handleMenuItemChange = (index: number, field: keyof MenuItem, val: string) => {
    const updatedMenu = form.menu.map((item, idx) => {
      if (idx === index) {
        return { ...item, [field]: val };
      }
      return item;
    });
    const next = { ...form, menu: updatedMenu };
    updateForm(next);
  };

  // Save changes to JSON DB via REST API
  const handleSave = async () => {
    setSaveStatus({ type: "loading", msg: "Đang lưu trữ dữ liệu lên Cloud..." });
    try {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!response.ok) {
        throw new Error();
      }
      const savedData = await response.json();
      setSaveStatus({ type: "success", msg: t.saveSuccess });
      setTimeout(() => setSaveStatus({ type: null, msg: "" }), 4000);
    } catch (err) {
      setSaveStatus({ type: "error", msg: t.saveFailed });
    }
  };

  // AI-assisted Wedding Story generator (calls `/api/ai/generate-story` on server-side)
  const generateLoveStoryWithAI = async () => {
    setAiStatus({ loading: true, error: null });
    try {
      const response = await fetch("/api/ai/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groomName: form.groomName,
          brideName: form.brideName,
          firstMeet: aiMeetInfo,
          memorableMoments: aiMomentsInfo,
          tone: aiTone
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "AI Server returns bad status");
      }

      const data = await response.json();
      // Inject AI output text directly into timeline details
      const aiTimelineEvent: LoveStoryEvent = {
        id: "ls-ai-" + Date.now(),
        year: "2026",
        title: "Câu Chuyện Tình Yêu (AI)",
        description: data.story
      };
      
      const next = {
        ...form,
        loveStory: [...form.loveStory, aiTimelineEvent]
      };
      updateForm(next);
      setAiStatus({ loading: false, error: null });
    } catch (err: any) {
      console.error(err);
      setAiStatus({ loading: false, error: err.message || "Không thể kết nối với trí tuệ nhân tạo Gemini." });
    }
  };

  return (
    <div id="editor-layout" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Upper header action controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-stone-200 pb-6 mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-800 flex items-center gap-2">
            <span>Thiết kế thiệp cưới của bạn</span>
            <span className="text-xs bg-rose-50 text-rose-500 border border-rose-100 rounded-full px-2.5 py-1 font-sans">Draft</span>
          </h1>
          <p className="mt-1.5 text-stone-600 text-xs sm:text-sm">
            Tùy biến nội dung, sắp xếp hình ảnh, lập danh sách món ăn tiệc và dùng AI sáng tác chuyện tình yêu.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* History Undos */}
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-full border border-stone-200 hover:bg-stone-50 disabled:opacity-40 transition-colors text-stone-600 bg-white"
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-full border border-stone-200 hover:bg-stone-50 disabled:opacity-40 transition-colors text-stone-600 bg-white"
            title="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </button>

          {/* View Live */}
          <button
            onClick={() => onPreviewInvitation(form.slug)}
            className="px-4 py-2 border border-stone-200 text-stone-700 bg-white rounded-full text-xs font-semibold flex items-center gap-1.5 hover:bg-stone-50"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>{t.btnPreview}</span>
          </button>

          {/* Export Share Link */}
          <button
            onClick={() => setIsShareOpen(true)}
            className="px-5 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md active:scale-95 transition-transform"
            title="Xuất đường dẫn liên kết để gửi cho bạn bè, khách mời"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Xuất Link Gửi Khách</span>
          </button>
        </div>
      </div>

      {/* Saving status warning banners */}
      {saveStatus.type && (
        <div className={`p-4 mb-6 rounded-2xl border flex items-center gap-3 animate-fade-in ${
          saveStatus.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
            : saveStatus.type === "loading"
            ? "bg-amber-50 text-amber-800 border-amber-100"
            : "bg-rose-50 text-rose-800 border-rose-100"
        }`}>
          {saveStatus.type === "loading" ? (
            <RefreshCw className="h-5 w-5 animate-spin text-amber-500 shrink-0" />
          ) : saveStatus.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-semibold">{saveStatus.msg}</span>
        </div>
      )}

      {/* Editor Content split columns */}
      <div id="editor-sections" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar Tabs */}
        <div className="lg:col-span-3 space-y-2 bg-white p-4 rounded-3xl border border-stone-200">
          <button
            onClick={() => setActiveTab("basics")}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-left text-xs sm:text-sm font-medium transition-all ${
              activeTab === "basics" 
                ? "bg-rose-500 text-white shadow-md shadow-rose-200 font-semibold" 
                : "text-stone-600 hover:bg-stone-50"
            }`}
          >
            <Heart className="h-4.5 w-4.5" />
            <span>Thông tin cơ bản</span>
          </button>
          <button
            onClick={() => setActiveTab("gallery")}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-left text-xs sm:text-sm font-medium transition-all ${
              activeTab === "gallery" 
                ? "bg-rose-500 text-white shadow-md shadow-rose-200 font-semibold" 
                : "text-stone-600 hover:bg-stone-50"
            }`}
          >
            <ImageIcon className="h-4.5 w-4.5" />
            <span>Album & Ảnh đại diện</span>
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-left text-xs sm:text-sm font-medium transition-all ${
              activeTab === "timeline" 
                ? "bg-rose-500 text-white shadow-md shadow-rose-200 font-semibold" 
                : "text-stone-600 hover:bg-stone-50"
            }`}
          >
            <Clock className="h-4.5 w-4.5" />
            <span>Chuyện tình yêu</span>
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-left text-xs sm:text-sm font-medium transition-all ${
              activeTab === "menu" 
                ? "bg-rose-500 text-white shadow-md shadow-rose-200 font-semibold" 
                : "text-stone-600 hover:bg-stone-50"
            }`}
          >
            <MapPin className="h-4.5 w-4.5" />
            <span>Thực đơn tiệc</span>
          </button>
          <button
            onClick={() => setActiveTab("extras")}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-left text-xs sm:text-sm font-medium transition-all ${
              activeTab === "extras" 
                ? "bg-rose-500 text-white shadow-md shadow-rose-200 font-semibold" 
                : "text-stone-600 hover:bg-stone-50"
            }`}
          >
            <Gift className="h-4.5 w-4.5" />
            <span>Mừng cưới & Nhạc nền</span>
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-left text-xs sm:text-sm font-semibold text-stone-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors`}
          >
            <Sparkles className="h-4.5 w-4.5 text-amber-500 animate-bounce" />
            <span>Trợ lý AI viết văn</span>
          </button>
          <button
            onClick={() => setActiveTab("uiConfig")}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-left text-xs sm:text-sm font-medium transition-all ${
              activeTab === "uiConfig" 
                ? "bg-stone-900 text-white shadow-md font-semibold border border-stone-800" 
                : "text-stone-600 hover:bg-stone-50 bg-stone-50 border border-stone-100"
            }`}
          >
            <SlidersHorizontal className="h-4.5 w-4.5 text-rose-500" />
            <span className="flex-1 flex items-center justify-between">
              <span>Cài đặt & Giao diện</span>
              <span className="bg-rose-500 text-[9px] text-white font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full">New 🔥</span>
            </span>
          </button>
        </div>

        {/* Input Details Panel Form */}
        <div className="lg:col-span-9 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200">
          
          {/* BASICS TAB */}
          {activeTab === "basics" && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl font-bold text-stone-800 border-b border-stone-100 pb-3">{t.groomInfo}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Tên Chú Rể</label>
                  <input
                    type="text"
                    value={form.groomName}
                    onChange={(e) => handleFieldChange("groomName", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-rose-400"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Cha Chú Rể</label>
                  <input
                    type="text"
                    value={form.groomFather}
                    onChange={(e) => handleFieldChange("groomFather", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-rose-400"
                    placeholder="Tên Cha"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Mẹ Chú Rể</label>
                  <input
                    type="text"
                    value={form.groomMother}
                    onChange={(e) => handleFieldChange("groomMother", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-rose-400"
                    placeholder="Tên Mẹ"
                  />
                </div>
              </div>

              <h2 className="font-serif text-xl font-bold text-stone-800 border-b border-stone-100 pb-3 mt-8">{t.brideInfo}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Tên Cô Dâu</label>
                  <input
                    type="text"
                    value={form.brideName}
                    onChange={(e) => handleFieldChange("brideName", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-rose-400"
                    placeholder="Nguyễn Thị B"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Cha Cô Dâu</label>
                  <input
                    type="text"
                    value={form.brideFather}
                    onChange={(e) => handleFieldChange("brideFather", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-rose-400"
                    placeholder="Tên Cha"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Mẹ Cô Dâu</label>
                  <input
                    type="text"
                    value={form.brideMother}
                    onChange={(e) => handleFieldChange("brideMother", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-rose-400"
                    placeholder="Tên Mẹ"
                  />
                </div>
              </div>

              <h2 className="font-serif text-xl font-bold text-stone-800 border-b border-stone-100 pb-3 mt-8">{t.weddingEvent}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Ngày tổ chức</label>
                  <input
                    type="date"
                    value={form.weddingDate}
                    onChange={(e) => handleFieldChange("weddingDate", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-rose-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Giờ hành lễ</label>
                  <input
                    type="time"
                    value={form.weddingTime}
                    onChange={(e) => handleFieldChange("weddingTime", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-rose-400"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Đường dẫn thiệp cưới (slug duy nhất)</label>
                  <div className="flex rounded-xl border border-stone-200 overflow-hidden focus-within:border-rose-400">
                    <span className="bg-stone-50 px-4 py-2.5 text-stone-500 text-xs sm:text-sm border-r border-stone-200 select-none">/wedding/</span>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => handleFieldChange("slug", e.target.value.replace(/\s+/g, '-').toLowerCase())}
                      className="flex-1 px-4 py-2.5 text-xs sm:text-sm focus:outline-none bg-transparent"
                      placeholder="duy-anh-mai-chi"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Tên địa điểm nhà hàng</label>
                  <input
                    type="text"
                    value={form.venueName}
                    onChange={(e) => handleFieldChange("venueName", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-rose-400"
                    placeholder="Khách sạn Melia, Sảnh Ballroom"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Địa chỉ cụ thể</label>
                  <input
                    type="text"
                    value={form.venueAddress}
                    onChange={(e) => handleFieldChange("venueAddress", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-rose-400"
                    placeholder="Số 123 Đường Lý Thường Kiệt, Quận Hoàn Kiếm, Hà Nội"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Google Maps URL chỉ đường</label>
                  <input
                    type="text"
                    value={form.googleMapsUrl}
                    onChange={(e) => handleFieldChange("googleMapsUrl", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-rose-400"
                    placeholder="https://maps.app.goo.gl/..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* GALLERY TAB */}
          {activeTab === "gallery" && (
            <div className="space-y-8">
              {/* Profile Avatars Section */}
              <div>
                <h2 className="font-serif text-xl font-bold text-stone-800 border-b border-stone-100 pb-3 mb-6">Ảnh Đại Diện Cô Dâu & Chú Rể</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Groom Avatar */}
                  <div className="p-5 border border-stone-200 rounded-2xl bg-stone-50/50 flex flex-col sm:flex-row items-center gap-5">
                    <div className="h-24 w-24 rounded-full overflow-hidden shrink-0 border-4 border-white shadow-md bg-stone-200 relative group">
                      <img 
                        src={form.groomAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"} 
                        alt="Groom avatar" 
                        className="w-full h-full object-cover"
                      />
                      {uploadingGroom && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <RefreshCw className="h-5 w-5 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 w-full space-y-2">
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">Ảnh đại diện Chú Rể</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={form.groomAvatar || ""}
                          onChange={(e) => handleFieldChange("groomAvatar", e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg border border-stone-200 bg-white text-xs focus:outline-none focus:border-rose-400"
                          placeholder="Dán link ảnh chú rể hoặc bấm nút bên..."
                        />
                        <label className="px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold text-center cursor-pointer select-none shrink-0 transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                          <Upload className="h-3.5 w-3.5" />
                          <span>Tải ảnh lên</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleImageUpload(e.target.files[0], "groomAvatar", setUploadingGroom);
                              }
                            }}
                          />
                        </label>
                      </div>
                      <p className="text-[10px] text-stone-500 italic">Chọn tải ảnh trực tiếp từ máy của bạn hoặc dán địa chỉ liên kết ảnh chân dung.</p>
                    </div>
                  </div>

                  {/* Bride Avatar */}
                  <div className="p-5 border border-stone-200 rounded-2xl bg-stone-50/50 flex flex-col sm:flex-row items-center gap-5">
                    <div className="h-24 w-24 rounded-full overflow-hidden shrink-0 border-4 border-white shadow-md bg-stone-200 relative group">
                      <img 
                        src={form.brideAvatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"} 
                        alt="Bride avatar" 
                        className="w-full h-full object-cover"
                      />
                      {uploadingBride && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <RefreshCw className="h-5 w-5 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 w-full space-y-2">
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">Ảnh đại diện Cô Dâu</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={form.brideAvatar || ""}
                          onChange={(e) => handleFieldChange("brideAvatar", e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg border border-stone-200 bg-white text-xs focus:outline-none focus:border-rose-400"
                          placeholder="Dán link ảnh cô dâu hoặc bấm nút bên..."
                        />
                        <label className="px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold text-center cursor-pointer select-none shrink-0 transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                          <Upload className="h-3.5 w-3.5" />
                          <span>Tải ảnh lên</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleImageUpload(e.target.files[0], "brideAvatar", setUploadingBride);
                              }
                            }}
                          />
                        </label>
                      </div>
                      <p className="text-[10px] text-stone-500 italic">Chọn tải ảnh trực tiếp từ máy của bạn hoặc dán địa chỉ liên kết ảnh chân dung.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Album Section */}
              <div>
                <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-6">
                  <h2 className="font-serif text-xl font-bold text-stone-800">Album Ảnh Cưới Của Chúng Mình</h2>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${form.galleryImages.length >= 20 ? 'text-rose-600 bg-rose-50 border border-rose-100' : 'text-stone-600 bg-stone-100'}`}>
                    Sức chứa: {form.galleryImages.length}/20 ảnh
                  </span>
                </div>

                {/* Add new Image url form */}
                <div className="bg-stone-50 p-5 border border-stone-200 rounded-2xl mb-6 space-y-3">
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">Thêm ảnh mới vào Album</label>
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 flex gap-2">
                      <input
                        id="new-album-image-url"
                        type="text"
                        placeholder="Dán liên kết ảnh cưới (URL Unsplash, Imgur, v.v...)"
                        className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:border-rose-400"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = document.getElementById('new-album-image-url') as HTMLInputElement;
                            if (input && input.value.trim()) {
                              if (form.galleryImages.length >= 20) {
                                alert("Album đã đạt giới hạn tối đa 20 ảnh. Vui lòng xóa bớt ảnh trước khi thêm mới.");
                                return;
                              }
                              const updatedImages = [...form.galleryImages, input.value.trim()];
                              handleFieldChange("galleryImages", updatedImages);
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('new-album-image-url') as HTMLInputElement;
                          if (input && input.value.trim()) {
                            if (form.galleryImages.length >= 20) {
                              alert("Album đã đạt giới hạn tối đa 20 ảnh. Vui lòng xóa bớt ảnh trước khi thêm mới.");
                              return;
                            }
                            const updatedImages = [...form.galleryImages, input.value.trim()];
                            handleFieldChange("galleryImages", updatedImages);
                            input.value = '';
                          }
                        }}
                        className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shrink-0 transition-colors"
                      >
                        Thêm Link
                      </button>
                    </div>

                    <label className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold text-center cursor-pointer select-none shrink-0 transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                      {uploadingAlbum ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      <span>{uploadingAlbum ? "Đang tải ảnh..." : "Tải ảnh từ thiết bị (chọn nhiều)"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        disabled={uploadingAlbum}
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            const files = Array.from(e.target.files) as File[];
                            if (form.galleryImages.length + files.length > 20) {
                              alert(`Bạn chỉ có thể thêm tối đa 20 ảnh cưới. Hiện tại album đã có ${form.galleryImages.length} ảnh, bạn không thể tải thêm ${files.length} ảnh nữa.`);
                              return;
                            }
                            setUploadingAlbum(true);
                            let completed = 0;
                            const uploadedUrls: string[] = [];
                            
                            files.forEach(async (file: File) => {
                              try {
                                const formData = new FormData();
                                formData.append("image", file);
                                formData.append("name", file.name.split(".")[0] || "album_image");

                                const response = await fetch("/api/upload", {
                                  method: "POST",
                                  body: formData,
                                });

                                if (response.ok) {
                                  const data = await response.json();
                                  uploadedUrls.push(data.url);
                                } else {
                                  const text = await response.text();
                                  console.error("Batch upload file error:", response.status, text);
                                }
                              } catch (err) {
                                console.error("Batch upload file error:", err);
                              } finally {
                                completed++;
                                if (completed === files.length) {
                                  if (uploadedUrls.length > 0) {
                                    setForm((prev) => ({
                                      ...prev,
                                      galleryImages: [...prev.galleryImages, ...uploadedUrls].slice(0, 20)
                                    }));
                                  }
                                  setUploadingAlbum(false);
                                }
                              }
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                  
                  {/* Preset photo suggestions */}
                  <div className="space-y-2 pt-2">
                    <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Hoặc nhấp để chọn ảnh cưới mẫu lung linh:</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800", label: "Hôn Lễ Ngoài Trời" },
                        { url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800", label: "Tay Trong Tay" },
                        { url: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=800", label: "Nhẫn Cưới Khắc Ghi" },
                        { url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800", label: "Ngọt Ngào Dưới Nắng" },
                        { url: "https://images.unsplash.com/photo-1460978812857-470ed1c77af0?auto=format&fit=crop&q=80&w=800", label: "Nụ Cười Hạnh Phúc" },
                        { url: "https://images.unsplash.com/photo-1519225495810-7517c2965de7?auto=format&fit=crop&q=80&w=800", label: "Bữa Tiệc Sang Trọng" }
                      ].map((preset, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => {
                            if (form.galleryImages.length >= 20) {
                              alert("Album đã đạt giới hạn tối đa 20 ảnh. Vui lòng xóa bớt ảnh trước khi thêm mới.");
                              return;
                            }
                            if (!form.galleryImages.includes(preset.url)) {
                              const updatedImages = [...form.galleryImages, preset.url];
                              handleFieldChange("galleryImages", updatedImages);
                            }
                          }}
                          className="px-2.5 py-1 text-[10px] font-medium bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-full border border-rose-100 transition-colors"
                        >
                          + {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Display Current Album Photo list */}
                {form.galleryImages.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-stone-200 rounded-3xl">
                    <ImageIcon className="h-8 w-8 text-stone-300 mx-auto mb-2" />
                    <p className="text-xs text-stone-500">Chưa có hình ảnh nào trong album. Hãy thêm liên kết ảnh của hai bạn!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {form.galleryImages.map((imgUrl, imgIdx) => (
                      <div key={imgIdx} className="aspect-square relative rounded-2xl overflow-hidden border border-stone-100 shadow-md group bg-stone-100">
                        <img 
                          src={imgUrl} 
                          alt={`Album photo ${imgIdx + 1}`} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const updatedImages = form.galleryImages.filter((_, idx) => idx !== imgIdx);
                              handleFieldChange("galleryImages", updatedImages);
                            }}
                            className="p-2 bg-white/90 hover:bg-white text-rose-600 rounded-full shadow-lg hover:scale-110 transition-transform"
                            title="Xóa ảnh"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[9px] font-bold text-white bg-black/60 rounded-full select-none">
                          Ảnh {imgIdx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TIMELINE TAB */}
          {activeTab === "timeline" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h2 className="font-serif text-xl font-bold text-stone-800">{t.loveStoryTitle}</h2>
                <button
                  onClick={addTimelineEvent}
                  className="px-3.5 py-1.5 bg-stone-900 text-white rounded-full text-xs font-bold flex items-center gap-1 hover:bg-stone-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Thêm cột mốc</span>
                </button>
              </div>

              <div className="space-y-4">
                {form.loveStory.map((item) => (
                  <div key={item.id} className="p-5 border border-stone-200 rounded-2xl bg-stone-50/50 flex flex-col sm:flex-row gap-4 items-start relative">
                    <button
                      onClick={() => removeTimelineEvent(item.id)}
                      className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-rose-500 transition-colors"
                      title="Xóa cột mốc"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                    
                    <div className="w-full sm:w-24 shrink-0">
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Năm</label>
                      <input
                        type="text"
                        value={item.year}
                        onChange={(e) => handleTimelineChange(item.id, "year", e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none"
                      />
                    </div>

                    <div className="flex-1 space-y-3 w-full">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Tiêu đề cột mốc</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleTimelineChange(item.id, "title", e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Mô tả chi tiết</label>
                        <textarea
                          value={item.description}
                          onChange={(e) => handleTimelineChange(item.id, "description", e.target.value)}
                          rows={3}
                          className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MENU TAB */}
          {activeTab === "menu" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h2 className="font-serif text-xl font-bold text-stone-800">{t.menuTitle}</h2>
                <button
                  onClick={addMenuItem}
                  className="px-3.5 py-1.5 bg-stone-900 text-white rounded-full text-xs font-bold flex items-center gap-1 hover:bg-stone-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Thêm món ăn</span>
                </button>
              </div>

              <div className="space-y-3">
                {form.menu.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-center bg-stone-50 p-3.5 rounded-2xl border border-stone-200 relative">
                    <div className="w-1/3 shrink-0">
                      <select
                        value={item.category}
                        onChange={(e) => handleMenuItemChange(idx, "category", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none cursor-pointer"
                      >
                        <option value="Khai vị">Khai vị</option>
                        <option value="Món chính">Món chính</option>
                        <option value="Tráng miệng">Tráng miệng</option>
                        <option value="Đồ uống">Đồ uống</option>
                      </select>
                    </div>

                    <div className="flex-1">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleMenuItemChange(idx, "name", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none"
                        placeholder="Tên chi tiết món ăn..."
                      />
                    </div>

                    <button
                      onClick={() => removeMenuItem(idx)}
                      className="p-1.5 text-stone-400 hover:text-rose-500 transition-colors"
                      title="Xóa món ăn"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Extra dresscode selectors */}
              <div className="border-t border-stone-100 pt-6 mt-8 space-y-4">
                <h3 className="font-serif text-lg font-bold text-stone-800">Dress Code (Quy chuẩn trang phục)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Màu trang phục khuyến nghị</label>
                    <div className="flex gap-2.5 items-center">
                      <input
                        type="color"
                        value={form.dressCodeColor}
                        onChange={(e) => handleFieldChange("dressCodeColor", e.target.value)}
                        className="h-10 w-10 border border-stone-200 rounded-lg cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={form.dressCodeColor}
                        onChange={(e) => handleFieldChange("dressCodeColor", e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-stone-200 text-xs font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Yêu cầu trang phục chi tiết</label>
                    <input
                      type="text"
                      value={form.dressCodeDescription}
                      onChange={(e) => handleFieldChange("dressCodeDescription", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-rose-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EXTRAS TAB */}
          {activeTab === "extras" && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl font-bold text-stone-800 border-b border-stone-100 pb-3">{t.giftTitle}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Groom banking setup */}
                <div className="p-5 border border-stone-200 rounded-2xl bg-stone-50/50 space-y-3">
                  <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Ngân hàng nhà trai (Chú rể)</span>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Tên ngân hàng</label>
                    <input
                      type="text"
                      value={form.groomBankName}
                      onChange={(e) => handleFieldChange("groomBankName", e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Số tài khoản</label>
                    <input
                      type="text"
                      value={form.groomBankAccount}
                      onChange={(e) => handleFieldChange("groomBankAccount", e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Chủ tài khoản (Không dấu)</label>
                    <input
                      type="text"
                      value={form.groomBankUser}
                      onChange={(e) => handleFieldChange("groomBankUser", e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Link ảnh mã QR chuyển khoản mừng</label>
                    <input
                      type="text"
                      value={form.qrGroomBank}
                      onChange={(e) => handleFieldChange("qrGroomBank", e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs"
                    />
                  </div>
                </div>

                {/* Bride banking setup */}
                <div className="p-5 border border-stone-200 rounded-2xl bg-stone-50/50 space-y-3">
                  <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Ngân hàng nhà gái (Cô dâu)</span>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Tên ngân hàng</label>
                    <input
                      type="text"
                      value={form.brideBankName}
                      onChange={(e) => handleFieldChange("brideBankName", e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Số tài khoản</label>
                    <input
                      type="text"
                      value={form.brideBankAccount}
                      onChange={(e) => handleFieldChange("brideBankAccount", e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Chủ tài khoản (Không dấu)</label>
                    <input
                      type="text"
                      value={form.brideBankUser}
                      onChange={(e) => handleFieldChange("brideBankUser", e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Link ảnh mã QR chuyển khoản mừng</label>
                    <input
                      type="text"
                      value={form.qrBrideBank}
                      onChange={(e) => handleFieldChange("qrBrideBank", e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Music Background Settings */}
              <div className="border-t border-stone-100 pt-6 mt-8 space-y-5">
                <h3 className="font-serif text-lg font-bold text-stone-800 flex items-center gap-2">
                  <Music className="h-5 w-5 text-rose-500 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>Nhạc nền hôn lễ</span>
                </h3>

                {/* NhacCuaTui URL input */}
                <div className="bg-rose-50/40 border border-rose-100 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Trình chuyển đổi nhạc từ NhacCuaTui</span>
                    <span className="px-2 py-0.5 bg-rose-100 text-[10px] text-rose-700 font-semibold rounded-full">Khuyên dùng ✨</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Dễ dàng dán bất kỳ liên kết bài hát nào từ <strong>NhacCuaTui.com</strong> (ví dụ: link bài hát cô dâu chú rể yêu thích), hệ thống sẽ tự động tìm kiếm và đồng bộ nhạc nền chất lượng cao cho thiệp cưới của bạn.
                  </p>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={nctUrl}
                      onChange={(e) => setNctUrl(e.target.value)}
                      placeholder="Ví dụ: https://www.nhaccuatui.com/song/VyfpdksboLsO"
                      className="flex-1 px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:border-rose-400"
                    />
                    <button
                      type="button"
                      disabled={nctLoading}
                      onClick={() => resolveNctSong()}
                      className="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
                    >
                      {nctLoading ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                      <span>Phân tích</span>
                    </button>
                  </div>

                  {nctError && (
                    <p className="text-xs text-rose-500 font-semibold flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{nctError}</span>
                    </p>
                  )}

                  {/* Preset NCT links */}
                  <div className="pt-1.5 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Gợi ý nhạc cưới lãng mạn:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setNctUrl("https://www.nhaccuatui.com/song/em-dong-y-i-do-duc-phuc-ft-911.bXlqg6uXitGq.html");
                        resolveNctSong("https://www.nhaccuatui.com/song/em-dong-y-i-do-duc-phuc-ft-911.bXlqg6uXitGq.html");
                      }}
                      className="px-2.5 py-1 text-[10px] font-medium bg-white hover:bg-rose-50 text-stone-700 border border-stone-200 hover:border-rose-200 rounded-full transition-all"
                    >
                      🎵 Em Đồng Ý (I Do)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNctUrl("https://www.nhaccuatui.com/song/yes-i-do-bui-anh-tuan-ft-hien-ho.qW74p6iA4R3I.html");
                        resolveNctSong("https://www.nhaccuatui.com/song/yes-i-do-bui-anh-tuan-ft-hien-ho.qW74p6iA4R3I.html");
                      }}
                      className="px-2.5 py-1 text-[10px] font-medium bg-white hover:bg-rose-50 text-stone-700 border border-stone-200 hover:border-rose-200 rounded-full transition-all"
                    >
                      🎵 Yes I Do
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNctUrl("https://www.nhaccuatui.com/song/dam-cuoi-nha-hong-thanh-ft-mie.gY1C96r9YV70.html");
                        resolveNctSong("https://www.nhaccuatui.com/song/dam-cuoi-nha-hong-thanh-ft-mie.gY1C96r9YV70.html");
                      }}
                      className="px-2.5 py-1 text-[10px] font-medium bg-white hover:bg-rose-50 text-stone-700 border border-stone-200 hover:border-rose-200 rounded-full transition-all"
                    >
                      🎵 Đám Cưới Nha
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNctUrl("https://www.nhaccuatui.com/song/em-se-la-co-dau-minh-vuong-m4u-ft-huy-cung.AInpPhR3gAms.html");
                        resolveNctSong("https://www.nhaccuatui.com/song/em-se-la-co-dau-minh-vuong-m4u-ft-huy-cung.AInpPhR3gAms.html");
                      }}
                      className="px-2.5 py-1 text-[10px] font-medium bg-white hover:bg-rose-50 text-stone-700 border border-stone-200 hover:border-rose-200 rounded-full transition-all"
                    >
                      🎵 Em Sẽ Là Cô Dâu
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNctUrl("https://www.nhaccuatui.com/song/ngay-dau-tien-duc-phuc.KMyFstfMndI9.html");
                        resolveNctSong("https://www.nhaccuatui.com/song/ngay-dau-tien-duc-phuc.KMyFstfMndI9.html");
                      }}
                      className="px-2.5 py-1 text-[10px] font-medium bg-white hover:bg-rose-50 text-stone-700 border border-stone-200 hover:border-rose-200 rounded-full transition-all"
                    >
                      🎵 Ngày Đầu Tiên
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Tên bài hát hiển thị</label>
                    <input
                      type="text"
                      value={form.musicTitle}
                      onChange={(e) => handleFieldChange("musicTitle", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-rose-400 font-medium text-stone-800"
                      placeholder="Tên bài hát..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Liên kết tệp âm thanh trực tiếp (.mp3)</label>
                    <input
                      type="text"
                      value={form.musicUrl}
                      onChange={(e) => handleFieldChange("musicUrl", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-rose-400 font-mono text-stone-600 bg-stone-50/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI ASSISTANT TAB */}
          {activeTab === "ai" && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-amber-500 animate-bounce mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-serif text-sm font-bold text-amber-900">Sức mạnh Trí Tuệ Nhân Tạo (Gemini AI)</h4>
                  <p className="mt-1 text-stone-600 text-xs leading-relaxed">
                    Được tích hợp trực tiếp với mô hình AI <strong>Gemini 3.5 Flash</strong> từ Google. Bạn chỉ cần nhập vài nét gạch đầu dòng mộc mạc, AI sẽ tự động biến chúng thành những câu chữ lãng mạn đầy bay bổng để hiển thị trên thiệp cưới của hai bạn!
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Hai bạn đã gặp nhau như thế nào? (Gợi ý cho AI)</label>
                  <textarea
                    value={aiMeetInfo}
                    onChange={(e) => setAiMeetInfo(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none resize-none leading-relaxed"
                    placeholder="Ví dụ: Gặp nhau năm 2021 trong quán cà phê mưa rào, chú rể cho cô dâu mượn ô..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Những khoảnh khắc hay kỉ niệm đáng nhớ nhất?</label>
                  <textarea
                    value={aiMomentsInfo}
                    onChange={(e) => setAiMomentsInfo(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none resize-none leading-relaxed"
                    placeholder="Ví dụ: Tỏ tình ở Đà Lạt, cầu hôn bên bờ biển Nha Trang lúc hoàng hôn lộng gió..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Tông giọng & Văn phong mong muốn</label>
                  <select
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none cursor-pointer bg-white"
                  >
                    <option value="Lãng mạn, thơ mộng, nhẹ nhàng sâu sắc">Lãng mạn, thơ mộng (Lựa chọn hàng đầu)</option>
                    <option value="Hài hước, vui vẻ, trẻ trung cá tính">Hài hước, cá tính độc đáo</option>
                    <option value="Trang trọng, nhã nhặn, tôn nghiêm">Trang trọng, thanh tao quý phái</option>
                  </select>
                </div>

                {aiStatus.error && (
                  <div className="p-3.5 bg-rose-50 text-rose-800 border border-rose-100 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0" />
                    <span>Lỗi: {aiStatus.error}</span>
                  </div>
                )}

                <button
                  onClick={generateLoveStoryWithAI}
                  disabled={aiStatus.loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 disabled:opacity-50 transition-all"
                >
                  {aiStatus.loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Trí tuệ nhân tạo đang sáng tác câu chuyện...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Sáng tác Câu chuyện tình yêu ngay</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ADVANCED CONFIGURATION (UI CONFIG) TAB */}
          {activeTab === "uiConfig" && (
            <div className="bg-[#121214] text-zinc-100 rounded-3xl p-6 border border-zinc-800/80 space-y-6">
              
              {/* Header inside settings panel */}
              <div className="border-b border-zinc-800 pb-5 mb-4">
                <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-pink-500" />
                  <span>Cài đặt & Giao diện nâng cao</span>
                </h3>
                <p className="text-zinc-400 text-xs mt-1">
                  Tinh chỉnh giao diện, kích hoạt hoặc ẩn các cấu phần trên thiệp cưới của bạn theo phong cách chuyên nghiệp.
                </p>
              </div>

              {/* Accordion List */}
              <div className="space-y-4">
                
                {/* 1. Định dạng giờ (Time Format) */}
                <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection("timeFormat")}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-zinc-800/80 p-2 rounded-xl text-zinc-300">
                        <Clock className="h-4.5 w-4.5 text-pink-500" />
                      </div>
                      <div>
                        <span className="block text-sm font-semibold text-white">Định dạng giờ</span>
                        <span className="text-[11px] text-zinc-400">Chọn cách hiển thị 24 giờ hoặc sáng/chiều</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {expandedSections.timeFormat ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                    </div>
                  </button>

                  {expandedSections.timeFormat && (
                    <div className="px-5 pb-5 pt-1 border-t border-zinc-800/50 space-y-3 bg-zinc-900/20">
                      <p className="text-xs text-zinc-400">Giờ hiển thị trên thiệp sẽ dùng định dạng này, dùng cho đồng hồ và sự kiện.</p>
                      <div className="grid grid-cols-2 gap-3.5">
                        <button
                          type="button"
                          onClick={() => handleFieldChange("timeFormat", "24h")}
                          className={`py-3.5 px-4 rounded-xl text-xs font-bold transition-all border ${
                            (form.timeFormat || '24h') === '24h'
                              ? 'bg-pink-600 border-pink-500 text-white shadow-md shadow-pink-900/20'
                              : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                          }`}
                        >
                          24 giờ (Ví dụ: 18:00)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFieldChange("timeFormat", "12h")}
                          className={`py-3.5 px-4 rounded-xl text-xs font-bold transition-all border ${
                            form.timeFormat === '12h'
                              ? 'bg-pink-600 border-pink-500 text-white shadow-md shadow-pink-900/20'
                              : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                          }`}
                        >
                          Sáng/Chiều (Ví dụ: 06:00 CH)
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Giới hạn khách & Khai tiệc */}
                <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection("limitGuests")}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-zinc-800/80 p-2 rounded-xl text-zinc-300">
                        <Users className="h-4.5 w-4.5 text-pink-500" />
                      </div>
                      <div>
                        <span className="block text-sm font-semibold text-white">Giới hạn khách & Khai tiệc</span>
                        <span className="text-[11px] text-zinc-400">Thiết lập giới hạn số lượng khách và giờ đãi tiệc</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFieldChange("limitGuestsEnabled", !form.limitGuestsEnabled);
                        }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                          {form.limitGuestsEnabled ? "Hiện" : "Ẩn"}
                        </span>
                        <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ${form.limitGuestsEnabled ? 'bg-pink-600' : 'bg-zinc-700'}`}>
                          <div className={`bg-white w-4 h-4 rounded-full shadow transform duration-200 ${form.limitGuestsEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </button>
                      {expandedSections.limitGuests ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                    </div>
                  </button>

                  {expandedSections.limitGuests && (
                    <div className="px-5 pb-5 pt-1 border-t border-zinc-800/50 space-y-4 bg-zinc-900/20">
                      <p className="text-xs text-zinc-400">Thay đổi cài đặt giới hạn và giờ đón khách/khai tiệc.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Giới hạn số khách mỗi bàn</label>
                          <input
                            type="number"
                            value={form.views > 0 ? 10 : 12} // Mocking standard size
                            disabled
                            className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-800/50 text-zinc-400 text-xs cursor-not-allowed"
                            placeholder="Mặc định: 10 khách/bàn"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Trạng thái giới hạn</label>
                          <div className="p-3 bg-zinc-800/30 border border-zinc-800 rounded-xl text-xs text-zinc-300">
                            Không áp dụng giới hạn toàn bộ
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Đồng hồ đếm ngược (Countdown) */}
                <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection("countdown")}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-zinc-800/80 p-2 rounded-xl text-zinc-300">
                        <Hourglass className="h-4.5 w-4.5 text-pink-500" />
                      </div>
                      <div>
                        <span className="block text-sm font-semibold text-white">Đồng hồ đếm ngược</span>
                        <span className="text-[11px] text-zinc-400">Đếm ngược thời gian tới ngày cưới</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFieldChange("countdownEnabled", form.countdownEnabled !== false ? false : true);
                        }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                          {form.countdownEnabled !== false ? "Hiện" : "Ẩn"}
                        </span>
                        <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ${form.countdownEnabled !== false ? 'bg-pink-600' : 'bg-zinc-700'}`}>
                          <div className={`bg-white w-4 h-4 rounded-full shadow transform duration-200 ${form.countdownEnabled !== false ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </button>
                      {expandedSections.countdown ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                    </div>
                  </button>

                  {expandedSections.countdown && (
                    <div className="px-5 pb-5 pt-1 border-t border-zinc-800/50 space-y-3 bg-zinc-900/20">
                      <p className="text-xs text-zinc-400">Đồng hồ đếm ngược giúp tạo không khí hào hứng và mong chờ cho khách mời đến ngày cưới vinh quy bái tổ của bạn.</p>
                      <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 flex justify-center gap-3.5">
                        <div className="text-center bg-zinc-900/80 px-4 py-2.5 rounded-xl min-w-16 border border-zinc-800">
                          <span className="block text-lg font-serif text-pink-500 font-bold">120</span>
                          <span className="text-[9px] uppercase tracking-wider text-zinc-400">Ngày</span>
                        </div>
                        <div className="text-center bg-zinc-900/80 px-4 py-2.5 rounded-xl min-w-16 border border-zinc-800">
                          <span className="block text-lg font-serif text-pink-500 font-bold">04</span>
                          <span className="text-[9px] uppercase tracking-wider text-zinc-400">Giờ</span>
                        </div>
                        <div className="text-center bg-zinc-900/80 px-4 py-2.5 rounded-xl min-w-16 border border-zinc-800">
                          <span className="block text-lg font-serif text-pink-500 font-bold">59</span>
                          <span className="text-[9px] uppercase tracking-wider text-zinc-400">Phút</span>
                        </div>
                        <div className="text-center bg-zinc-900/80 px-4 py-2.5 rounded-xl min-w-16 border border-zinc-800">
                          <span className="block text-lg font-serif text-pink-500 font-bold">18</span>
                          <span className="text-[9px] uppercase tracking-wider text-zinc-400">Giây</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Địa chỉ (Address) */}
                <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection("address")}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-zinc-800/80 p-2 rounded-xl text-zinc-300">
                        <MapPin className="h-4.5 w-4.5 text-pink-500" />
                      </div>
                      <div>
                        <span className="block text-sm font-semibold text-white">Địa chỉ hôn lễ</span>
                        <span className="text-[11px] text-zinc-400">Địa điểm tổ chức tiệc cưới chính thức</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {expandedSections.address ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                    </div>
                  </button>

                  {expandedSections.address && (
                    <div className="px-5 pb-5 pt-1 border-t border-zinc-800/50 space-y-3 bg-zinc-900/20">
                      <div className="relative">
                        <textarea
                          value={form.venueAddress}
                          onChange={(e) => handleFieldChange("venueAddress", e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-200 text-xs sm:text-sm focus:outline-none focus:border-pink-500 resize-none pr-10"
                        />
                        <button className="absolute bottom-4 right-4 p-1.5 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                          <Plus className="h-3.5 w-3.5 rotate-45" /> {/* Small pen edit layout indicator */}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Bản đồ (Map) */}
                <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection("map")}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-zinc-800/80 p-2 rounded-xl text-zinc-300">
                        <Map className="h-4.5 w-4.5 text-pink-500" />
                      </div>
                      <div>
                        <span className="block text-sm font-semibold text-white">Bản đồ</span>
                        <span className="text-[11px] text-zinc-400">Hiển thị nút dẫn đường Google Maps</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFieldChange("mapEnabled", form.mapEnabled !== false ? false : true);
                        }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                          {form.mapEnabled !== false ? "Hiện" : "Ẩn"}
                        </span>
                        <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ${form.mapEnabled !== false ? 'bg-pink-600' : 'bg-zinc-700'}`}>
                          <div className={`bg-white w-4 h-4 rounded-full shadow transform duration-200 ${form.mapEnabled !== false ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </button>
                      {expandedSections.map ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                    </div>
                  </button>

                  {expandedSections.map && (
                    <div className="px-5 pb-5 pt-1 border-t border-zinc-800/50 space-y-3.5 bg-zinc-900/20">
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Bản đồ tự động hiển thị liên kết Google Maps dẫn đường khi gửi cho quan khách hai họ.
                      </p>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Liên kết định vị Google Maps</label>
                        <input
                          type="text"
                          value={form.googleMapsUrl}
                          onChange={(e) => handleFieldChange("googleMapsUrl", e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-300 text-xs font-mono focus:outline-none focus:border-pink-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 6. Xác nhận tham dự (RSVP) */}
                <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection("rsvp")}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-zinc-800/80 p-2 rounded-xl text-zinc-300">
                        <CheckSquare className="h-4.5 w-4.5 text-pink-500" />
                      </div>
                      <div>
                        <span className="block text-sm font-semibold text-white">Xác nhận tham dự (RSVP)</span>
                        <span className="text-[11px] text-zinc-400">Quản lý phản hồi tham dự của khách mời</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFieldChange("rsvpEnabled", form.rsvpEnabled !== false ? false : true);
                        }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                          {form.rsvpEnabled !== false ? "Hiện" : "Ẩn"}
                        </span>
                        <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ${form.rsvpEnabled !== false ? 'bg-pink-600' : 'bg-zinc-700'}`}>
                          <div className={`bg-white w-4 h-4 rounded-full shadow transform duration-200 ${form.rsvpEnabled !== false ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </button>
                      {expandedSections.rsvp ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                    </div>
                  </button>

                  {expandedSections.rsvp && (
                    <div className="px-5 pb-5 pt-1 border-t border-zinc-800/50 space-y-4 bg-zinc-900/20">
                      
                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs text-zinc-400 leading-relaxed flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-pink-500 animate-ping shrink-0" />
                        <span>Khách mời có thể xác nhận tham dự trực tiếp ngay trên thiệp cưới.</span>
                      </div>

                      <div className="space-y-2">
                        <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Kiểu hiển thị rsvp</span>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => handleFieldChange("rsvpStyle", "button")}
                            className={`py-3.5 px-4 rounded-xl text-xs font-bold transition-all border ${
                              (form.rsvpStyle || 'button') === 'button'
                                ? 'bg-pink-600 border-pink-500 text-white shadow-md'
                                : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                            }`}
                          >
                            Nút bấm
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFieldChange("rsvpStyle", "embedded")}
                            className={`py-3.5 px-4 rounded-xl text-xs font-bold transition-all border ${
                              form.rsvpStyle === 'embedded'
                                ? 'bg-pink-600 border-pink-500 text-white shadow-md'
                                : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                            }`}
                          >
                            Hiện trực tiếp
                          </button>
                        </div>
                        <span className="block text-[10px] text-zinc-500 italic">Chọn cách hiển thị RSVP nổi dạng nút bấm mở popup hoặc nhúng trực tiếp vào cuối thiệp.</span>
                      </div>

                      {/* Survey questions list */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Các câu hỏi khảo sát:</span>
                        </div>

                        <div className="space-y-2">
                          {(form.rsvpQuestions || ['Họ và tên', 'Số điện thoại', 'Bạn đi cùng ai?', 'Lời chúc gửi cô dâu chú rể']).map((q, idx) => (
                            <div key={idx} className="flex gap-2 items-center bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800">
                              <span className="text-xs text-zinc-500 px-1 font-mono">#{idx+1}</span>
                              <input
                                type="text"
                                value={q}
                                onChange={(e) => {
                                  const current = form.rsvpQuestions || ['Họ và tên', 'Số điện thoại', 'Bạn đi cùng ai?', 'Lời chúc gửi cô dâu chú rể'];
                                  const next = [...current];
                                  next[idx] = e.target.value;
                                  handleFieldChange("rsvpQuestions", next);
                                }}
                                className="flex-1 bg-transparent text-xs text-zinc-200 border-none outline-none focus:ring-0 focus:text-pink-500"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const current = form.rsvpQuestions || ['Họ và tên', 'Số điện thoại', 'Bạn đi cùng ai?', 'Lời chúc gửi cô dâu chú rể'];
                                  handleFieldChange("rsvpQuestions", current.filter((_, i) => i !== idx));
                                }}
                                className="text-zinc-500 hover:text-rose-500 p-1"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const current = form.rsvpQuestions || ['Họ và tên', 'Số điện thoại', 'Bạn đi cùng ai?', 'Lời chúc gửi cô dâu chú rể'];
                            handleFieldChange("rsvpQuestions", [...current, ""]);
                          }}
                          className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-zinc-700 active:scale-95 transition-transform"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Thêm câu hỏi</span>
                        </button>
                      </div>

                    </div>
                  )}
                </div>

                {/* 7. Dress Code */}
                <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection("dressCode")}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-zinc-800/80 p-2 rounded-xl text-zinc-300">
                        <Shirt className="h-4.5 w-4.5 text-pink-500" />
                      </div>
                      <div>
                        <span className="block text-sm font-semibold text-white">Dress Code</span>
                        <span className="text-[11px] text-zinc-400">Đề xuất quy chuẩn màu sắc trang phục tiệc cưới</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFieldChange("dressCodeEnabled", form.dressCodeEnabled !== false ? false : true);
                        }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                          {form.dressCodeEnabled !== false ? "Hiện" : "Ẩn"}
                        </span>
                        <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ${form.dressCodeEnabled !== false ? 'bg-pink-600' : 'bg-zinc-700'}`}>
                          <div className={`bg-white w-4 h-4 rounded-full shadow transform duration-200 ${form.dressCodeEnabled !== false ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </button>
                      {expandedSections.dressCode ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                    </div>
                  </button>

                  {expandedSections.dressCode && (
                    <div className="px-5 pb-5 pt-1 border-t border-zinc-800/50 space-y-4 bg-zinc-900/20">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-zinc-400 mb-1.5">Màu sắc khuyến nghị</label>
                          <div className="flex gap-2.5 items-center">
                            <input
                              type="color"
                              value={form.dressCodeColor}
                              onChange={(e) => handleFieldChange("dressCodeColor", e.target.value)}
                              className="h-10 w-10 border border-zinc-800 rounded-xl cursor-pointer bg-transparent"
                            />
                            <input
                              type="text"
                              value={form.dressCodeColor}
                              onChange={(e) => handleFieldChange("dressCodeColor", e.target.value)}
                              className="w-full px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-300 text-xs font-mono focus:outline-none focus:border-pink-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-400 mb-1.5">Yêu cầu chi tiết</label>
                          <input
                            type="text"
                            value={form.dressCodeDescription}
                            onChange={(e) => handleFieldChange("dressCodeDescription", e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-300 text-xs sm:text-sm focus:outline-none focus:border-pink-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 8. Lịch trình ngày cưới */}
                <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection("timeline")}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-zinc-800/80 p-2 rounded-xl text-zinc-300">
                        <Calendar className="h-4.5 w-4.5 text-pink-500" />
                      </div>
                      <div>
                        <span className="block text-sm font-semibold text-white">Lịch trình ngày cưới</span>
                        <span className="text-[11px] text-zinc-400">Hiển thị lịch trình và các hoạt động cưới hỏi</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFieldChange("timelineEnabled", form.timelineEnabled !== false ? false : true);
                        }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                          {form.timelineEnabled !== false ? "Hiện" : "Ẩn"}
                        </span>
                        <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ${form.timelineEnabled !== false ? 'bg-pink-600' : 'bg-zinc-700'}`}>
                          <div className={`bg-white w-4 h-4 rounded-full shadow transform duration-200 ${form.timelineEnabled !== false ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </button>
                      {expandedSections.timeline ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                    </div>
                  </button>

                  {expandedSections.timeline && (
                    <div className="px-5 pb-5 pt-1 border-t border-zinc-800/50 space-y-3 bg-zinc-900/20">
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Các mốc lịch trình như đón dâu, làm lễ nhà thờ, khai tiệc tại nhà hàng sẽ hiển thị đẹp mắt theo dòng thời gian.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab("timeline")}
                        className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shrink-0 transition-colors shadow-sm active:scale-95"
                      >
                        <span>Chỉnh sửa câu chuyện & lịch trình ngay</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 9. Sổ lưu bút */}
                <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection("guestbook")}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-zinc-800/80 p-2 rounded-xl text-zinc-300">
                        <BookOpen className="h-4.5 w-4.5 text-pink-500" />
                      </div>
                      <div>
                        <span className="block text-sm font-semibold text-white">Sổ lưu bút</span>
                        <span className="text-[11px] text-zinc-400">Cho phép khách mời gửi lời chúc phúc</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFieldChange("guestbookEnabled", form.guestbookEnabled !== false ? false : true);
                        }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                          {form.guestbookEnabled !== false ? "Hiện" : "Ẩn"}
                        </span>
                        <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ${form.guestbookEnabled !== false ? 'bg-pink-600' : 'bg-zinc-700'}`}>
                          <div className={`bg-white w-4 h-4 rounded-full shadow transform duration-200 ${form.guestbookEnabled !== false ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </button>
                      {expandedSections.guestbook ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                    </div>
                  </button>

                  {expandedSections.guestbook && (
                    <div className="px-5 pb-5 pt-1 border-t border-zinc-800/50 space-y-4 bg-zinc-900/20">
                      <div>
                        <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Bộ lọc từ xấu nhạy cảm:</span>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {(form.guestbookFilterWords || ['bậy bạ', 'tục tĩu']).map((word, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-850 border border-zinc-800 rounded-full text-xs text-zinc-300">
                              <span>{word}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const current = form.guestbookFilterWords || ['bậy bạ', 'tục tĩu'];
                                  handleFieldChange("guestbookFilterWords", current.filter(w => w !== word));
                                }}
                                className="text-zinc-500 hover:text-white"
                              >
                                <Plus className="h-3 w-3 rotate-45" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Nhập từ cần chặn và ấn Enter..."
                            value={newBadWord || ""}
                            onChange={(e) => setNewBadWord(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (newBadWord.trim()) {
                                  const current = form.guestbookFilterWords || ['bậy bạ', 'tục tĩu'];
                                  handleFieldChange("guestbookFilterWords", [...current, newBadWord.trim()]);
                                  setNewBadWord("");
                                }
                              }
                            }}
                            className="flex-1 px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-300 text-xs focus:outline-none focus:border-pink-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (newBadWord.trim()) {
                                const current = form.guestbookFilterWords || ['bậy bạ', 'tục tĩu'];
                                handleFieldChange("guestbookFilterWords", [...current, newBadWord.trim()]);
                                setNewBadWord("");
                              }
                            }}
                            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold rounded-xl text-xs"
                          >
                            Thêm chặn
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 10. Hộp quà cưới (Gift Box) */}
                <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection("giftBox")}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-zinc-800/80 p-2 rounded-xl text-zinc-300">
                        <Gift className="h-4.5 w-4.5 text-pink-500" />
                      </div>
                      <div>
                        <span className="block text-sm font-semibold text-white">Hộp quà cưới</span>
                        <span className="text-[11px] text-zinc-400">Hiển thị thông tin nhận quà mừng và tài khoản</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFieldChange("giftBoxEnabled", form.giftBoxEnabled !== false ? false : true);
                        }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                          {form.giftBoxEnabled !== false ? "Hiện" : "Ẩn"}
                        </span>
                        <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ${form.giftBoxEnabled !== false ? 'bg-pink-600' : 'bg-zinc-700'}`}>
                          <div className={`bg-white w-4 h-4 rounded-full shadow transform duration-200 ${form.giftBoxEnabled !== false ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </button>
                      {expandedSections.giftBox ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                    </div>
                  </button>

                  {expandedSections.giftBox && (
                    <div className="px-5 pb-5 pt-1 border-t border-zinc-800/50 space-y-4 bg-zinc-900/20">
                      
                      {(!form.groomBankAccount && !form.brideBankAccount) ? (
                        <div className="border-2 border-dashed border-zinc-800 p-8 rounded-2xl text-center space-y-3 bg-zinc-950/40">
                          <p className="text-xs text-zinc-500">Chưa có phương thức nào. Nhấn nút bên dưới để thêm.</p>
                          <button
                            type="button"
                            onClick={() => setActiveTab("extras")}
                            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 mx-auto active:scale-95 transition-transform"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Thêm tài khoản ngân hàng</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-xs text-zinc-400 leading-relaxed">Thông tin tài khoản đã sẵn sàng để quý khách chuyển khoản mừng cưới tiện lợi:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {form.groomBankAccount && (
                              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col justify-between">
                                <span className="text-[10px] font-bold text-pink-500 uppercase tracking-widest">Nhà trai</span>
                                <span className="text-xs font-bold text-white mt-1.5">{form.groomBankName}</span>
                                <span className="text-[11px] font-mono text-zinc-400 mt-0.5">{form.groomBankAccount}</span>
                                <span className="text-[10px] text-zinc-500 mt-1">{form.groomBankUser}</span>
                              </div>
                            )}
                            {form.brideBankAccount && (
                              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col justify-between">
                                <span className="text-[10px] font-bold text-pink-500 uppercase tracking-widest">Nhà gái</span>
                                <span className="text-xs font-bold text-white mt-1.5">{form.brideBankName}</span>
                                <span className="text-[11px] font-mono text-zinc-400 mt-0.5">{form.brideBankAccount}</span>
                                <span className="text-[10px] text-zinc-500 mt-1">{form.brideBankUser}</span>
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveTab("extras")}
                            className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                          >
                            <span>Sửa tài khoản & tải ảnh QR mừng cưới</span>
                          </button>
                        </div>
                      )}

                    </div>
                  )}
                </div>

                {/* 11. Lời cảm ơn */}
                <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection("thankYou")}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-zinc-800/80 p-2 rounded-xl text-zinc-300">
                        <Smile className="h-4.5 w-4.5 text-pink-500" />
                      </div>
                      <div>
                        <span className="block text-sm font-semibold text-white">Lời cảm ơn</span>
                        <span className="text-[11px] text-zinc-400">Hiển thị lời cảm ơn chân tình ở cuối thiệp</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFieldChange("thankYouEnabled", form.thankYouEnabled !== false ? false : true);
                        }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                          {form.thankYouEnabled !== false ? "Hiện" : "Ẩn"}
                        </span>
                        <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ${form.thankYouEnabled !== false ? 'bg-pink-600' : 'bg-zinc-700'}`}>
                          <div className={`bg-white w-4 h-4 rounded-full shadow transform duration-200 ${form.thankYouEnabled !== false ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </button>
                      {expandedSections.thankYou ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                    </div>
                  </button>

                  {expandedSections.thankYou && (
                    <div className="px-5 pb-5 pt-1 border-t border-zinc-800/50 space-y-3 bg-zinc-900/20">
                      <div className="relative">
                        <textarea
                          value={form.thankYouMessage || "Sự hiện diện của quý khách là niềm vinh hạnh lớn cho hai gia đình chúng tôi!"}
                          onChange={(e) => handleFieldChange("thankYouMessage", e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-200 text-xs sm:text-sm focus:outline-none focus:border-pink-500 resize-none pr-10 leading-relaxed"
                        />
                        <button className="absolute bottom-4 right-4 p-1.5 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                          <Plus className="h-3.5 w-3.5 rotate-45" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 12. Nhạc nền (Music) */}
                <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection("music")}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-zinc-800/80 p-2 rounded-xl text-zinc-300">
                        <Music className="h-4.5 w-4.5 text-pink-500" />
                      </div>
                      <div>
                        <span className="block text-sm font-semibold text-white">Nhạc nền</span>
                        <span className="text-[11px] text-zinc-400">Âm thanh lãng mạn hòa nhịp thiệp cưới</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {expandedSections.music ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                    </div>
                  </button>

                  {expandedSections.music && (
                    <div className="px-5 pb-5 pt-1 border-t border-zinc-800/50 space-y-4 bg-zinc-900/20 text-center py-6">
                      <div className="mx-auto h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center text-pink-500 animate-pulse">
                        <Music className="h-6 w-6" />
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-white mt-2">{form.musicTitle}</span>
                        <span className="text-[10px] text-zinc-400 font-mono mt-0.5">{form.musicUrl}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("extras")}
                        className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 active:scale-95 transition-transform mx-auto"
                      >
                        <Music className="h-3.5 w-3.5" />
                        <span>Chọn nhạc khác hoặc NhạcCuaTui</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 13. Phong bì (Envelope) */}
                <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection("envelope")}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-zinc-800/80 p-2 rounded-xl text-zinc-300">
                        <Mail className="h-4.5 w-4.5 text-pink-500" />
                      </div>
                      <div>
                        <span className="block text-sm font-semibold text-white">Phong bì</span>
                        <span className="text-[11px] text-zinc-400">Lời tựa gửi gắm ngoài thiệp</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFieldChange("envelopeEnabled", form.envelopeEnabled !== false ? false : true);
                        }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                          {form.envelopeEnabled !== false ? "Hiện" : "Ẩn"}
                        </span>
                        <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ${form.envelopeEnabled !== false ? 'bg-pink-600' : 'bg-zinc-700'}`}>
                          <div className={`bg-white w-4 h-4 rounded-full shadow transform duration-200 ${form.envelopeEnabled !== false ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </button>
                      {expandedSections.envelope ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                    </div>
                  </button>

                  {expandedSections.envelope && (
                    <div className="px-5 pb-5 pt-1 border-t border-zinc-800/50 space-y-3.5 bg-zinc-900/20">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Lời mời</label>
                        <input
                          type="text"
                          value={form.envelopeGreeting || "Trân trọng"}
                          onChange={(e) => handleFieldChange("envelopeGreeting", e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-200 text-xs focus:outline-none focus:border-pink-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 14. Ảnh xem trước khi chia sẻ (Preview link share style) */}
                <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection("preview")}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-zinc-800/80 p-2 rounded-xl text-zinc-300">
                        <Eye className="h-4.5 w-4.5 text-pink-500" />
                      </div>
                      <div>
                        <span className="block text-sm font-semibold text-white">Ảnh xem trước khi chia sẻ</span>
                        <span className="text-[11px] text-zinc-400">Hình ảnh hiển thị khi gửi link qua Zalo, FB, Tele...</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {expandedSections.preview ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                    </div>
                  </button>

                  {expandedSections.preview && (
                    <div className="px-5 pb-5 pt-1 border-t border-zinc-800/50 space-y-4 bg-zinc-900/20">
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Ảnh hiển thị khi bạn gửi link thiệp qua Zalo, Facebook, Messenger. Chọn 1 trong 2 kiểu bên dưới:
                      </p>

                      <div className="grid grid-cols-2 gap-3.5">
                        <button
                          type="button"
                          onClick={() => handleFieldChange("previewStyle", "envelope")}
                          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border ${
                            (form.previewStyle || 'envelope') === 'envelope'
                              ? 'bg-pink-600 border-pink-500 text-white shadow-md'
                              : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                          }`}
                        >
                          Phong bì lặp
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFieldChange("previewStyle", "customImage")}
                          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border ${
                            form.previewStyle === 'customImage'
                              ? 'bg-pink-600 border-pink-500 text-white shadow-md'
                              : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                          }`}
                        >
                          Ảnh của bạn
                        </button>
                      </div>

                      {/* Mockup Preview Graphic */}
                      <div className="border border-zinc-800 rounded-2xl bg-zinc-950 p-4 space-y-3.5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Phong cách của bạn: Với lời mời rực rỡ, ảnh sẽ hiện khi khách được mời:</span>
                        
                        {/* Golden Envelope Mockup Card */}
                        <div className="relative overflow-hidden w-full aspect-[2/1.1] rounded-xl bg-gradient-to-br from-red-800 via-red-900 to-amber-950 border border-amber-500/20 flex flex-col items-center justify-center p-5 text-center shadow-xl">
                          {/* Traditional gold pattern watermark */}
                          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
                          
                          {/* Inner gold thin border */}
                          <div className="absolute inset-2 border border-amber-400/20 rounded-lg pointer-events-none" />
                          
                          <div className="space-y-1.5 z-10">
                            <span className="text-[10px] uppercase tracking-widest text-amber-300/80 font-bold">Lễ Thành Hôn</span>
                            <h4 className="font-serif text-lg sm:text-xl font-bold text-amber-100 italic tracking-wider flex items-center justify-center gap-2">
                              <span>{form.groomName.split(" ").pop()}</span>
                              <span className="text-sm font-sans text-amber-400/60 font-normal">&</span>
                              <span>{form.brideName.split(" ").pop()}</span>
                            </h4>
                            <div className="h-px w-12 bg-amber-400/30 mx-auto my-1" />
                            <p className="text-[9px] font-mono text-amber-300/60 uppercase tracking-widest">{form.weddingDate}</p>
                            <span className="inline-block mt-2 bg-amber-500/10 text-amber-300 px-3 py-1 rounded-full text-[9px] uppercase tracking-widest border border-amber-400/20 font-semibold shadow-inner">
                              {form.envelopeGreeting || "Trân trọng kính mời"}
                            </span>
                          </div>
                        </div>

                        <span className="block text-[10px] text-zinc-500 text-center italic">
                          Ảnh và thông tin này khi gửi thiệp qua Zalo, facebook... giúp thiệp của bạn trông chỉn chu, đẹp, lịch sự hơn.
                        </span>
                      </div>

                    </div>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Invitation Link Modal */}
      <ShareModal 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        slug={form.slug}
        groomName={form.groomName}
        brideName={form.brideName}
        invite={form}
      />
    </div>
  );
}
