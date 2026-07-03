/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Navigation from "./components/Navigation";
import HomeView from "./components/HomeView";
import TemplatesGallery from "./components/TemplatesGallery";
import InvitationEditor from "./components/InvitationEditor";
import InvitationView from "./components/InvitationView";
import DashboardView from "./components/DashboardView";
import AdminDashboard from "./components/AdminDashboard";
import BlogView from "./components/BlogView";
import { LanguageCode, translations } from "./translations";
import { WeddingInvitation } from "./types";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("home");
  const [lang, setLang] = useState<LanguageCode>("vi");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [editorInvitation, setEditorInvitation] = useState<WeddingInvitation | null>(null);
  const [previewSlug, setPreviewSlug] = useState<string>("duy-anh-mai-chi");
  const [previewData, setPreviewData] = useState<WeddingInvitation | null>(null);

  const t = translations[lang];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteSlug = params.get("invite") || params.get("id");
    if (inviteSlug) {
      setPreviewSlug(inviteSlug);
      setCurrentTab("live-invitation");
    }
  }, []);

  const handleGoHome = () => {
    window.history.replaceState({}, document.title, window.location.pathname);
    setCurrentTab("home");
    setPreviewData(null);
  };

  // Callback when a template is chosen from Gallery
  const handleSelectTemplate = (templateId: string) => {
    setEditorInvitation(null);
    setSelectedTemplateId(templateId);
    setPreviewData(null);
    setCurrentTab("editor");
  };

  const handleEditInvitation = (slug: string, invitation?: WeddingInvitation | null) => {
    setSelectedTemplateId(invitation?.templateId || null);
    setEditorInvitation(invitation || null);
    setPreviewData(null);
    setCurrentTab("editor");
  };

  // Callback to display the custom wedding invitation preview page
  const handlePreviewInvitation = (slug: string, previewData?: WeddingInvitation | null) => {
    setPreviewSlug(slug);
    setPreviewData(previewData || null);
    setCurrentTab("preview");
  };

  return (
    <div id="amore-love-app" className="min-h-screen flex flex-col bg-stone-50/50">
      
      {/* Shared Header Navigation */}
      {currentTab !== "live-invitation" && (
        <Navigation 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
          lang={lang} 
          setLang={setLang} 
        />
      )}

      {/* Main viewport dispatcher */}
      <main id="app-viewport" className="flex-grow">
        {currentTab === "home" && (
          <HomeView 
            setCurrentTab={setCurrentTab} 
            lang={lang} 
            onSelectTemplate={handleSelectTemplate} 
          />
        )}

        {currentTab === "templates" && (
          <TemplatesGallery 
            onSelectTemplate={handleSelectTemplate} 
            lang={lang} 
          />
        )}

        {currentTab === "editor" && (
          <InvitationEditor 
            selectedTemplateId={selectedTemplateId} 
            initialInvitation={editorInvitation}
            onPreviewInvitation={handlePreviewInvitation} 
            lang={lang} 
          />
        )}

        {currentTab === "preview" && (
          <div className="space-y-4">
            {/* Quick alert bar to navigate back to builder */}
            <div className="bg-stone-900 text-white py-3.5 px-4 text-center text-xs font-semibold flex items-center justify-center gap-3">
              <span>Đây là chế độ xem trước tấm thiệp của bạn. Bạn muốn tiếp tục tùy biến thêm?</span>
              <button
                onClick={() => setCurrentTab("editor")}
                className="bg-rose-500 hover:bg-rose-600 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wide shadow-sm transition-transform hover:scale-105 active:scale-95"
              >
                Quay lại Chỉnh sửa
              </button>
            </div>
            
            <InvitationView 
              slug={previewSlug} 
              lang={lang} 
              previewInvite={previewData}
            />
          </div>
        )}

        {currentTab === "live-invitation" && (
          <div className="space-y-4">
            <InvitationView 
              slug={previewSlug} 
              lang={lang} 
            />
            {/* Elegant banner offering viewers to create their own invitation at Amore Love */}
            <div className="bg-white border-t border-stone-200 py-8 px-4 text-center space-y-3.5 shadow-inner">
              <p className="text-xs sm:text-sm text-stone-600 font-medium">
                Tấm thiệp cưới trực tuyến lộng lẫy này được thiết kế miễn phí bởi nền tảng <span className="font-serif font-bold text-stone-800">Amore <span className="text-rose-500">Love</span></span>.
              </p>
              <button
                onClick={handleGoHome}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95"
              >
                Tự thiết kế thiệp cưới miễn phí ngay
              </button>
            </div>
          </div>
        )}

        {currentTab === "dashboard" && (
          <DashboardView 
            lang={lang} 
            onEditInvitation={handleEditInvitation} 
          />
        )}

        {currentTab === "admin" && (
          <AdminDashboard 
            lang={lang} 
          />
        )}

        {currentTab === "blog" && (
          <BlogView 
            lang={lang} 
          />
        )}
      </main>

      {/* Shared Footer block */}
      {currentTab !== "live-invitation" && (
        <footer id="app-footer" className="border-t border-stone-200 bg-white py-8 px-4 sm:px-6 lg:px-8 text-center text-stone-500 text-xs font-medium">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="font-serif text-lg font-bold tracking-wider text-stone-700">
              Amore <span className="text-rose-500">Love</span>
            </div>
            <p>{t.footerText}</p>
            <div className="flex gap-4">
              <span className="hover:text-stone-800 cursor-pointer">Bảo mật</span>
              <span>•</span>
              <span className="hover:text-stone-800 cursor-pointer">Điều khoản</span>
            </div>
          </div>
        </footer>
      )}

    </div>
  );
}
