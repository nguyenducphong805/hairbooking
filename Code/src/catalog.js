/* BarberBook - module catalog. */
import { $, state, SERVICES, BARBERS, esc, cash, service } from "./data.js";
import { updateSlots } from "./bookings.js";

export function renderCatalog(){
  $('servicesGrid').innerHTML=SERVICES.map((s,i)=>`<article class="service-card ${s.id===state.selectedService?'selected':''}" data-service="${s.id}" tabindex="0" role="button" aria-label="Chọn ${esc(s.name)}"><span class="service-number">SERVICE / 0${i+1}</span><div class="service-icon">${s.icon}</div><h3>${esc(s.name)}</h3><p>${esc(s.desc)}</p><div class="service-bottom"><strong>${cash(s.price)}</strong><span>${s.duration} phút</span></div></article>`).join('');
  $('barbersGrid').innerHTML=BARBERS.map(b=>`<article class="barber-card ${b.id===state.selectedBarber?'selected':''}" data-barber="${b.id}" tabindex="0" role="button" aria-label="Chọn thợ ${esc(b.name)}"><div class="avatar">${b.symbol}</div><div><h3>${esc(b.name)}</h3><p>${esc(b.title)}</p></div><span class="select-tag">${b.id===state.selectedBarber?'ĐÃ CHỌN':'CHỌN →'}</span></article>`).join('');
  $('serviceSelect').innerHTML=SERVICES.map(s=>`<option value="${s.id}">${esc(s.name)} — ${cash(s.price)}</option>`).join('');
  $('barberSelect').innerHTML=BARBERS.map(b=>`<option value="${b.id}">${esc(b.name)}</option>`).join('');
  $('serviceSelect').value=state.selectedService;$('barberSelect').value=state.selectedBarber;updatePrice();updateSlots();
}

export function updatePrice(){const s=service($('serviceSelect').value);$('priceSummary').textContent=s?`${s.name} · ${cash(s.price)} · ${s.duration} phút`:'Chọn dịch vụ để xem giá.'}
