import React from 'react';

const HeaderAdmin = ({
  toggleSidebar,
  title = 'DASHBOARD',
  navItems = [
    { label: 'Overview', active: false },
    { label: 'Inventory', active: true },
  ],
  actionLabel = 'QUICK EXPORT',
  onActionClick,
}) => {
  return (
    <header className="flex justify-between items-center py-5 px-4 md:py-7 md:px-10 lg:px-14 bg-white border-b border-[#f0f0f0] sticky top-0 z-30">
      <div className="flex items-center gap-4 md:gap-[30px]">
        {/* Hamburger Menu Toggle (Mobile Only) */}
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 -ml-2 bg-transparent border-none cursor-pointer text-[#111] hover:bg-[#f4f4f4] rounded-sm transition-colors"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>

        <h1 className="text-[18px] md:text-[20px] font-black m-0 tracking-[-0.5px]">{title}</h1>
        
      </div>
      <div>
        <button
          onClick={onActionClick}
          className="bg-black text-white hover:bg-opacity-80 border-none py-2.5 px-4 md:py-3 md:px-6 text-[9px] md:text-[10px] font-extrabold tracking-[1px] md:tracking-[1.5px] rounded-sm transition-opacity duration-200 cursor-pointer hidden sm:block"
        >
          {actionLabel}
        </button>
        <button
          onClick={onActionClick}
          className="bg-black text-white hover:bg-opacity-80 border-none p-2.5 rounded-sm transition-opacity duration-200 cursor-pointer sm:hidden"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
        </button>
      </div>
    </header>
  );
};

export default HeaderAdmin;
