/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Search, Clock, Calendar, User, MessageSquare, Share2, Tag, ChevronRight, Heart } from "lucide-react";
import { BlogPost } from "../types";
import { LanguageCode, translations } from "../translations";

interface BlogViewProps {
  lang: LanguageCode;
}

export default function BlogView({ lang }: BlogViewProps) {
  const t = translations[lang];

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [search, setSearch] = useState("");
  const [comments, setComments] = useState<{ name: string; text: string; date: string }[]>([
    { name: "Thu Trang", text: "Bài viết chia sẻ lộ trình chuẩn bị rất chi tiết và trực quan. Việc tạo thiệp cưới online giúp mình nhàn nhã hơn hẳn trong khâu gom RSVP!", date: "02/07/2026" },
    { name: "Quốc Đạt", text: "Xu hướng thiệp cưới kỹ thuật số thực sự bảo vệ môi trường và cực kỳ sang trọng.", date: "02/07/2026" }
  ]);
  const [newCommentName, setNewCommentName] = useState("");
  const [newCommentText, setNewCommentText] = useState("");

  useEffect(() => {
    fetch("/api/blogs")
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error(err));
  }, []);

  const handlePostClick = (slug: string) => {
    fetch(`/api/blogs/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setSelectedPost(data);
        // Reset comment list
        setNewCommentName("");
        setNewCommentText("");
      })
      .catch((err) => console.error(err));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentName.trim() || !newCommentText.trim()) return;

    const comment = {
      name: newCommentName,
      text: newCommentText,
      date: new Date().toLocaleDateString("vi-VN")
    };
    setComments([...comments, comment]);
    setNewCommentName("");
    setNewCommentText("");
  };

  const filteredPosts = posts.filter((post) => 
    post.title.toLowerCase().includes(search.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div id="blog-root" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {selectedPost ? (
        /* Blog Detail view */
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <button
            onClick={() => setSelectedPost(null)}
            className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 border border-rose-200/50 bg-rose-50/20 px-4 py-2 rounded-full"
          >
            ← Quay lại danh sách bài viết
          </button>

          <div className="space-y-4">
            <span className="text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 rounded-full px-3 py-1 uppercase">{selectedPost.category}</span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 leading-tight">{selectedPost.title}</h1>
            
            {/* Metadata indicators */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 font-medium pt-2 border-b border-stone-100 pb-4">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>Tác giả: {selectedPost.author}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Xuất bản: {selectedPost.publishDate}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Thời gian đọc: {selectedPost.readingTime}</span>
              </span>
            </div>
          </div>

          {/* Large cover image */}
          <div className="aspect-[21/9] rounded-3xl overflow-hidden border border-stone-100 shadow-md">
            <img
              src={selectedPost.coverImage}
              alt={selectedPost.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Detailed rich article body text */}
          <article className="prose prose-stone max-w-none text-xs sm:text-sm md:text-base leading-relaxed text-stone-700 whitespace-pre-line space-y-4">
            {selectedPost.content}
          </article>

          {/* Interactive Comments sections board */}
          <div className="border-t border-stone-200 pt-8 mt-12 space-y-6">
            <h3 className="font-serif text-xl font-bold text-stone-800 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-rose-500" />
              <span>Bình luận ({comments.length})</span>
            </h3>

            {/* Comment list */}
            <div className="space-y-4">
              {comments.map((comm, idx) => (
                <div key={idx} className="bg-stone-50 p-4 rounded-2xl border border-stone-200/60 text-xs sm:text-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-stone-800">{comm.name}</span>
                    <span className="text-[10px] text-stone-400 font-medium">{comm.date}</span>
                  </div>
                  <p className="text-stone-600 leading-relaxed italic">"{comm.text}"</p>
                </div>
              ))}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="space-y-4 pt-4 bg-stone-50/50 p-5 rounded-3xl border border-stone-200">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-widest block">Để lại ý kiến của bạn</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Tên của bạn..."
                  value={newCommentName}
                  onChange={(e) => setNewCommentName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:border-rose-400"
                />
              </div>
              <textarea
                required
                rows={3}
                placeholder="Ý kiến bình luận của bạn..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:border-rose-400 resize-none leading-relaxed"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-stone-900 text-white rounded-full text-xs font-bold hover:bg-stone-800 shadow-sm active:scale-95 transition-all"
              >
                Gửi bình luận
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Blog List view */
        <div className="space-y-12">
          {/* Header titles */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
              {t.blogHeader}
            </h1>
            <p className="text-stone-600 text-xs sm:text-sm md:text-base leading-relaxed">
              {t.blogSubtitle}
            </p>
          </div>

          {/* Search bar */}
          <div className="max-w-md mx-auto relative mb-12">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Tìm kiếm cẩm nang chuẩn bị cưới..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-stone-200 text-xs focus:outline-none focus:border-rose-400 bg-white shadow-sm"
            />
          </div>

          {/* Grid of articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => handlePostClick(post.slug)}
                className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer group"
              >
                <div className="aspect-[16/10] w-full bg-stone-100 overflow-hidden relative">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-4 left-4 rounded-full bg-stone-900/85 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase text-white tracking-widest shadow-md">
                    {post.category}
                  </span>
                </div>

                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-2.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{post.publishDate}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{post.readingTime} đọc</span>
                      </span>
                    </div>

                    <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-800 leading-snug group-hover:text-rose-500 transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="mt-3 text-stone-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-stone-500 group-hover:text-stone-800 transition-colors">
                    <span>Đọc chi tiết bài viết</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
