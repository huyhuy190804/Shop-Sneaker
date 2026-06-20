import React from 'react';
import { NavLink } from 'react-router-dom';

const sidebarLinks = [
  {
    label: 'PRODUCTS',
    to: '/product-management',
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0 mr-4 stroke-current fill-none stroke-2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
    ),
  },
  {
    label: 'ORDERS',
    to: '/order-management',
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0 mr-4 fill-current" viewBox="0 0 24 24"><path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3V3z"/></svg>
    ),
  },
  {
    label: 'USERS',
    to: '/user-management',
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0 mr-4 fill-current" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
    ),
  },
  {
    label: 'COUPONS',
    to: null,
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0 mr-4 fill-current" viewBox="0 0 24 24"><path d="M22 10V6a2 2 0 00-2-2H4a2 2 0 00-2 2v4c1.1 0 2 .9 2 2s-.9 2-2 2v4a2 2 0 002 2h16a2 2 0 002-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2z"/></svg>
    ),
  },
];

const SidebarItem = ({ to, label, icon, end = false }) => (
  <li className="mb-1">
    {to ? (
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
          `flex items-center py-[14px] px-3 rounded transition-colors duration-200 ${
            isActive ? 'bg-black text-white' : 'cursor-pointer text-[#999] hover:text-[#111] hover:bg-[#f4f4f4]'
          }`
        }
      >
        {icon}
        <span>{label}</span>
      </NavLink>
    ) : (
      <div className="flex items-center py-[14px] px-3 rounded text-[#c0c0c0] cursor-not-allowed">
        {icon}
        <span>{label}</span>
      </div>
    )}
  </li>
);

const SidebarAdmin = () => {
  return (
    <aside className="w-[250px] bg-[#fbfbfb] border-r border-[#f0f0f0] flex flex-col py-10 px-6 h-full overflow-y-auto shadow-xl lg:shadow-none">
      <div className="text-[18px] md:text-[20px] font-black tracking-[-0.5px] mb-12 pl-3">
        SOLE ADMIN
      </div>
      <div className="flex-1">
        <div className="text-[10px] font-extrabold text-[#b0b0b0] tracking-[1.5px] mb-6 pl-3">
          SYSTEM CONTROLLER V1.0
        </div>
        <ul className="flex flex-col m-0 p-0 list-none text-[11px] font-bold text-[#999] tracking-[0.5px]">
          {sidebarLinks.map((item) => (
            <SidebarItem key={item.label} {...item} end={item.to === '/product-management'} />
          ))}
        </ul>
      </div>
      <div className="mt-8 md:mt-auto">
        
        <div className="flex items-center mt-7 pt-7 border-t border-[#f0f0f0]">
          <div className="w-[36px] h-[36px] shrink-0 bg-black rounded-sm mr-3.5 overflow-hidden">
            <img className="w-full h-full object-cover" src="https://i.pravatar.cc/150?u=admin" alt="Admin" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-black text-black tracking-[0.5px] truncate">ADMIN USER</span>
            <span className="text-[9px] font-medium text-[#a0a0a0] mt-[3px] tracking-[0.2px] truncate">SYSTEM CONTROLLER V1.0</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default SidebarAdmin;
