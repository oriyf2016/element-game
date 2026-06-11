/* =========================
   Element Game
   חלק 1 - משתנים ונתונים
========================= */

const gameArea = document.getElementById("game-area");
const elementsList = document.getElementById("elements-list");
const discoveriesContainer = document.getElementById("discoveries");

const chatMessages = document.getElementById("chatMessages");
const systemMessages = document.getElementById("systemMessages");
const usersList = document.getElementById("usersList");

const mergeSound = document.getElementById("mergeSound");
const discoverSound = document.getElementById("discoverSound");

/* =========================
   משתמש מנהל מובנה
========================= */

const DEFAULT_ADMIN = {
    username: "oriyf2016",
    password: "oriroee1105",
    admin: true
};

/* =========================
   אימוג'ים
========================= */

const EMOJIS = {

    "אדמה":"🌍",
    "חול":"🏖️",
    "אש":"🔥",
    "מים":"💧",
    "עץ":"🌳",

    "בוץ":"🟫",
    "זכוכית":"🪟",
    "פחם":"⚫",
    "עץ גדול":"🌲",
    "שריפה":"🔥",

    "אקווריום":"🐠",
    "עציץ צומח":"🪴",
    "מדורה":"🔥",
    "אקווריום שמח":"🐟"

    "ברזל":"⛓️",
    "לבה":"🌋",
    "אובסידיאן":"⬛",
    "מכוש ברזל":"⛏️",
    "אבן":"🪨",
};

/* =========================
   יסודות התחלתיים
========================= */

const STARTER_ELEMENTS = [
    "אדמה",
    "חול",
    "אש",
    "מים",
    "עץ",
    "ברזל",
];

/* =========================
   מתכונים
========================= */

const RECIPES = {

    "אדמה|מים":"בוץ",
    "מים|אדמה":"בוץ",

    "חול|אש":"זכוכית",
    "אש|חול":"זכוכית",

    "אש|אדמה":"פחם",
    "אדמה|אש":"פחם",

    "עץ|מים":"עץ גדול",
    "מים|עץ":"עץ גדול",

    "אש|עץ":"שריפה",
    "עץ|אש":"שריפה",

    "זכוכית|מים":"אקווריום",
    "מים|זכוכית":"אקווריום",

    "עץ גדול|זכוכית":"עציץ צומח",
    "זכוכית|עץ גדול":"עציץ צומח",

    "עץ|שריפה":"מדורה",
    "שריפה|עץ":"מדורה",

    "אקווריום|חול":"אקווריום שמח",
    "חול|אקווריום":"אקווריום שמח",
    "אש|אש":"לבה",

    "לבה|מים":"אובסידיאן",
    "מים|לבה":"אובסידיאן",

    "ברזל|עץ":"מכוש ברזל",
    "עץ|ברזל":"מכוש ברזל",

    "מכוש ברזל|אדמה":"אבן",
    "אדמה|מכוש ברזל":"אבן",
};

/* =========================
   משתני משחק
========================= */

let currentUser = null;

let activeElements = [];

let discoveredElements = [];

let users = [];

let chat = [];

let messages = [];

/* =========================
   טעינת נתונים
========================= */

function loadData() {

    users =
        JSON.parse(
            localStorage.getItem("users")
        ) || [];

    if(users.length === 0){

        users.push(DEFAULT_ADMIN);

        saveUsers();
    }

    discoveredElements =
        JSON.parse(
            localStorage.getItem("discoveredElements")
        ) || [...STARTER_ELEMENTS];

    chat =
        JSON.parse(
            localStorage.getItem("chat")
        ) || [];

    messages =
        JSON.parse(
            localStorage.getItem("messages")
        ) || [];
}

/* =========================
   שמירה
========================= */

function saveUsers(){

    localStorage.setItem(
        "users",
        JSON.stringify(users)
    );
}

function saveDiscoveries(){

    localStorage.setItem(
        "discoveredElements",
        JSON.stringify(discoveredElements)
    );
}

