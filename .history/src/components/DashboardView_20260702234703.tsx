/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, AreaChart, Area 
} from "recharts";
import { 
  Eye, Users, CheckCircle2, MessageSquare, Gift, Calendar, Share2, 
  Trash2, Edit, Check, AlertTriangle, FileSpreadsheet, Plus 
} from "lucide-react";
import { RSVP, DashboardStats } from "../types";
import { LanguageCode, translations } from "../translations";
import ShareModal from "./ShareModal";

interface DashboardViewProps {
  lang: LanguageCode;
  onEditInvitation: (slug: string) => void;
}

export default function DashboardView({ lang, onEditInvitation }: DashboardViewProps) {
  const t = translations[lang];

  const [activeSlug, setActiveSlug] = useState("duy-anh-mai-chi");
  const [invitations, setInvitations] = useState<any[]>([]);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    views: 0,
    rsvpsCount: 0,
    attendingCount: 0,
    declinedCount: 0,
    totalGuests: 0,
    wishesCount: 0,
    contributions: 0
  });
  const [loading, setLoading] = useState(true);

  // Time filters for analytics charts: "day" | "week" | "month"
  const [chartRange, setChartRange] = useState<"day" | "week" | "month">("day");

  // Load custom list of invitations and stats
  useEffect(() => {
    fetch("/api/my-invitations")
      .then((res) => res.json())
      .then((data) => {
        setInvitations(data);
        if (data.length > 0) {
          // Default to the first invitation slug
          const demoExists = data.some((i: any) => i.slug === "duy-anh-mai-chi");
          setActiveSlug(demoExists ? "duy-anh-mai-chi" : data[0].slug);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Load stats and RSVPs for selected active slug
  const loadStats = () => {
    setLoading(true);
    fetch(`/api/invitations/${activeSlug}/dashboard`)
      .then((res) => res.json())
      .then((data) => {
        setRsvps(data.rsvps || []);
        setStats(data.stats);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (activeSlug) {
      loadStats();
    }
  }, [activeSlug]);

  // Handle delete individual guest RSVP with API call
  const handleDeleteRSVP = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phản hồi RSVP này của khách mời?")) {
      fetch(`/api/rsvp/${id}`, { method: "DELETE" })
        .then((res) => {
          if (!res.ok) throw new Error("Delete failed");
          return res.json();
        })
        .then(() => {
          setRsvps(rsvps.filter((r) => r.id !== id));
        })
        .catch((err) => {
          console.error("Error deleting RSVP:", err);
          alert("Không thể xóa RSVP. Vui lòng thử lại.");
        });
    }
  };

  // Mock visual chart analytics datasets
  const chartDataDaily = [
    { name: "02/07", Views: 45, RSVPs: 3 },
    { name: "03/07", Views: 60, RSVPs: 5 },
    { name: "04/07", Views: 85, RSVPs: 8 },
    { name: "05/07", Views: 110, RSVPs: 12 },
    { name: "06/07", Views: 150, RSVPs: 18 },
    { name: "07/07", Views: 189, RSVPs: 22 }
  ];

  const chartDataWeekly = [
    { name: "Tuần 1", Views: 120, RSVPs: 10 },
    { name: "Tuần 2", Views: 250, RSVPs: 25 },
    { name: "Tuần 3", Views: 380, RSVPs: 45 },
    { name: "Tuần 4", Views: 540, RSVPs: 68 }
  ];

  const chartDataMonthly = [
    { name: "Tháng 4", Views: 420, RSVPs: 35 },
    { name: "Tháng 5", Views: 890, RSVPs: 78 },
    { name: "Tháng 6", Views: 1420, RSVPs: 120 },
    { name: "Tháng 7", Views: 1890, RSVPs: 189 }
  ];

  const currentChartData = 
    chartRange === "day" ? chartDataDaily : 
    chartRange === "week" ? chartDataWeekly : 
    chartDataMonthly;

  const activeInvitation = invitations.find((i: any) => i.slug === activeSlug);
  const groomName = activeInvitation?.groomName || "Chú rể";
  const brideName = activeInvitation?.brideName || "Cô dâu";

  return (
    <div id="dashboard-wrapper" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Title section with select invitation picker */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-stone-200 pb-6 mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">{t.dashboardTitle}</h1>
          <p className="mt-1 text-stone-600 text-xs sm:text-sm">Quản lý hiệu suất, thống kê số lượng khách, tiền mừng và các phản hồi RSVP thực tế.</p>
        </div>

        {/* Invitation selector list dropdown */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-bold text-stone-500 uppercase tracking-wider shrink-0">Chọn thiệp:</label>
          <select
            value={activeSlug}
            onChange={(e) => setActiveSlug(e.target.value)}
            className="flex-1 sm:w-64 px-4 py-2.5 rounded-full border border-stone-200 bg-white text-xs font-semibold focus:outline-none focus:border-rose-400 cursor-pointer shadow-sm"
          >
            {invitations.map((invite) => (
              <option key={invite.slug} value={invite.slug}>
                {invite.groomName} & {invite.brideName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Analytics stats dashboard bento grids */}
      <div id="stats-bento-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {/* Metric 1: Views */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="h-12 w-12 rounded-2xl bg-stone-100 text-stone-600 flex items-center justify-center text-xl shrink-0">
            <Eye className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">{t.statsViews}</span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-stone-800">{stats.views}</span>
          </div>
        </div>

        {/* Metric 2: Attendance RSVPs */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-xl shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Tổng số khách xác nhận</span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-stone-800">{stats.totalGuests}</span>
          </div>
        </div>

        {/* Metric 3: Attending list count */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-xl shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">{t.statsAttending}</span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-stone-800">{stats.attendingCount} <span className="text-xs text-stone-400 font-normal">phản hồi</span></span>
          </div>
        </div>

        {/* Metric 4: Gifts contributions tracking */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-xl shrink-0">
            <Gift className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">{t.statsContributions}</span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-stone-800">
              {stats.contributions.toLocaleString("vi-VN")} <span className="text-xs text-stone-400 font-normal">VND</span>
            </span>
          </div>
        </div>
      </div>

      {/* Visual Chart Trends Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Left 2 cols: Line/Area trend charts */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-800">Biểu đồ xu hướng tương tác</h3>
              <p className="text-[11px] text-stone-400">Xem tốc độ tương tác thiệp cưới theo thời gian biểu.</p>
            </div>

            {/* Range filters selectors */}
            <div className="flex gap-1 bg-stone-100 p-1 rounded-full border border-stone-200">
              <button
                onClick={() => setChartRange("day")}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                  chartRange === "day" ? "bg-white text-rose-500 shadow-sm" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                Theo Ngày
              </button>
              <button
                onClick={() => setChartRange("week")}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                  chartRange === "week" ? "bg-white text-rose-500 shadow-sm" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                Theo Tuần
              </button>
              <button
                onClick={() => setChartRange("month")}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                  chartRange === "month" ? "bg-white text-rose-500 shadow-sm" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                Theo Tháng
              </button>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis dataKey="name" stroke="#a8a29e" fontSize={10} tickLine={false} />
                <YAxis stroke="#a8a29e" fontSize={10} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="Views" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#viewsGrad)" name="Lượt xem" />
                <Area type="monotone" dataKey="RSVPs" stroke="#3b82f6" strokeWidth={2} fill="none" name="Lượt RSVP" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 col: Meal and attendance breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-800">Thống kê loại món ăn</h3>
            <p className="text-[11px] text-stone-400">Danh sách tổng hợp các món ăn khách chọn dự tiệc.</p>
          </div>

          {/* Simple percentage metrics bars */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-stone-700">Thịt bò Wagyu áp chảo</span>
                <span className="text-stone-500">60%</span>
              </div>
              <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: "60%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-stone-700">Tôm hùm phô mai đút lò</span>
                <span className="text-stone-500">25%</span>
              </div>
              <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-400 rounded-full" style={{ width: "25%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-stone-700">Súp bào ngư vi cá</span>
                <span className="text-stone-500">10%</span>
              </div>
              <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: "10%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-stone-700">Thực đơn chay tịnh</span>
                <span className="text-stone-500">5%</span>
              </div>
              <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-400 rounded-full" style={{ width: "5%" }} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => onEditInvitation(activeSlug)}
              className="w-full py-3 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 shadow-sm active:scale-95 transition-transform"
            >
              Sửa tệp thông tin thiệp
            </button>
            <button
              onClick={() => setIsShareOpen(true)}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-1.5"
            >
              <Share2 className="h-4 w-4" />
              <span>Xuất Link Gửi Khách</span>
            </button>
          </div>
        </div>
      </div>

      {/* Guest RSVP table lists */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-800">Danh Sách Khách Mời {t.rsvpConfirmTitle}</h3>
            <p className="text-xs text-stone-500">Bảng theo dõi và thống kê chi tiết các phản hồi RSVP của khách mời.</p>
          </div>
          <button className="px-4 py-2 bg-stone-100 text-stone-700 rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-stone-200">
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Xuất file Excel</span>
          </button>
        </div>

        {/* Data list Table */}
        {rsvps.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <p className="text-base font-serif italic">Chưa có khách mời nào phản hồi RSVP.</p>
            <p className="text-xs mt-1">Đường link mời của hai bạn sẽ cập nhật danh sách ngay khi khách chọn gửi thông tin.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Khách mời</th>
                  <th className="py-4 px-6">Trạng thái</th>
                  <th className="py-4 px-6">Số người đi</th>
                  <th className="py-4 px-6">Lựa chọn món ăn / Dị ứng</th>
                  <th className="py-4 px-6">Lời chúc gửi tới cặp đôi</th>
                  <th className="py-4 px-6 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs sm:text-sm">
                {rsvps.map((rsvp) => (
                  <tr key={rsvp.id} className="hover:bg-stone-50/50 transition-colors">
                    {/* Guest name info */}
                    <td className="py-4 px-6">
                      <span className="font-bold text-stone-800 block">{rsvp.guestName}</span>
                      <span className="text-[10px] font-mono text-stone-400">{rsvp.phone || "Không để lại SĐT"}</span>
                    </td>
                    {/* Attending status */}
                    <td className="py-4 px-6">
                      {rsvp.attending ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2.5 py-1 text-[10px] font-bold">
                          <Check className="h-3 w-3" />
                          <span>THAM GIA</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-600 border border-stone-200 rounded-full px-2.5 py-1 text-[10px] font-bold">
                          <span>BẬN VIỆC</span>
                        </span>
                      )}
                    </td>
                    {/* Guest count count */}
                    <td className="py-4 px-6">
                      <span className="font-semibold text-stone-700">{rsvp.guestCount} người</span>
                    </td>
                    {/* Meal preference */}
                    <td className="py-4 px-6 space-y-1">
                      {rsvp.attending ? (
                        <>
                          <span className="text-stone-700 block font-medium">🍴 {rsvp.foodChoice || "Bò Wagyu"}</span>
                          {rsvp.allergies && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 font-semibold uppercase">
                              <AlertTriangle className="h-3 w-3" />
                              <span>{rsvp.allergies}</span>
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-stone-400 font-medium italic">Không tham gia ăn tiệc</span>
                      )}
                    </td>
                    {/* Warm greetings wish */}
                    <td className="py-4 px-6 max-w-xs">
                      <p className="text-stone-600 line-clamp-2 leading-relaxed italic">"{rsvp.greetings || "Chúc anh chị trăm năm hạnh phúc!"}"</p>
                    </td>
                    {/* Actions tools */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDeleteRSVP(rsvp.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa phản hồi"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Share Invitation Link Modal */}
      <ShareModal 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        slug={activeSlug}
        groomName={groomName}
        brideName={brideName}
        invite={activeInvitation}
      />
    </div>
  );
}
