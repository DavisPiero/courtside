"use strict";
// Accounts (Supabase): email + username + password. The game still saves to this device first (js/save.js), so it
// plays offline and from a double-clicked index.html; when you're signed in, every save is also sent to your account
// a few seconds later. The tables, and the rules that let a player touch only their own rows, are in supabase/setup.sql.
// The URL and the publishable key below are public by design; the secret key must never appear in the game.
const SB_URL = "https://qbmxlihuqjehemhgioah.supabase.co",
  SB_KEY = "sb_publishable_civLflYmW5o41dFTHlLvwg_MqFqLYBA",
  // Supabase's browser library, pinned to one version; the integrity hash stops a changed copy from running.
  SB_LIB = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/dist/umd/supabase.js",
  SB_SRI = "sha384-Rj26LVGvoeRVR6+mwQmFfcR3QOBEwT+ZmuCWpuiqeTzJpCs0ER4ITAWGb4Hiy3Ok",
  ACC_KEY = "courtside.acct", // which account this device's save belongs to: { id, rev, dirty }
  SYNC_WAIT = 4000; // send the save at most this often (ms)
// state: "load" (library not ready), "off" (no connection), "out" (signed out), "in", "reset" (choosing a new password)
// attached: the account whose save is loaded; recover: arrived from a "choose a new password" email link.
const ACC = { sb: null, state: "load", user: null, name: "", attached: "", recover: 0, rev: 0, timer: 0, busy: 0, form: 0, last: 0, view: "in", delT: 0 };

// ---------- which account owns this device's save
function accOwner() {
  try {
    return JSON.parse(localStorage.getItem(ACC_KEY) || "null");
  } catch (e) {
    return null;
  }
}
function accSetOwner(o) {
  try {
    o ? localStorage.setItem(ACC_KEY, JSON.stringify(o)) : localStorage.removeItem(ACC_KEY);
  } catch (e) {}
}

// ---------- start-up: load the library in the background (never holds up the game)
function accInit() {
  if (/[?&](smoke|fitcheck|bench)\b/.test(location.search)) return accSet("off"); // tests stay offline
  const s = document.createElement("script");
  s.src = SB_LIB;
  s.integrity = SB_SRI;
  s.crossOrigin = "anonymous";
  s.onload = () => {
    try {
      ACC.sb = window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    } catch (e) {
      return accSet("off");
    }
    // Fires once at start (INITIAL_SESSION), then on every sign in or out. Work happens outside the callback (Supabase advice).
    ACC.sb.auth.onAuthStateChange((ev, session) => setTimeout(() => accAuth(ev, session), 0));
  };
  s.onerror = () => accSet("off");
  document.head.appendChild(s);
  // Try to send unsent progress when the game is closed or put in the background.
  addEventListener("visibilitychange", () => document.visibilityState === "hidden" && accPush());
}
function accSet(st) {
  ACC.state = st;
  accButton();
  if ($("acct").classList.contains("on")) drawAcct();
  if ($("prof").classList.contains("on")) drawProf();
}
async function accAuth(ev, session) {
  const u = session && session.user;
  if (ev === "PASSWORD_RECOVERY") ACC.recover = 1;
  if (!u) {
    ACC.user = null;
    ACC.name = "";
    ACC.attached = "";
    return accSet("out");
  }
  ACC.user = u;
  if (ACC.attached !== u.id) {
    ACC.attached = u.id; // token refreshes and repeat events don't load the save again
    try {
      await accAttach(u);
    } catch (e) {
      ACC.attached = ""; // try again next time the pop-up opens
      accMsg("Couldn't load your account. Check your internet and try again.", "bad");
    }
  }
  accSet(ACC.recover ? "reset" : "in");
  if (ACC.recover) openAcct();
}