function saveChat(){

    localStorage.setItem(
        "chat",
        JSON.stringify(chat)
    );
}

function saveMessages(){

    localStorage.setItem(
        "messages",
        JSON.stringify(messages)
    );
}

/* =========================
   פונקציות עזר
========================= */

function getEmoji(name){

    return EMOJIS[name] || "✨";
}

function elementText(name){

    return `${getEmoji(name)} ${name}`;
}

function playMergeSound(){

    if(!mergeSound) return;

    mergeSound.currentTime = 0;
    mergeSound.play();
}

function playDiscoverSound(){

    if(!discoverSound) return;

    discoverSound.currentTime = 0;
    discoverSound.play();
}

/* =========================
   יצירת יסוד במאגר
========================= */

function createSidebarElement(name){

    const div = document.createElement("div");

    div.className = "element";

    div.innerText = elementText(name);

    div.onclick = () => {

        createGameElement(
            name,
            100,
            100
        );
    };

    elementsList.appendChild(div);
}

/* =========================
   רענון מאגר
========================= */

function refreshElements(){

    elementsList.innerHTML = "";

    discoveredElements.forEach(element => {

        createSidebarElement(element);

    });
}

/* =========================
   רענון תגליות
========================= */

function refreshDiscoveries(){

    discoveriesContainer.innerHTML = "";

    discoveredElements.forEach(element => {

        const div =
            document.createElement("div");

        div.className =
            "discovery";

        div.innerText =
            elementText(element);

        discoveriesContainer.appendChild(div);
    });
}

/* =========================
   התחלה
========================= */

loadData();

refreshElements();

refreshDiscoveries();
/* =========================
   חלק 2 - אזור המשחק
========================= */

function createGameElement(
    name,
    x = 100,
    y = 100
){

    const div =
        document.createElement("div");

    div.className =
        "spawned-element";

    div.dataset.element =
        name;

    div.innerText =
        elementText(name);

    div.style.left =
        x + "px";

    div.style.top =
        y + "px";

    gameArea.appendChild(div);

    makeDraggable(div);

    activeElements.push({
        name:name,
        element:div
    });

    return div;
}

/* =========================
   גרירה
========================= */

function makeDraggable(el){

    let dragging = false;

    let offsetX = 0;
    let offsetY = 0;

    el.addEventListener(
        "mousedown",
        e => {

            dragging = true;

            const rect =
                el.getBoundingClientRect();

            offsetX =
                e.clientX - rect.left;

            offsetY =
                e.clientY - rect.top;
        }
    );

    document.addEventListener(
        "mouseup",
        () => {

            dragging = false;

            checkAllCollisions();
        }
    );

    document.addEventListener(
        "mousemove",
        e => {

            if(!dragging)
                return;

            const areaRect =
                gameArea.getBoundingClientRect();

            let x =
                e.clientX -
                areaRect.left -
                offsetX;

            let y =
                e.clientY -
                areaRect.top -
                offsetY;

            if(x < 0) x = 0;
            if(y < 0) y = 0;

            if(x > areaRect.width - 80)
                x = areaRect.width - 80;

            if(y > areaRect.height - 40)
                y = areaRect.height - 40;

            el.style.left =
                x + "px";

            el.style.top =
                y + "px";
        }
    );
}

/* =========================
   בדיקת התנגשות
========================= */

function isColliding(a,b){

    const r1 =
        a.getBoundingClientRect();

    const r2 =
        b.getBoundingClientRect();

    return !(
        r1.right < r2.left ||
        r1.left > r2.right ||
        r1.bottom < r2.top ||
        r1.top > r2.bottom
    );
}

/* =========================
   חיפוש מתכון
========================= */

function getRecipeResult(
    first,
    second
){

    const key =
        `${first}|${second}`;

    return RECIPES[key];
}

/* =========================
   חיבור יסודות
========================= */

