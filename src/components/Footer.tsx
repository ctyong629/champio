import { Trophy } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* 第一欄：品牌與 Logo */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-orange-500">
              <Trophy className="w-8 h-8" />
              <span className="text-2xl font-black tracking-wider text-white">CHAMPIO</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              專業運動賽事管理平台<br />
              三分鐘建立您的賽事官網
            </p>
          </div>

          {/* 第二欄：平台功能 */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg tracking-wide">平台功能</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li className="hover:text-orange-500 cursor-pointer transition-colors">賽事官網建置</li>
              <li className="hover:text-orange-500 cursor-pointer transition-colors">動態報名系統</li>
              <li className="hover:text-orange-500 cursor-pointer transition-colors">賽程編排引擎</li>
              <li className="hover:text-orange-500 cursor-pointer transition-colors">即時比分追蹤</li>
            </ul>
          </div>

          {/* 第三欄：支援運動 */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg tracking-wide">支援運動</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li className="flex items-center gap-2 hover:text-orange-500 cursor-pointer transition-colors">
                <span>🏀</span> 籃球
              </li>
              <li className="flex items-center gap-2 hover:text-orange-500 cursor-pointer transition-colors">
                <span>🏐</span> 排球・沙排
              </li>
              <li className="flex items-center gap-2 hover:text-orange-500 cursor-pointer transition-colors">
                <span>⚽</span> 足球
              </li>
              <li className="flex items-center gap-2 hover:text-orange-500 cursor-pointer transition-colors">
                <span>🥎</span> 壘球
              </li>
              <li className="flex items-center gap-2 hover:text-orange-500 cursor-pointer transition-colors">
                <span>🏸</span> 羽球
              </li>
              <li className="flex items-center gap-2 hover:text-orange-500 cursor-pointer transition-colors">
                <span>🏓</span> 桌球
              </li>
            </ul>
          </div>

          {/* 第四欄：聯絡我們 */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg tracking-wide">聯絡我們</h4>
            <ul className="space-y-4 text-slate-400 text-sm leading-relaxed">
              <li className="text-white font-bold tracking-wide">MT SPORTSWEAR LIMITED</li>
              <li className="flex items-start">
                <span className="shrink-0 mr-1">門市地址｜</span>
                <span>新北市新莊區中正路514巷99號<br/>一樓內3攤位</span>
              </li>
              <li>LINE：@MTSPORTSWEAR</li>
              <li>電話 ｜ ＋886 965-028-387</li>
            </ul>
          </div>

        </div>

        {/* 底部版權宣告與政策連結 */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CHAMPIO. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">隱私權政策</span>
            <span className="hover:text-white cursor-pointer transition-colors">服務條款</span>
          </div>
        </div>
      </div>
    </footer>
  );
}