/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ShieldAlert, Users, Layers, ShoppingBag, CreditCard, Ticket, 
  Settings, HelpCircle, BarChart, Check, Trash, Plus, CheckCircle2 
} from "lucide-react";
import { LanguageCode, translations } from "../translations";

interface AdminDashboardProps {
  lang: LanguageCode;
}

export default function AdminDashboard({ lang }: AdminDashboardProps) {
  const t = translations[lang];

  const [activeSubTab, setActiveSubTab] = useState<"users" | "orders" | "settings">("users");
  const [successMsg, setSuccessMsg] = useState("");

  const usersMock = [
    { id: "usr-1", name: "Lê Duy Anh", email: "duyanh@gmail.com", role: "Customer", registered: "2026-07-02" },
    { id: "usr-2", name: "Trần Mai Chi", email: "maichi@gmail.com", role: "Customer", registered: "2026-07-02" },
    { id: "usr-3", name: "Quốc Anh", email: "quocanh.admin@love.com", role: "Admin", registered: "2026-06-01" }
  ];

  const ordersMock = [
    { id: "ord-1001", user: "Lê Duy Anh", plan: t.pricePremiumName, price: "299.000đ", status: "Completed", date: "2026-07-02" },
    { id: "ord-1002", user: "Nguyễn Thu Hà", plan: t.priceLuxuryName, price: "599.000đ", status: "Completed", date: "2026-06-28" }
  ];

  const handleApplySettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("Đã cập nhật cấu hình hệ thống thành công!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div id="admin-dashboard-container" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Upper header */}
      <div className="border-b border-stone-200 pb-6 mb-8 flex items-center gap-3">
        <div className="h-10 w-10 bg-stone-900 text-amber-400 rounded-2xl flex items-center justify-center text-lg shadow-sm">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Bảng Quản Trị Hệ Thống (Admin Portal)</h1>
          <p className="mt-1 text-stone-600 text-xs sm:text-sm">Trang quản lý dành cho Super Admin, Admin, Support và Designer của Amore Love.</p>
        </div>
      </div>

      {/* Sub tabs navigation */}
      <div className="flex gap-2.5 border-b border-stone-200 pb-4 mb-8">
        <button
          onClick={() => setActiveSubTab("users")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
            activeSubTab === "users" ? "bg-stone-900 text-white shadow-sm" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          Quản lý Thành viên
        </button>
        <button
          onClick={() => setActiveSubTab("orders")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
            activeSubTab === "orders" ? "bg-stone-900 text-white shadow-sm" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          Quản lý Giao dịch
        </button>
        <button
          onClick={() => setActiveSubTab("settings")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
            activeSubTab === "settings" ? "bg-stone-900 text-white shadow-sm" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          Cấu hình Hệ thống
        </button>
      </div>

      {/* Overview statistical cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
          <Users className="h-6 w-6 text-stone-500 mb-2" />
          <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Tổng thành viên</span>
          <span className="font-serif text-2xl font-bold text-stone-800">1,248 <span className="text-xs text-stone-400 font-normal">users</span></span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
          <Layers className="h-6 w-6 text-stone-500 mb-2" />
          <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Tổng số thiệp tạo</span>
          <span className="font-serif text-2xl font-bold text-stone-800">3,492 <span className="text-xs text-stone-400 font-normal">invites</span></span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
          <ShoppingBag className="h-6 w-6 text-stone-500 mb-2" />
          <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Giao dịch thành công</span>
          <span className="font-serif text-2xl font-bold text-stone-800">185 <span className="text-xs text-stone-400 font-normal">orders</span></span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
          <CreditCard className="h-6 w-6 text-stone-500 mb-2" />
          <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Doanh thu quý</span>
          <span className="font-serif text-2xl font-bold text-stone-800">54,350,000 <span className="text-xs text-stone-400 font-normal">đ</span></span>
        </div>
      </div>

      {/* Sub tab content panels */}
      {activeSubTab === "users" && (
        <div className="bg-white border border-stone-200 rounded-3xl shadow-sm overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-stone-800">Danh sách tài khoản khách hàng</h3>
            <span className="text-xs font-semibold text-stone-500">Tổng cộng: {usersMock.length} tài khoản mẫu</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Tên chủ tài khoản</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Quyền hạn (Role)</th>
                  <th className="py-4 px-6">Ngày đăng ký</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs sm:text-sm">
                {usersMock.map((usr) => (
                  <tr key={usr.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-[11px] text-stone-400">{usr.id}</td>
                    <td className="py-4 px-6 font-bold text-stone-800">{usr.name}</td>
                    <td className="py-4 px-6 text-stone-600">{usr.email}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        usr.role === "Admin" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600"
                      }`}>
                        {usr.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-stone-500 font-medium">{usr.registered}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === "orders" && (
        <div className="bg-white border border-stone-200 rounded-3xl shadow-sm overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-stone-100">
            <h3 className="font-serif text-lg font-bold text-stone-800">Lịch sử thanh toán & đơn hàng kích hoạt</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Mã đơn</th>
                  <th className="py-4 px-6">Khách mua</th>
                  <th className="py-4 px-6">Gói kích hoạt</th>
                  <th className="py-4 px-6">Giá trị</th>
                  <th className="py-4 px-6">Trạng thái</th>
                  <th className="py-4 px-6">Ngày hoàn thành</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs sm:text-sm">
                {ordersMock.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-[11px] text-stone-400">{ord.id}</td>
                    <td className="py-4 px-6 font-bold text-stone-800">{ord.user}</td>
                    <td className="py-4 px-6 text-stone-600 font-medium">{ord.plan}</td>
                    <td className="py-4 px-6 text-stone-800 font-bold">{ord.price}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2 py-0.5 text-[10px] font-bold">
                        <Check className="h-3 w-3" />
                        <span>COMPLETED</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-stone-500 font-medium">{ord.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === "settings" && (
        <form onSubmit={handleApplySettings} className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
          <h3 className="font-serif text-lg font-bold text-stone-800 border-b border-stone-100 pb-3">Cấu hình chung của ứng dụng</h3>

          {successMsg && (
            <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-2xl flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span className="text-xs sm:text-sm font-semibold">{successMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Tên nền tảng (Platform Brand)</label>
              <input
                type="text"
                defaultValue="Amore Love"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Email thông báo hệ thống</label>
              <input
                type="email"
                defaultValue="notification@amorelove.com"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Giới hạn tệp tải lên (MB)</label>
              <input
                type="number"
                defaultValue={50}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Hệ thống AI Model (Google GenAI)</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none">
                <option value="gemini-3.5-flash">Gemini 3.5 Flash (Recommended)</option>
                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-full text-xs font-bold shadow-md active:scale-95 transition-all"
          >
            Lưu cấu hình hệ thống
          </button>
        </form>
      )}
    </div>
  );
}
