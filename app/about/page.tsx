import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow max-w-4xl mx-auto px-6 w-full py-16 space-y-8">
        <h1 className="text-4xl font-extrabold font-orbitron text-cyan-400">關於 INN 星際新聞網</h1>
        <div className="bg-[#121520]/80 border border-cyan-500/20 rounded-2xl p-8 space-y-6 text-gray-300 leading-relaxed">
          <p>INN（Interstellar News Network）星際新聞網是聯邦最高委員會授權之官方權威新聞機構，致力於向第四象限及各大星域提供即時、客觀、深度之宇宙時政與科技報導。</p>
          <p>我們擁有遍布銀河系各個航道的特派記者網絡與量子通訊終端，確保每一位聯邦公民與星際旅客都能第一時間掌握宇宙脈動。</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