// ---------- signing in: bring the device save and the account save together
async function accAttach(u) {
  const sb = ACC.sb,
    own = accOwner();
  const { data: prof } = await sb.from("profiles").select("username").eq("id", u.id).maybeSingle();
  ACC.name = (prof && prof.username) || (u.user_metadata && u.user_metadata.username) || "";
  const { data: row, error } = await sb.from("saves").select("data,rev").eq("user_id", u.id).maybeSingle();
  if (error) throw error;
  let note = "";
  if (!row) {
    // A brand-new account: this device's progress becomes the account's (unless it belongs to another account).
    if (own && own.id !== u.id) accApply(saveFresh());
    else if (saveHasProgress(SAVE)) note = "Your progress on this device is now saved to your account!";
    const ins = await sb.from("saves").insert({ user_id: u.id, data: SAVE, rev: 1 });
    if (ins.error) throw ins.error;
    ACC.rev = 1;
  } else if (own && own.id === u.id) {
    // This device already belongs to this account: take the cloud save if another device saved since.
    ACC.rev = own.rev || 0;
    if (row.rev > ACC.rev) {
      accApply(row.data);
      ACC.rev = row.rev;
      if (own.dirty) note = "Loaded the newer save from your other device.";
    } else if (own.dirty) setTimeout(accPush, 0);
  } else if (own && own.id !== u.id) {
    // Another account's save is on this device: don't mix the two.
    accApply(row.data);
    ACC.rev = row.rev;
  } else {
    // Playing as a guest, then signing in: add this device's progress to the account (David: "just carry it over").
    if (saveHasProgress(SAVE)) {
      accApply(saveMerge(row.data, SAVE));
      note = "Your progress on this device was added to your account!";
      ACC.rev = row.rev;
      accSetOwner({ id: u.id, rev: ACC.rev, dirty: 1 });
      setTimeout(accPush, 0);
    } else {
      accApply(row.data);
      ACC.rev = row.rev;
    }
  }
  const o = accOwner();
  if (!o || o.id !== u.id) accSetOwner({ id: u.id, rev: ACC.rev, dirty: 0 });
  ACC.last = Date.now();
  if (note) accMsg(note, "ok");
}
// Put a save into SAVE and onto the device.
function accApply(data) {
  saveLoadFrom(data);
  writeSave(1);
  if (typeof dailyBadge === "function") dailyBadge();
}

// ---------- sending the save (called from writeSave)
function accDirty() {
  const o = accOwner();
  if (!ACC.user || !o || o.id !== ACC.user.id) return;
  if (!o.dirty) accSetOwner({ ...o, dirty: 1 });
  clearTimeout(ACC.timer);
  ACC.timer = setTimeout(accPush, SYNC_WAIT);
}
async function accPush() {
  const o = accOwner();
  if (!ACC.sb || !ACC.user || !o || o.id !== ACC.user.id || !o.dirty || ACC.busy) return;
  ACC.busy = 1;
  clearTimeout(ACC.timer);
  try {
    // Only overwrite the save we last saw: if another device saved in between, take theirs instead.
    const { data, error } = await ACC.sb.from("saves").update({ data: SAVE, rev: ACC.rev + 1 }).eq("user_id", ACC.user.id).eq("rev", ACC.rev).select("rev");
    if (error) throw error;
    if (data && data.length) {
      ACC.rev++;
      accSetOwner({ id: ACC.user.id, rev: ACC.rev, dirty: 0 });
      ACC.last = Date.now();
    } else {
      const { data: row } = await ACC.sb.from("saves").select("data,rev").eq("user_id", ACC.user.id).maybeSingle();
      if (row) {
        accApply(row.data);
        ACC.rev = row.rev;
        accSetOwner({ id: ACC.user.id, rev: ACC.rev, dirty: 0 });
        ACC.last = Date.now();
      }
    }
  } catch (e) {
    /* offline: it stays marked unsent and goes next time */
  }
  ACC.busy = 0;
  if ($("acct").classList.contains("on") && ACC.view === "in") drawAcct();
  if ($("prof").classList.contains("on")) drawProf();
}

