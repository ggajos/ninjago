(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))c(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&c(s)}).observe(document,{childList:!0,subtree:!0});function n(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function c(a){if(a.ep)return;a.ep=!0;const o=n(a);fetch(a.href,o)}})();const u=[{id:"kai",name:"Kai",element:"Ogień",color:"#C41E3A",emoji:"🔥",avatar:"/avatars/kai.svg",encouragements:["Gorąco! Świetna robota!","Płomienne obliczenia!","Ogień! Tak trzymaj!","Rozpalasz się!"],comforts:["Nie poddawaj się! Ogień nigdy nie gaśnie!","Spróbuj jeszcze raz, wojowniku!","Każdy ninja się uczy!"]},{id:"jay",name:"Jay",element:"Błyskawica",color:"#0047AB",emoji:"⚡",avatar:"/avatars/jay.svg",encouragements:["Elektrycznie! Błyskawiczna odpowiedź!","Szok! Jak szybko!","Piorunująca robota!","Jesteś jak błyskawica!"],comforts:["Hej, nawet błyskawice czasem chybiają!","Spróbuj jeszcze! Będzie super!","Nie martw się, dasz radę!"]},{id:"cole",name:"Cole",element:"Ziemia",color:"#2F2F2F",emoji:"🏔️",avatar:"/avatars/cole.svg",encouragements:["Solidna odpowiedź jak skała!","Mocne! Ziemia się trzęsie!","Niewzruszony jak góra!","Skalna pewność!"],comforts:["Bądź silny jak góra, próbuj dalej!","Ziemia jest cierpliwa, Ty też bądź!","Każda góra zaczyna się od kamyka!"]},{id:"zane",name:"Zane",element:"Lód",color:"#87CEEB",emoji:"❄️",avatar:"/avatars/zane.svg",encouragements:["Lodowato precyzyjne!","Chłodna kalkulacja!","Zimna krew, gorący wynik!","Doskonała logika!"],comforts:["Analiza błędu pomoże następnym razem.","Spokojnie, oblicz jeszcze raz.","Każdy błąd to nauka!"]},{id:"lloyd",name:"Lloyd",element:"Energia",color:"#228B22",emoji:"💚",avatar:"/avatars/lloyd.svg",encouragements:["Zielona moc! Świetnie!","Energia płynie przez Ciebie!","Mistrzowskie obliczenie!","Prawdziwy Zielony Ninja!"],comforts:["Nawet Zielony Ninja musiał się uczyć!","Energia wraca! Spróbuj jeszcze!","Wierzę w Ciebie, wojowniku!"]},{id:"nya",name:"Nya",element:"Woda",color:"#4169E1",emoji:"💧",avatar:"/avatars/nya.svg",encouragements:["Płynna perfekcja!","Jak fala - nie do zatrzymania!","Wodna precyzja!","Świetny przepływ myśli!"],comforts:["Woda zawsze znajdzie drogę, Ty też!","Płyń dalej, nie poddawaj się!","Każda kropla się liczy!"]}],m=[{id:"easy",name:"Easy",namePolish:"Łatwy",maxNumber:10,operators:["+"],description:"Dodawanie do 10"},{id:"medium",name:"Medium",namePolish:"Średni",maxNumber:20,operators:["+","-"],description:"Dodawanie i odejmowanie do 20"},{id:"hard",name:"Hard",namePolish:"Trudny",maxNumber:50,operators:["+","-"],description:"Dodawanie i odejmowanie do 50"},{id:"master",name:"Master",namePolish:"Mistrz",maxNumber:100,operators:["+","-"],description:"Dodawanie i odejmowanie do 100"}],z="ninjago-math-game-save";function f(e){return Math.floor(Math.random()*e)+1}function p(e){return e[Math.floor(Math.random()*e.length)]}function O(e){const t=f(e-1),n=f(e-t);return{operand1:t,operand2:n,operator:"+",correctAnswer:t+n}}function T(e){const t=f(e),n=f(t);return{operand1:t,operand2:n,operator:"-",correctAnswer:t-n}}function v(e){return p(e.operators)==="+"?O(e.maxNumber):T(e.maxNumber)}function Z(e,t){return e.correctAnswer===t}function S(e){return`${e.operand1} ${e.operator} ${e.operand2} = ?`}function w(e){try{localStorage.setItem(z,JSON.stringify(e))}catch{console.warn("Nie można zapisać danych gry")}}function F(){try{const e=localStorage.getItem(z);if(e)return JSON.parse(e)}catch{console.warn("Nie można wczytać danych gry")}return null}function N(e){return u.find(t=>t.id===e)||u[0]}function x(e){return m.find(t=>t.id===e)||m[0]}function J(){const e=F(),t=e?N(e.selectedNinjaId):u[4],n=e?x(e.selectedDifficultyId):m[0],c=e?.highScore||0;return{currentNinja:t,score:0,highScore:c,streak:0,currentProblem:null,difficulty:n,totalProblems:0,correctAnswers:0,isGameActive:!1}}function K(e){return{...e,score:0,streak:0,currentProblem:v(e.difficulty),totalProblems:0,correctAnswers:0,isGameActive:!0}}function H(e,t){if(!e.currentProblem)return{state:e,isCorrect:!1,message:""};const n=Z(e.currentProblem,t),c=e.currentNinja;let a=e.score,o=e.streak,s=e.highScore,g;if(n){const G=10+Math.min(o,5)*2;a+=G,o+=1,g=p(c.encouragements),a>s&&(s=a)}else o=0,g=p(c.comforts);const M={...e,score:a,highScore:s,streak:o,currentProblem:v(e.difficulty),totalProblems:e.totalProblems+1,correctAnswers:e.correctAnswers+(n?1:0)};return w({highScore:s,selectedNinjaId:e.currentNinja.id,selectedDifficultyId:e.difficulty.id}),{state:M,isCorrect:n,message:g}}function W(e,t){const n=N(t);return w({highScore:e.highScore,selectedNinjaId:n.id,selectedDifficultyId:e.difficulty.id}),{...e,currentNinja:n}}function q(e,t){const n=x(t);return w({highScore:e.highScore,selectedNinjaId:e.currentNinja.id,selectedDifficultyId:n.id}),{...e,difficulty:n}}let r=J();const i=e=>{const t=document.querySelector(e);if(!t)throw new Error(`Element not found: ${e}`);return t},b=i("#start-screen"),k=i("#game-screen"),P=i("#ninja-grid"),$=i("#difficulty-buttons"),Q=i("#high-score-value"),R=i("#start-btn"),L=i("#current-score"),I=i("#current-streak"),V=i("#back-btn"),h=i("#ninja-avatar"),A=i("#problem-display"),l=i("#answer-input"),U=i("#submit-btn"),d=i("#feedback"),y=i("#ninja-message");function E(e,t=120){return`
    <svg viewBox="0 0 100 100" width="${t}" height="${t}">
      <!-- Tło z kolorem żywiołu -->
      <circle cx="50" cy="50" r="48" fill="${e.color}" opacity="0.2"/>
      
      <!-- Ciało ninja -->
      <ellipse cx="50" cy="70" rx="25" ry="20" fill="${e.color}"/>
      
      <!-- Głowa -->
      <circle cx="50" cy="35" r="22" fill="${e.color}"/>
      
      <!-- Maska ninja (odsłonięte oczy) -->
      <rect x="28" y="28" width="44" height="18" fill="#1a1a1a" rx="4"/>
      
      <!-- Oczy -->
      <ellipse cx="40" cy="35" rx="5" ry="4" fill="white"/>
      <ellipse cx="60" cy="35" rx="5" ry="4" fill="white"/>
      <circle cx="41" cy="35" r="2.5" fill="#222"/>
      <circle cx="61" cy="35" r="2.5" fill="#222"/>
      
      <!-- Blaski w oczach -->
      <circle cx="42" cy="34" r="1" fill="white"/>
      <circle cx="62" cy="34" r="1" fill="white"/>
      
      <!-- Węzeł maski -->
      <circle cx="78" cy="35" r="5" fill="#1a1a1a"/>
      <path d="M 78 40 Q 85 45 82 55" stroke="#1a1a1a" stroke-width="3" fill="none"/>
      <path d="M 78 40 Q 90 42 88 52" stroke="#1a1a1a" stroke-width="3" fill="none"/>
      
      <!-- Symbol żywiołu -->
      <text x="50" y="85" text-anchor="middle" font-size="20">${e.emoji}</text>
    </svg>
  `}function C(){P.innerHTML=u.map(e=>`
    <button 
      class="ninja-card ${e.id===r.currentNinja.id?"selected":""}"
      data-ninja-id="${e.id}"
      style="--ninja-color: ${e.color}"
      title="${e.name} - ${e.element}"
    >
      <div class="ninja-card-avatar">
        ${E(e,80)}
      </div>
      <div class="ninja-card-name">${e.name}</div>
      <div class="ninja-card-element">${e.emoji} ${e.element}</div>
    </button>
  `).join("")}function B(){$.innerHTML=m.map(e=>`
    <button 
      class="difficulty-btn ${e.id===r.difficulty.id?"selected":""}"
      data-difficulty-id="${e.id}"
    >
      <span class="difficulty-name">${e.namePolish}</span>
      <span class="difficulty-desc">${e.description}</span>
    </button>
  `).join("")}function Y(){C(),B(),Q.textContent=String(r.highScore),document.documentElement.style.setProperty("--current-ninja-color",r.currentNinja.color)}function _(){L.textContent=String(r.score),I.textContent=String(r.streak),h.innerHTML=E(r.currentNinja,150),r.currentProblem&&(A.textContent=S(r.currentProblem)),d.textContent="",d.className="feedback",y.textContent="",l.value="",l.focus()}function X(e,t,n){d.textContent=e?"✓ Dobrze!":`✗ Źle! Poprawna odpowiedź: ${n}`,d.className=`feedback ${e?"correct":"incorrect"}`,y.textContent=t,y.className=`ninja-message ${e?"encouragement":"comfort"}`,h.classList.add(e?"celebrate":"shake"),setTimeout(()=>{h.classList.remove("celebrate","shake")},500)}function j(e){e==="start"?(b.classList.remove("hidden"),k.classList.add("hidden"),Y()):(b.classList.add("hidden"),k.classList.remove("hidden"),_())}P.addEventListener("click",e=>{const n=e.target.closest(".ninja-card");if(!n)return;const c=n.dataset.ninjaId;c&&(r=W(r,c),C(),document.documentElement.style.setProperty("--current-ninja-color",r.currentNinja.color))});$.addEventListener("click",e=>{const n=e.target.closest(".difficulty-btn");if(!n)return;const c=n.dataset.difficultyId;c&&(r=q(r,c),B())});R.addEventListener("click",()=>{r=K(r),j("game")});V.addEventListener("click",()=>{r.isGameActive=!1,j("start")});function D(){const e=parseInt(l.value,10);if(isNaN(e)){l.classList.add("shake"),setTimeout(()=>l.classList.remove("shake"),500);return}const t=r.currentProblem?.correctAnswer,n=H(r,e);r=n.state,X(n.isCorrect,n.message,t),L.textContent=String(r.score),I.textContent=String(r.streak),setTimeout(()=>{r.currentProblem&&(A.textContent=S(r.currentProblem)),l.value="",l.focus(),d.textContent="",y.textContent=""},1500)}U.addEventListener("click",D);l.addEventListener("keypress",e=>{e.key==="Enter"&&D()});function ee(){j("start")}ee();