function mergeElements(
    firstElement,
    secondElement
){

    const firstName =
        firstElement.dataset.element;

    const secondName =
        secondElement.dataset.element;

    const result =
        getRecipeResult(
            firstName,
            secondName
        );

    if(!result)
        return;

    const x =
        (
            parseInt(firstElement.style.left)
            +
            parseInt(secondElement.style.left)
        ) / 2;

    const y =
        (
            parseInt(firstElement.style.top)
            +
            parseInt(secondElement.style.top)
        ) / 2;

    firstElement.remove();
    secondElement.remove();

    activeElements =
        activeElements.filter(
            obj =>
            obj.element !== firstElement &&
            obj.element !== secondElement
        );

    createGameElement(
        result,
        x,
        y
    );

    playMergeSound();

    discoverElement(result);
}

/* =========================
   פתיחת יסוד חדש
========================= */

function discoverElement(name){

    if(
        discoveredElements.includes(name)
    ){
        return;
    }

    discoveredElements.push(name);

    saveDiscoveries();

    refreshElements();

    refreshDiscoveries();

    playDiscoverSound();

    showDiscoveryEffect(name);
}

/* =========================
   אפקט גילוי
========================= */

function showDiscoveryEffect(name){

    const div =
        document.createElement("div");

    div.className =
        "system-message new-discovery";

    div.innerText =
        "🎉 גילית יסוד חדש: "
        + elementText(name);

    discoveriesContainer.prepend(div);

    setTimeout(() => {

        div.remove();

    },5000);
}

/* =========================
   בדיקת כל ההתנגשויות
========================= */

function checkAllCollisions(){

    const elements =
        document.querySelectorAll(
            ".spawned-element"
        );

    for(
        let i = 0;
        i < elements.length;
        i++
    ){

        for(
            let j = i + 1;
            j < elements.length;
            j++
        ){

            const first =
                elements[i];

            const second =
                elements[j];

            if(
                isColliding(
                    first,
                    second
                )
            ){

                mergeElements(
                    first,
                    second
                );

                return;
            }
        }
    }
}

/* =========================
   טעינת יסודות התחלתיים
========================= */

function spawnStarterElements(){

    STARTER_ELEMENTS.forEach(
        element => {

            if(
                !discoveredElements.includes(
                    element
                )
            ){

                discoveredElements.push(
                    element
                );
            }
        }
    );

    saveDiscoveries();

    refreshElements();

    refreshDiscoveries();
}

spawnStarterElements();
/* =========================
   חלק 3 - משתמשים וצ'אט
========================= */

/* =========================
   פתיחת חלונות
========================= */

function openAuth(){
    document
        .getElementById("authModal")
        .classList
        .remove("hidden");
}

function closeAuth(){
    document
        .getElementById("authModal")
        .classList
        .add("hidden");
}

function openChat(){

    renderChat();

    document
        .getElementById("chatModal")
        .classList
        .remove("hidden");
}

function closeChat(){

    document
        .getElementById("chatModal")
        .classList
        .add("hidden");
}

function openMessages(){

    renderMessages();

    document
        .getElementById("messagesModal")
        .classList
        .remove("hidden");
}

function closeMessages(){

    document
        .getElementById("messagesModal")
        .classList
        .add("hidden");
}

function openAdmin(){

    renderUsers();

    document
        .getElementById("adminModal")
        .classList
        .remove("hidden");
}

function closeAdmin(){

    document
        .getElementById("adminModal")
        .classList
        .add("hidden");
}

/* =========================
   הרשמה
========================= */

function registerUser(){

    const username =
        document
        .getElementById("username")
        .value
        .trim();

    const password =
        document
        .getElementById("password")
        .value
        .trim();

    if(
        username.length < 3
    ){
        alert("שם משתמש קצר מדי");
        return;
    }

    if(
        password.length < 3
    ){
        alert("סיסמה קצרה מדי");
        return;
    }

    const exists =
        users.find(
            user =>
            user.username === username
        );

    if(exists){

        alert("שם המשתמש קיים");

        return;
    }

    users.push({

        username:username,

        password:password,

        admin:false
    });

    saveUsers();

    alert("נרשמת בהצלחה");
}

