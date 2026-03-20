'use client';

interface DeleteButtonProps {
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}

export function DeleteButton({ onClick, className = '' }: DeleteButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        group relative w-8 h-8 rounded-full bg-gray-900 border-none
        flex items-center justify-center
        shadow-[0_0_10px_rgba(0,0,0,0.1)]
        cursor-pointer overflow-hidden
        transition-all duration-300 ease-in-out
        hover:w-[72px] hover:rounded-2xl hover:bg-red-500
        ${className}
      `}
    >
      <svg
        viewBox="0 0 448 512"
        className="w-3 h-3 transition-all duration-300 group-hover:translate-y-[60%] group-hover:w-5 group-hover:h-5"
      >
        <path
          fill="white"
          d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"
        />
      </svg>
      <span className="absolute top-0 text-white text-size-2 transition-all duration-300 group-hover:text-xs group-hover:opacity-100 group-hover:translate-y-[6px]">
        삭제
      </span>
    </button>
  );
}
