/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Heart, Music, MapPin, Calendar, Clock, Gift, Users, MessageSquare, 
  ChevronRight, Volume2, VolumeX, Sparkles, AlertCircle, CheckCircle2, X, RefreshCw 
} from "lucide-react";
import { motion } from "motion/react";
import { WeddingInvitation, RSVP } from "../types";
import { LanguageCode, translations } from "../translations";
import Confetti from "./Confetti";
import Toast from "./Toast";

interface InvitationViewProps {
  slug: string;
  lang: LanguageCode;
  previewInvite?: WeddingInvitation | null;
}

export default function InvitationView({ slug, lang, previewInvite }: InvitationViewProps) {
  const t = translations[lang];

  // Invitation data states
  const [invite, setInvite] = useState<WeddingInvitation | null>(previewInvite || null);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(!previewInvite);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Background music audio control
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Gallery modal display lightbox
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // RSVP Form submission states
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [attending, setAttending] = useState<boolean>(true);
  const [guestCount, setGuestCount] = useState(1);
  const [greetings, setGreetings] = useState("");
  const [foodChoice, setFoodChoice] = useState("Thịt bò Wagyu");
  const [allergies, setAllergies] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState<{ type: "success" | "error" | null; msg: string }>({ type: null, msg: "" });

  // AI wishes generator state
  const [aiWishRelation, setAiWishRelation] = useState("bạn bè");
  const [aiWishTone, setAiWishTone] = useState("ấm áp chân thành");
  const [aiWishLoading, setAiWishLoading] = useState(false);

  // Confetti celebration state
  const [showConfetti, setShowConfetti] = useState(false);

  // Toast notification states
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Countdown timer calculations
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const FALLBACK_INVITATION: WeddingInvitation = {
    id: "fallback-invitation",
    slug: slug || "dang-thi-phi",
    templateId: "tpl-modern",
    groomName: "Anh",
    groomFather: "Gia đình Anh",
    groomMother: "Gia đình Anh",
    brideName: "Chị",
    brideFather: "Gia đình Chị",
    brideMother: "Gia đình Chị",
    weddingDate: new Date().toISOString().split("T")[0],
    weddingTime: "17:00",
    venueName: "Địa điểm đẹp lung linh",
    venueAddress: "Địa chỉ sẽ được cập nhật",
    googleMapsUrl: "https://maps.google.com",
    musicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    musicTitle: "Nhạc nền nhẹ nhàng",
    dressCodeColor: "#2563eb",
    dressCodeDescription: "Trang phục lịch sự và thanh lịch.",
    hashtag: "#AmoreLove",
    loveStory: [
      { id: "ls-1", year: "2026", title: "Khởi đầu", description: "Một câu chuyện tình yêu đẹp và nhiều cảm hứng." }
    ],
    menu: [
      { category: "Khai vị", name: "Món ngon mở đầu" },
      { category: "Món chính", name: "Món chính tinh tế" },
      { category: "Tráng miệng", name: "Tráng miệng ngọt ngào" }
    ],
    qrGroomBank: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=STB:0123456789:Anh",
    qrBrideBank: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=VCB:9876543210:Chi",
    groomBankName: "Sacombank",
    groomBankAccount: "0123456789",
    groomBankUser: "ANH",
    brideBankName: "Vietcombank",
    brideBankAccount: "9876543210",
    brideBankUser: "CHI",
    groomAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
    brideAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300",
    galleryImages: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600"
    ],
    views: 0,
    userId: "guest-user",
    createdAt: new Date().toISOString()
  };

  // Fetch invitation details & RSVP list from fullstack API with error handling
  const loadData = async () => {
    setLoading(true);
    setLoadError(null);

    const handleFallback = (reason: string) => {
      console.warn("InvitationView fallback:", reason);
      setInvite({ ...FALLBACK_INVITATION, slug });
      setRsvps([]);
      setLoading(false);
    };

    try {
      const response = await fetch(`/api/invitations/${slug}/dashboard`);
      if (response.ok) {
        const data = await response.json();
        setInvite(data.invitation);
        setRsvps(data.rsvps || []);
        setLoading(false);
        return;
      }

      const retryResponse = await fetch(`/api/invitations/${slug}`);
      if (retryResponse.ok) {
        const invitation = await retryResponse.json();
        setInvite(invitation);
        setRsvps([]);
        setLoading(false);
        return;
      }

      handleFallback(`API returned status ${response.status} / ${retryResponse.status}`);
    } catch (err: any) {
      console.error("Error loading invitation:", err);
      handleFallback(err.message || "Không thể kết nối API")
    }
  };

  useEffect(() => {
    if (previewInvite) {
      setInvite(previewInvite);
      setLoadError(null);
      setLoading(false);
    } else {
      loadData();
    }
  }, [slug, previewInvite]);

  const setupAudioElement = () => {
    if (!invite?.musicUrl || !audioRef.current) return;
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;
    audioRef.current.load();
  };

  useEffect(() => {
    if (invite?.musicUrl && audioRef.current) {
      setupAudioElement();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [invite?.musicUrl]);

  const playAudio = async () => {
    if (!audioRef.current) return false;

    try {
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
      return true;
    } catch (err) {
      console.log("Audio playback blocked or failed:", err);
      return false;
    }
  };

  // Auto play when user opened the invitation
  useEffect(() => {
    if (isOpened && invite?.musicUrl && audioRef.current) {
      (async () => {
        const played = await playAudio();
        setIsPlayingMusic(played);
      })();
    }
  }, [isOpened, invite?.musicUrl]);

  // Handle music play/pause toggle
  const toggleMusic = async () => {
    if (isPlayingMusic) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlayingMusic(false);
      return;
    }

    const played = await playAudio();
    setIsPlayingMusic(played);
  };

  // Run countdown clock interval
  useEffect(() => {
    if (!invite?.weddingDate) return;
    const weddingTimeStr = invite.weddingTime || "00:00";
    const weddingDateTime = new Date(`${invite.weddingDate}T${weddingTimeStr}:00`).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = weddingDateTime - now;

      if (distance < 0) {
        clearInterval(interval);
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const d = Math.floor(distance / (1000 * 60 * 60 * 24));
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);
        setCountdown({ days: d, hours: h, minutes: m, seconds: s });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [invite]);

  // Submit RSVP response with comprehensive input validation
  const handleSubmitRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate guest name
    if (!guestName || guestName.trim() === "") {
      setRsvpStatus({ type: "error", msg: "Vui lòng nhập tên của bạn." });
      return;
    }
    
    if (guestName.trim().length < 2) {
      setRsvpStatus({ type: "error", msg: "Tên phải có ít nhất 2 ký tự." });
      return;
    }
    
    if (guestName.length > 200) {
      setRsvpStatus({ type: "error", msg: "Tên quá dài." });
      return;
    }
    
    // Validate phone if provided
    if (phone && !/^[0-9\-+\s()]*$/.test(phone)) {
      setRsvpStatus({ type: "error", msg: "Số điện thoại không hợp lệ." });
      return;
    }
    
    // Validate guest count
    if (attending && guestCount < 1) {
      setRsvpStatus({ type: "error", msg: "Số lượng khách phải tối thiểu là 1." });
      return;
    }

    setRsvpStatus({ type: null, msg: "" });
    try {
      const response = await fetch(`/api/invitations/${slug}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: guestName.trim(),
          phone: phone.trim(),
          attending,
          guestCount: attending ? Number(guestCount) : 0,
          greetings: greetings.trim(),
          foodChoice: attending ? foodChoice : "",
          allergies: allergies.trim()
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Lỗi gửi RSVP");
      }

      setRsvpStatus({ type: "success", msg: t.rsvpSuccess });
      setToastMessage(t.rsvpSuccess);
      setIsToastOpen(true);
      setShowConfetti(true);
      // Reset form fields
      setGuestName("");
      setPhone("");
      setGreetings("");
      setAllergies("");
      // Reload rsvps board list
      loadData();
    } catch (err: any) {
      setRsvpStatus({ type: "error", msg: err.message || "Gửi phản hồi thất bại. Vui lòng thử lại sau." });
    }
  };

  // AI-assisted greeting wishes draft creator using Gemini API on server-side
  const handleGenerateAIWish = async () => {
    setAiWishLoading(true);
    try {
      const response = await fetch("/api/ai/generate-wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relation: aiWishRelation, tone: aiWishTone })
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setGreetings(data.wishes);
    } catch (err) {
      console.error(err);
      setGreetings("Chúc anh chị trăm năm hạnh phúc, gia đình êm ấm thuận hòa!");
    } finally {
      setAiWishLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <div className="h-10 w-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        <span className="font-serif italic text-stone-600">Đang chuẩn bị không gian lễ cưới...</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h2 className="font-serif text-xl font-bold text-red-900 mb-2">
            Lỗi tải thiệp cưới
          </h2>
          <p className="text-red-700 text-sm mb-4">{loadError}</p>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="text-center py-20 px-4">
        <h2 className="font-serif text-2xl font-bold text-stone-800">Không tìm thấy thiệp cưới</h2>
        <p className="mt-2 text-stone-600">Đường link thiệp cưới này không tồn tại hoặc đã bị gỡ bỏ.</p>
      </div>
    );
  }

  // Choose styling layout class based on template ID
  const isLuxury = invite.templateId === "tpl-luxury";
  const isFloral = invite.templateId === "tpl-floral";
  const headingFontClass = isLuxury ? "font-serif tracking-widest text-amber-500" : isFloral ? "font-serif text-rose-500" : "font-display tracking-tight text-stone-900";
  const containerBgClass = isLuxury ? "bg-slate-950 text-slate-200" : isFloral ? "bg-rose-50/30 text-stone-800" : "bg-stone-50/50 text-stone-800";

  return (
    <div id="invitation-view-root" className={`min-h-screen ${containerBgClass}`}>
      
      {/* Fullscreen Entrance Envelope / Wax Seal Overlay */}
      {!isOpened && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-stone-900/95 backdrop-blur-md text-white p-4 select-none">
          {/* Subtle slow floating background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-rose-500 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-amber-500 blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative max-w-md w-full bg-stone-800/85 border border-stone-700 p-8 rounded-3xl text-center shadow-2xl backdrop-blur-md"
          >
            {/* Elegant invitation card structure */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-rose-500 text-white p-4 rounded-full shadow-lg border-4 border-stone-800 flex items-center justify-center">
              <Heart className="h-8 w-8 animate-pulse text-white" />
            </div>

            <div className="mt-6 space-y-5">
              <span className="font-serif italic text-rose-400 tracking-widest text-xs uppercase block">Wedding Invitation</span>
              
              <h2 className="font-serif text-3xl font-bold tracking-wide text-amber-200">
                {invite.groomName} <span className="text-rose-400">&</span> {invite.brideName}
              </h2>

              <p className="text-stone-300 text-sm leading-relaxed max-w-xs mx-auto">
                Trân trọng kính mời quý khách tới tham dự ngày vui chung đôi và chung vui cùng gia đình chúng tôi!
              </p>

              {invite.musicTitle && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-700/60 rounded-full border border-stone-600 text-stone-300 text-[11px] font-mono">
                  <Music className="h-3 w-3 text-rose-400 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>{invite.musicTitle}</span>
                </div>
              )}

              <div className="pt-4">
                <button
                  onClick={async () => {
                    setIsOpened(true);
                    const played = await playAudio();
                    setIsPlayingMusic(played);
                  }}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold rounded-full shadow-lg hover:shadow-rose-500/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2.5 mx-auto group cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-amber-200 animate-pulse group-hover:rotate-12 transition-transform" />
                  <span>MỞ THIỆP CƯỚI & NGHE NHẠC</span>
                </button>
              </div>

              <span className="text-[10px] text-stone-500 block pt-1">
                * Nhấp để mở thiệp lãng mạn và tự động phát nhạc nền ngay lập tức.
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Background sound toggle trigger */}
      {invite.musicUrl && (
        <>
          <audio
            ref={audioRef}
            key={invite.musicUrl}
            src={invite.musicUrl}
            loop
            preload="auto"
          />
          <button
            onClick={toggleMusic}
            className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg backdrop-blur-md flex items-center justify-center transition-all active:scale-90 bg-white border border-stone-200 text-rose-500"
            title={isPlayingMusic ? "Mute soundtrack" : "Play romantic soundtrack"}
          >
            {isPlayingMusic ? (
              <Volume2 className="h-5 w-5 animate-bounce text-rose-500" />
            ) : (
              <VolumeX className="h-5 w-5 text-stone-400" />
            )}
          </button>
        </>
      )}

      {/* Main cover banner */}
      <section id="invitation-cover" className="relative min-h-[85vh] flex flex-col justify-center items-center text-center p-4 overflow-hidden">
        <div className="absolute inset-0 bg-black/35 z-10" />
        <img
          src={invite.galleryImages[0] || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200"}
          alt="Wedding Cover"
          className="absolute inset-0 w-full h-full object-cover select-none"
        />

        <div className="relative z-20 text-white max-w-2xl px-4 animate-fade-in">
          <span className="font-serif italic text-base sm:text-lg text-amber-200/90 tracking-widest mb-4 block uppercase font-medium">Save The Date</span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-wide leading-tight">
            {invite.groomName} <span className="text-rose-400 font-sans text-3xl sm:text-5xl">&</span> {invite.brideName}
          </h1>
          <p className="font-serif text-sm sm:text-base tracking-widest uppercase mt-6 opacity-90">Chúng mình chuẩn bị về chung một nhà!</p>

          {/* Golden border decorative frame for luxury template */}
          {isLuxury && <div className="mx-auto my-6 h-0.5 w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />}

          {/* Countdown display */}
          {invite.countdownEnabled !== false && (
            <div className="mt-10 grid grid-cols-4 gap-3 max-w-sm mx-auto">
              <div className="bg-black/45 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <span className="block font-serif text-xl sm:text-2xl font-bold text-rose-300">{countdown.days}</span>
                <span className="text-[10px] uppercase tracking-wider text-stone-300">{t.countdownDays}</span>
              </div>
              <div className="bg-black/45 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <span className="block font-serif text-xl sm:text-2xl font-bold text-rose-300">{countdown.hours}</span>
                <span className="text-[10px] uppercase tracking-wider text-stone-300">{t.countdownHours}</span>
              </div>
              <div className="bg-black/45 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <span className="block font-serif text-xl sm:text-2xl font-bold text-rose-300">{countdown.minutes}</span>
                <span className="text-[10px] uppercase tracking-wider text-stone-300">{t.countdownMinutes}</span>
              </div>
              <div className="bg-black/45 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <span className="block font-serif text-xl sm:text-2xl font-bold text-rose-300">{countdown.seconds}</span>
                <span className="text-[10px] uppercase tracking-wider text-stone-300">{t.countdownSeconds}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Profiles & Parental names */}
      <section id="invitation-parents" className="py-16 sm:py-24 px-4 bg-white overflow-hidden">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <Heart className="h-8 w-8 text-rose-400 fill-rose-50 mx-auto mb-6 animate-pulse" />
            <h2 className={`text-2xl sm:text-3xl font-bold mb-12 ${headingFontClass}`}>Trân trọng báo tin hôn lễ</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16">
            {/* Groom parental column */}
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="space-y-4"
            >
              <div className="relative inline-block">
                <div className="h-28 w-28 rounded-full overflow-hidden mx-auto border-4 border-white shadow-lg ring-1 ring-stone-200/50">
                  <img 
                    src={invite.groomAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300"} 
                    alt={invite.groomName} 
                    className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                <span className="absolute bottom-0 right-1 bg-rose-500 text-white rounded-full p-1.5 shadow-md text-[10px]">🤵</span>
              </div>
              <div className="pt-2">
                <span className="text-xs font-bold uppercase tracking-widest text-rose-500">Nhà Trai (Groom's Side)</span>
                <h3 className="font-serif text-2xl font-bold text-stone-800 mt-1">{invite.groomName}</h3>
              </div>
              <div className="text-stone-600 text-xs sm:text-sm space-y-1.5 pt-3 border-t border-stone-100 max-w-xs mx-auto">
                <p>Con ông: <strong className="text-stone-800">{invite.groomFather}</strong></p>
                <p>Con bà: <strong className="text-stone-800">{invite.groomMother}</strong></p>
              </div>
            </motion.div>

            {/* Bride parental column */}
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-4"
            >
              <div className="relative inline-block">
                <div className="h-28 w-28 rounded-full overflow-hidden mx-auto border-4 border-white shadow-lg ring-1 ring-stone-200/50">
                  <img 
                    src={invite.brideAvatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300"} 
                    alt={invite.brideName} 
                    className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                <span className="absolute bottom-0 right-1 bg-rose-500 text-white rounded-full p-1.5 shadow-md text-[10px]">👰</span>
              </div>
              <div className="pt-2">
                <span className="text-xs font-bold uppercase tracking-widest text-rose-500">Nhà Gái (Bride's Side)</span>
                <h3 className="font-serif text-2xl font-bold text-stone-800 mt-1">{invite.brideName}</h3>
              </div>
              <div className="text-stone-600 text-xs sm:text-sm space-y-1.5 pt-3 border-t border-stone-100 max-w-xs mx-auto">
                <p>Con ông: <strong className="text-stone-800">{invite.brideFather}</strong></p>
                <p>Con bà: <strong className="text-stone-800">{invite.brideMother}</strong></p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Love Story Timeline */}
      {invite.loveStory.length > 0 && invite.timelineEnabled !== false && (
        <section id="invitation-love-story" className="py-16 sm:py-24 px-4 bg-stone-50/40 border-y border-stone-200/50 overflow-hidden">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <span className="text-xs font-bold uppercase tracking-widest text-rose-500">{t.loveStoryTitle}</span>
              <h2 className={`text-2xl sm:text-3xl font-bold mt-2 mb-12 ${headingFontClass}`}>Hành Trình Gắn Kết</h2>
            </motion.div>

            <div className="relative border-l-2 border-rose-200/60 ml-4 sm:ml-32 text-left space-y-12">
              {invite.loveStory.map((event, idx) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, delay: Math.min(idx * 0.1, 0.3) }}
                  className="relative pl-8 sm:pl-10"
                >
                  <span className="absolute -left-3 top-1.5 h-6 w-6 rounded-full bg-rose-500 border-4 border-white shadow-md flex items-center justify-center text-[10px] text-white">
                    ❤
                  </span>
                  <div className="absolute -left-32 top-1.5 hidden sm:block w-24 text-right font-serif text-lg font-bold text-rose-500">
                    {event.year}
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-stone-200/60 shadow-sm">
                    <span className="font-serif text-xs font-bold text-rose-500 sm:hidden block mb-1">{event.year}</span>
                    <h3 className="font-serif text-lg font-bold text-stone-800 mb-2">{event.title}</h3>
                    <p className="text-stone-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line">{event.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Photo gallery slides */}
      <section id="invitation-gallery" className="py-16 sm:py-24 px-4 bg-white overflow-hidden">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-xs font-bold uppercase tracking-widest text-rose-500">Hình ảnh ngọt ngào</span>
            <h2 className={`text-2xl sm:text-3xl font-bold mt-2 mb-12 ${headingFontClass}`}>Album Cưới Của Chúng Mình</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {invite.galleryImages.map((img, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: Math.min(idx * 0.15, 0.45), ease: "easeOut" }}
                className="aspect-square rounded-2xl overflow-hidden border border-stone-100 shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all"
                onClick={() => setLightboxImg(img)}
              >
                <img
                  src={img}
                  alt={`Wedding Photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reception Details & Interactive Banquet Menu */}
      <section id="invitation-details" className="py-16 sm:py-24 px-4 bg-stone-50/40 overflow-hidden">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Left side: venue location and routing details */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-md space-y-6"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-rose-500">Địa điểm & Thời gian</span>
              <h3 className="font-serif text-2xl font-bold text-stone-800">Lễ Vu Quy & Thành Hôn</h3>
              
              <div className="space-y-4 text-xs sm:text-sm text-stone-600 pt-4 border-t border-stone-100">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-stone-800 font-semibold">Ngày diễn ra:</span>
                    <span>{invite.weddingDate} (Giờ hành lễ: {invite.weddingTime})</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-stone-800 font-semibold">{invite.venueName}</span>
                    <span>{invite.venueAddress}</span>
                  </div>
                </div>
              </div>

              {invite.googleMapsUrl && (
                <a
                  href={invite.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-1.5 px-4 py-3 bg-stone-950 text-white rounded-full text-xs font-bold hover:bg-stone-800 shadow-sm"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Xem vị trí trên Google Maps</span>
                </a>
              )}
            </motion.div>

            {/* Right side: Special banquets menu list */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-md space-y-6"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-rose-500">{t.menuTitle}</span>
              <h3 className="font-serif text-2xl font-bold text-stone-800">Ẩm Thực Tiệc Cưới</h3>
              
              <div className="space-y-4 pt-4 border-t border-stone-100">
                {invite.menu.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-baseline gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 shrink-0">{item.category}</span>
                    <span className="text-stone-700 text-xs sm:text-sm font-semibold">{item.name}</span>
                    <div className="flex-1 border-b border-dashed border-stone-200/80" />
                  </div>
                ))}
              </div>

              {/* Dresscode info details */}
              <div className="pt-4 border-t border-stone-100 flex items-center gap-4">
                <span className="h-10 w-10 rounded-full border shrink-0" style={{ backgroundColor: invite.dressCodeColor }} />
                <div>
                  <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Dress Code Khuyến Nghị</span>
                  <span className="text-xs font-semibold text-stone-700">{invite.dressCodeDescription}</span>
                </div>
              </div>

            </motion.div>

          </div>
        </div>
      </section>

      {/* RSVP Submit response Form */}
      {invite.rsvpEnabled !== false && (
        <section id="invitation-rsvp" className="py-16 sm:py-24 px-4 bg-white overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-2xl bg-stone-50 p-6 sm:p-10 rounded-3xl border border-stone-200 shadow-lg"
        >
          <div className="text-center mb-8">
            <Users className="h-8 w-8 text-rose-500 mx-auto mb-2" />
            <h2 className="font-serif text-2xl font-bold text-stone-800">{t.rsvpConfirmTitle}</h2>
            <p className="text-xs text-stone-500 mt-1">Phản hồi của bạn giúp chúng mình sắp xếp tiệc cưới được chu đáo nhất.</p>
          </div>

          <form onSubmit={handleSubmitRSVP} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">{t.rsvpName}</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:border-rose-400"
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">{t.rsvpPhone}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:border-rose-400"
                placeholder="0912345678"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">{t.rsvpAttending}</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setAttending(true)}
                  className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                    attending 
                      ? "bg-rose-500 text-white border-rose-500 shadow-md" 
                      : "bg-white text-stone-600 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  {t.rsvpYes}
                </button>
                <button
                  type="button"
                  onClick={() => setAttending(false)}
                  className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                    !attending 
                      ? "bg-stone-900 text-white border-stone-900 shadow-md" 
                      : "bg-white text-stone-600 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  {t.rsvpNo}
                </button>
              </div>
            </div>

            {attending && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">{t.rsvpCount}</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">{t.rsvpFood}</label>
                  <select
                    value={foodChoice}
                    onChange={(e) => setFoodChoice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Thịt bò Wagyu">Thịt bò Wagyu áp chảo</option>
                    <option value="Tôm hùm">Tôm hùm bỏ lò phô mai</option>
                    <option value="Súp bào ngư">Súp bào ngư vi cá</option>
                    <option value="Chay">Thực đơn chay tịnh</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">{t.rsvpAllergy}</label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none"
                    placeholder="Không có hoặc ví dụ: Dị ứng các loại hạt..."
                  />
                </div>
              </div>
            )}

            {/* AI assisted Wishes generator for guest */}
            <div className="border-t border-stone-200 pt-4 mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">{t.rsvpGreeting}</label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-0.5">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span>AI Wishes Helper</span>
                  </span>
                </div>
              </div>

              {/* Mini AI config rail */}
              <div className="flex flex-wrap items-center gap-2 bg-stone-100 p-2.5 rounded-xl border border-stone-200">
                <select
                  value={aiWishRelation}
                  onChange={(e) => setAiWishRelation(e.target.value)}
                  className="bg-white border text-[10px] font-bold px-2.5 py-1.5 rounded-lg focus:outline-none cursor-pointer"
                >
                  <option value="bạn bè thân thiết">Mối quan hệ: Bạn thân</option>
                  <option value="đồng nghiệp">Đồng nghiệp</option>
                  <option value="họ hàng">Họ hàng, anh chị em</option>
                </select>
                <select
                  value={aiWishTone}
                  onChange={(e) => setAiWishTone(e.target.value)}
                  className="bg-white border text-[10px] font-bold px-2.5 py-1.5 rounded-lg focus:outline-none cursor-pointer"
                >
                  <option value="ấm áp chân thành">Tông giọng: Ấm áp</option>
                  <option value="hài hước hóm hỉnh">Hài hước</option>
                  <option value="trang trọng quý phái">Trang trọng</option>
                </select>
                <button
                  type="button"
                  onClick={handleGenerateAIWish}
                  disabled={aiWishLoading}
                  className="px-3.5 py-1.5 bg-rose-500 text-white rounded-lg text-[10px] font-bold hover:bg-rose-600 flex items-center gap-1 active:scale-95 disabled:opacity-50"
                >
                  {aiWishLoading ? "Generating..." : "AI Tạo Lời Chúc"}
                </button>
              </div>

              <textarea
                value={greetings}
                onChange={(e) => setGreetings(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none resize-none leading-relaxed"
                placeholder="Viết những lời chúc ngọt ngào nhất gửi tới ngày vui của cặp đôi..."
              />
            </div>

            {rsvpStatus.type && (
              <div className={`p-4 rounded-xl border flex items-center gap-2.5 ${
                rsvpStatus.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-100" : "bg-rose-50 text-rose-800 border-rose-100"
              }`}>
                {rsvpStatus.type === "success" ? <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" /> : <AlertCircle className="h-4.5 w-4.5 text-rose-500" />}
                <span className="text-xs font-semibold">{rsvpStatus.msg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md active:scale-98 transition-transform"
            >
              {t.btnSubmitRsvp}
            </button>
          </form>
        </motion.div>
      </section>
      )}

      {/* Banking QR register registry ("Mã QR mừng cưới") */}
      {invite.giftBoxEnabled !== false && (
        <section id="invitation-banking" className="py-16 sm:py-24 px-4 bg-stone-50/40 border-t border-stone-200/50 overflow-hidden">
        <div className="mx-auto max-w-4xl text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <Gift className="h-8 w-8 text-rose-500 mx-auto mb-2" />
            <h2 className={`text-2xl sm:text-3xl font-bold ${headingFontClass}`}>Hộp Mừng Cưới Từ Xa</h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">Nếu không thể tham gia chung vui trực tiếp, quý khách có thể gửi lời chúc phúc kèm tiền mừng thông qua tài khoản ngân hàng dưới đây.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 max-w-2xl mx-auto">
            {/* Groom Bank registry details */}
            {invite.qrGroomBank && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-md space-y-4 flex flex-col items-center"
              >
                <span className="text-xs font-extrabold text-amber-600 uppercase tracking-wider">Mừng cưới Chú Rể</span>
                <div className="h-44 w-44 border border-stone-100 p-2 rounded-2xl bg-stone-50 shadow-inner">
                  <img src={invite.qrGroomBank} alt="Groom QR" className="w-full h-full object-contain" />
                </div>
                <div className="text-xs text-stone-600 font-medium space-y-1 text-center">
                  <p>Ngân hàng: <strong className="text-stone-800">{invite.groomBankName}</strong></p>
                  <p>Số tài khoản: <strong className="text-stone-800">{invite.groomBankAccount}</strong></p>
                  <p>Chủ tài khoản: <strong className="text-stone-800 font-mono">{invite.groomBankUser}</strong></p>
                </div>
              </motion.div>
            )}

            {/* Bride Bank registry details */}
            {invite.qrBrideBank && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-md space-y-4 flex flex-col items-center"
              >
                <span className="text-xs font-extrabold text-rose-500 uppercase tracking-wider">Mừng cưới Cô Dâu</span>
                <div className="h-44 w-44 border border-stone-100 p-2 rounded-2xl bg-stone-50 shadow-inner">
                  <img src={invite.qrBrideBank} alt="Bride QR" className="w-full h-full object-contain" />
                </div>
                <div className="text-xs text-stone-600 font-medium space-y-1 text-center">
                  <p>Ngân hàng: <strong className="text-stone-800">{invite.brideBankName}</strong></p>
                  <p>Số tài khoản: <strong className="text-stone-800">{invite.brideBankAccount}</strong></p>
                  <p>Chủ tài khoản: <strong className="text-stone-800 font-mono">{invite.brideBankUser}</strong></p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
      )}

      {/* Guestbook Board view wishes list */}
      {invite.guestbookEnabled !== false && (
        <section id="invitation-guestbook" className="py-16 sm:py-24 px-4 bg-white border-t border-stone-200 overflow-hidden">
          <div className="mx-auto max-w-3xl space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <MessageSquare className="h-8 w-8 text-rose-500 mx-auto mb-2" />
              <h2 className="font-serif text-2xl font-bold text-stone-800">{t.guestbookTitle}</h2>
            </motion.div>

            <div className="space-y-4">
              {rsvps.length === 0 ? (
                <p className="text-center text-stone-400 text-xs sm:text-sm italic py-8">Hãy là người đầu tiên gửi những lời chúc mừng hạnh phúc lứa đôi!</p>
              ) : (
                rsvps.map((rsvp, idx) => {
                  const filterText = (txt: string) => {
                    if (!invite.badWords || invite.badWords.length === 0) return txt;
                    let filtered = txt;
                    invite.badWords.forEach((word: string) => {
                      if (!word.trim()) return;
                      try {
                        const regex = new RegExp(word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
                        filtered = filtered.replace(regex, '***');
                      } catch (e) {}
                    });
                    return filtered;
                  };
                  const cleanGreetings = filterText(rsvp.greetings || "Chúc anh chị trăm năm hạnh phúc!");
                  const cleanGuestName = filterText(rsvp.guestName);
                  return (
                    <motion.div 
                      key={rsvp.id} 
                      initial={{ opacity: 0, y: 25 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: Math.min(idx * 0.08, 0.3) }}
                      className="bg-stone-50 p-5 rounded-2xl border border-stone-200/60 flex items-start gap-4"
                    >
                      <div className="h-10 w-10 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center shrink-0 uppercase shadow-sm">
                        {cleanGuestName.charAt(0) || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs sm:text-sm font-bold text-stone-800 truncate">{cleanGuestName}</span>
                          <span className="text-[10px] font-medium text-stone-400">{new Date(rsvp.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed italic whitespace-pre-line">"{cleanGreetings}"</p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      )}

      {/* Image zoom lightbox popup */}
      {lightboxImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setLightboxImg(null)}>
          <button className="absolute top-6 right-6 text-white hover:opacity-80">
            <X className="h-8 w-8" />
          </button>
          <img src={lightboxImg} alt="Lightbox Zoom" className="max-w-full max-h-[90vh] object-contain rounded-xl select-none" />
        </div>
      )}

      {/* Confetti celebration burst */}
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Toast notification system */}
      <Toast isOpen={isToastOpen} message={toastMessage} onClose={() => setIsToastOpen(false)} />

    </div>
  );
}
