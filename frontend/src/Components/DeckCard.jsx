export function DeckCard({ word, team }) {
  const teamStyles = {
    red: {
      bg: 'bg-gradient-to-br from-red-500 via-red-600 to-red-700',
      border: 'border-red-400/30',
      shadow: 'shadow-xl shadow-red-500/40',
      glow: 'group-hover:shadow-red-500/50',
      text: 'text-white',
      shine: 'from-red-300/0 via-red-100/20 to-red-300/0'
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700',
      border: 'border-blue-400/30',
      shadow: 'shadow-xl shadow-blue-500/40',
      glow: 'group-hover:shadow-blue-500/50',
      text: 'text-white',
      shine: 'from-blue-300/0 via-blue-100/20 to-blue-300/0'
    },
    neutral: {
      bg: 'bg-gradient-to-br from-white via-gray-50 to-gray-100',
      border: 'border-gray-300/50',
      shadow: 'shadow-xl shadow-gray-400/40',
      glow: 'group-hover:shadow-gray-400/50',
      text: 'text-gray-900',
      shine: 'from-white/0 via-white/40 to-white/0'
    },
    assassin: {
      bg: 'bg-gradient-to-br from-gray-800 via-gray-900 to-black',
      border: 'border-gray-600/30',
      shadow: 'shadow-xl shadow-black/60',
      glow: 'group-hover:shadow-gray-600/70',
      text: 'text-white',
      shine: 'from-gray-400/0 via-gray-300/15 to-gray-400/0'
    }
  };

  const style = teamStyles[team];

  return (
    <div className="group relative w-full h-full">
      {/* Card glow */}
      <div className={`absolute -inset-1 ${style.bg} rounded-[10px] blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
      
      <div
        className={`
          relative w-full h-full rounded-[10px] border-2
          transform transition-all duration-500 ease-out
          hover:scale-105 hover:-translate-y-1
          cursor-pointer overflow-hidden
          ${style.bg} ${style.border} ${style.text}
          ${style.shadow} ${style.glow}
        `}
      >
        {/* Geometric pattern overlay - Net structure */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(45deg, transparent 48%, currentColor 48%, currentColor 52%, transparent 52%),
                linear-gradient(-45deg, transparent 48%, currentColor 48%, currentColor 52%, transparent 52%)
              `,
              backgroundSize: '20px 20px'
            }}
          />
        </div>

        {/* Corner accents */}
        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-current opacity-30 rounded-tl" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-current opacity-30 rounded-br" />
        
        {/* Top gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/20" />

        {/* Word content */}
        <div className="relative h-full flex items-center justify-center p-3">
          <span 
            className="uppercase tracking-widest drop-shadow-lg text-center"
            style={{ 
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: '800',
              letterSpacing: '0.1em',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}
          >
            {word}
          </span>
        </div>

        {/* Shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-700">
          <div className={`absolute inset-0 bg-gradient-to-r ${style.shine} translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12`} />
        </div>

        {/* Bottom highlight */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        {/* Vignette effect */}
        <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] rounded-[10px] pointer-events-none" />
      </div>
    </div>
  );
}
