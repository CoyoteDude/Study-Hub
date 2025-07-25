const githubAvatars = [
  "https://avatars.githubusercontent.com/u/583231?s=64", // Octocat
  "https://avatars.githubusercontent.com/u/9919?s=64",    // hubot
  "https://avatars.githubusercontent.com/u/2?s=64",       // defunkt
  "https://avatars.githubusercontent.com/u/3?s=64",       // pjhyett
  "https://avatars.githubusercontent.com/u/4?s=64",       // wycats
  "https://avatars.githubusercontent.com/u/5?s=64",       // ezmobius
  "https://avatars.githubusercontent.com/u/6?s=64",       //ivey
  "https://avatars.githubusercontent.com/u/21?s=64"       // bkeepers
];

// --- INIT DATA & UTILS ---
let state = JSON.parse(localStorage.getItem("dashboard-state") || "{}");

// === COURSE LIST UPDATED: SCIENCE & MATH ===
state.courses = [
  {name: "General Biology I", meta: "", grade: "", expanded: false},
  {name: "General Biology II", meta: "", grade: "", expanded: false},
  {name: "General Genetics", meta: "", grade: "", expanded: false},
  {name: "Microbiology", meta: "", grade: "", expanded: false},
  {name: "Anatomy and Physiology", meta: "", grade: "", expanded: false},
  {name: "General Chemistry I", meta: "", grade: "", expanded: false},
  {name: "General Chemistry II", meta: "", grade: "", expanded: false},
  {name: "Organic Chemistry I", meta: "", grade: "", expanded: false},
  {name: "Organic Chemistry II", meta: "", grade: "", expanded: false},
  {name: "Biochemistry", meta: "", grade: "", expanded: false},
  {name: "Algebra I", meta: "", grade: "", expanded: false},
  {name: "Algebra II", meta: "", grade: "", expanded: false},
  {name: "Pre-Calculus", meta: "", grade: "", expanded: false},
  {name: "Calculus I", meta: "", grade: "", expanded: false},
  {name: "Calculus II", meta: "", grade: "", expanded: false},
  {name: "Calculus III", meta: "", grade: "", expanded: false},
  {name: "Physics I", meta: "", grade: "", expanded: false},
  {name: "Physics II", meta: "", grade: "", expanded: false}
];

if (!state.todos) state.todos = [];
if (!state.calendar) state.calendar = [];
if (!state.profile) state.profile = {};
if (!state.prefs) state.prefs = {theme:"light", grid:true, showGrades:true, accent:"#bf3cff", fontsize:16, contrast:false, landing:"Dashboard"};
if (!state.banner) state.banner = "";

function saveState() { localStorage.setItem("dashboard-state", JSON.stringify(state)); }
function $(id){return document.getElementById(id);}
function show(el){el.classList.remove('hidden');}
function hide(el){el.classList.add('hidden');}
function applyPrefs() {
  document.body.className = state.prefs.theme + "-theme" + (state.prefs.contrast ? " high-contrast" : "");
  document.body.style.setProperty('--accent-color', state.prefs.accent || "#bf3cff");
  document.body.setAttribute('data-font-size', String(state.prefs.fontsize || 16));
  $("grid-toggle").checked = !!state.prefs.grid;
  $("grade-toggle").checked = !!state.prefs.showGrades;
  $("contrast-toggle").checked = !!state.prefs.contrast;
  $("accent-color").value = state.prefs.accent || "#bf3cff";
  $("font-size-slider").value = state.prefs.fontsize || 16;
}
applyPrefs();
// --- Avatar Picker ---
function renderAvatarPicker() {
  const current = state.profile.avatar || githubAvatars[0];
  const avatarList = $("avatar-list");
  avatarList.innerHTML = "";
  githubAvatars.forEach(url => {
    const img = document.createElement("img");
    img.src = url;
    img.className = "avatar-choice" + (current === url ? " selected" : "");
    img.onclick = ()=>{
      state.profile.avatar = url;
      $("avatar").src = url;
      saveState(); renderAvatarPicker();
    };
    avatarList.appendChild(img);
  });
}
$("avatar").src = state.profile.avatar || githubAvatars[0];
$("profile-name").value = state.profile.name || "";
$("profile-name").addEventListener("input", e=>{
  state.profile.name = e.target.value; saveState();});
