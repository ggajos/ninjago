(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const c of document.querySelectorAll('link[rel="modulepreload"]'))n(c);new MutationObserver(c=>{for(const r of c)if(r.type==="childList")for(const l of r.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function a(c){const r={};return c.integrity&&(r.integrity=c.integrity),c.referrerPolicy&&(r.referrerPolicy=c.referrerPolicy),c.crossOrigin==="use-credentials"?r.credentials="include":c.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(c){if(c.ep)return;c.ep=!0;const r=a(c);fetch(c.href,r)}})();const N=[{id:"kai",name:"Kai",element:"Ogień",color:"#C41E3A",emoji:"🔥",avatar:"/avatars/kai.svg",encouragements:["Gorąco! Świetna robota!","Płomienne obliczenia!","Ogień! Tak trzymaj!","Rozpalasz się!"],comforts:["Nie poddawaj się! Ogień nigdy nie gaśnie!","Spróbuj jeszcze raz, wojowniku!","Każdy ninja się uczy!"]},{id:"jay",name:"Jay",element:"Błyskawica",color:"#0047AB",emoji:"⚡",avatar:"/avatars/jay.svg",encouragements:["Elektrycznie! Błyskawiczna odpowiedź!","Szok! Jak szybko!","Piorunująca robota!","Jesteś jak błyskawica!"],comforts:["Hej, nawet błyskawice czasem chybiają!","Spróbuj jeszcze! Będzie super!","Nie martw się, dasz radę!"]},{id:"cole",name:"Cole",element:"Ziemia",color:"#2F2F2F",emoji:"🏔️",avatar:"/avatars/cole.svg",encouragements:["Solidna odpowiedź jak skała!","Mocne! Ziemia się trzęsie!","Niewzruszony jak góra!","Skalna pewność!"],comforts:["Bądź silny jak góra, próbuj dalej!","Ziemia jest cierpliwa, Ty też bądź!","Każda góra zaczyna się od kamyka!"]},{id:"zane",name:"Zane",element:"Lód",color:"#87CEEB",emoji:"❄️",avatar:"/avatars/zane.svg",encouragements:["Lodowato precyzyjne!","Chłodna kalkulacja!","Zimna krew, gorący wynik!","Doskonała logika!"],comforts:["Analiza błędu pomoże następnym razem.","Spokojnie, oblicz jeszcze raz.","Każdy błąd to nauka!"]},{id:"lloyd",name:"Lloyd",element:"Energia",color:"#228B22",emoji:"💚",avatar:"/avatars/lloyd.svg",encouragements:["Zielona moc! Świetnie!","Energia płynie przez Ciebie!","Mistrzowskie obliczenie!","Prawdziwy Zielony Ninja!"],comforts:["Nawet Zielony Ninja musiał się uczyć!","Energia wraca! Spróbuj jeszcze!","Wierzę w Ciebie, wojowniku!"]},{id:"nya",name:"Nya",element:"Woda",color:"#4169E1",emoji:"💧",avatar:"/avatars/nya.svg",encouragements:["Płynna perfekcja!","Jak fala - nie do zatrzymania!","Wodna precyzja!","Świetny przepływ myśli!"],comforts:["Woda zawsze znajdzie drogę, Ty też!","Płyń dalej, nie poddawaj się!","Każda kropla się liczy!"]}],H=[{id:"easy",name:"Easy",namePolish:"Łatwy",maxNumber:10,operators:["+","-"],description:"Dodawanie i odejmowanie do 10"},{id:"medium",name:"Medium",namePolish:"Średni",maxNumber:20,operators:["+","-"],description:"Dodawanie i odejmowanie do 20"},{id:"hard",name:"Hard",namePolish:"Trudny",maxNumber:50,operators:["+","-"],description:"Dodawanie i odejmowanie do 50"},{id:"master",name:"Master",namePolish:"Mistrz",maxNumber:100,operators:["+","-"],description:"Dodawanie i odejmowanie do 100"}],me="ninjago-math-game-save",s={PLAYER_MAX_HEALTH:100,ENEMY_BASE_HEALTH:100,ENEMY_HEALTH_INCREMENT:20,PLAYER_ATTACK_DAMAGE:15,ENEMY_ATTACK_DAMAGE:20,IDLE_ATTACK_DAMAGE:10,IDLE_TIMEOUT_MAX_MS:15e3,IDLE_TIMEOUT_MIN_MS:8e3,HEALTH_REGEN_ON_HIT:5,STREAK_BONUS_DAMAGE:3,SKELETON_REPEATS:3},w=[{id:"skeleton",name:"Szkielet",emoji:"💀",color:"#4a0080",scale:1,isBoss:!1},{id:"skeleton-warrior",name:"Szkielet Wojownik",emoji:"⚔️",color:"#5a1090",scale:1.1,isBoss:!1},{id:"stone-warrior",name:"Kamienny Wojownik",emoji:"🗿",color:"#6b5b45",scale:1.2,isBoss:!0},{id:"serpentine",name:"Serpentyn",emoji:"🐍",color:"#228b22",scale:1.3,isBoss:!0},{id:"nindroid",name:"Nindroid",emoji:"🤖",color:"#404040",scale:1.4,isBoss:!0},{id:"ghost",name:"Duch",emoji:"👻",color:"#00ff88",scale:1.5,isBoss:!0},{id:"oni",name:"Oni",emoji:"👹",color:"#8b0000",scale:1.6,isBoss:!0},{id:"dragon-hunter",name:"Łowca Smoków",emoji:"🏹",color:"#8b4513",scale:1.7,isBoss:!0},{id:"overlord",name:"Overlord",emoji:"😈",color:"#1a0033",scale:2,isBoss:!0}];function p(e){if(e<=s.SKELETON_REPEATS)return Math.random()<.7?w[0]:w[1];const t=Math.min(e-s.SKELETON_REPEATS+1,w.length-1);return w[t]}function D(e){const t=p(e),a=s.ENEMY_BASE_HEALTH,n=Math.max(0,e-1)*s.ENEMY_HEALTH_INCREMENT;return Math.floor(a*t.scale+n)}function z(e){return Math.floor(Math.random()*e)+1}function V(e){return e[Math.floor(Math.random()*e.length)]}function ze(e){const t=z(Math.max(1,e-1)),a=Math.max(1,e-t),n=z(a);return{operand1:t,operand2:n,operator:"+",correctAnswer:t+n}}function Ce(e){const t=z(Math.max(2,e-1))+1,a=z(t-1);return{operand1:t,operand2:a,operator:"-",correctAnswer:t-a}}function ue(e){return V(e.operators)==="+"?ze(e.maxNumber):Ce(e.maxNumber)}function _e(e,t){return e.correctAnswer===t}function W(e){return`${e.operand1} ${e.operator} ${e.operand2} = ?`}function Z(e){try{localStorage.setItem(me,JSON.stringify(e))}catch{console.warn("Nie można zapisać danych gry")}}function Pe(){try{const e=localStorage.getItem(me);if(e)return JSON.parse(e)}catch{console.warn("Nie można wczytać danych gry")}return null}function ye(e){return N.find(t=>t.id===e)||N[0]}function he(e){return H.find(t=>t.id===e)||H[0]}function pe(){const e=Pe(),t=e?ye(e.selectedNinjaId):N[4],a=e?he(e.selectedDifficultyId):H[0],n=e?.highScore||0;return{currentNinja:t,score:0,highScore:n,streak:0,currentProblem:null,difficulty:a,totalProblems:0,correctAnswers:0,isGameActive:!1,playerHealth:s.PLAYER_MAX_HEALTH,maxPlayerHealth:s.PLAYER_MAX_HEALTH,enemyHealth:D(1),maxEnemyHealth:D(1),isGameOver:!1,lastAnswerTime:Date.now(),enemyLevel:1,enemiesDefeated:0}}function ge(e){const t=D(1);return{...e,score:0,streak:0,currentProblem:ue(e.difficulty),totalProblems:0,correctAnswers:0,isGameActive:!0,playerHealth:s.PLAYER_MAX_HEALTH,maxPlayerHealth:s.PLAYER_MAX_HEALTH,enemyHealth:t,maxEnemyHealth:t,isGameOver:!1,lastAnswerTime:Date.now(),enemyLevel:1,enemiesDefeated:0}}function Ie(e,t){if(!e.currentProblem||e.isGameOver)return{state:e,isCorrect:!1,message:"",playerAttacked:!1,enemyAttacked:!1,enemyDefeated:!1,playerDefeated:!1,damageDealt:0,damageTaken:0,newEnemyType:null};const a=_e(e.currentProblem,t),n=e.currentNinja;let c=e.score,r=e.streak,l=e.highScore,m=e.playerHealth,u=e.enemyHealth,ne=e.maxEnemyHealth,b=e.enemyLevel,ie=e.enemiesDefeated,I,$=0,O=0,G=!1,L=!1;if(a){const re=Math.min(r,5),He=10+re*2;if(c+=He,r+=1,I=V(n.encouragements),c>l&&(l=c),$=s.PLAYER_ATTACK_DAMAGE+re*s.STREAK_BONUS_DAMAGE,u=Math.max(0,u-$),m=Math.min(e.maxPlayerHealth,m+s.HEALTH_REGEN_ON_HIT),u<=0){G=!0,ie++,b++;const ce=D(b);u=ce,ne=ce;const De=p(e.enemyLevel).isBoss?100:50;c+=De,c>l&&(l=c)}}else r=0,I=V(n.comforts),O=s.ENEMY_ATTACK_DAMAGE,m=Math.max(0,m-O),m<=0&&(L=!0);const Ne={...e,score:c,highScore:l,streak:r,currentProblem:L?null:ue(e.difficulty),totalProblems:e.totalProblems+1,correctAnswers:e.correctAnswers+(a?1:0),playerHealth:m,enemyHealth:u,maxEnemyHealth:ne,isGameOver:L,lastAnswerTime:Date.now(),enemyLevel:b,enemiesDefeated:ie};return Z({highScore:l,selectedNinjaId:e.currentNinja.id,selectedDifficultyId:e.difficulty.id}),{state:Ne,isCorrect:a,message:I,playerAttacked:a,enemyAttacked:!a,enemyDefeated:G,playerDefeated:L,damageDealt:$,damageTaken:O,newEnemyType:G?p(b):null}}function $e(e){if(!e.isGameActive||e.isGameOver)return{state:e,attacked:!1,damage:0,playerDefeated:!1};const t=s.IDLE_ATTACK_DAMAGE,a=Math.max(0,e.playerHealth-t),n=a<=0;return{state:{...e,playerHealth:a,isGameOver:n,lastAnswerTime:Date.now()},attacked:!0,damage:t,playerDefeated:n}}function we(e){const t=w.length+s.SKELETON_REPEATS-1,a=Math.min(e-1,t-1)/(t-1),n=s.IDLE_TIMEOUT_MAX_MS-s.IDLE_TIMEOUT_MIN_MS;return Math.floor(s.IDLE_TIMEOUT_MAX_MS-a*n)}function Oe(e){if(!e.isGameActive||e.isGameOver)return!1;const t=Date.now()-e.lastAnswerTime,a=we(e.enemyLevel);return t>=a}function xe(e,t){const a=ye(t);return Z({highScore:e.highScore,selectedNinjaId:a.id,selectedDifficultyId:e.difficulty.id}),{...e,currentNinja:a}}function ke(e,t){const a=he(t);return Z({highScore:e.highScore,selectedNinjaId:e.currentNinja.id,selectedDifficultyId:a.id}),{...e,difficulty:a}}let B=null,g=!1;const oe=localStorage.getItem("ninjago-muted");oe!==null&&(g=oe==="true");function Ge(){return B||(B=new(window.AudioContext||window.webkitAudioContext)),B}function Be(e){const t=e.currentTime;[523.25,659.25,783.99].forEach((n,c)=>{const r=e.createOscillator(),l=e.createGain();r.type="sine",r.frequency.value=n,l.gain.setValueAtTime(0,t+c*.05),l.gain.linearRampToValueAtTime(.15,t+c*.05+.05),l.gain.exponentialRampToValueAtTime(.01,t+.4),r.connect(l),l.connect(e.destination),r.start(t+c*.05),r.stop(t+.5)})}function Re(e){const t=e.currentTime,a=e.createOscillator(),n=e.createGain();a.type="square",a.frequency.setValueAtTime(200,t),a.frequency.linearRampToValueAtTime(150,t+.2),n.gain.setValueAtTime(.1,t),n.gain.exponentialRampToValueAtTime(.01,t+.25),a.connect(n),n.connect(e.destination),a.start(t),a.stop(t+.3)}function Ve(e){const t=e.currentTime,a=e.createOscillator(),n=e.createGain();a.type="sawtooth",a.frequency.setValueAtTime(800,t),a.frequency.exponentialRampToValueAtTime(200,t+.15),n.gain.setValueAtTime(.12,t),n.gain.exponentialRampToValueAtTime(.01,t+.15),a.connect(n),n.connect(e.destination),a.start(t),a.stop(t+.2)}function qe(e){const t=e.currentTime,a=e.sampleRate*.1,n=e.createBuffer(1,a,e.sampleRate),c=n.getChannelData(0);for(let u=0;u<a;u++)c[u]=(Math.random()*2-1)*Math.exp(-u/(a*.1));const r=e.createBufferSource();r.buffer=n;const l=e.createBiquadFilter();l.type="lowpass",l.frequency.value=500;const m=e.createGain();m.gain.setValueAtTime(.2,t),m.gain.exponentialRampToValueAtTime(.01,t+.1),r.connect(l),l.connect(m),m.connect(e.destination),r.start(t)}function Ke(e){const t=e.currentTime;[{freq:523.25,start:0,duration:.15},{freq:659.25,start:.1,duration:.15},{freq:783.99,start:.2,duration:.15},{freq:1046.5,start:.3,duration:.4}].forEach(n=>{const c=e.createOscillator(),r=e.createGain();c.type="triangle",c.frequency.value=n.freq,r.gain.setValueAtTime(0,t+n.start),r.gain.linearRampToValueAtTime(.15,t+n.start+.02),r.gain.exponentialRampToValueAtTime(.01,t+n.start+n.duration),c.connect(r),r.connect(e.destination),c.start(t+n.start),c.stop(t+n.start+n.duration+.1)})}function Ye(e){const t=e.currentTime;[{freq:392,start:0,duration:.3},{freq:349.23,start:.25,duration:.3},{freq:293.66,start:.5,duration:.5}].forEach(n=>{const c=e.createOscillator(),r=e.createGain();c.type="sine",c.frequency.value=n.freq,r.gain.setValueAtTime(0,t+n.start),r.gain.linearRampToValueAtTime(.12,t+n.start+.05),r.gain.exponentialRampToValueAtTime(.01,t+n.start+n.duration),c.connect(r),r.connect(e.destination),c.start(t+n.start),c.stop(t+n.start+n.duration+.1)})}function Fe(e){const t=e.currentTime,a=e.createOscillator(),n=e.createGain();a.type="sine",a.frequency.value=600,n.gain.setValueAtTime(.08,t),n.gain.exponentialRampToValueAtTime(.01,t+.05),a.connect(n),n.connect(e.destination),a.start(t),a.stop(t+.06)}function We(e){const t=e.currentTime;[0,.1].forEach((a,n)=>{const c=e.createOscillator(),r=e.createGain();c.type="square",c.frequency.value=n===0?440:880,r.gain.setValueAtTime(.1,t+a),r.gain.exponentialRampToValueAtTime(.01,t+a+.1),c.connect(r),r.connect(e.destination),c.start(t+a),c.stop(t+a+.15)})}function d(e){if(!g)try{const t=Ge();switch(t.state==="suspended"&&t.resume(),e){case"correct":Be(t);break;case"wrong":Re(t);break;case"attack":Ve(t);break;case"hit":qe(t);break;case"victory":Ke(t);break;case"gameOver":Ye(t);break;case"click":Fe(t);break;case"start":We(t);break}}catch(t){console.warn("Audio error:",t)}}function Ze(e){g=e,localStorage.setItem("ninjago-muted",String(e))}function q(){return g}function Qe(){return Ze(!g),g}let i=pe(),j=null,S=null;const o=e=>{const t=document.querySelector(e);if(!t)throw new Error(`Element not found: ${e}`);return t},le=o("#start-screen"),C=o("#game-screen"),K=o("#gameover-screen"),Ae=o("#ninja-grid"),Ee=o("#difficulty-buttons"),Ue=o("#high-score-value"),Xe=o("#start-btn"),Y=o("#mute-btn"),Q=o("#current-score"),U=o("#current-streak"),Je=o("#current-damage"),et=o("#back-btn"),x=o("#ninja-avatar"),y=o("#enemy-avatar"),se=o("#enemy-name"),X=o("#problem-display"),f=o("#answer-input"),k=o("#answer-display"),A=o("#feedback"),h=o("#ninja-message"),tt=o(".numpad"),at=o("#backspace-btn"),nt=o("#attack-btn"),de=o("#player-health-fill"),it=o("#player-health-text"),fe=o("#enemy-health-fill"),rt=o("#enemy-health-text"),E=o("#battle-effect"),Te=o("#player-damage-popup"),ve=o("#enemy-damage-popup"),R=o("#idle-timer-fill"),ct=o("#final-score"),ot=o("#final-correct"),lt=o("#final-enemies"),st=o("#restart-btn"),dt=o("#menu-btn");function J(e,t=120){return`
    <svg viewBox="0 0 100 100" width="${t}" height="${t}" class="ninja-svg">
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
  `}function ee(e,t=120){const a=Math.floor(t*e.scale),n=e.isBoss?"#ff0000":"#ff4444",c=e.isBoss?"0.4":"0.2";let r="";switch(e.id){case"skeleton":case"skeleton-warrior":r=`
        <!-- Ciało szkieleta -->
        <ellipse cx="50" cy="72" rx="22" ry="18" fill="#2d2d2d"/>
        <rect x="38" y="60" width="24" height="3" fill="#d4d4d4" rx="1"/>
        <rect x="40" y="65" width="20" height="3" fill="#d4d4d4" rx="1"/>
        <rect x="42" y="70" width="16" height="3" fill="#d4d4d4" rx="1"/>
        <!-- Czaszka -->
        <circle cx="50" cy="32" r="22" fill="#e8e8e8"/>
        <ellipse cx="40" cy="30" rx="7" ry="8" fill="#1a1a1a"/>
        <ellipse cx="60" cy="30" rx="7" ry="8" fill="#1a1a1a"/>
        <circle cx="40" cy="30" r="3" fill="${n}"/>
        <circle cx="60" cy="30" r="3" fill="${n}"/>
        <path d="M 50 35 L 47 42 L 53 42 Z" fill="#1a1a1a"/>
        <rect x="42" y="44" width="4" height="6" fill="#e8e8e8" rx="1"/>
        <rect x="48" y="44" width="4" height="6" fill="#e8e8e8" rx="1"/>
        <rect x="54" y="44" width="4" height="6" fill="#e8e8e8" rx="1"/>
        ${e.id==="skeleton-warrior"?'<rect x="75" y="20" width="4" height="40" fill="#808080"/><rect x="72" y="55" width="10" height="4" fill="#8B4513"/>':""}
      `;break;case"stone-warrior":r=`
        <!-- Kamienny wojownik -->
        <ellipse cx="50" cy="70" rx="28" ry="22" fill="#5a534a"/>
        <rect x="35" y="55" width="30" height="8" fill="#6b5b45" rx="2"/>
        <circle cx="50" cy="32" r="25" fill="#6b5b45"/>
        <ellipse cx="40" cy="30" rx="8" ry="6" fill="#1a1a1a"/>
        <ellipse cx="60" cy="30" rx="8" ry="6" fill="#1a1a1a"/>
        <circle cx="40" cy="30" r="4" fill="${n}"/>
        <circle cx="60" cy="30" r="4" fill="${n}"/>
        <rect x="38" y="45" width="24" height="8" fill="#4a4a4a" rx="2"/>
      `;break;case"serpentine":r=`
        <!-- Serpentyn -->
        <ellipse cx="50" cy="70" rx="20" ry="24" fill="#1a5a1a"/>
        <path d="M 35 75 Q 25 85 30 95" stroke="#228b22" stroke-width="8" fill="none"/>
        <circle cx="50" cy="30" r="24" fill="#228b22"/>
        <ellipse cx="40" cy="28" rx="6" ry="10" fill="#ffff00"/>
        <ellipse cx="60" cy="28" rx="6" ry="10" fill="#ffff00"/>
        <ellipse cx="40" cy="30" rx="2" ry="6" fill="#000"/>
        <ellipse cx="60" cy="30" rx="2" ry="6" fill="#000"/>
        <path d="M 45 45 Q 50 52 55 45" stroke="#1a1a1a" stroke-width="2" fill="none"/>
        <path d="M 48 48 L 50 55 L 52 48" fill="#ff0000"/>
      `;break;case"nindroid":r=`
        <!-- Nindroid -->
        <rect x="32" y="55" width="36" height="35" fill="#303030" rx="4"/>
        <rect x="38" y="60" width="24" height="3" fill="#00ff00" opacity="0.5"/>
        <rect x="38" y="66" width="24" height="3" fill="#00ff00" opacity="0.5"/>
        <circle cx="50" cy="30" r="22" fill="#404040"/>
        <rect x="30" y="25" width="40" height="15" fill="#505050" rx="2"/>
        <rect x="35" cy="28" width="12" height="8" fill="#ff0000"/>
        <rect x="53" cy="28" width="12" height="8" fill="#ff0000"/>
        <rect x="45" y="40" width="10" height="3" fill="#606060"/>
      `;break;case"ghost":r=`
        <!-- Duch -->
        <ellipse cx="50" cy="65" rx="25" ry="30" fill="#00ff88" opacity="0.6"/>
        <path d="M 25 70 Q 30 95 40 90 Q 50 95 60 90 Q 70 95 75 70" fill="#00ff88" opacity="0.6"/>
        <circle cx="50" cy="35" r="22" fill="#00ff88" opacity="0.8"/>
        <ellipse cx="40" cy="33" rx="8" ry="10" fill="#000"/>
        <ellipse cx="60" cy="33" rx="8" ry="10" fill="#000"/>
        <circle cx="42" cy="32" r="3" fill="#00ffff"/>
        <circle cx="62" cy="32" r="3" fill="#00ffff"/>
        <ellipse cx="50" cy="50" rx="8" ry="6" fill="#000" opacity="0.5"/>
      `;break;case"oni":r=`
        <!-- Oni -->
        <ellipse cx="50" cy="70" rx="26" ry="22" fill="#4a0000"/>
        <circle cx="50" cy="32" r="26" fill="#8b0000"/>
        <!-- Rogi -->
        <path d="M 30 20 L 25 5 L 35 15" fill="#1a1a1a"/>
        <path d="M 70 20 L 75 5 L 65 15" fill="#1a1a1a"/>
        <ellipse cx="38" cy="30" rx="8" ry="6" fill="#ffff00"/>
        <ellipse cx="62" cy="30" rx="8" ry="6" fill="#ffff00"/>
        <circle cx="38" cy="30" r="3" fill="#000"/>
        <circle cx="62" cy="30" r="3" fill="#000"/>
        <rect x="35" y="45" width="30" height="10" fill="#1a1a1a" rx="2"/>
        <rect x="40" y="47" width="5" height="8" fill="#fff"/>
        <rect x="48" y="47" width="5" height="8" fill="#fff"/>
        <rect x="56" y="47" width="5" height="8" fill="#fff"/>
      `;break;case"dragon-hunter":r=`
        <!-- Łowca Smoków -->
        <ellipse cx="50" cy="70" rx="24" ry="20" fill="#5c4033"/>
        <rect x="35" y="55" width="30" height="12" fill="#8b4513"/>
        <circle cx="50" cy="32" r="22" fill="#deb887"/>
        <ellipse cx="40" cy="30" rx="5" ry="6" fill="#1a1a1a"/>
        <ellipse cx="60" cy="30" rx="5" ry="6" fill="#1a1a1a"/>
        <circle cx="40" cy="30" r="2" fill="${n}"/>
        <circle cx="60" cy="30" r="2" fill="${n}"/>
        <!-- Hełm -->
        <path d="M 28 25 Q 50 5 72 25" fill="#404040"/>
        <rect x="70" y="20" width="8" height="50" fill="#8b4513"/>
        <path d="M 78 20 L 85 15 L 78 30" fill="#808080"/>
      `;break;case"overlord":r=`
        <!-- Overlord -->
        <ellipse cx="50" cy="68" rx="30" ry="26" fill="#0a0015"/>
        <circle cx="50" cy="30" r="28" fill="#1a0033"/>
        <!-- Korona cieni -->
        <path d="M 22 20 L 30 0 L 38 15 L 50 -5 L 62 15 L 70 0 L 78 20" fill="#4a0080"/>
        <ellipse cx="38" cy="28" rx="10" ry="8" fill="#8b00ff"/>
        <ellipse cx="62" cy="28" rx="10" ry="8" fill="#8b00ff"/>
        <circle cx="38" cy="28" r="4" fill="#ff00ff"/>
        <circle cx="62" cy="28" r="4" fill="#ff00ff"/>
        <!-- Trzecie oko -->
        <ellipse cx="50" cy="15" rx="6" ry="5" fill="#ff0000"/>
        <circle cx="50" cy="15" r="2" fill="#000"/>
        <path d="M 35 50 Q 50 60 65 50" stroke="#8b00ff" stroke-width="3" fill="none"/>
      `;break;default:r=`
        <ellipse cx="50" cy="72" rx="22" ry="18" fill="#2d2d2d"/>
        <circle cx="50" cy="32" r="22" fill="#e8e8e8"/>
        <circle cx="40" cy="30" r="3" fill="${n}"/>
        <circle cx="60" cy="30" r="3" fill="${n}"/>
      `}return`
    <svg viewBox="0 0 100 100" width="${a}" height="${a}" class="enemy-svg ${e.isBoss?"boss":""}">
      <!-- Tło z efektem glow dla bossów -->
      <circle cx="50" cy="50" r="48" fill="${e.color}" opacity="${c}"/>
      ${e.isBoss?`<circle cx="50" cy="50" r="48" fill="none" stroke="${e.color}" stroke-width="2" opacity="0.6"/>`:""}
      
      ${r}
      
      <!-- Emoji -->
      <text x="50" y="95" text-anchor="middle" font-size="${e.isBoss?18:14}">${e.emoji}</text>
    </svg>
  `}function be(){Ae.innerHTML=N.map(e=>`
    <button 
      class="ninja-card ${e.id===i.currentNinja.id?"selected":""}"
      data-ninja-id="${e.id}"
      style="--ninja-color: ${e.color}"
      title="${e.name} - ${e.element}"
    >
      <div class="ninja-card-avatar">
        ${J(e,80)}
      </div>
      <div class="ninja-card-name">${e.name}</div>
      <div class="ninja-card-element">${e.emoji} ${e.element}</div>
    </button>
  `).join("")}function Le(){Ee.innerHTML=H.map(e=>`
    <button 
      class="difficulty-btn ${e.id===i.difficulty.id?"selected":""}"
      data-difficulty-id="${e.id}"
    >
      <span class="difficulty-name">${e.namePolish}</span>
      <span class="difficulty-desc">${e.description}</span>
    </button>
  `).join("")}function ft(){be(),Le(),Ue.textContent=String(i.highScore),document.documentElement.style.setProperty("--current-ninja-color",i.currentNinja.color)}function mt(){Q.textContent=String(i.score),U.textContent=String(i.streak),te(),x.innerHTML=J(i.currentNinja,120);const e=p(i.enemyLevel);y.innerHTML=ee(e,120),ae(e),i.currentProblem&&(X.textContent=W(i.currentProblem)),T(),A.textContent="",A.className="feedback",h.textContent="",Te.textContent="",ve.textContent="",E.className="battle-effect",f.value="",f.focus(),ht()}function T(){const e=i.playerHealth/i.maxPlayerHealth*100,t=i.enemyHealth/i.maxEnemyHealth*100;de.style.width=`${e}%`,fe.style.width=`${t}%`,it.textContent=`${i.playerHealth}/${i.maxPlayerHealth}`,rt.textContent=`${i.enemyHealth}/${i.maxEnemyHealth}`,de.classList.toggle("low-health",e<=30),fe.classList.toggle("low-health",t<=30)}function ut(){const e=Math.min(i.streak,5);return s.PLAYER_ATTACK_DAMAGE+e*s.STREAK_BONUS_DAMAGE}function te(){Je.textContent=String(ut())}function ae(e){se.textContent=`${e.emoji} ${e.name}`,se.classList.toggle("boss-name",e.id==="boss")}function M(e,t,a=!1){const n=e==="player"?Te:ve;n.textContent=a?`+${t}`:`-${t}`,n.className=`damage-popup ${a?"heal":"damage"} show`,setTimeout(()=>{n.classList.remove("show")},1e3)}function F(e){E.className=`battle-effect ${e}-attack`,e==="player"?(x.classList.add("attacking"),y.classList.add("hit")):(y.classList.add("attacking"),x.classList.add("hit")),setTimeout(()=>{E.className="battle-effect",x.classList.remove("attacking","hit"),y.classList.remove("attacking","hit")},500)}function yt(e,t,a){A.textContent=e?"✓ Dobrze!":`✗ Źle! Poprawna odpowiedź: ${a}`,A.className=`feedback ${e?"correct":"incorrect"}`,h.textContent=t,h.className=`ninja-message ${e?"encouragement":"comfort"}`}function je(){P(),ct.textContent=String(i.score),ot.textContent=String(i.correctAnswers),lt.textContent=String(i.enemiesDefeated),C.classList.add("hidden"),K.classList.remove("hidden")}function ht(){P(),j=window.setInterval(()=>{Oe(i)&&gt()},100),S=window.setInterval(()=>{pt()},50)}function P(){j&&(clearInterval(j),j=null),S&&(clearInterval(S),S=null)}function pt(){if(!i.isGameActive||i.isGameOver){R.style.width="100%";return}const e=Date.now()-i.lastAnswerTime,t=we(i.enemyLevel),a=Math.max(0,100-e/t*100);R.style.width=`${a}%`,R.classList.toggle("danger",a<=30)}function gt(){const e=$e(i);i=e.state,e.attacked&&(d("hit"),F("enemy"),M("player",e.damage),T(),h.textContent="Zbyt wolno! Wróg atakuje!",h.className="ninja-message comfort",e.playerDefeated&&(d("gameOver"),je()))}function v(e){e==="start"?(P(),le.classList.remove("hidden"),C.classList.add("hidden"),K.classList.add("hidden"),ft()):(le.classList.add("hidden"),K.classList.add("hidden"),C.classList.remove("hidden"),mt())}Ae.addEventListener("click",e=>{const a=e.target.closest(".ninja-card");if(!a)return;const n=a.dataset.ninjaId;n&&(i=xe(i,n),be(),document.documentElement.style.setProperty("--current-ninja-color",i.currentNinja.color))});Ee.addEventListener("click",e=>{const a=e.target.closest(".difficulty-btn");if(!a)return;const n=a.dataset.difficultyId;n&&(i=ke(i,n),Le())});Xe.addEventListener("click",()=>{d("start"),i=ge(i),v("game")});et.addEventListener("click",()=>{d("click"),P(),i.isGameActive=!1,v("start")});function Se(){if(i.isGameOver)return;const e=parseInt(f.value,10);if(isNaN(e)){k.classList.add("shake"),setTimeout(()=>k.classList.remove("shake"),500);return}const t=i.currentProblem?.correctAnswer,a=Ie(i,e);if(i=a.state,a.playerAttacked?(d("correct"),d("attack"),F("player"),M("enemy",a.damageDealt),a.isCorrect&&setTimeout(()=>M("player",5,!0),300)):a.enemyAttacked&&(d("wrong"),d("hit"),F("enemy"),M("player",a.damageTaken)),T(),yt(a.isCorrect,a.message,t),Q.textContent=String(i.score),U.textContent=String(i.streak),te(),a.enemyDefeated&&(d("victory"),E.classList.add("enemy-defeated"),setTimeout(()=>E.classList.remove("enemy-defeated"),1e3),a.newEnemyType&&setTimeout(()=>{const n=p(i.enemyLevel);y.classList.add("enemy-spawn"),y.innerHTML=ee(n,120),ae(n),T(),h.textContent=`Nowy przeciwnik: ${n.emoji} ${n.name}!`,setTimeout(()=>{y.classList.remove("enemy-spawn")},600)},800)),a.playerDefeated){d("gameOver"),je();return}i.currentProblem&&!i.isGameOver&&(X.textContent=W(i.currentProblem)),f.value="",k.textContent="?",setTimeout(()=>{A.textContent="",h.textContent=""},1e3)}function _(){k.textContent=f.value||"?"}tt.addEventListener("click",e=>{const a=e.target.dataset.num;a!==void 0&&!i.isGameOver&&(d("click"),f.value.length<4&&(f.value+=a,_()))});at.addEventListener("click",()=>{!i.isGameOver&&f.value.length>0&&(d("click"),f.value=f.value.slice(0,-1),_())});nt.addEventListener("click",()=>{i.isGameOver||Se()});document.addEventListener("keydown",e=>{!i.isGameActive||i.isGameOver||C.classList.contains("hidden")||(e.key>="0"&&e.key<="9"?f.value.length<4&&(f.value+=e.key,_(),d("click")):e.key==="Backspace"?f.value.length>0&&(f.value=f.value.slice(0,-1),_(),d("click")):e.key==="Enter"&&Se())});st.addEventListener("click",()=>{d("start");const e=i.currentNinja,t=i.difficulty;i=pe(),i=xe(i,e.id),i=ke(i,t.id),i=ge(i),X.textContent=W(i.currentProblem),Q.textContent="0",U.textContent="0",te(),x.innerHTML=J(i.currentNinja,120),document.documentElement.style.setProperty("--current-ninja-color",i.currentNinja.color),T();const a=p(i.enemyLevel);y.innerHTML=ee(a,120),ae(a),v("game"),f.value="",k.textContent="?"});dt.addEventListener("click",()=>{d("click"),v("start")});function Me(){Y.textContent=q()?"🔇":"🔊",Y.setAttribute("aria-label",q()?"Włącz dźwięki":"Wycisz dźwięki")}Y.addEventListener("click",()=>{Qe(),Me(),q()||d("click")});function wt(){Me(),v("start")}wt();
