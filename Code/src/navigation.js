/* BarberBook - module navigation. */
import { $, state, STORAGE_SESSION, show } from "./data.js";
import { renderCatalog } from "./catalog.js";
import { renderMine } from "./bookings.js";
import { renderStaff } from "./staff.js";

export function openShop(){
  if(state.selectedRole==='staff')return;
  $('logoutBtn').classList.toggle('hidden',!state.currentUser&&state.selectedRole!=='guest');
  $('accountBtn').classList.toggle('hidden',!state.currentUser);
  $('logoutBtn').textContent=state.currentUser?'Đăng xuất':'Thoát chế độ Khách';
  $('userBadge').textContent=state.currentUser?`${state.currentUser.name} · Khách hàng`:'Khách (chưa đăng nhập)';
  $('guestGate').classList.toggle('hidden',!!state.currentUser);$('booking').classList.toggle('hidden',!state.currentUser);$('myBookingsSection').classList.toggle('hidden',!state.currentUser);
  $('heroCTA').textContent=state.currentUser?'Đặt lịch ngay ↗':'Đăng nhập để đặt lịch ↗';
  $('heroCTA').setAttribute('href',state.currentUser?'#booking':'#guestGate');
  if(state.currentUser){$('customerName').value=state.currentUser.name;$('customerPhone').value=state.currentUser.phone;renderMine()}
  renderCatalog();show('shopView');
}

export function openStaff(){if(state.currentUser?.role!=='staff')return show('roleView');$('accountBtn').classList.remove('hidden');$('logoutBtn').classList.remove('hidden');$('logoutBtn').textContent='Đăng xuất';$('userBadge').textContent=`${state.currentUser.name} · Nhân viên`;show('staffView');renderStaff()}
