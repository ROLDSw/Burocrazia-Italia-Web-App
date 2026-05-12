'use client'

export function PremiumBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
      {/* Base Background Color Layer */}
      <div className="absolute inset-0 bg-slate-50 dark:bg-[#020617] transition-colors duration-500" />
      
      {/* Vivid Background Glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[100%] h-[100%] bg-blue-200/40 dark:bg-blue-600/20 blur-[140px] rounded-full transition-colors duration-500" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[80%] h-[80%] bg-purple-200/50 dark:bg-purple-600/30 blur-[120px] rounded-full transition-colors duration-500" />
      <div className="absolute top-[30%] left-[-5%] w-[50%] h-[50%] bg-pink-200/30 dark:bg-indigo-600/20 blur-[100px] rounded-full transition-colors duration-500" />
      
      {/* Mesh Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.3),transparent_70%),radial-gradient(circle_at_20%_80%,rgba(168,85,247,0.3),transparent_70%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.2),transparent_70%),radial-gradient(circle_at_20%_80%,rgba(147,51,234,0.2),transparent_70%)] opacity-90 transition-opacity duration-500" />
      
      {/* Subtle Noise Texture */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none contrast-150" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>
    </div>
  )
}
