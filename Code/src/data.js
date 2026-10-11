/*
 * BarberBook v4 - Hệ thống đặt lịch cắt tóc (frontend).
 * Modules: F01 choose role; F02 customer registration; F03 role-based login;
 * F04 logout; F05 browse services; F06 browse barbers; F07 book appointment;
 * F08 view own appointments; F09 cancel; F10 staff manage appointments;
 * F11 change password; F12 update personal profile.
 * Giới hạn công nghệ: localStorage/sessionStorage nằm trong trình duyệt;
 * xác thực và phân quyền phía máy chủ không thuộc phạm vi triển khai.
 */
'use strict';
export const SERVICES = Object.freeze([
  {id:'S01',name:'Cắt tóc cơ bản',price:80000,duration:30,icon:'✂',desc:'Cắt gọn và tạo kiểu phù hợp.'},
  {id:'S02',name:'Cắt + gội',price:120000,duration:45,icon:'◒',desc:'Cắt tóc kết hợp gội và sấy.'},
  {id:'S03',name:'Uốn / tạo kiểu',price:250000,duration:90,icon:'〰',desc:'Tạo kiểu theo tư vấn của thợ.'},
  {id:'S04',name:'Cạo / tỉa râu',price:60000,duration:20,icon:'⌁',desc:'Chỉnh đường nét gọn gàng.'}
]);
export const BARBERS = Object.freeze([
  {id:'B01',name:'Nguyễn Đức Phong',title:'Nhân viên · Thợ cắt tóc',symbol:'P'},
  {id:'B02',name:'Lê Trung Nghĩa',title:'Nhân viên · Thợ cắt tóc',symbol:'N'}
]);
export const STATUS_PENDING='Chờ xác nhận',STATUS_CONFIRMED='Đã xác nhận',STATUS_DONE='Đã hoàn thành',STATUS_CANCELLED='Đã hủy';
export const STORAGE_USERS='bb_users_v3',STORAGE_BOOKINGS='bb_bookings_v3',STORAGE_SESSION='bb_session_v3';
export const STAFF_ACCOUNTS=Object.freeze([
  {id:'STAFF-PHONG',name:'Nguyễn Đức Phong',email:'nguyenducphong@gmail.com',phone:'0900000001',role:'staff'},
  {id:'STAFF-NGHIA',name:'Lê Trung Nghĩa',email:'letrungnghia@gmail.com',phone:'0900000002',role:'staff'}
]);
export const INITIAL_STAFF_PASSWORD='Barber@2026';
export const $ = id => document.getElementById(id);
export const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const cash = x => new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND',maximumFractionDigits:0}).format(x);
export const localDate = (d=new Date())=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
export const plusDays = n => {const d=new Date();d.setDate(d.getDate()+n);return localDate(d)};
export function readStore(key,fallback){try{const v=JSON.parse(localStorage.getItem(key));return Array.isArray(v)?v:fallback}catch{return fallback}}
export function writeStore(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch{toast('Không thể lưu dữ liệu. Hãy kiểm tra bộ nhớ trình duyệt.');return false}}
export const users=()=>readStore(STORAGE_USERS,[]);
export const bookings=()=>readStore(STORAGE_BOOKINGS,[]);
export const service=id=>SERVICES.find(x=>x.id===id);
export const barber=id=>BARBERS.find(x=>x.id===id);
export const state = {currentUser:null,selectedRole:null,selectedService:"S01",selectedBarber:"B01"};
let toastTimer=null;
export function toast(message){const n=$('toast');n.textContent=message;n.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>n.classList.remove('show'),3600)}

export function setFeedback(id,message,success=false){const n=$(id);n.textContent=message;n.classList.toggle('success',success)}

export function show(view){for(const id of ['roleView','authView','shopView','staffView','accountView'])$(id).classList.toggle('hidden',id!==view);window.scrollTo({top:0,behavior:'instant'})}

export function randomSalt(){const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('')}

export function hex(bytes){return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('')}

export async function passwordHash(password,salt){
  if(!globalThis.crypto?.subtle)throw new Error('Trình duyệt không hỗ trợ Web Crypto. Hãy chạy qua localhost bằng Live Server.');
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},key,256);
  return hex(bits);
}

export function makeId(prefix){return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}

export function findActiveAccount(){
  if(!state.currentUser)return null;
  return users().find(x=>x.id===state.currentUser.id&&x.role===state.currentUser.role)||null;
}

export function statusClass(s){return s===STATUS_CONFIRMED?'confirmed':s===STATUS_DONE?'completed':s===STATUS_CANCELLED?'cancelled':''}
