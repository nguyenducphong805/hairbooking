/* Main wiring: các module theo nhóm chức năng; entry point duy nhất. */
import { $, state } from './data.js';
import { roleChooser,selectRole,showAuth,seedStaffAccounts,register,login,restoreSession } from './auth.js';
import { openShop,openStaff } from './navigation.js';
import { openAccount,updateProfile,changePassword } from './account.js';
import { renderCatalog } from './catalog.js';
import { book,updateSlots,cancelMine } from './bookings.js';
import { renderStaff,staffUpdate } from './staff.js';
import { toast } from './data.js';
// Event delegation
addEventListener('click',e=>{
  const role=e.target.closest('[data-role]');if(role){selectRole(role.dataset.role);return}
  const tab=e.target.closest('[data-auth-tab]');if(tab){showAuth(tab.dataset.authTab);return}
  const sc=e.target.closest('[data-service]');if(sc){state.selectedService=sc.dataset.service;$('serviceSelect').value=state.selectedService;renderCatalog();return}
  const bc=e.target.closest('[data-barber]');if(bc){state.selectedBarber=bc.dataset.barber;$('barberSelect').value=state.selectedBarber;renderCatalog();return}
  const c=e.target.closest('[data-cancel]');if(c){cancelMine(c.dataset.cancel);return}
  const save=e.target.closest('[data-save-status]');if(save){const sel=Array.from(document.querySelectorAll('[data-update-status]')).find(n=>n.dataset.updateStatus===save.dataset.saveStatus);if(sel)staffUpdate(save.dataset.saveStatus,sel.value)}
});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-service],[data-barber]')){e.preventDefault();e.target.click()}});
$('registerForm').addEventListener('submit',register);$('loginForm').addEventListener('submit',login);
$('profileForm').addEventListener('submit',updateProfile);
$('passwordForm').addEventListener('submit',changePassword);
$('accountBtn').addEventListener('click',openAccount);
$('accountBackBtn').addEventListener('click',()=>{if(state.currentUser?.role==='staff')openStaff();else openShop()});
$('bookingForm').addEventListener('submit',book);
$('logoutBtn').addEventListener('click',()=>{roleChooser();toast('Đã thoát vai trò hiện tại.')});
$('roleSwitch').addEventListener('click',roleChooser);$('backToRoles').addEventListener('click',roleChooser);
$('homeLink').addEventListener('click',e=>{e.preventDefault();roleChooser()});
$('guestLoginBtn').addEventListener('click',()=>selectRole('customer'));
$('serviceSelect').addEventListener('change',()=>{state.selectedService=$('serviceSelect').value;renderCatalog()});
$('barberSelect').addEventListener('change',()=>{state.selectedBarber=$('barberSelect').value;renderCatalog()});
$('dateSelect').addEventListener('change',updateSlots);
$('staffSearch').addEventListener('input',renderStaff);$('statusFilter').addEventListener('change',renderStaff);
(async()=>{try{await seedStaffAccounts();if(!restoreSession())roleChooser()}catch(e){roleChooser();toast('Cần chạy trang bằng Live Server (localhost) để dùng Web Crypto.')}})();
