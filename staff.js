/* BarberBook - module staff. */
import { $, state, bookings, service, barber, esc, cash, STATUS_PENDING, STATUS_CONFIRMED, STATUS_DONE, STATUS_CANCELLED, statusClass, writeStore, STORAGE_BOOKINGS, toast } from "./data.js";

export function allowedStatuses(current){
  if(current===STATUS_PENDING)return [STATUS_PENDING,STATUS_CONFIRMED,STATUS_CANCELLED];
  if(current===STATUS_CONFIRMED)return [STATUS_CONFIRMED,STATUS_DONE,STATUS_CANCELLED];
  return [current];
}

export function renderStaff(){
  if(state.currentUser?.role!=='staff')return;
  const all=bookings();
  $('statsGrid').innerHTML=[['Tổng lịch',all.length],['Lịch chưa hủy',all.filter(b=>b.status!==STATUS_CANCELLED).length],['Chờ xác nhận',all.filter(b=>b.status===STATUS_PENDING).length],['Hoàn thành',all.filter(b=>b.status===STATUS_DONE).length]].map(([label,num])=>`<div class="stat-card"><p>${label}</p><strong>${num}</strong></div>`).join('');
  const q=$('staffSearch').value.trim().toLowerCase(),status=$('statusFilter').value;
  const items=all.filter(b=>(status==='all'||status===b.status)&&(!q||b.customerName.toLowerCase().includes(q)||b.phone.includes(q)||b.id.toLowerCase().includes(q))).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  $('staffBookings').innerHTML=items.length?items.map(b=>`<article class="staff-row"><div><h4>${esc(b.customerName)}</h4><p>${esc(b.phone)}<br>Mã ${esc(b.id)}</p></div><div><h4>${esc(service(b.serviceId)?.name||'Dịch vụ')}</h4><p>${esc(barber(b.barberId)?.name||'Thợ')} · ${cash(b.price)}</p></div><div><h4>${esc(b.date)} · ${esc(b.time)}</h4><p>${esc(b.note||'Không có ghi chú')}</p></div><div><span class="status ${statusClass(b.status)}">${esc(b.status)}</span></div><div class="staff-actions"><select data-update-status="${esc(b.id)}" aria-label="Trạng thái lịch ${esc(b.id)}" ${allowedStatuses(b.status).length===1?'disabled':''}>${allowedStatuses(b.status).map(s=>`<option ${s===b.status?'selected':''} value="${esc(s)}">${esc(s)}</option>`).join('')}</select><button type="button" class="btn btn-dark" data-save-status="${esc(b.id)}" ${allowedStatuses(b.status).length===1?'disabled':''}>Lưu trạng thái</button></div></article>`).join(''):'<div class="empty-state">Chưa có lịch phù hợp bộ lọc.</div>';
}

export function staffUpdate(id,status){
  if(state.currentUser?.role!=='staff')return;
  const all=bookings(),b=all.find(x=>x.id===id);if(!b||!allowedStatuses(b.status).includes(status))return toast('Không thể chuyển sang trạng thái này.');
  if(b.status===status)return toast('Trạng thái lịch không thay đổi.');
  b.status=status;if(!writeStore(STORAGE_BOOKINGS,all))return;
  renderStaff();toast('Cập nhật trạng thái thành công.');
}