$("profile-avatar").onchange = e=>{
  const file = e.target.files[0];
  if(file){const r=new FileReader();
    r.onload = ()=> {
      $("avatar").src = r.result;
      state.profile.avatar = r.result;
      saveState(); renderAvatarPicker();
    }; r.readAsDataURL(file);}
};
renderAvatarPicker();
// --- NAV/menu ---
$("menu-btn").onclick = ()=>{$("dropdown-menu").classList.toggle("hidden");};
$("settings-btn").onclick = ()=>{show($("settings-panel"));}
$("settings-link").onclick = ()=>{
  show($("settings-panel")); hide($("dropdown-menu"));};
$("toggle-dark").onclick = ()=>{
  state.prefs.theme = document.body.classList.toggle("dark-theme") ? "dark" : "light";
  saveState(); applyPrefs();
  hide($("dropdown-menu"));
};
$("close-settings").onclick = ()=>{hide($("settings-panel"));};
// --- THEME/ACCENT CONTROLS ---
$("accent-color").oninput=(e)=>{state.prefs.accent=e.target.value; saveState(); applyPrefs();};
$("font-size-slider").oninput=(e)=>{
  state.prefs.fontsize=Number(e.target.value)||16; saveState(); applyPrefs();};
$("contrast-toggle").onchange = e => {state.prefs.contrast = e.target.checked; saveState(); applyPrefs();}
$("landing-select").onchange = e => {state.prefs.landing = e.target.value; saveState();}
$("grade-toggle").onchange = e => {state.prefs.showGrades = e.target.checked; saveState(); renderCourses();}
$("grid-toggle").onchange = e=>{state.prefs.grid = e.target.checked; saveState(); renderCourses();};
// --- ANNOUNCEMENT BANNER ---
function renderBanner() {
  if(state.banner){
    $("banner").innerText=state.banner;
    $("banner").classList.add("active");
  } else $("banner").classList.remove("active");
}
$("set-banner").onclick=()=>{
  state.banner = $("banner-input").value; saveState(); renderBanner();
};
$("clear-banner").onclick=()=>{state.banner=""; saveState(); renderBanner();}
renderBanner();
// --- COURSES: Drag-Drop, Add, Remove, Expand ---
function renderCourses() {
  let html = "";
  let arr = state.courses;
  if (!arr.length) html = "<div class='empty-state'>No enrolled courses.<br>Add courses in Settings.</div>";
  else arr.forEach((c,i)=>{
    const classes = state.prefs.grid ? "course-tile" : "course-tile-list";
    html += `<div class="${classes}" draggable="true" data-i="${i}">
    <strong>${c.name}</strong>
    <span class='course-meta'>${c.meta||""} ${state.prefs.showGrades && c.grade? "&middot; "+c.grade:""}</span>
    <span class='tile-actions'>
      <button class='btn' onclick='toggleExpand(${i})'>${c.expanded?"Collapse":"Expand"}</button>
      <button class='btn' onclick='removeCourse(${i})'>Remove</button>
    </span>
    ${c.expanded?`<div><em>Recent announcements, links, syllabus, etc.</em></div>`:""}
    </div>`;
  });
  $("dashboard-courses").innerHTML= html;
  if(arr.length) Sortable.create($("dashboard-courses"),{
    animation:150, onEnd: function(evt){
      const item = state.courses.splice(evt.oldIndex,1)[0];
      state.courses.splice(evt.newIndex,0,item); saveState(); renderCourses();
    }
  });
}
window.toggleExpand = i =>{ state.courses[i].expanded=!state.courses[i].expanded; saveState(); renderCourses();};
window.removeCourse = i =>{ state.courses.splice(i,1); saveState(); renderCourses();};
renderCourses();
// --- TO-DO LIST ---
function renderTodos() {
  $("todo-list").innerHTML = state.todos.map(
    (t,i)=>`<li class='todo-item${t.checked?" completed":""}' data-i="${i}"><input type='checkbox' ${t.checked?"checked":""} 
   onchange='toggleTodo(${i})'><span>${t.text}</span>
   <button onclick='delTodo(${i})'>🗑</button></li>`).join('');
}
$("add-todo").onclick=()=>{
  const txt = prompt("Add Task"); if(txt){state.todos.push({text:txt,checked:false}); saveState(); renderTodos();}
}
window.delTodo = i=>{state.todos.splice(i,1); saveState(); renderTodos();}
window.toggleTodo = i=>{state.todos[i].checked=!state.todos[i].checked; saveState(); renderTodos();}
renderTodos();
// --- CALENDAR VIEW ---
function renderCalendar(){
  let days = [];
  for(let ev of state.calendar){
    const d = new Date(ev.date).toLocaleDateString();
    days.push(`<li>${d}: ${ev.title}</li>`);
  }
  $("calendar").innerHTML = days.length? '<ul>'+days.join('')+'</ul>' : '<em>No events</em>';
}
$("export-ical").onclick = ()=>{
  let ics = "BEGIN:VCALENDAR\nVERSION:2.0\n";
  for(let ev of state.calendar)
    ics+=`BEGIN:VEVENT\nSUMMARY:${ev.title}\nDTSTART;VALUE=DATE:${ev.date}\nEND:VEVENT\n`;
  ics+="END:VCALENDAR";
  const blob = new Blob([ics],{type:'text/calendar'});
  const a = document.createElement('a');
  a.href=URL.createObjectURL(blob); a.download="calendar.ics"; a.click();
  URL.revokeObjectURL(a.href);
}
$("import-ical").onclick = ()=>$("ical-input").click();
$("ical-input").onchange = e=>{
  const f = e.target.files[0];
  if(f) {
    const r = new FileReader();
    r.onload = ()=>{
      const events = [];
      let m= r.result.matchAll(/BEGIN:VEVENT([\s\S]+?)END:VEVENT/g);
      for(let g of m){
        let title = (g[1].match(/SUMMARY:(.*)/)||[])[1]||"Event";
        let date = (g[1].match(/DTSTART;VALUE=DATE:(\d{4}\d{2}\d{2})/)||[])[1];
        if(date) date = date.slice(0,4)+'-'+date.slice(4,6)+'-'+date.slice(6,8);
        if(date) events.push({title,date});
      }
      state.calendar = state.calendar.concat(events);
      saveState(); renderCalendar();
    }; r.readAsText(f);
  }
};
renderCalendar();
// --- SETTINGS IMPORT/EXPORT ---
$("export-settings").onclick = () => {
  const blob = new Blob([JSON.stringify(state)], {type: 'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = "dashboard-settings.json"; a.click();
  URL.revokeObjectURL(a.href);
}
$("import-settings").onclick = ()=> $("import-settings-file").click();
$("import-settings-file").onchange = e=>{
  const f = e.target.files[0]; if(f){
    const r = new FileReader();
    r.onload = ()=>{
      try{ state = JSON.parse(r.result); saveState(); location.reload(); }
      catch{ alert("Not valid settings file."); }
    }; r.readAsText(f);
  }
};
// --- SEARCH BAR ---
$("search-bar").oninput = function(e) {
  let q = e.target.value.toLowerCase();
  Array.from(document.querySelectorAll('.course-tile, .course-tile-list')).forEach(tile=>{
    const t = tile.innerText.toLowerCase();
    tile.style.display = q && !t.includes(q) ? "none" : "";
  });
  Array.from(document.querySelectorAll('.todo-item')).forEach(item=>{
    const t = item.innerText.toLowerCase();
    item.style.display = q && !t.includes(q) ? "none" : "";
  });
}
// --- KEYBOARD SHORTCUTS ---
document.addEventListener('keydown', e=>{
  if(document.activeElement.tagName == "INPUT" || document.activeElement.tagName=="TEXTAREA") return;
  if(e.key=="/") { $("search-bar").focus(); e.preventDefault();}
  if(e.key=="g"){
    document.addEventListener('keydown',function handler(ev){
      if(ev.key=="d"){scrollTo({top:0,behavior:'smooth'});}
      if(ev.key=="s"){show($("settings-panel"));}
      document.removeEventListener('keydown',handler);
    },{once:true});
  }
});
function notify(txt){
  if(Notification.permission==="granted") new Notification(txt);
  else if(Notification.permission!=="denied") Notification.requestPermission().then(p=>{
    if(p==="granted") new Notification(txt);
  });
}
if(state.todos.some(t=>!t.checked)) setTimeout(()=>notify("You have pending tasks!"), 2000);
saveState();
applyPrefs();

