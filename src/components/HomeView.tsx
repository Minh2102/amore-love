/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, Heart, Check, ChevronRight, MessageSquare, Quote, HelpCircle, Gift, Award, Calendar, Share2 } from "lucide-react";
import { LanguageCode, translations } from "../translations";

interface HomeViewProps {
  setCurrentTab: (tab: string) => void;
  lang: LanguageCode;
  onSelectTemplate: (templateId: string) => void;
}

export default function HomeView({ setCurrentTab, lang, onSelectTemplate }: HomeViewProps) {
  const t = translations[lang];
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const steps = [
    {
      num: "01",
      title: t.step1Title,
      desc: t.step1Desc,
      icon: "🎨"
    },
    {
      num: "02",
      title: t.step2Title,
      desc: t.step2Desc,
      icon: "✍️"
    },
    {
      num: "03",
      title: t.step3Title,
      desc: t.step3Desc,
      icon: "💌"
    }
  ];

  const plans = [
    {
      name: t.priceBasicName,
      price: t.priceBasicPrice,
      desc: "Trải nghiệm đầy đủ các tính năng cơ bản cho ngày cưới ấm áp.",
      features: [
        t.pricingFeature1,
        t.pricingFeature2,
        t.pricingFeature3,
        t.pricingFeature4,
      ],
      color: "border-stone-200 bg-white",
      btnStyle: "bg-stone-100 hover:bg-stone-200 text-stone-800"
    },
    {
      name: t.pricePremiumName,
      price: t.pricePremiumPrice,
      desc: "Sự kết hợp hoàn hảo của âm thanh lãng mạn và khả năng tự động hóa.",
      features: [
        t.pricingFeature1,
        t.pricingFeature2,
        "Album cưới lên tới 30 hình ảnh sắc nét",
        t.pricingFeature4,
        t.pricingFeature5,
        t.pricingFeature7,
      ],
      popular: true,
      color: "border-rose-300 bg-white shadow-[0_20px_50px_rgba(244,63,94,0.1)] relative",
      btnStyle: "bg-rose-500 hover:bg-rose-600 text-white"
    },
    {
      name: t.priceLuxuryName,
      price: t.priceLuxuryPrice,
      desc: "Đẳng cấp hoàng gia hoàn mỹ tích hợp trợ lý trí tuệ nhân tạo thông minh.",
      features: [
        t.pricingFeature1,
        t.pricingFeature2,
        "Album cưới & Video HD không giới hạn số lượng",
        t.pricingFeature4,
        t.pricingFeature5,
        t.pricingFeature6,
        t.pricingFeature7,
        "Tên miền riêng cao cấp (.com, .net)",
        "Thiết kế thiệp chúc mừng tùy chỉnh thủ công"
      ],
      color: "border-amber-400 bg-stone-900 text-stone-100 shadow-[0_20px_50px_rgba(197,168,128,0.25)]",
      btnStyle: "bg-gradient-to-r from-amber-500 to-yellow-600 hover:opacity-90 text-white"
    }
  ];

  const reviews = [
    {
      author: "Mai Linh & Hoàng Nam",
      date: "05/2026",
      avatar: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=150",
      content: "Chúng tôi nhận được vô vàn lời khen từ họ hàng và bạn bè vì tấm thiệp cưới online quá đỗi sang trọng. Chức năng RSVP giúp kiểm soát chính xác số lượng khách tới ăn tiệc cực kỳ rực rỡ và nhàn nhã!"
    },
    {
      author: "Kim Chi & Minh Hải",
      date: "06/2026",
      avatar: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=150",
      content: "Nhạc nền lãng mạn cùng album cưới mượt mà giúp tái hiện hoàn hảo chặng đường yêu nhau của hai đứa. Đặc biệt trợ lý AI viết chuyện tình cực kỳ thơ mộng và xúc động!"
    }
  ];

  const faqs = [
    {
      q: t.faq1Q,
      a: t.faq1A
    },
    {
      q: t.faq2Q,
      a: t.faq2A
    },
    {
      q: "Tôi có thể thay đổi thông tin sau khi đã xuất bản thiệp cưới không?",
      a: "Hoàn toàn được! Bạn có thể chỉnh sửa bất cứ lúc nào từ thông tin đám cưới, đổi nhạc nền, cập nhật menu hay thêm bớt ảnh trong album cưới của mình. Giao diện thiệp của khách mời sẽ ngay lập tức được đồng bộ hóa tức thì."
    },
    {
      q: "Các thông tin mừng cưới chuyển khoản bằng QR có được bảo mật không?",
      a: "Có, hệ thống chỉ hiển thị mã QR theo cấu trúc số tài khoản ngân hàng của bạn để khách mời dễ dàng quét chuyển khoản khi mừng cưới từ xa. Mọi giao dịch diễn ra hoàn toàn trực tiếp giữa tài khoản của khách mời và ngân hàng của bạn."
    }
  ];

  return (
    <div id="home-view-container" className="flex flex-col bg-stone-50/50">
      {/* Hero Section */}
      <section id="hero-section" className="relative overflow-hidden py-16 sm:py-24">
        {/* Decorative background vectors */}
        <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-rose-100/30 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-amber-100/30 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-4 py-1.5 text-xs font-semibold text-rose-600 border border-rose-100 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>NỀN TẢNG TIÊN PHONG CÔNG NGHỆ CƯỚI 2026</span>
          </div>

          <h1 id="hero-main-title" className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 leading-tight max-w-5xl mx-auto">
            {t.heroTitle}
          </h1>

          <p id="hero-main-subtitle" className="mt-6 text-base sm:text-lg text-stone-600 max-w-3xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>

          <div id="hero-cta-group" className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              id="hero-btn-primary"
              onClick={() => setCurrentTab("editor")}
              className="rounded-full bg-rose-500 px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-rose-600 hover:shadow-xl hover:scale-105 active:scale-95"
            >
              {t.btnGetStarted}
            </button>
            <button
              id="hero-btn-secondary"
              onClick={() => setCurrentTab("templates")}
              className="rounded-full bg-white border border-stone-200 px-8 py-4 text-sm font-bold text-stone-800 shadow-sm transition-all hover:bg-stone-50 hover:border-stone-300"
            >
              {t.btnLearnMore}
            </button>
          </div>

          {/* Interactive mockup preview container */}
          <div id="hero-mockup-wrapper" className="mt-16 relative mx-auto max-w-4xl rounded-3xl border border-stone-200/60 p-4 bg-white/40 shadow-2xl backdrop-blur-sm">
            <div className="absolute -top-3 -right-3 bg-amber-400 text-stone-900 text-[10px] font-bold px-3 py-1 rounded-full shadow-md tracking-wider flex items-center gap-1">
              <span>★ LUXURY THEME ACTIVE</span>
            </div>
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-inner aspect-[16/9] relative group">
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200"
                alt="Wedding Showcase Mockup"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent flex flex-col justify-end p-8 text-left">
                <div className="flex items-center gap-2 text-rose-300 font-serif italic text-lg sm:text-xl mb-1">
                  <span>Duy Anh & Mai Chi</span>
                  <Heart className="h-4 w-4 fill-rose-300" />
                  <span>18.10.2026</span>
                </div>
                <h3 className="text-white font-serif text-2xl sm:text-3xl font-medium tracking-wide">Lễ Thành Hôn Hoàng Gia</h3>
                <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-lg">The Grand Romance Resort, TP. Hồ Chí Minh</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section id="features-bento-section" className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
              Công nghệ đỉnh cao cho ngày chung đôi trọn vẹn
            </h2>
            <p className="mt-4 text-stone-600 text-sm sm:text-base">
              Không chỉ đơn giản là một tấm thiệp tĩnh, chúng tôi cung cấp hệ thống giải pháp cưới toàn diện, tinh tế và đầy bản sắc sáng tạo riêng biệt.
            </p>
          </div>

          <div id="features-grid" className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Bento Card 1 */}
            <div className="p-8 rounded-3xl border border-stone-100 bg-stone-50/50 flex flex-col justify-between hover:shadow-xl transition-all group">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-xl mb-6 shadow-sm">
                  ❤️
                </div>
                <h3 className="font-serif text-xl font-bold text-stone-800">Cá nhân hóa đỉnh cao</h3>
                <p className="mt-3 text-stone-600 text-sm leading-relaxed">
                  Tự tay tùy biến toàn bộ thông tin cô dâu chú rể, nhạc nền, thực đơn tiệc, dress code, sơ đồ vị trí bàn tiệc linh hoạt theo phong cách của bạn.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-stone-200/50 flex items-center gap-1.5 text-xs font-semibold text-rose-600 cursor-pointer" onClick={() => setCurrentTab("editor")}>
                <span>Bắt đầu thiết kế</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Bento Card 2 */}
            <div className="p-8 rounded-3xl border border-rose-100 bg-rose-50/20 flex flex-col justify-between hover:shadow-xl transition-all group">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl mb-6 shadow-sm">
                  ✨
                </div>
                <h3 className="font-serif text-xl font-bold text-stone-800">Trí tuệ nhân tạo Gemini</h3>
                <p className="mt-3 text-stone-600 text-sm leading-relaxed">
                  Tích hợp AI viết câu chuyện tình yêu mượt mà lãng mạn, đồng thời tự động đề xuất những lời chúc phúc sáng tạo vô giá theo đúng tâm nguyện lứa đôi.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-rose-200/40 flex items-center gap-1.5 text-xs font-semibold text-rose-600 cursor-pointer" onClick={() => setCurrentTab("editor")}>
                <span>Dùng thử Trợ lý AI</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Bento Card 3 */}
            <div className="p-8 rounded-3xl border border-stone-100 bg-stone-50/50 flex flex-col justify-between hover:shadow-xl transition-all group">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-xl mb-6 shadow-sm">
                  📊
                </div>
                <h3 className="font-serif text-xl font-bold text-stone-800">Quản lý RSVP tự động</h3>
                <p className="mt-3 text-stone-600 text-sm leading-relaxed">
                  Theo dõi thời gian thực danh sách khách dự đám cưới, số lượng đi kèm, lựa chọn thực đơn ăn tiệc, dị ứng thức ăn và các khoản tiền mừng trực tuyến.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-stone-200/50 flex items-center gap-1.5 text-xs font-semibold text-rose-600 cursor-pointer" onClick={() => setCurrentTab("dashboard")}>
                <span>Vào Dashboard</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Step Process Flow */}
      <section id="process-section" className="py-16 sm:py-24 bg-stone-50/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-center text-stone-900 mb-16">
            {t.stepTitle}
          </h2>

          <div id="steps-container" className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-dashed bg-rose-200/40 z-0" />
            {steps.map((step, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl border border-stone-200/50 shadow-md relative z-10 flex flex-col items-center text-center hover:scale-105 transition-all">
                <span className="absolute -top-4 left-6 bg-rose-500 text-white font-mono text-sm font-bold px-3 py-1 rounded-full shadow-md">
                  {step.num}
                </span>
                <div className="h-16 w-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-3xl mb-6 shadow-inner">
                  {step.icon}
                </div>
                <h3 className="font-serif text-lg font-bold text-stone-800">{step.title}</h3>
                <p className="mt-3 text-stone-600 text-xs sm:text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Sections */}
      <section id="pricing-section" className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
              {t.priceTitle}
            </h2>
            <p className="mt-4 text-stone-600 text-sm sm:text-base">
              Lựa chọn gói dịch vụ tối ưu nhất để mang lại trải nghiệm đỉnh cao cho khách mời ngày vui trọng đại của hai bạn.
            </p>
          </div>

          <div id="pricing-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-3xl border flex flex-col justify-between hover:shadow-2xl transition-all ${plan.color}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[10px] font-extrabold tracking-widest px-4 py-1.5 rounded-full shadow-md uppercase">
                    KHUYÊN DÙNG (POPULAR)
                  </span>
                )}
                <div>
                  <h3 className="font-serif text-xl font-bold">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="font-serif text-4xl font-extrabold tracking-tight">{plan.price}</span>
                  </div>
                  <p className="mt-4 text-xs opacity-80 leading-relaxed">{plan.desc}</p>
                  
                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-xs sm:text-sm">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => setCurrentTab("editor")}
                  className={`mt-10 w-full py-3.5 rounded-full font-bold text-sm shadow-md transition-all active:scale-95 ${plan.btnStyle}`}
                >
                  Bắt đầu tạo thiệp
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Testimonial Reviews */}
      <section id="testimonials-section" className="py-16 sm:py-24 bg-stone-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
              Chia sẻ từ các cặp đôi hạnh phúc
            </h2>
            <p className="mt-4 text-stone-600 text-sm">
              Niềm vui và sự hài lòng tuyệt đối của khách hàng chính là động lực lớn nhất để Amore Love hoàn thiện mỗi ngày.
            </p>
          </div>

          <div id="reviews-grid" className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reviews.map((rev, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl border border-stone-200/50 shadow-md flex gap-6 items-start hover:shadow-lg transition-all">
                <img
                  src={rev.avatar}
                  alt={rev.author}
                  className="h-16 w-16 rounded-full object-cover border border-stone-100 shadow-sm shrink-0"
                />
                <div className="flex-1">
                  <Quote className="h-8 w-8 text-rose-200 fill-rose-50 mb-2" />
                  <p className="text-stone-700 text-xs sm:text-sm italic leading-relaxed">"{rev.content}"</p>
                  <div className="mt-4 flex items-center justify-between text-xs font-semibold text-stone-500">
                    <span className="text-stone-800">{rev.author}</span>
                    <span>Đám cưới {rev.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq-section" className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <HelpCircle className="h-8 w-8 text-rose-500 mx-auto mb-3" />
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
              {t.faqTitle}
            </h2>
          </div>

          <div id="faqs-accordion-wrapper" className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-stone-200 rounded-2xl overflow-hidden shadow-sm bg-stone-50/30">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left font-serif text-base font-semibold text-stone-800 hover:bg-stone-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className="text-rose-500 text-xl font-bold shrink-0 ml-4">
                    {activeFaq === idx ? "−" : "+"}
                  </span>
                </button>
                {activeFaq === idx && (
                  <div className="p-6 pt-0 border-t border-stone-100 bg-white text-stone-600 text-xs sm:text-sm leading-relaxed animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
