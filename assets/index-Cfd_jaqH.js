(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))a(o);new MutationObserver(o=>{for(const r of o)if(r.type==="childList")for(const c of r.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&a(c)}).observe(document,{childList:!0,subtree:!0});function n(o){const r={};return o.integrity&&(r.integrity=o.integrity),o.referrerPolicy&&(r.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?r.credentials="include":o.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function a(o){if(o.ep)return;o.ep=!0;const r=n(o);fetch(o.href,r)}})();const I=[{id:"kai",name:"Kai",element:"Ogień",color:"#C41E3A",emoji:"🔥",avatar:"/avatars/kai.svg",encouragements:["Gorąco! Świetna robota!","Płomienne obliczenia!","Ogień! Tak trzymaj!","Rozpalasz się!"],comforts:["Nie poddawaj się! Ogień nigdy nie gaśnie!","Spróbuj jeszcze raz, wojowniku!","Każdy ninja się uczy!"]},{id:"jay",name:"Jay",element:"Błyskawica",color:"#0047AB",emoji:"⚡",avatar:"/avatars/jay.svg",encouragements:["Elektrycznie! Błyskawiczna odpowiedź!","Szok! Jak szybko!","Piorunująca robota!","Jesteś jak błyskawica!"],comforts:["Hej, nawet błyskawice czasem chybiają!","Spróbuj jeszcze! Będzie super!","Nie martw się, dasz radę!"]},{id:"cole",name:"Cole",element:"Ziemia",color:"#2F2F2F",emoji:"🏔️",avatar:"/avatars/cole.svg",encouragements:["Solidna odpowiedź jak skała!","Mocne! Ziemia się trzęsie!","Niewzruszony jak góra!","Skalna pewność!"],comforts:["Bądź silny jak góra, próbuj dalej!","Ziemia jest cierpliwa, Ty też bądź!","Każda góra zaczyna się od kamyka!"]},{id:"zane",name:"Zane",element:"Lód",color:"#87CEEB",emoji:"❄️",avatar:"/avatars/zane.svg",encouragements:["Lodowato precyzyjne!","Chłodna kalkulacja!","Zimna krew, gorący wynik!","Doskonała logika!"],comforts:["Analiza błędu pomoże następnym razem.","Spokojnie, oblicz jeszcze raz.","Każdy błąd to nauka!"]},{id:"lloyd",name:"Lloyd",element:"Energia",color:"#228B22",emoji:"💚",avatar:"/avatars/lloyd.svg",encouragements:["Zielona moc! Świetnie!","Energia płynie przez Ciebie!","Mistrzowskie obliczenie!","Prawdziwy Zielony Ninja!"],comforts:["Nawet Zielony Ninja musiał się uczyć!","Energia wraca! Spróbuj jeszcze!","Wierzę w Ciebie, wojowniku!"]},{id:"nya",name:"Nya",element:"Woda",color:"#4169E1",emoji:"💧",avatar:"/avatars/nya.svg",encouragements:["Płynna perfekcja!","Jak fala - nie do zatrzymania!","Wodna precyzja!","Świetny przepływ myśli!"],comforts:["Woda zawsze znajdzie drogę, Ty też!","Płyń dalej, nie poddawaj się!","Każda kropla się liczy!"]}],P=[{id:"easy",name:"Easy",namePolish:"Łatwy",maxNumber:10,operators:["+","-"],description:"Dodawanie i odejmowanie do 10"},{id:"medium",name:"Medium",namePolish:"Średni",maxNumber:20,operators:["+","-"],description:"Dodawanie i odejmowanie do 20"},{id:"hard",name:"Hard",namePolish:"Trudny",maxNumber:50,operators:["+","-"],description:"Dodawanie i odejmowanie do 50"},{id:"master",name:"Master",namePolish:"Mistrz",maxNumber:100,operators:["+","-"],description:"Dodawanie i odejmowanie do 100"}],be="ninjago-math-game-save",d={PLAYER_MAX_HEALTH:100,ENEMY_BASE_HEALTH:100,ENEMY_HEALTH_INCREMENT:20,PLAYER_ATTACK_DAMAGE:15,ENEMY_ATTACK_DAMAGE:20,IDLE_ATTACK_DAMAGE:10,IDLE_TIMEOUT_MAX_MS:15e3,IDLE_TIMEOUT_MIN_MS:8e3,HEALTH_REGEN_ON_HIT:5,STREAK_BONUS_DAMAGE:3,SKELETON_REPEATS:3},L=[{id:"skeleton",name:"Szkielet",emoji:"💀",color:"#4a0080",scale:1,isBoss:!1},{id:"skeleton-warrior",name:"Szkielet Wojownik",emoji:"⚔️",color:"#5a1090",scale:1.1,isBoss:!1},{id:"stone-warrior",name:"Kamienny Wojownik",emoji:"🗿",color:"#6b5b45",scale:1.2,isBoss:!0},{id:"serpentine",name:"Serpentyn",emoji:"🐍",color:"#228b22",scale:1.3,isBoss:!0},{id:"nindroid",name:"Nindroid",emoji:"🤖",color:"#404040",scale:1.4,isBoss:!0},{id:"ghost",name:"Duch",emoji:"👻",color:"#00ff88",scale:1.5,isBoss:!0},{id:"oni",name:"Oni",emoji:"👹",color:"#8b0000",scale:1.6,isBoss:!0},{id:"dragon-hunter",name:"Łowca Smoków",emoji:"🏹",color:"#8b4513",scale:1.7,isBoss:!0},{id:"overlord",name:"Overlord",emoji:"😈",color:"#1a0033",scale:2,isBoss:!0}];function h(e){if(e<=d.SKELETON_REPEATS)return Math.random()<.7?L[0]:L[1];const t=Math.min(e-d.SKELETON_REPEATS+1,L.length-1);return L[t]}function B(e){const t=h(e),n=d.ENEMY_BASE_HEALTH,a=Math.max(0,e-1)*d.ENEMY_HEALTH_INCREMENT;return Math.floor(n*t.scale+a)}function _(e){return Math.floor(Math.random()*e)+1}function X(e){return e[Math.floor(Math.random()*e.length)]}function Ge(e){const t=_(Math.max(1,e-1)),n=Math.max(1,e-t),a=_(n);return{operand1:t,operand2:a,operator:"+",correctAnswer:t+a}}function Re(e){const t=_(Math.max(2,e-1))+1,n=_(t-1);return{operand1:t,operand2:n,operator:"-",correctAnswer:t-n}}function ke(e){return X(e.operators)==="+"?Ge(e.maxNumber):Re(e.maxNumber)}function Ke(e,t){return e.correctAnswer===t}function G(e){return`${e.operand1} ${e.operator} ${e.operand2} = ?`}function oe(e){try{localStorage.setItem(be,JSON.stringify(e))}catch{console.warn("Nie można zapisać danych gry")}}function Ve(){try{const e=localStorage.getItem(be);if(e)return JSON.parse(e)}catch{console.warn("Nie można wczytać danych gry")}return null}function Te(e){return I.find(t=>t.id===e)||I[0]}function Ae(e){return P.find(t=>t.id===e)||P[0]}function ce(){const e=Ve(),t=e?Te(e.selectedNinjaId):I[4],n=e?Ae(e.selectedDifficultyId):P[0],a=e?.highScore||0;return{currentNinja:t,score:0,highScore:a,streak:0,currentProblem:null,difficulty:n,totalProblems:0,correctAnswers:0,isGameActive:!1,playerHealth:d.PLAYER_MAX_HEALTH,maxPlayerHealth:d.PLAYER_MAX_HEALTH,enemyHealth:B(1),maxEnemyHealth:B(1),isGameOver:!1,lastAnswerTime:Date.now(),enemyLevel:1,enemiesDefeated:0}}function se(e){const t=B(1);return{...e,score:0,streak:0,currentProblem:ke(e.difficulty),totalProblems:0,correctAnswers:0,isGameActive:!0,playerHealth:d.PLAYER_MAX_HEALTH,maxPlayerHealth:d.PLAYER_MAX_HEALTH,enemyHealth:t,maxEnemyHealth:t,isGameOver:!1,lastAnswerTime:Date.now(),enemyLevel:1,enemiesDefeated:0}}function qe(e,t){if(!e.currentProblem||e.isGameOver)return{state:e,isCorrect:!1,message:"",playerAttacked:!1,enemyAttacked:!1,enemyDefeated:!1,playerDefeated:!1,damageDealt:0,damageTaken:0,newEnemyType:null};const n=Ke(e.currentProblem,t),a=e.currentNinja;let o=e.score,r=e.streak,c=e.highScore,u=e.playerHealth,y=e.enemyHealth,z=e.maxEnemyHealth,E=e.enemyLevel,ue=e.enemiesDefeated,U,W=0,F=0,Z=!1,D=!1;if(n){const ye=Math.min(r,5),Be=10+ye*2;if(o+=Be,r+=1,U=X(a.encouragements),o>c&&(c=o),W=d.PLAYER_ATTACK_DAMAGE+ye*d.STREAK_BONUS_DAMAGE,y=Math.max(0,y-W),u=Math.min(e.maxPlayerHealth,u+d.HEALTH_REGEN_ON_HIT),y<=0){Z=!0,ue++,E++;const pe=B(E);y=pe,z=pe;const _e=h(e.enemyLevel).isBoss?100:50;o+=_e,o>c&&(c=o)}}else r=0,U=X(a.comforts),F=d.ENEMY_ATTACK_DAMAGE,u=Math.max(0,u-F),u<=0&&(D=!0);const Pe={...e,score:o,highScore:c,streak:r,currentProblem:D?null:ke(e.difficulty),totalProblems:e.totalProblems+1,correctAnswers:e.correctAnswers+(n?1:0),playerHealth:u,enemyHealth:y,maxEnemyHealth:z,isGameOver:D,lastAnswerTime:Date.now(),enemyLevel:E,enemiesDefeated:ue};return oe({highScore:c,selectedNinjaId:e.currentNinja.id,selectedDifficultyId:e.difficulty.id}),{state:Pe,isCorrect:n,message:U,playerAttacked:n,enemyAttacked:!n,enemyDefeated:Z,playerDefeated:D,damageDealt:W,damageTaken:F,newEnemyType:Z&&h(e.enemyLevel).id!=="overlord"?h(E):null}}function Ye(e){if(!e.isGameActive||e.isGameOver)return{state:e,attacked:!1,damage:0,playerDefeated:!1};const t=d.IDLE_ATTACK_DAMAGE,n=Math.max(0,e.playerHealth-t),a=n<=0;return{state:{...e,playerHealth:n,isGameOver:a,lastAnswerTime:Date.now()},attacked:!0,damage:t,playerDefeated:a}}function Le(e){const t=L.length+d.SKELETON_REPEATS-1,n=Math.min(e-1,t-1)/(t-1),a=d.IDLE_TIMEOUT_MAX_MS-d.IDLE_TIMEOUT_MIN_MS;return Math.floor(d.IDLE_TIMEOUT_MAX_MS-n*a)}function Ue(e){if(!e.isGameActive||e.isGameOver)return!1;const t=Date.now()-e.lastAnswerTime,n=Le(e.enemyLevel);return t>=n}function le(e,t){const n=Te(t);return oe({highScore:e.highScore,selectedNinjaId:n.id,selectedDifficultyId:e.difficulty.id}),{...e,currentNinja:n}}function de(e,t){const n=Ae(t);return oe({highScore:e.highScore,selectedNinjaId:e.currentNinja.id,selectedDifficultyId:n.id}),{...e,difficulty:n}}let J=null,T=!1;const he=localStorage.getItem("ninjago-muted");he!==null&&(T=he==="true");function We(){return J||(J=new(window.AudioContext||window.webkitAudioContext)),J}function Fe(e){const t=e.currentTime;[523.25,659.25,783.99].forEach((a,o)=>{const r=e.createOscillator(),c=e.createGain();r.type="sine",r.frequency.value=a,c.gain.setValueAtTime(0,t+o*.05),c.gain.linearRampToValueAtTime(.15,t+o*.05+.05),c.gain.exponentialRampToValueAtTime(.01,t+.4),r.connect(c),c.connect(e.destination),r.start(t+o*.05),r.stop(t+.5)})}function Ze(e){const t=e.currentTime,n=e.createOscillator(),a=e.createGain();n.type="square",n.frequency.setValueAtTime(200,t),n.frequency.linearRampToValueAtTime(150,t+.2),a.gain.setValueAtTime(.1,t),a.gain.exponentialRampToValueAtTime(.01,t+.25),n.connect(a),a.connect(e.destination),n.start(t),n.stop(t+.3)}function Je(e){const t=e.currentTime,n=e.createOscillator(),a=e.createGain();n.type="sawtooth",n.frequency.setValueAtTime(800,t),n.frequency.exponentialRampToValueAtTime(200,t+.15),a.gain.setValueAtTime(.12,t),a.gain.exponentialRampToValueAtTime(.01,t+.15),n.connect(a),a.connect(e.destination),n.start(t),n.stop(t+.2)}function Qe(e){const t=e.currentTime,n=e.sampleRate*.1,a=e.createBuffer(1,n,e.sampleRate),o=a.getChannelData(0);for(let y=0;y<n;y++)o[y]=(Math.random()*2-1)*Math.exp(-y/(n*.1));const r=e.createBufferSource();r.buffer=a;const c=e.createBiquadFilter();c.type="lowpass",c.frequency.value=500;const u=e.createGain();u.gain.setValueAtTime(.2,t),u.gain.exponentialRampToValueAtTime(.01,t+.1),r.connect(c),c.connect(u),u.connect(e.destination),r.start(t)}function Xe(e){const t=e.currentTime;[{freq:523.25,start:0,duration:.15},{freq:659.25,start:.1,duration:.15},{freq:783.99,start:.2,duration:.15},{freq:1046.5,start:.3,duration:.4}].forEach(a=>{const o=e.createOscillator(),r=e.createGain();o.type="triangle",o.frequency.value=a.freq,r.gain.setValueAtTime(0,t+a.start),r.gain.linearRampToValueAtTime(.15,t+a.start+.02),r.gain.exponentialRampToValueAtTime(.01,t+a.start+a.duration),o.connect(r),r.connect(e.destination),o.start(t+a.start),o.stop(t+a.start+a.duration+.1)})}function et(e){const t=e.currentTime;[{freq:392,start:0,duration:.3},{freq:349.23,start:.25,duration:.3},{freq:293.66,start:.5,duration:.5}].forEach(a=>{const o=e.createOscillator(),r=e.createGain();o.type="sine",o.frequency.value=a.freq,r.gain.setValueAtTime(0,t+a.start),r.gain.linearRampToValueAtTime(.12,t+a.start+.05),r.gain.exponentialRampToValueAtTime(.01,t+a.start+a.duration),o.connect(r),r.connect(e.destination),o.start(t+a.start),o.stop(t+a.start+a.duration+.1)})}function tt(e){const t=e.currentTime,n=e.createOscillator(),a=e.createGain();n.type="sine",n.frequency.value=600,a.gain.setValueAtTime(.08,t),a.gain.exponentialRampToValueAtTime(.01,t+.05),n.connect(a),a.connect(e.destination),n.start(t),n.stop(t+.06)}function nt(e){const t=e.currentTime;[0,.1].forEach((n,a)=>{const o=e.createOscillator(),r=e.createGain();o.type="square",o.frequency.value=a===0?440:880,r.gain.setValueAtTime(.1,t+n),r.gain.exponentialRampToValueAtTime(.01,t+n+.1),o.connect(r),r.connect(e.destination),o.start(t+n),o.stop(t+n+.15)})}function l(e){if(!T)try{const t=We();switch(t.state==="suspended"&&t.resume(),e){case"correct":Fe(t);break;case"wrong":Ze(t);break;case"attack":Je(t);break;case"hit":Qe(t);break;case"victory":Xe(t);break;case"gameOver":et(t);break;case"click":tt(t);break;case"start":nt(t);break}}catch(t){console.warn("Audio error:",t)}}function at(e){T=e,localStorage.setItem("ninjago-muted",String(e))}function ee(){return T}function it(){return at(!T),T}let i=ce(),O=null,H=null;const rt={emoji:"🏯",text:"Ninjago jest w niebezpieczeństwie! Armia szkieletów zaatakowała miasto. Tylko TY możesz ich powstrzymać... używając mocy MATEMATYKI! 🧮⚡"},ge={skeleton:{gradient:"linear-gradient(180deg, #1a0a2e 0%, #2d1b4e 30%, #1a0a2e 70%, #0d0518 100%)",particles:"💀",ambientColor:"#4a0080",floatingElements:["🦴","💀","⚔️","🕯️"]},"skeleton-warrior":{gradient:"linear-gradient(180deg, #1f0a3a 0%, #3d1b5e 30%, #2a1045 70%, #0d0518 100%)",particles:"⚔️",ambientColor:"#5a1090",floatingElements:["⚔️","🗡️","💀","🛡️"]},"stone-warrior":{gradient:"linear-gradient(180deg, #2a2218 0%, #4a3c2e 30%, #3b3025 70%, #1a1510 100%)",particles:"🪨",ambientColor:"#6b5b45",floatingElements:["🗿","🪨","⛰️","🏛️"]},serpentine:{gradient:"linear-gradient(180deg, #0a2a1a 0%, #1b4e2e 30%, #0d3318 70%, #051a0d 100%)",particles:"🐍",ambientColor:"#228b22",floatingElements:["🐍","🌿","🍃","☠️"]},nindroid:{gradient:"linear-gradient(180deg, #0a0a1a 0%, #1a1a3e 30%, #0d0d2a 70%, #050510 100%)",particles:"⚡",ambientColor:"#4040ff",floatingElements:["🤖","⚡","💠","🔩"]},ghost:{gradient:"linear-gradient(180deg, #0a2a2a 0%, #1b4e4e 30%, #0d3333 70%, #051a1a 100%)",particles:"👻",ambientColor:"#00ff88",floatingElements:["👻","🌫️","💀","🕯️"]},oni:{gradient:"linear-gradient(180deg, #2a0a0a 0%, #4e1b1b 30%, #330d0d 70%, #1a0505 100%)",particles:"🔥",ambientColor:"#ff4444",floatingElements:["👹","🔥","⛓️","💀"]},"dragon-hunter":{gradient:"linear-gradient(180deg, #1a1510 0%, #3e2b1b 30%, #2a1d12 70%, #100a05 100%)",particles:"🏹",ambientColor:"#8b4513",floatingElements:["🏹","🐉","⚔️","🎯"]},overlord:{gradient:"linear-gradient(180deg, #0d0015 0%, #1a0033 30%, #0d001a 70%, #050008 100%)",particles:"😈",ambientColor:"#9900ff",floatingElements:["😈","⚡","💀","🌑"]}},ot={"stone-warrior":{emoji:"🗿",text:"UWAGA! Kamienny Wojownik się zbliża! Ten starożytny strażnik jest niezniszczalny... prawie. Twoja inteligencja jest twoją bronią!"},serpentine:{emoji:"🐍",text:"Sssserpentyn wyłania się z cieni! Ten podstępny wąż hypnotyzuje swoje ofiary. Nie daj się zahipnotyzować - skup się na liczbach!"},nindroid:{emoji:"🤖",text:"ALERT SYSTEMU! Nindroid aktywowany. Ta maszyna wojenna oblicza 1000 działań na sekundę. Czy nadążysz?"},ghost:{emoji:"👻",text:"Temperatura spada... Duch z Królestwa Umarłych nawiedza arenę! Tylko czysty umysł może go pokonać!"},oni:{emoji:"👹",text:"DRŻYJ ŚMIERTELNIKU! Oni - demon z innego wymiaru - żąda twojej duszy! Pokaż mu moc ninja!"},"dragon-hunter":{emoji:"🏹",text:"Łowca Smoków namierzył nowy cel... CIEBIE! Ten bezwzględny myśliwy nigdy nie chybia. Bądź szybszy!"},overlord:{emoji:"😈",text:`⚠️ FINAŁOWA BITWA ⚠️

OVERLORD - Władca Ciemności - powstał! To jest TO. Ostateczne starcie dobra ze złem. Cała nadzieja Ninjago spoczywa na TOBIE! 🌟`}},s=e=>{const t=document.querySelector(e);if(!t)throw new Error(`Element not found: ${e}`);return t},we=s("#start-screen"),w=s("#game-screen"),te=s("#gameover-screen"),je=s("#ninja-grid"),Me=s("#difficulty-buttons"),ct=s("#high-score-value"),st=s("#start-btn"),ne=s("#mute-btn"),R=s("#current-score"),K=s("#current-enemies"),lt=s("#current-damage"),dt=s("#back-btn"),p=s("#ninja-avatar"),f=s("#enemy-avatar"),ve=s("#enemy-name"),V=s("#problem-display"),m=s("#answer-input"),k=s("#answer-display"),j=s("#feedback"),v=s("#ninja-message"),mt=s(".numpad"),ft=s("#backspace-btn"),ut=s("#attack-btn"),xe=s("#player-health-fill"),yt=s("#player-health-text"),Ee=s("#enemy-health-fill"),pt=s("#enemy-health-text"),M=s("#battle-effect"),Se=s("#player-damage-popup"),Ce=s("#enemy-damage-popup"),Q=s("#idle-timer-fill"),ht=s("#final-score"),gt=s("#final-correct"),wt=s("#final-enemies"),vt=s("#restart-btn"),xt=s("#menu-btn"),ae=s("#victory-screen"),Et=s("#victory-score"),bt=s("#victory-correct"),kt=s("#victory-enemies"),Tt=s("#victory-restart-btn"),At=s("#victory-menu-btn");function me(e,t){A();const n=document.createElement("div");n.className="story-overlay",n.innerHTML=`
    <div class="story-emoji">${e.emoji}</div>
    <div class="story-text">${e.text}</div>
    <div class="story-skip">Dotknij aby kontynuować...</div>
  `,document.body.appendChild(n);const a=()=>{n.classList.add("fade-out"),setTimeout(()=>{n.remove(),i.isGameActive&&!i.isGameOver&&(i.lastAnswerTime=Date.now(),$e()),t&&t()},500)};n.addEventListener("click",a),n.addEventListener("touchstart",a),setTimeout(()=>{document.body.contains(n)&&a()},5e3)}function Ne(){w.classList.add("screen-shake"),setTimeout(()=>w.classList.remove("screen-shake"),500)}function ie(){const e=document.createElement("div");e.className="lightning-effect",document.body.appendChild(e),setTimeout(()=>e.remove(),150)}let b=[];function ze(e){const t=ge[e]||ge.skeleton;b.forEach(r=>r.remove()),b=[],document.body.style.background=t.gradient,document.body.style.transition="background 1.5s ease-in-out",document.documentElement.style.setProperty("--enemy-ambient-color",t.ambientColor);const n=document.createElement("div");n.className="floating-elements-container";for(let r=0;r<15;r++){const c=document.createElement("div");c.className="floating-element",c.textContent=t.floatingElements[Math.floor(Math.random()*t.floatingElements.length)],c.style.left=`${Math.random()*100}%`,c.style.animationDelay=`${Math.random()*10}s`,c.style.animationDuration=`${15+Math.random()*20}s`,c.style.fontSize=`${1.5+Math.random()*2}rem`,c.style.opacity=`${.15+Math.random()*.25}`,n.appendChild(c)}document.body.appendChild(n),b.push(n);const a=document.createElement("div");a.className="ambient-particles";for(let r=0;r<30;r++){const c=document.createElement("div");c.className="ambient-particle",c.textContent=t.particles,c.style.left=`${Math.random()*100}%`,c.style.top=`${Math.random()*100}%`,c.style.animationDelay=`${Math.random()*5}s`,c.style.animationDuration=`${3+Math.random()*4}s`,a.appendChild(c)}document.body.appendChild(a),b.push(a);let o=document.querySelector(".vignette-overlay");o||(o=document.createElement("div"),o.className="vignette-overlay",document.body.appendChild(o)),o.style.boxShadow=`inset 0 0 150px 50px ${t.ambientColor}40`}function Lt(e,t,n,a=12){const o=document.createElement("div");o.className="particle-container",o.style.left=`${e}px`,o.style.top=`${t}px`;for(let r=0;r<a;r++){const c=document.createElement("div");c.className="particle",c.style.backgroundColor=n;const u=r/a*Math.PI*2,y=50+Math.random()*100,z=Math.cos(u)*y,E=Math.sin(u)*y;c.style.setProperty("--tx",`${z}px`),c.style.setProperty("--ty",`${E}px`),o.appendChild(c)}document.body.appendChild(o),setTimeout(()=>o.remove(),1e3)}function jt(e){if(e<3)return;const t=document.createElement("div");t.className="combo-display",t.textContent=`${e}x COMBO!`,e>=5&&(t.style.color="#ff4444",t.style.textShadow="0 0 30px rgba(255, 68, 68, 0.8), 0 0 60px rgba(255, 0, 0, 0.6)"),document.body.appendChild(t),setTimeout(()=>t.remove(),800)}function Mt(){const e=document.createElement("div");e.className="ultimate-attack",document.body.appendChild(e),setTimeout(()=>e.remove(),800)}function St(e="MISTRZ"){const t=document.createElement("div");t.className="level-up-effect",t.innerHTML=`⚔️ ${e} POKONANY! ⚔️`,document.body.appendChild(t),setTimeout(()=>t.remove(),1500)}function Ct(e){const t=ot[e.id];t?me(t,()=>{ie(),Ne(),f.classList.add("boss-entrance"),setTimeout(()=>{f.classList.remove("boss-entrance")},1500)}):(f.classList.add("enemy-spawn"),setTimeout(()=>f.classList.remove("enemy-spawn"),600))}function Nt(){!i.currentProblem||i.isGameOver||(m.value=String(i.currentProblem.correctAnswer),N(),fe())}function q(e,t=120){return`
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
  `}function S(e,t=120){const n=Math.floor(t*e.scale),a=e.isBoss?"#ff0000":"#ff4444",o=e.isBoss?"0.4":"0.2";let r="";switch(e.id){case"skeleton":case"skeleton-warrior":r=`
        <!-- Ciało szkieleta -->
        <ellipse cx="50" cy="72" rx="22" ry="18" fill="#2d2d2d"/>
        <rect x="38" y="60" width="24" height="3" fill="#d4d4d4" rx="1"/>
        <rect x="40" y="65" width="20" height="3" fill="#d4d4d4" rx="1"/>
        <rect x="42" y="70" width="16" height="3" fill="#d4d4d4" rx="1"/>
        <!-- Czaszka -->
        <circle cx="50" cy="32" r="22" fill="#e8e8e8"/>
        <ellipse cx="40" cy="30" rx="7" ry="8" fill="#1a1a1a"/>
        <ellipse cx="60" cy="30" rx="7" ry="8" fill="#1a1a1a"/>
        <circle cx="40" cy="30" r="3" fill="${a}"/>
        <circle cx="60" cy="30" r="3" fill="${a}"/>
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
        <circle cx="40" cy="30" r="4" fill="${a}"/>
        <circle cx="60" cy="30" r="4" fill="${a}"/>
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
        <circle cx="40" cy="30" r="2" fill="${a}"/>
        <circle cx="60" cy="30" r="2" fill="${a}"/>
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
        <circle cx="40" cy="30" r="3" fill="${a}"/>
        <circle cx="60" cy="30" r="3" fill="${a}"/>
      `}return`
    <svg viewBox="0 0 100 100" width="${n}" height="${n}" class="enemy-svg ${e.isBoss?"boss":""}">
      <!-- Tło z efektem glow dla bossów -->
      <circle cx="50" cy="50" r="48" fill="${e.color}" opacity="${o}"/>
      ${e.isBoss?`<circle cx="50" cy="50" r="48" fill="none" stroke="${e.color}" stroke-width="2" opacity="0.6"/>`:""}
      
      ${r}
      
      <!-- Emoji -->
      <text x="50" y="95" text-anchor="middle" font-size="${e.isBoss?18:14}">${e.emoji}</text>
    </svg>
  `}function De(){je.innerHTML=I.map(e=>`
    <button 
      class="ninja-card ${e.id===i.currentNinja.id?"selected":""}"
      data-ninja-id="${e.id}"
      style="--ninja-color: ${e.color}"
      title="${e.name} - ${e.element}"
    >
      <div class="ninja-card-avatar">
        ${q(e,80)}
      </div>
      <div class="ninja-card-name">${e.name}</div>
      <div class="ninja-card-element">${e.emoji} ${e.element}</div>
    </button>
  `).join("")}function Oe(){Me.innerHTML=P.map(e=>`
    <button 
      class="difficulty-btn ${e.id===i.difficulty.id?"selected":""}"
      data-difficulty-id="${e.id}"
    >
      <span class="difficulty-name">${e.namePolish}</span>
      <span class="difficulty-desc">${e.description}</span>
    </button>
  `).join("")}function zt(){De(),Oe(),ct.textContent=String(i.highScore),document.documentElement.style.setProperty("--current-ninja-color",i.currentNinja.color)}function Dt(){R.textContent=String(i.score),K.textContent=String(i.enemiesDefeated),Y(),p.innerHTML=q(i.currentNinja,120);const e=h(i.enemyLevel);f.innerHTML=S(e,120),C(e),ze(e.id),i.currentProblem&&(V.textContent=G(i.currentProblem)),g(),j.textContent="",j.className="feedback",v.textContent="",Se.textContent="",Ce.textContent="",M.className="battle-effect",m.value="",m.focus(),$e()}function g(){const e=i.playerHealth/i.maxPlayerHealth*100,t=i.enemyHealth/i.maxEnemyHealth*100;xe.style.width=`${e}%`,Ee.style.width=`${t}%`,yt.textContent=`${i.playerHealth}/${i.maxPlayerHealth}`,pt.textContent=`${i.enemyHealth}/${i.maxEnemyHealth}`,xe.classList.toggle("low-health",e<=30),Ee.classList.toggle("low-health",t<=30)}function Ot(){const e=Math.min(i.streak,5);return d.PLAYER_ATTACK_DAMAGE+e*d.STREAK_BONUS_DAMAGE}function Y(){lt.textContent=String(Ot())}function C(e){ve.textContent=`${e.emoji} ${e.name}`,ve.classList.toggle("boss-name",e.id==="boss")}function $(e,t,n=!1){const a=e==="player"?Se:Ce;a.textContent=n?`+${t}`:`-${t}`,a.className=`damage-popup ${n?"heal":"damage"} show`,setTimeout(()=>{a.classList.remove("show")},1e3)}function re(e){M.className=`battle-effect ${e}-attack`,e==="player"?(p.classList.add("attacking"),f.classList.add("hit")):(f.classList.add("attacking"),p.classList.add("hit")),setTimeout(()=>{M.className="battle-effect",p.classList.remove("attacking","hit"),f.classList.remove("attacking","hit")},500)}function Ht(e,t,n){j.textContent=e?"✓ Dobrze!":`✗ Źle! Poprawna odpowiedź: ${n}`,j.className=`feedback ${e?"correct":"incorrect"}`,v.textContent=t,v.className=`ninja-message ${e?"encouragement":"comfort"}`}function He(){A(),ht.textContent=String(i.score),gt.textContent=String(i.correctAnswers),wt.textContent=String(i.enemiesDefeated),w.classList.add("hidden"),te.classList.remove("hidden")}function $t(){A(),i.isGameOver=!0,Et.textContent=String(i.score),bt.textContent=String(i.correctAnswers),kt.textContent=String(i.enemiesDefeated),w.classList.add("hidden"),ae.classList.remove("hidden")}function $e(){A(),O=window.setInterval(()=>{Ue(i)&&Pt()},100),H=window.setInterval(()=>{It()},50)}function A(){O&&(clearInterval(O),O=null),H&&(clearInterval(H),H=null)}function It(){if(!i.isGameActive||i.isGameOver){Q.style.width="100%";return}const e=Date.now()-i.lastAnswerTime,t=Le(i.enemyLevel),n=Math.max(0,100-e/t*100);Q.style.width=`${n}%`,Q.classList.toggle("danger",n<=30)}function Pt(){const e=Ye(i);i=e.state,e.attacked&&(l("hit"),re("enemy"),$("player",e.damage),g(),v.textContent="Zbyt wolno! Wróg atakuje!",v.className="ninja-message comfort",e.playerDefeated&&(l("gameOver"),He()))}function Bt(){b.forEach(t=>t.remove()),b=[],document.body.style.background="linear-gradient(135deg, var(--bg-dark) 0%, var(--bg-medium) 50%, var(--bg-light) 100%)";const e=document.querySelector(".vignette-overlay");e&&e.remove()}function x(e){e==="start"?(A(),Bt(),we.classList.remove("hidden"),w.classList.add("hidden"),te.classList.add("hidden"),ae.classList.add("hidden"),zt()):(we.classList.add("hidden"),te.classList.add("hidden"),ae.classList.add("hidden"),w.classList.remove("hidden"),Dt())}je.addEventListener("click",e=>{const n=e.target.closest(".ninja-card");if(!n)return;const a=n.dataset.ninjaId;a&&(i=le(i,a),De(),document.documentElement.style.setProperty("--current-ninja-color",i.currentNinja.color))});Me.addEventListener("click",e=>{const n=e.target.closest(".difficulty-btn");if(!n)return;const a=n.dataset.difficultyId;a&&(i=de(i,a),Oe())});st.addEventListener("click",()=>{l("start"),i=se(i),x("game"),setTimeout(()=>{me(rt)},500)});dt.addEventListener("click",()=>{l("click"),A(),i.isGameActive=!1,x("start")});function fe(){if(i.isGameOver)return;const e=parseInt(m.value,10);if(isNaN(e)){k.classList.add("shake"),setTimeout(()=>k.classList.remove("shake"),500);return}const t=i.currentProblem?.correctAnswer,n=qe(i,e);if(i=n.state,n.playerAttacked){l("correct"),l("attack"),re("player"),$("enemy",n.damageDealt),p.classList.add("power-up"),setTimeout(()=>p.classList.remove("power-up"),500),i.streak>=3&&jt(i.streak),i.streak===5&&(Mt(),ie()),n.isCorrect&&setTimeout(()=>$("player",5,!0),300);const a=f.getBoundingClientRect();Lt(a.left+a.width/2,a.top+a.height/2,i.currentNinja.color,8)}else n.enemyAttacked&&(l("wrong"),l("hit"),re("enemy"),$("player",n.damageTaken),Ne(),i.playerHealth<=30&&(p.classList.add("critical-hit"),setTimeout(()=>p.classList.remove("critical-hit"),300)));if(g(),Ht(n.isCorrect,n.message,t),R.textContent=String(i.score),K.textContent=String(i.enemiesDefeated),Y(),n.enemyDefeated&&(l("victory"),M.classList.add("enemy-defeated"),f.classList.add("enemy-death"),setTimeout(()=>{M.classList.remove("enemy-defeated"),f.classList.remove("enemy-death")},1e3),n.newEnemyType?setTimeout(()=>{const a=h(i.enemyLevel);ze(a.id),a.isBoss?(Ct(a),f.innerHTML=S(a,120),C(a),g()):(f.classList.add("enemy-spawn"),f.innerHTML=S(a,120),C(a),g(),v.textContent=`Nowy przeciwnik: ${a.emoji} ${a.name}!`,setTimeout(()=>{f.classList.remove("enemy-spawn")},600))},800):(St("OVERLORD"),ie(),setTimeout(()=>{me({emoji:"🏆",text:`ZWYCIĘSTWO!

Pokonałeś Overlorda i uratowałeś Ninjago!

Jesteś prawdziwym MISTRZEM SPINJITZU!

⚡ Twoja mądrość matematyczna ocaliła krainę! ⚡`},()=>{$t()})},500))),n.playerDefeated){l("gameOver"),He();return}i.currentProblem&&!i.isGameOver&&(V.textContent=G(i.currentProblem)),m.value="",k.textContent="?",setTimeout(()=>{j.textContent="",v.textContent=""},1e3)}function N(){k.textContent=m.value||"?"}mt.addEventListener("click",e=>{const n=e.target.dataset.num;n!==void 0&&!i.isGameOver&&(l("click"),m.value.length<4&&(m.value+=n,N()))});ft.addEventListener("click",()=>{!i.isGameOver&&m.value.length>0&&(l("click"),m.value=m.value.slice(0,-1),N())});ut.addEventListener("click",()=>{i.isGameOver||fe()});document.addEventListener("keydown",e=>{if(e.key==="`"||e.key==="~"){i.isGameActive&&!i.isGameOver&&(e.preventDefault(),Nt());return}!i.isGameActive||i.isGameOver||w.classList.contains("hidden")||(e.key>="0"&&e.key<="9"?m.value.length<4&&(m.value+=e.key,N(),l("click")):e.key==="Backspace"?m.value.length>0&&(m.value=m.value.slice(0,-1),N(),l("click")):e.key==="Enter"&&fe())});vt.addEventListener("click",()=>{l("start");const e=i.currentNinja,t=i.difficulty;i=ce(),i=le(i,e.id),i=de(i,t.id),i=se(i),V.textContent=G(i.currentProblem),R.textContent="0",K.textContent="0",Y(),p.innerHTML=q(i.currentNinja,120),document.documentElement.style.setProperty("--current-ninja-color",i.currentNinja.color),g();const n=h(i.enemyLevel);f.innerHTML=S(n,120),C(n),x("game"),m.value="",k.textContent="?"});xt.addEventListener("click",()=>{l("click"),x("start")});Tt.addEventListener("click",()=>{l("start");const e=i.currentNinja,t=i.difficulty;i=ce(),i=le(i,e.id),i=de(i,t.id),i=se(i),V.textContent=G(i.currentProblem),R.textContent="0",K.textContent="0",Y(),p.innerHTML=q(i.currentNinja,120),document.documentElement.style.setProperty("--current-ninja-color",i.currentNinja.color),g();const n=h(i.enemyLevel);f.innerHTML=S(n,120),C(n),x("game"),m.value="",k.textContent="?"});At.addEventListener("click",()=>{l("click"),x("start")});function Ie(){ne.textContent=ee()?"🔇":"🔊",ne.setAttribute("aria-label",ee()?"Włącz dźwięki":"Wycisz dźwięki")}ne.addEventListener("click",()=>{it(),Ie(),ee()||l("click")});function _t(){Ie(),x("start")}_t();
