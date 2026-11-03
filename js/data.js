/* EduCore data adapter: all people and student records come from the PHP API. */
(function(){
  'use strict';
  var BASE=/\/pages\//i.test(location.pathname.replace(/\\/g,'/'))?'../':'';
  var token='';
  var departments=['Computer Science','Business Administration','Electrical Engineering','Mechanical Engineering','Mathematics','Psychology','Economics','Nursing','Civil Engineering','Media Studies'];
  var programs=['B.Sc','B.A','BBA','B.Eng','Diploma','M.Sc','MBA','Ph.D'];
  var semesters=Array.from({length:8},function(_,i){return 'Semester '+(i+1);});
  function initials(name){return String(name||'').trim().split(/\s+/).filter(Boolean).slice(0,2).map(function(p){return p[0];}).join('').toUpperCase()||'NA';}
  function color(name){var colors=['#2451e0','#6a3fe8','#0e7490','#b45309','#be123c','#0f766e','#4338ca'];var n=0;String(name||'').split('').forEach(function(c){n=(n*31+c.charCodeAt(0))%100000;});return colors[n%colors.length];}
  function mapStudent(s){return Object.assign({},s,{initials:s.initials||initials(s.name),color:s.color||color(s.name),guardian:s.guardian||'',gpa:s.gpa==null?0:Number(s.gpa),attendance:s.attendance==null?0:Number(s.attendance)});}
  function displayUser(u){return Object.assign({},u,{role:u.role==='Admin'?'Administrator':(u.role==='Student'?'Student':(u.role==='User'?'Registrar':u.role)),initials:u.initials||initials(u.name),color:u.color||color(u.name)});}
  async function request(path,options){options=options||{};var method=(options.method||'GET').toUpperCase();var headers=Object.assign({Accept:'application/json'},options.headers||{});if(options.body)headers['Content-Type']='application/json';if(method!=='GET'&&method!=='HEAD')headers['X-CSRF-Token']=token;var response;try{response=await fetch(BASE+path,{method:method,headers:headers,body:options.body,credentials:'same-origin'});}catch(e){return {ok:false,error:'Cannot reach PHP. Start Apache and open this project through http://localhost; do not open the HTML file directly.'};}var result;try{result=await response.json();}catch(e){return {ok:false,error:'The PHP endpoint returned a non-JSON response. Check Apache and PHP errors.'};}if(response.status===401&&document.body.dataset.page!=='login'&&document.body.dataset.page!=='register'){location.href=BASE+'index.php';}return result;}
  var DB={UNIVERSITY:'Northfield University',DOMAIN:'northfield.edu',departments:departments,programs:programs,semesters:semesters,students:[],users:[],activities:[],notifications:[],dashboardStats:null,currentUser:null,BASE:BASE,request:request,initials:initials,avatarColor:color,
    formatDate:function(value,style){if(!value)return '—';var d=new Date(String(value).slice(0,10)+'T00:00:00');if(isNaN(d))return String(value);return d.toLocaleDateString('en-US',style==='long'?{month:'short',day:'numeric',year:'numeric'}:{day:'2-digit',month:'short',year:'numeric'});},
    ageFrom:function(value){var d=new Date(value+'T00:00:00');if(isNaN(d))return 0;var n=new Date(),age=n.getFullYear()-d.getFullYear();if(n.getMonth()<d.getMonth()||(n.getMonth()===d.getMonth()&&n.getDate()<d.getDate()))age--;return age;},
    getStudent:function(id){return DB.students.find(function(x){return String(x.id)===String(id);})||null;},
    fetchStudent:async function(id){var result=await request('students/api.php?id='+encodeURIComponent(id));if(!result.ok)throw new Error(result.error||'Student record could not be loaded.');return mapStudent(result.student);},
    getUser:function(id){return DB.users.find(function(x){return String(x.id)===String(id);})||null;},
    refreshStudents:async function(){var all=[],page=1,totalPages=1;do{var r=await request('students/api.php?page='+page+'&per_page=100&sort=joined&direction=desc');if(!r.ok)throw new Error(r.error||'Could not load students.');all=all.concat((r.students||[]).map(mapStudent));totalPages=(r.pagination&&r.pagination.pages)||1;page++;}while(page<=totalPages);DB.students=all;return all;},
    refreshUsers:async function(){if(!DB.currentUser||DB.currentUser.role!=='Administrator'){DB.users=DB.currentUser?[DB.currentUser]:[];return DB.users;}var r=await request('users/api.php');if(!r.ok)throw new Error(r.error||'Could not load users.');DB.users=(r.users||[]).map(displayUser);return DB.users;},
    refreshDashboard:async function(){var r=await request('api/dashboard.php');if(r.ok){DB.dashboardStats=r.stats;DB.activities=(r.recent||[]).slice(0,6).map(function(s){return {type:'success',icon:'user-plus',text:'<strong>'+escapeHtml(s.name)+'</strong> was registered in '+escapeHtml(s.department),time:DB.formatDate(s.joined,'long')};});}return r;},
    refreshProfile:async function(){if(!DB.currentUser)return null;var r=await request('api/profile.php');if(!r.ok)throw new Error(r.error||'Could not load your profile.');var p=r.profile;DB.currentUser=Object.assign({},DB.currentUser,p,{name:p.name,initials:initials(p.name),color:color(p.name),role:p.role==='Admin'?'Administrator':'Registrar'});var found=DB.users.findIndex(function(u){return String(u.id)===String(DB.currentUser.id);});if(found>=0)DB.users[found]=DB.currentUser;return p;},
    createStudent:async function(data){return request('students/api.php',{method:'POST',body:JSON.stringify(data)});},
    updateStudent:async function(data){return request('students/api.php',{method:'PUT',body:JSON.stringify(data)});},
    deleteStudent:async function(id){return request('students/api.php',{method:'DELETE',body:JSON.stringify({id:id})});},
    createUser:async function(data){return request('users/api.php',{method:'POST',body:JSON.stringify(data)});},
    updateUser:async function(data){return request('users/api.php',{method:'PUT',body:JSON.stringify(data)});},
    deleteUser:async function(id){return request('users/api.php',{method:'DELETE',body:JSON.stringify({id:id})});},
    saveProfile:async function(data){return request('api/profile.php',{method:'PUT',body:JSON.stringify(data)});},
    logout:async function(){return request('auth/api.php?action=logout',{method:'POST',body:JSON.stringify({})});}
  };
  function escapeHtml(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  DB.ready=(async function(){var auth=await request('api/csrf.php');if(!auth.ok)throw new Error(auth.error||'Session setup failed.');token=auth.csrf||'';if(auth.user){DB.currentUser=Object.assign({},auth.user,{name:auth.user.full_name,initials:initials(auth.user.full_name),color:color(auth.user.full_name),role:auth.user.role==='Admin'?'Administrator':(auth.user.role==='Student'?'Student':'Registrar')});if(auth.user.role==='Admin'){await DB.refreshProfile();await DB.refreshStudents();await DB.refreshUsers();var d=await DB.refreshDashboard();if(!d.ok)DB.activities=[];}else{DB.users=[DB.currentUser];}}})();
  window.DB=DB;
})();
