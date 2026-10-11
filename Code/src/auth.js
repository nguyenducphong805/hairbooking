/* BarberBook - module auth. */
import { $, state, STORAGE_SESSION, STORAGE_USERS, STAFF_ACCOUNTS, INITIAL_STAFF_PASSWORD, users, randomSalt, passwordHash, makeId, writeStore, setFeedback, toast, show } from "./data.js";
import { openShop, openStaff } from "./navigation.js";

let activeAuthTab = 'login';

export function roleChooser(){state.selectedRole=null;state.currentUser=null;sessionStorage.removeItem(STORAGE_SESSION);$('accountBtn').classList.add('hidden');$('logoutBtn').classList.add('hidden');$('userBadge').textContent='Chưa chọn vai trò';show('roleView')}

export function selectRole(role){
  if(role==='guest'){state.selectedRole='guest';state.currentUser=null;sessionStorage.removeItem(STORAGE_SESSION);openShop();return}
  if(!['customer','staff'].includes(role))return;
  state.selectedRole=role;state.currentUser=null;sessionStorage.removeItem(STORAGE_SESSION);
  showAuth('login');
}

export function showAuth(tab){
  activeAuthTab=tab;
  if(state.selectedRole==='staff')tab='login';
  $('authHeading').innerHTML=state.selectedRole==='staff'?'Xin chào,<br>nhân viên.':'Chào mừng<br>trở lại.';
  $('authSubheading').textContent=state.selectedRole==='staff'?'Đăng nhập để quản lý lịch hẹn.':'Đăng nhập hoặc tạo tài khoản để đặt lịch.';
  $('loginRoleTitle').textContent=state.selectedRole==='staff'?'nhân viên':'khách hàng';
  $('staffHint').classList.toggle('hidden',state.selectedRole!=='staff');
  $('authTabs').classList.toggle('hidden',state.selectedRole==='staff');
  $('loginForm').classList.toggle('hidden',tab!=='login');$('registerForm').classList.toggle('hidden',tab!=='register');
  document.querySelectorAll('[data-auth-tab]').forEach(b=>b.classList.toggle('active',b.dataset.authTab===tab));
  setFeedback('loginFeedback','');setFeedback('registerFeedback','');show('authView');
}

export async function seedStaffAccounts(){
  const all=users(); let changed=false;
  for(const profile of STAFF_ACCOUNTS){
    if(all.some(x=>x.id===profile.id || x.email===profile.email))continue;
    const salt=randomSalt(),passwordHashValue=await passwordHash(INITIAL_STAFF_PASSWORD,salt);
    all.push({...profile,salt,passwordHash:passwordHashValue});changed=true;
  }
  if(changed)writeStore(STORAGE_USERS,all);
}

export async function register(e){
  e.preventDefault();if(state.selectedRole!=='customer')return;
  const name=$('registerName').value.trim(),email=$('registerEmail').value.trim().toLowerCase(),phone=$('registerPhone').value.trim(),password=$('registerPassword').value,confirm=$('registerConfirm').value;
  if(name.length<2||name.length>80){setFeedback('registerFeedback','Họ tên phải từ 2 đến 80 ký tự.');return}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setFeedback('registerFeedback','Email chưa hợp lệ.');return}
  if(!/^0\d{9}$/.test(phone)){setFeedback('registerFeedback','Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.');return}
  if(password.length<8||password.length>72){setFeedback('registerFeedback','Mật khẩu phải từ 8 đến 72 ký tự.');return}
  if(password!==confirm){setFeedback('registerFeedback','Hai lần nhập mật khẩu không trùng nhau.');return}
  const all=users();if(all.some(x=>x.email===email)){setFeedback('registerFeedback','Email đã được đăng ký.');return}
  if(all.some(x=>x.phone===phone)){setFeedback('registerFeedback','Số điện thoại đã được sử dụng.');return}
  const button=$('registerSubmit');button.disabled=true;
  try{const salt=randomSalt(),hash=await passwordHash(password,salt);
    all.push({id:makeId('C'),name,email,phone,role:'customer',salt,passwordHash:hash});
    if(!writeStore(STORAGE_USERS,all)){setFeedback('registerFeedback','Không thể lưu tài khoản.');return}
    $('registerForm').reset();showAuth('login');$('loginEmail').value=email;
    setFeedback('loginFeedback','Tạo tài khoản thành công. Hãy đăng nhập.',true);toast('Đăng ký tài khoản khách hàng thành công!');
  }catch(err){setFeedback('registerFeedback',err.message)}finally{button.disabled=false}
}

export async function login(e){
  e.preventDefault();const email=$('loginEmail').value.trim().toLowerCase(),pwd=$('loginPassword').value;
  const found=users().find(x=>x.email===email);
  const button=$('loginSubmit');button.disabled=true;
  try{
    if(!found||found.role!==state.selectedRole){setFeedback('loginFeedback','Tài khoản không tồn tại hoặc không đúng vai trò đã chọn.');return}
    const hash=await passwordHash(pwd,found.salt);
    if(hash!==found.passwordHash){setFeedback('loginFeedback','Mật khẩu không chính xác.');return}
    state.currentUser={id:found.id,name:found.name,email:found.email,phone:found.phone,role:found.role};
    sessionStorage.setItem(STORAGE_SESSION,JSON.stringify({userId:found.id,role:found.role}));
    $('loginForm').reset();state.selectedRole=found.role;found.role==='staff'?openStaff():openShop();toast(`Xin chào, ${found.name}!`);
  }catch(err){setFeedback('loginFeedback',err.message)}finally{button.disabled=false}
}

export function restoreSession(){try{const v=JSON.parse(sessionStorage.getItem(STORAGE_SESSION)||'null');const u=users().find(x=>x.id===v?.userId&&x.role===v.role);if(!u)return false;state.currentUser={id:u.id,name:u.name,email:u.email,phone:u.phone,role:u.role};state.selectedRole=u.role;u.role==='staff'?openStaff():openShop();return true}catch{return false}}