// ---------- the ACCOUNT button on the main menu (your picture and name) opens the account page (js/profile.js);
// the gear there opens this pop-up: sign in or create an account, or change password, sign out, delete.
function accButton() {
  const b = $("bAcc");
  $("accTxt").textContent = ACC.state === "in" && ACC.name ? ACC.name.toUpperCase() : "ACCOUNT";
  b.classList.toggle("in", ACC.state === "in");
  drawPic($("accPic"), SAVE.prof.pic);
}
function openAcct() {
  if (ACC.sb && ACC.user && !ACC.attached && ACC.state === "in") accAuth("RETRY", { user: ACC.user });
  if (ACC.state === "in" || ACC.state === "reset") ACC.view = ACC.state;
  else if (ACC.view !== "up" && ACC.view !== "forgot") ACC.view = "signin";
  accMsg("");
  $("acct").classList.add("on");
  drawAcct();
}
function closeAcct() {
  $("acct").classList.remove("on");
  $("accDel").classList.remove("on");
  if (typeof closePP === "function") closePP();
}
function accMsg(t, kind) {
  const m = $("accMsg");
  m.textContent = t;
  m.className = "accmsg " + (kind || "");
}
const accEsc = (s) => String(s).replace(/[&<>"']/g, (c) => "&#" + c.charCodeAt(0) + ";");
const agoText = (ms) => {
  const s = Math.round((Date.now() - ms) / 1000);
  return s < 10 ? "just now" : s < 60 ? s + " seconds ago" : s < 3600 ? Math.round(s / 60) + " min ago" : Math.round(s / 3600) + " h ago";
};
function drawAcct() {
  drawAcctBody();
  fitPanel($("acct").firstElementChild); // too tall for the screen: the form scrolls, CLOSE stays pinned
}
function drawAcctBody() {
  const B = $("accBody"),
    v = ACC.state === "in" ? "in" : ACC.state === "reset" ? "reset" : ACC.view;
  ACC.view = v;
  const field = (id, label, type, auto, extra = "") =>
    `<label>${label}<input id="${id}" type="${type}" autocomplete="${auto}" autocapitalize="none" autocorrect="off" spellcheck="false" ${extra}></label>`;
  $("accHead").textContent = v === "in" ? "ACCOUNT SETTINGS" : "ACCOUNT";
  if (ACC.state === "load" || ACC.state === "off") {
    B.innerHTML = `<p class="accnote">${ACC.state === "load" ? "Connecting..." : "Accounts need the internet. You can keep playing; your progress is saved on this device."}</p>`;
  } else if (v === "in") {
    const o = accOwner();
    B.innerHTML = `<div class="accme"><b id="accName"></b><span id="accMail"></span></div>
      <p class="accnote">${o && o.dirty ? "Saving to your account..." : "Progress saved to your account " + agoText(ACC.last) + "."} It's also kept on this device, so you can play offline.</p>
      <div class="accbtns"><button class="btn" id="bAccPw">CHANGE PASSWORD</button><button class="btn" id="bAccOut">SIGN OUT</button>
      <button class="btn bad" id="bAccDel">DELETE ACCOUNT</button></div>`;
    $("accName").textContent = ACC.name.toUpperCase();
    $("accMail").textContent = ACC.user.email || "";
    $("bAccOut").onclick = accSignOut;
    $("bAccPw").onclick = () => accForgot(ACC.user.email);
    $("bAccDel").onclick = accDelete;
  } else if (v === "reset") {
    B.innerHTML = `<form id="accForm" class="accform"><p class="accnote">Choose a new password.</p>
      ${field("accPw", "NEW PASSWORD", "password", "new-password", 'minlength="8" maxlength="72"')}
      <button class="btn pri" type="submit">SAVE PASSWORD</button></form>`;
    $("accForm").onsubmit = accNewPassword;
  } else {
    const up = v === "up",
      forgot = v === "forgot";
    B.innerHTML = `<div class="tabs acctabs"><button data-v="signin" class="${!up && !forgot ? "on" : ""}">SIGN IN</button><button data-v="up" class="${up ? "on" : ""}">CREATE ACCOUNT</button></div>
      <form id="accForm" class="accform">
      ${!forgot && saveHasProgress(SAVE) ? `<p class="accnote">Your progress on this device will be added to your account.</p>` : ""}
      ${forgot ? `<p class="accnote">Type your email and we'll send you a link to choose a new password.</p>` : ""}
      ${field("accMail", "EMAIL", "email", "email", 'inputmode="email" maxlength="254"')}
      ${up ? field("accUser", "USERNAME", "text", "username", 'maxlength="16"') + `<i class="hint">3 to 16 letters, numbers or _. Other players will see it. Don't use your real name.</i>` : ""}
      ${forgot ? "" : field("accPw", "PASSWORD", "password", up ? "new-password" : "current-password", 'maxlength="72"')}
      ${up ? `<i class="hint">At least 8 characters, with a letter and a number.</i>` : ""}
      <button class="btn pri" type="submit">${up ? "CREATE ACCOUNT" : forgot ? "SEND LINK" : "SIGN IN"}</button>
      ${up ? "" : `<button class="btn lnk" type="button" id="bAccForgot">${forgot ? "BACK TO SIGN IN" : "FORGOT PASSWORD?"}</button>`}
      </form>`;
    B.querySelectorAll("[data-v]").forEach((b) => (b.onclick = () => ((ACC.view = b.dataset.v), accMsg(""), drawAcct())));
    if ($("bAccForgot")) $("bAccForgot").onclick = () => ((ACC.view = forgot ? "signin" : "forgot"), accMsg(""), drawAcct());
    $("accForm").onsubmit = (e) => (e.preventDefault(), up ? accSignUp() : forgot ? accForgot($("accMail").value) : accSignIn());
  }
}

// ---------- actions
const MAIL_OK = (m) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m),
  USER_OK = (u) => /^[A-Za-z0-9_]{3,16}$/.test(u),
  PW_OK = (p) => p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);
// Supabase's messages, in the game's words.
function accErr(e) {
  const m = ((e && e.message) || "").toLowerCase();
  if (m.includes("invalid login")) return "Wrong email or password.";
  if (m.includes("not confirmed")) return "Confirm your email first: tap the link we sent you.";
  if (m.includes("already registered")) return "That email already has an account. Sign in instead.";
  if (m.includes("rate limit") || m.includes("too many") || (e && e.status === 429)) return "Too many tries. Wait a few minutes and try again.";
  if (m.includes("password")) return "That password isn't allowed. Use at least 8 characters with a letter and a number.";
  if (m.includes("fetch") || m.includes("network")) return "No connection. Check your internet.";
  return "Something went wrong. Try again in a moment.";
}
async function accBusy(fn) {
  if (ACC.form) return;
  ACC.form = 1;
  const btn = $("accForm") && $("accForm").querySelector("[type=submit]");
  if (btn) btn.disabled = true;
  try {
    await fn();
  } catch (e) {
    accMsg(accErr(e), "bad");
  }
  ACC.form = 0;
  if (btn && btn.isConnected) btn.disabled = false;
}
function accSignIn() {
  const mail = $("accMail").value.trim(),
    pw = $("accPw").value;
  if (!MAIL_OK(mail) || !pw) return accMsg("Type your email and password.", "bad");
  accBusy(async () => {
    accMsg("Signing in...");
    const { error } = await ACC.sb.auth.signInWithPassword({ email: mail, password: pw });
    if (error) throw error;
    accMsg("Signed in!", "ok"); // accAuth() does the rest
  });
}
function accSignUp() {
  const mail = $("accMail").value.trim(),
    user = $("accUser").value.trim(),
    pw = $("accPw").value;
  if (!MAIL_OK(mail)) return accMsg("That email doesn't look right.", "bad");
  if (!USER_OK(user)) return accMsg("Username: 3 to 16 letters, numbers or _.", "bad");
  if (!PW_OK(pw)) return accMsg("Password: at least 8 characters, with a letter and a number.", "bad");
  accBusy(async () => {
    accMsg("Checking your username...");
    const free = await ACC.sb.rpc("username_free", { name: user });
    if (free.error) throw free.error;
    if (!free.data) return accMsg("That username is taken. Try another.", "bad");
    accMsg("Creating your account...");
    const { data, error } = await ACC.sb.auth.signUp({ email: mail, password: pw, options: { data: { username: user }, emailRedirectTo: accHome() } });
    if (error) throw error;
    if (data.session) accMsg("Account created!", "ok");
    else {
      ACC.view = "signin";
      drawAcct();
      $("accMail").value = mail;
      accMsg("Nearly there! We sent a link to " + mail + ". Tap it, then sign in here. Your progress stays on this device until then.", "ok");
    }
  });
}
// Where emailed links come back to: this page, or the live site when playing from a file.
const accHome = () => (location.protocol.startsWith("http") ? location.origin + location.pathname : "https://davispiero.github.io/courtside/");
function accForgot(mail) {
  mail = (mail || "").trim();
  if (!MAIL_OK(mail)) return accMsg("Type the email you signed up with.", "bad");
  accBusy(async () => {
    const { error } = await ACC.sb.auth.resetPasswordForEmail(mail, { redirectTo: accHome() });
    if (error) throw error;
    accMsg("If that email has an account, a link to choose a new password is on its way.", "ok");
  });
}
function accNewPassword(e) {
  e.preventDefault();
  const pw = $("accPw").value;
  if (!PW_OK(pw)) return accMsg("Password: at least 8 characters, with a letter and a number.", "bad");
  accBusy(async () => {
    const { error } = await ACC.sb.auth.updateUser({ password: pw });
    if (error) throw error;
    ACC.recover = 0;
    accSet("in");
    accMsg("Password changed!", "ok");
  });
}
// Signing out sends the last progress, then clears this device back to a fresh save: the progress lives in the
// account, and a fresh device can't be used to copy coins from one save into another.
async function accSignOut() {
  accMsg("Saving and signing out...");
  await accPush();
  const o = accOwner();
  if (o && o.dirty && !confirm("Some progress hasn't reached your account yet (no connection?). Sign out anyway and lose it?")) return accMsg("");
  try {
    await ACC.sb.auth.signOut();
  } catch (e) {}
  const daily = SAVE.daily; // so today's reward can't be claimed twice by signing out
  accSetOwner(null);
  accApply({ ...saveFresh(), daily });
  ACC.user = null;
  ACC.name = "";
  ACC.attached = "";
  ACC.view = "signin";
  accSet("out");
  accMsg("Signed out. Your progress is safe in your account.", "ok");
}
// Deleting asks twice: DELETE ACCOUNT opens "Are you sure?", whose YES only unlocks after 3 seconds.
function accDelete() {
  const yes = $("bDelYes");
  $("accDel").classList.add("on");
  let n = 3;
  const tick = () => {
    if (!$("accDel").classList.contains("on")) return;
    yes.disabled = n > 0;
    yes.textContent = n > 0 ? `YES, DELETE (${n})` : "YES, DELETE";
    if (n-- > 0) ACC.delT = setTimeout(tick, 1000);
  };
  clearTimeout(ACC.delT);
  tick();
  $("bDelNo").onclick = () => $("accDel").classList.remove("on");
  yes.onclick = () => ($("accDel").classList.remove("on"), accDeleteNow());
}
function accDeleteNow() {
  accBusy(async () => {
    const { error } = await ACC.sb.rpc("delete_me");
    if (error) throw error;
    try {
      await ACC.sb.auth.signOut({ scope: "local" });
    } catch (e) {}
    accSetOwner(null);
    ACC.user = null;
    ACC.name = "";
    ACC.attached = "";
    ACC.view = "signin";
    accSet("out");
    accMsg("Account deleted. Your progress is still on this device.", "ok");
  });
}

$("bAcc").onclick = openProf;
$("bAccX").onclick = closeAcct;
accButton();
accInit();
