/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Heart, Globe, User, ShieldAlert } from "lucide-react";
import { LanguageCode, translations } from "../translations";

interface NavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
}

export default function Navigation({ currentTab, setCurrentTab, lang, setLang }: NavigationProps) {
  const t = translations[lang];

  return (
    <header id="main-header" className="sticky top-0 z-50 w-full border-b border-stone-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div 
          id="brand-logo"
          className="flex cursor-pointer items-center gap-2"
          onClick={() => setCurrentTab("home")}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 border border-rose-100 text-rose-500 shadow-sm animate-pulse">
            <Heart className="h-5 w-5 fill-rose-500" />
          </div>
          <span className="font-serif text-xl font-bold tracking-wider text-stone-800">
            Amore <span className="text-rose-500">Love</span>
          </span>
        </div>

        {/* Nav Links */}
        <nav id="main-nav" className="hidden md:flex items-center gap-6">
          <button
            id="nav-btn-home"
            onClick={() => setCurrentTab("home")}
            className={`font-display text-sm font-medium transition-colors ${
              currentTab === "home" ? "text-rose-600 font-semibold" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {t.navHome}
          </button>
          <button
            id="nav-btn-templates"
            onClick={() => setCurrentTab("templates")}
            className={`font-display text-sm font-medium transition-colors ${
              currentTab === "templates" ? "text-rose-600 font-semibold" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {t.navTemplates}
          </button>
          <button
            id="nav-btn-editor"
            onClick={() => setCurrentTab("editor")}
            className={`font-display text-sm font-medium transition-colors ${
              currentTab === "editor" ? "text-rose-600 font-semibold" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {t.navEditor}
          </button>
          <button
            id="nav-btn-blog"
            onClick={() => setCurrentTab("blog")}
            className={`font-display text-sm font-medium transition-colors ${
              currentTab === "blog" ? "text-rose-600 font-semibold" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {t.navBlog}
          </button>
          <button
            id="nav-btn-dashboard"
            onClick={() => setCurrentTab("dashboard")}
            className={`font-display text-sm font-medium transition-colors ${
              currentTab === "dashboard" ? "text-rose-600 font-semibold" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {t.navDashboard}
          </button>
        </nav>

        {/* Action Controls */}
        <div id="nav-actions" className="flex items-center gap-4">
          {/* Language Selector */}
          <div className="relative flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-stone-700">
            <Globe className="h-4 w-4 text-stone-500" />
            <select
              id="lang-selector"
              value={lang}
              onChange={(e) => setLang(e.target.value as LanguageCode)}
              className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer pr-1"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
              <option value="zh">中文</option>
            </select>
          </div>

          {/* Quick CTA to Builder */}
          <button
            id="nav-quick-cta"
            onClick={() => setCurrentTab("editor")}
            className="hidden sm:inline-flex items-center justify-center rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-transform hover:scale-105 active:scale-95 bg-gradient-to-r hover:from-stone-900 hover:to-rose-950"
          >
            {t.navEditor}
          </button>

          {/* Admin link button */}
          <button
            id="nav-admin-link"
            title="Admin Dashboard"
            onClick={() => setCurrentTab("admin")}
            className={`p-2 rounded-full border transition-colors ${
              currentTab === "admin"
                ? "bg-stone-900 text-amber-400 border-stone-900"
                : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile nav rail */}
      <div id="mobile-nav-bar" className="flex md:hidden items-center justify-around border-t border-stone-100 bg-white py-2">
        <button
          id="mob-btn-home"
          onClick={() => setCurrentTab("home")}
          className={`flex flex-col items-center gap-0.5 text-xs ${
            currentTab === "home" ? "text-rose-500 font-medium" : "text-stone-500"
          }`}
        >
          <span className="text-lg">🏡</span>
          <span>{t.navHome}</span>
        </button>
        <button
          id="mob-btn-templates"
          onClick={() => setCurrentTab("templates")}
          className={`flex flex-col items-center gap-0.5 text-xs ${
            currentTab === "templates" ? "text-rose-500 font-medium" : "text-stone-500"
          }`}
        >
          <span className="text-lg">🎨</span>
          <span>{t.navTemplates}</span>
        </button>
        <button
          id="mob-btn-editor"
          onClick={() => setCurrentTab("editor")}
          className={`flex flex-col items-center gap-0.5 text-xs ${
            currentTab === "editor" ? "text-rose-500 font-medium" : "text-stone-500"
          }`}
        >
          <span className="text-lg">✍️</span>
          <span>{t.navEditor}</span>
        </button>
        <button
          id="mob-btn-dashboard"
          onClick={() => setCurrentTab("dashboard")}
          className={`flex flex-col items-center gap-0.5 text-xs ${
            currentTab === "dashboard" ? "text-rose-500 font-medium" : "text-stone-500"
          }`}
        >
          <span className="text-lg">📊</span>
          <span>{t.navDashboard}</span>
        </button>
      </div>
    </header>
  );
}
