export default function StepOption({ label, description, selected, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      style={selected ? { backgroundColor: '#617b65', borderColor: '#617b65' } : {}}
      className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 active:scale-[0.98] ${
        selected
          ? 'border-primary shadow-lg'
          : 'bg-white border-outline-variant/30 hover:border-primary/40 hover:bg-surface-container-low'
      }`}
    >
      <div className="flex items-center gap-4">
        {icon && (
          <div
            style={selected ? { backgroundColor: 'rgba(255,255,255,0.2)' } : {}}
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              selected ? '' : 'bg-primary-fixed'
            }`}
          >
            <span
              style={selected ? { color: '#ffffff' } : {}}
              className={`material-symbols-outlined text-xl ${selected ? '' : 'text-primary'}`}
            >
              {icon}
            </span>
          </div>
        )}
        <div className="flex-1">
          <p
            style={selected ? { color: '#ffffff' } : {}}
            className={`font-bold text-sm ${selected ? '' : 'text-on-surface'}`}
          >
            {label}
          </p>
          {description && (
            <p
              style={selected ? { color: 'rgba(255,255,255,0.75)' } : {}}
              className={`text-xs mt-0.5 ${selected ? '' : 'text-on-surface-variant'}`}
            >
              {description}
            </p>
          )}
        </div>
        <div
          style={selected ? { backgroundColor: '#ffffff', borderColor: '#ffffff' } : {}}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            selected ? '' : 'border-outline-variant'
          }`}
        >
          {selected && (
            <span style={{ color: '#49624d' }} className="material-symbols-outlined text-sm">
              check
            </span>
          )}
        </div>
      </div>
    </button>
  )
}