/* BarberBook - module bookings. */
import { $, state, service, barber, bookings, esc, cash, localDate, plusDays, writeStore, STORAGE_BOOKINGS, STATUS_PENDING, STATUS_CONFIRMED, STATUS_CANCELLED, makeId, toast, statusClass } from "./data.js";

export function mins(t){const [h,m]=t.split(':').map(Number);return h*60+m}

/** Hai khoảng [start,end) giao nhau khi startA < endB và endA > startB. */
export function isOverlap(start,end,b){const from=mins(b.time),to=from+(service(b.serviceId)?.duration||0);return start<to&&end>from}
/** Một thợ bận nếu đã có lịch cùng ngày, chưa hủy và thời gian chồng lấn. */
export function hasBarberConflict(date,time,serviceId,barberId){
  const s=service(serviceId);
  if(!s)return true;
  const start=mins(time),end=start+s.duration;
  return bookings().some(b=>b.date===date&&b.barberId===barberId&&b.status!==STATUS_CANCELLED&&isOverlap(start,end,b));
}

export function validSlot(date,time,serviceId,barberId){
  const s=service(serviceId);
  if(!s||!barber(barberId)||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(time))return false;
  if(date<localDate()||date>plusDays(30))return false;
  const start=mins(time),end=start+s.duration;
  if(start<540||start>=1080||start%30!==0||end>1080||new Date(`${date}T${time}:00`)<=new Date())return false;
  return !hasBarberConflict(date,time,serviceId,barberId);
}

export function updateSlots(){
  $('dateSelect').min=localDate();$('dateSelect').max=plusDays(30);
  const date=$('dateSelect').value,sid=$('serviceSelect').value,bid=$('barberSelect').value;
  if(!date){$('timeSelect').innerHTML='<option value="">Chọn ngày trước</option>';return}
  const available=[];for(let m=9*60;m<18*60;m+=30){const time=`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;if(validSlot(date,time,sid,bid))available.push(time)}
  $('timeSelect').innerHTML=available.length?'<option value="">Chọn giờ</option>'+available.map(t=>`<option value="${t}">${t}</option>`).join(''):'<option value="">Không còn giờ trống</option>';
}

export function book(e){
  e.preventDefault();if(!state.currentUser||state.currentUser.role!=='customer'){toast('Cần đăng nhập bằng tài khoản Khách hàng.');return}
  const serviceId=$('serviceSelect').value,barberId=$('barberSelect').value,date=$('dateSelect').value,time=$('timeSelect').value,note=$('bookingNote').value.trim();
  if(note.length>300){toast('Ghi chú tối đa 300 ký tự.');return}
  if(!validSlot(date,time,serviceId,barberId)){toast('Ngày/giờ không hợp lệ hoặc lịch của thợ đã bị trùng.');updateSlots();return}
  const s=service(serviceId),all=bookings();const item={id:makeId('BB'),customerId:state.currentUser.id,customerName:state.currentUser.name,phone:state.currentUser.phone,serviceId,barberId,date,time,note,price:s.price,status:STATUS_PENDING,createdAt:new Date().toISOString()};
  all.push(item);if(!writeStore(STORAGE_BOOKINGS,all))return;
  $('bookingNote').value='';$('dateSelect').value='';updateSlots();renderMine();toast(`Đặt lịch thành công! Mã ${item.id}`);$('myBookingsSection').scrollIntoView({behavior:'smooth'});
}

export function renderMine(){
  if(state.currentUser?.role!=='customer')return;
  const items=bookings().filter(b=>b.customerId===state.currentUser.id).sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time));
  $('myBookings').innerHTML=items.length?items.map(b=>`<article class="booking-item"><div><h4>${esc(service(b.serviceId)?.name||'Dịch vụ')}</h4><p>Mã lịch: ${esc(b.id)}<br>Thợ: ${esc(barber(b.barberId)?.name||'Thợ')}</p></div><div><h4>${esc(b.date)} · ${esc(b.time)}</h4><p>${cash(b.price)}</p></div><div><span class="status ${statusClass(b.status)}">${esc(b.status)}</span><p>${esc(b.note||'Không có ghi chú')}</p></div><div>${[STATUS_PENDING,STATUS_CONFIRMED].includes(b.status)?`<button type="button" class="btn btn-dark" data-cancel="${esc(b.id)}">Hủy lịch</button>`:''}</div></article>`).join(''):'<div class="empty-state">Bạn chưa có lịch hẹn nào.</div>';
}

export function cancelMine(id){
  if(state.currentUser?.role!=='customer')return;
  const all=bookings(),b=all.find(x=>x.id===id&&x.customerId===state.currentUser.id);
  if(!b||![STATUS_PENDING,STATUS_CONFIRMED].includes(b.status)){toast('Không thể hủy lịch này.');return}
  b.status=STATUS_CANCELLED;if(!writeStore(STORAGE_BOOKINGS,all))return;
  renderMine();updateSlots();toast('Lịch hẹn đã được hủy.');
}
