/* BarberBook - module account. */
import { $, state, users, bookings, writeStore, STORAGE_USERS, STORAGE_BOOKINGS, setFeedback, toast, show, findActiveAccount, randomSalt, passwordHash } from "./data.js";

export function refreshAccountBadge(){
  const label=state.currentUser?.role==='staff'?'Nhân viên':'Khách hàng';
  if(state.currentUser)$('userBadge').textContent=`${state.currentUser.name} · ${label}`;
}

export function renderAccount(){
  const user=findActiveAccount();if(!user)return;
  $('profileName').value=user.name;
  $('profileEmail').value=user.email;
  $('profilePhone').value=user.phone;
  $('profileName').readOnly=user.role==='staff';
  setFeedback('profileFeedback','');setFeedback('passwordFeedback','');
}

export function openAccount(){
  if(!state.currentUser){toast('Vui lòng đăng nhập để xem tài khoản.');return}
  renderAccount();show('accountView');
}

export function updateProfile(e){
  e.preventDefault();const user=findActiveAccount();if(!user)return;
  const name=$('profileName').value.trim(),phone=$('profilePhone').value.trim();
  if(name.length<2||name.length>80){setFeedback('profileFeedback','Họ tên cần từ 2 đến 80 ký tự.');return}
  if(!/^0\d{9}$/.test(phone)){setFeedback('profileFeedback','Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.');return}
  if(users().some(x=>x.id!==user.id&&x.phone===phone)){setFeedback('profileFeedback','Số điện thoại đã thuộc tài khoản khác.');return}
  const all=users();const item=all.find(x=>x.id===user.id);if(!item)return;
  if(user.role==='customer')item.name=name;
  item.phone=phone;
  if(!writeStore(STORAGE_USERS,all))return;
  // Cập nhật tên và số điện thoại hiển thị trong các lịch do người này đặt.
  if(user.role==='customer'){
    const allBookings=bookings();
    allBookings.filter(b=>b.customerId===user.id).forEach(b=>{b.customerName=item.name;b.phone=phone});
    writeStore(STORAGE_BOOKINGS,allBookings);
  }
  state.currentUser.name=item.name;state.currentUser.phone=item.phone;
  refreshAccountBadge();renderAccount();setFeedback('profileFeedback','Cập nhật thông tin thành công.',true);
  toast('Thông tin cá nhân đã được cập nhật.');
}

export async function changePassword(e){
  e.preventDefault();const user=findActiveAccount();if(!user)return;
  const oldPwd=$('oldPassword').value,newPwd=$('newPassword').value,confirmPwd=$('confirmNewPassword').value;
  if(newPwd.length<8||newPwd.length>72){setFeedback('passwordFeedback','Mật khẩu mới phải từ 8 đến 72 ký tự.');return}
  if(oldPwd===newPwd){setFeedback('passwordFeedback','Mật khẩu mới phải khác mật khẩu cũ.');return}
  if(newPwd!==confirmPwd){setFeedback('passwordFeedback','Xác nhận mật khẩu mới không khớp.');return}
  const button=$('passwordSubmit');button.disabled=true;
  try{
    const oldHash=await passwordHash(oldPwd,user.salt);
    if(oldHash!==user.passwordHash){setFeedback('passwordFeedback','Mật khẩu hiện tại không chính xác.');return}
    const all=users(),item=all.find(x=>x.id===user.id);if(!item)return;
    const salt=randomSalt();item.salt=salt;item.passwordHash=await passwordHash(newPwd,salt);
    if(!writeStore(STORAGE_USERS,all))return;
    $('passwordForm').reset();setFeedback('passwordFeedback','Đổi mật khẩu thành công.',true);
    toast('Mật khẩu đã được thay đổi.');
  }catch(err){setFeedback('passwordFeedback','Không thể đổi mật khẩu: '+err.message)}
  finally{button.disabled=false}
}
