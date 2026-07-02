/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Search, Heart, SlidersHorizontal, Sparkles, Eye, CheckCircle2 } from "lucide-react";
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
    { id: "minimal", name: "Tối giản" }
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
                
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-full border border-white" style={{ backgroundColor: tpl.primaryColor }} title="Tông màu chủ đạo" />
                    <span className="inline-block h-3 w-3 rounded-full border border-white" style={{ backgroundColor: tpl.backgroundColor }} title="Nền thiệp" />
                  </div>
                  <button
                    onClick={() => onSelectTemplate(tpl.id)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                  >
                    <span>Lựa chọn giao diện</span>
                    <SlidersHorizontal className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Simple Quick Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl border border-stone-200 flex flex-col sm:flex-row animate-scale-in">
            <div className="w-full sm:w-1/2 aspect-square sm:aspect-auto bg-stone-100 relative">
              <img
                src={previewTemplate.coverImage}
                alt={previewTemplate.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-8 w-full sm:w-1/2 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-rose-500 tracking-widest">{previewTemplate.category}</span>
                <h2 className="font-serif text-2xl font-bold text-stone-900 mt-1">{previewTemplate.name}</h2>
                <p className="mt-4 text-stone-600 text-xs sm:text-sm leading-relaxed">{previewTemplate.description}</p>

                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Fonts: {previewTemplate.fontHeading} / {previewTemplate.fontBody}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Giao diện chuẩn Responsive 100%</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Hỗ trợ chuyển đổi ngôn ngữ linh hoạt</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="px-4 py-2 rounded-full border border-stone-200 text-stone-600 text-xs font-bold hover:bg-stone-50 flex-1"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    onSelectTemplate(previewTemplate.id);
                    setPreviewTemplate(null);
                  }}
                  className="px-5 py-2.5 rounded-full bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 shadow-md flex-1"
                >
                  Thiết kế ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
