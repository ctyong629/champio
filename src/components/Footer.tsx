import { Trophy } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300 w-full mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-orange-500" />
              <span className="font-display text-2xl tracking-widest text-white mt-1">SPORTIFY</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              專業運動賽事管理平台<br />三分鐘建立您的賽事官網
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-bold text-white">平台功能</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li className="hover:text-orange-400 cursor-pointer transition-colors">賽事官網建置</li>
              <li className="hover:text-orange-400 cursor-pointer transition-colors">動態報名系統</li>
              <li className="hover:text-orange-400 cursor-pointer transition-colors">賽程編排引擎</li>
              <li className="hover:text-orange-400 cursor-pointer transition-colors">即時比分追蹤</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-bold text-white">支援運動</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>🏀 籃球</li>
              <li>🏐 排球・沙排</li>
              <li>⚽ 足球</li>
              <li>🥎 壘球</li>
              <li>🏸 羽球</li>
              <li>🏓 桌球</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-bold text-white">聯絡我們</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>service@sportify.tw</li>
              <li>02-1234-5678</li>
              <li>台北市信義區信義路五段 7 號</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-800 pt-6 text-center text-xs text-slate-600">
          © 2026 Champio. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