/* =========================
   התחברות
========================= */

function login(){

    const username =
        document
        .getElementById("username")
        .value
        .trim();

    const password =
        document
        .getElementById("password")
        .value
        .trim();

    const user =
        users.find(
            account =>
            account.username === username
            &&
            account.password === password
        );

    if(!user){

        alert("פרטי התחברות שגויים");

        return;
    }

    currentUser = user;

    alert(
        "ברוך הבא "
        + currentUser.username
    );

    closeAuth();

    updateAdminPanelButton();
}

/* =========================
   כפתור מנהל
========================= */

function updateAdminPanelButton(){

    const btn =
        document
        .getElementById("adminButton");

    if(
        currentUser &&
        currentUser.admin
    ){
        btn.style.display =
            "inline-block";

        document
        .getElementById(
            "adminMessageControls"
        )
        .style.display =
            "block";
    }
    else{

        btn.style.display =
            "none";

        document
        .getElementById(
            "adminMessageControls"
        )
        .style.display =
            "none";
    }
}

/* =========================
   סינון צ'אט
========================= */

const BLOCKED_WORDS = [

    "http",
    "https",
    "www",

    ".com",
    ".net",
    ".org"
];

function containsBlockedText(text){

    const lower =
        text.toLowerCase();

    return BLOCKED_WORDS.some(
        word =>
        lower.includes(word)
    );
}

/* =========================
   שליחת הודעה
========================= */

function sendChatMessage(){

    if(!currentUser){

        alert(
            "צריך להתחבר"
        );

        return;
    }

    const input =
        document
        .getElementById(
            "chatInput"
        );

    const text =
        input.value.trim();

    if(text === "")
        return;

    if(
        containsBlockedText(
            text
        )
    ){

        alert(
            "קישורים אינם מותרים"
        );

        return;
    }

    chat.push({

        username:
            currentUser.username,

        message:text,

        date:
            Date.now()
    });

    saveChat();

    input.value = "";

    renderChat();
}

/* =========================
   הצגת צ'אט
========================= */

function renderChat(){

    chatMessages.innerHTML = "";

    chat.forEach(msg => {

        const div =
            document.createElement(
                "div"
            );

        div.className =
            "chat-message";

        div.innerHTML =
            "<b>"
            +
            msg.username
            +
            ":</b> "
            +
            msg.message;

        chatMessages.appendChild(
            div
        );
    });

    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}

/* =========================
   הודעות מערכת
========================= */

function sendAdminMessage(){

    if(
        !currentUser ||
        !currentUser.admin
    ){
        return;
    }

    const input =
        document
        .getElementById(
            "adminMessageInput"
        );

    const text =
        input.value.trim();

    if(text === "")
        return;

    messages.unshift({

        sender:
            currentUser.username,

        message:text,

        date:
            Date.now()
    });

    saveMessages();

    input.value = "";

    renderMessages();
}

function renderMessages(){

    systemMessages.innerHTML = "";

    messages.forEach(msg => {

        const div =
            document.createElement(
                "div"
            );

        div.className =
            "system-message";

        div.innerHTML =
            "<b>📢 "
            +
            msg.sender
            +
            "</b><br>"
            +
            msg.message;

        systemMessages.appendChild(
            div
        );
    });
}

/* =========================
   פאנל מנהל
========================= */

function renderUsers(){

    usersList.innerHTML = "";

    users.forEach(user => {

        const div =
            document.createElement(
                "div"
            );

        div.className =
            "user-card";

        div.innerHTML =

            "<b>"
            +
            user.username
            +
            "</b>"
            +
            (
                user.admin
                ?
                " 👑 מנהל"
                :
                ""
            );

        usersList.appendChild(
            div
        );
    });
}

/* =========================
   טעינה ראשונית
========================= */

renderChat();

renderMessages();

updateAdminPanelButton();

console.log(
    "Element Game Loaded"
);
