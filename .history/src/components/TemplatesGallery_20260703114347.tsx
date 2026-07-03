/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Search, Heart, SlidersHorizontal, Sparkles, Eye, CheckCircle2, X } from "lucide-react";
import { Template } from "../types";
import { LanguageCode, translations } from "../translations";

interface TemplatesGalleryProps {
  onSelectTemplate: (templateId: string) => void;
  lang: LanguageCode;
}

export default function TemplatesGallery({ onSelectTemplate, lang }: TemplatesGalleryProps) {
  const t = translations[lang];
  const [templates, setTemplates] = useState<Template[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  // Fetch templates from Express backend
  useEffect(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) => setTemplates(data))
      .catch((err) => console.error("Error fetching templates:", err));
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((f) => f !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const categories = [
    { id: "all", name: "Tất cả mẫu" },
    { id: "modern", name: "Hiện đại" },
    { id: "luxury", name: "Sang trọng" },
    { id: "floral", name: "Hoa cỏ" },
    { id: "minimal", name: "Tối giản" },
    { id: "classic", name: "Cổ điển" },
    { id: "vintage", name: "Hoài cổ" },
    { id: "elegant", name: "Thanh lịch" }
  ];

  // Filtering & Sorting
  const filteredTemplates = templates
    .filter((tpl) => {
      const matchSearch = tpl.name.toLowerCase().includes(search.toLowerCase()) || 
                          tpl.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === "all" || tpl.category === selectedCategory;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div id="templates-gallery-container" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header section */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
          Bộ sưu tập mẫu giao diện thiệp cưới 2026
        </h1>
        <p className="mt-3 text-stone-600 text-sm sm:text-base leading-relaxed">
          Tất cả giao diện được các chuyên gia UI/UX thiết kế chuyên biệt, tương thích hoàn toàn trên cả thiết bị di động, tablet và máy tính để bàn.
        </p>
      </div>

      {/* Filters bar */}
      <div id="filters-container" className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-stone-200 pb-6 mb-8">
        {/* Categories Tab */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
                selectedCategory === cat.id
                  ? "bg-rose-500 text-white shadow-md shadow-rose-200"
                  : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Tìm kiếm mẫu giao diện..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-stone-200 text-xs focus:outline-none focus:border-rose-400 bg-white shadow-sm"
            />
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-2 text-stone-700 text-xs">
            <SlidersHorizontal className="h-4 w-4 text-stone-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-medium focus:outline-none cursor-pointer"
            >
              <option value="name">Sắp xếp: Tên A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of templates */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-20 text-stone-500">
          <p className="text-lg font-serif">Không tìm thấy mẫu thiệp cưới nào phù hợp</p>
          <p className="text-sm mt-1">Vui lòng thử tìm kiếm bằng từ khoá khác.</p>
        </div>
      ) : (
        <div id="templates-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group relative"
            >
              {/* Cover display */}
              <div className="aspect-[4/3] w-full overflow-hidden relative bg-stone-100">
                <img
                  src={tpl.coverImage}
                  alt={tpl.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setPreviewTemplate(tpl)}
                    className="h-10 w-10 rounded-full bg-white text-stone-800 shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                    title="Xem nhanh chi tiết"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onSelectTemplate(tpl.id)}
                    className="px-4 py-2 rounded-full bg-rose-500 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 hover:scale-110 active:scale-95 transition-all"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Thiết kế ngay</span>
                  </button>
                </div>

                {/* Favorite Icon */}
                <button
                  onClick={(e) => toggleFavorite(tpl.id, e)}
                  className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/90 backdrop-blur-md text-stone-600 hover:text-rose-500 shadow-md flex items-center justify-center transition-colors"
                >
                  <Heart
                    className={`h-4.5 w-4.5 ${
                      favorites.includes(tpl.id) ? "fill-rose-500 text-rose-500" : ""
                    }`}
                  />
                </button>

                {/* Badge Category */}
                <span className="absolute bottom-4 left-4 rounded-full bg-stone-900/80 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  {tpl.category}
                </span>
              </div>

              {/* Text content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-800">{tpl.name}</h3>
                  <p className="mt-2 text-stone-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-stone-100 flex flex-col gap-3">
                  <div className="flex gap-1.5 items-center">
                    <span className="inline-block h-3 w-3 rounded-full border border-white" style={{ backgroundColor: tpl.primaryColor }} title="Tông màu chủ đạo" />
                    <span className="inline-block h-3 w-3 rounded-full border border-white" style={{ backgroundColor: tpl.backgroundColor }} title="Nền thiệp" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setPreviewTemplate(tpl)}
                      className="flex-1 min-w-[120px] px-3 py-2 rounded-full bg-stone-900 text-white text-[11px] font-bold hover:bg-stone-800 transition-all"
                    >
                      Xem demo
                    </button>
                    <button
                      onClick={() => onSelectTemplate(tpl.id)}
                      className="flex-1 min-w-[120px] px-3 py-2 rounded-full bg-rose-500 text-white text-[11px] font-bold hover:bg-rose-600 transition-all"
                    >
                      Chọn mẫu
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Demo chi tiết modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl rounded-[2rem] overflow-hidden bg-white shadow-[0_30px_80px_rgba(15,23,42,0.35)] border border-stone-200 animate-scale-in">
            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-0 lg:gap-8">
              <div className="relative bg-gradient-to-br from-stone-950 via-slate-900 to-stone-900 text-white p-8 lg:p-10">
                <div className="absolute inset-0 opacity-40" style={{ backgroundImage: `url(${previewTemplate.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div className="relative z-10 flex flex-col gap-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.35em] text-white/80">
                    {previewTemplate.category}
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-rose-200/80">Demo Preview</p>
                    <h2 className="mt-3 text-4xl sm:text-5xl font-semibold leading-tight" style={{ color: previewTemplate.primaryColor }}>
                      {previewTemplate.name}
                    </h2>
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-200/90">
                      {previewTemplate.description}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                      <p className="text-[10px] uppercase tracking-[0.35em] text-stone-200">Cặp đôi</p>
                      <p className="mt-3 text-lg font-semibold">Duy Anh & Mai Chi</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                      <p className="text-[10px] uppercase tracking-[0.35em] text-stone-200">Ngày cưới</p>
                      <p className="mt-3 text-lg font-semibold">18/10/2026 · 11:00</p>
                      <p className="mt-2 text-sm text-stone-200/80">The Grand Romance Resort, Quận 1</p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-3xl border border-white/10 bg-white/10 p-4 text-center">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-stone-200">Responsive</p>
                      <p className="mt-3 text-base font-semibold">Mobile & Desktop</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/10 p-4 text-center">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-stone-200">RSVP online</p>
                      <p className="mt-3 text-base font-semibold">Gửi lời mời nhanh</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/10 p-4 text-center">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-stone-200">Bản đồ</p>
                      <p className="mt-3 text-base font-semibold">Google Maps</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-stone-50 p-8 lg:p-10 flex flex-col justify-between gap-8">
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Chi tiết mẫu</p>
                      <h3 className="mt-2 text-3xl font-semibold text-stone-900">Mô phỏng giao diện đầy đủ</h3>
                    </div>
                    <button
                      onClick={() => setPreviewTemplate(null)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 transition hover:bg-stone-100"
                      aria-label="Đóng preview"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-6 grid gap-4">
                    <div className="rounded-3xl border border-stone-200 bg-white p-5">
                      <p className="text-[10px] uppercase tracking-[0.35em] text-stone-500">Phối màu</p>
                      <div className="mt-3 flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 rounded-full border" style={{ backgroundColor: previewTemplate.primaryColor }} />
                        <span className="text-sm font-semibold text-stone-900">Màu chính</span>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 rounded-full border" style={{ backgroundColor: previewTemplate.backgroundColor }} />
                        <span className="text-sm font-semibold text-stone-900">Màu nền</span>
                      </div>
                    </div>
                    <div className="rounded-3xl border border-stone-200 bg-white p-5">
                      <p className="text-[10px] uppercase tracking-[0.35em] text-stone-500">Typography</p>
                      <p className="mt-3 text-sm font-semibold text-stone-900">Tiêu đề: {previewTemplate.fontHeading}</p>
                      <p className="mt-2 text-sm font-semibold text-stone-900">Nội dung: {previewTemplate.fontBody}</p>
                    </div>
                    <div className="rounded-3xl border border-stone-200 bg-white p-5">
                      <p className="text-[10px] uppercase tracking-[0.35em] text-stone-500">Đặc điểm</p>
                      <ul className="mt-3 space-y-2 text-sm text-stone-600">
                        <li>• Thông điệp chào đón ấm áp</li>
                        <li>• Hình ảnh bìa lớn nổi bật</li>
                        <li>• Khả năng tùy chọn logo và nhạc nền</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-stone-500">Bố cục preview</p>
                    <div className="mt-4 rounded-3xl border border-stone-200 bg-stone-50 p-5">
                      <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Lời mời</p>
                      <h4 className="mt-3 text-xl font-semibold text-stone-900">Chúng tôi trân trọng kính mời</h4>
                      <p className="mt-3 text-sm leading-relaxed text-stone-600">
                        Gia đình chúng tôi xin kính mời quý khách đến tham dự lễ cưới của hai con tại không gian sang trọng và ấm cúng, ngày 18/10/2026.
                      </p>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                        <p className="text-[10px] uppercase tracking-[0.35em] text-stone-500">Nội dung chính</p>
                        <p className="mt-3 text-sm text-stone-700">Thông tin thời gian, địa điểm, dresscode và hashtag.</p>
                      </div>
                      <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                        <p className="text-[10px] uppercase tracking-[0.35em] text-stone-500">Tính năng</p>
                        <p className="mt-3 text-sm text-stone-700">Bản đồ, RSVP, ảnh cưới, ví quà mừng.</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-stone-500">Xem trước full demo</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4 text-center">
                        <p className="text-[10px] uppercase tracking-[0.35em] text-stone-500">Ảnh bìa</p>
                        <p className="mt-3 text-sm font-semibold text-stone-900">Nổi bật</p>
                      </div>
                      <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4 text-center">
                        <p className="text-[10px] uppercase tracking-[0.35em] text-stone-500">Nội dung</p>
                        <p className="mt-3 text-sm font-semibold text-stone-900">Đầy đủ</p>
                      </div>
                      <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4 text-center">
                        <p className="text-[10px] uppercase tracking-[0.35em] text-stone-500">Âm nhạc</p>
                        <p className="mt-3 text-sm font-semibold text-stone-900">Kèm theo</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="flex-1 rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={() => {
                      onSelectTemplate(previewTemplate.id);
                      setPreviewTemplate(null);
                    }}
                    className="flex-1 rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
                  >
                    Chọn mẫu và vào editor
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
