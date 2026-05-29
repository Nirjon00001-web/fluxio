import { useState, useRef, useEffect } from "react";

const CYAN = "#00E5FF";
const VIOLET = "#7B2FFF";
const FUCHSIA = "#FF3DFF";
const VOID = "#060614";
const DARK = "#0A0A1A";

const SUGGESTIONS = [
  "Mujhe ek food delivery app ki landing page chahiye — dark theme",
  "Ek modern portfolio website banao — developer ke liye",
  "Customer support chatbot UI banao",
  "Ek simple to-do app banao with local storage",
  "E-commerce product page banao — sneakers store",
];

function Logo() {
  return (
    <svg width="110" height="36" viewBox="0 0 140 46" fill="none">
      <g transform="translate(0,5)">
        <path d="M4 18 C7 7,13 7,16 18 C19 29,25 29,28 18" stroke="url(#mG1)" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <path d="M11 18 C14 7,20 7,23 18 C26 29,32 29,35 18" stroke="url(#mG1)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5"/>
        <circle cx="38" cy="18" r="3" fill="url(#mG2)"/>
      </g>
      <text x="48" y="32" fontFamily="Georgia,serif" fontWeight="700" fontSize="22" fill="url(#mG3)">fluxio</text>
      <defs>
        <linearGradient id="mG1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={CYAN}/><stop offset="100%" stopColor={VIOLET}/>
        </linearGradient>
        <radialGradient id="mG2"><stop offset="0%" stopColor={FUCHSIA}/><stop offset="100%" stopColor={VIOLET}/></radialGradient>
        <linearGradient id="mG3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fff"/><stop offset="100%" stopColor="#C0CFFF"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

async function callClaude(messages) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: `You are Fluxio, an elite AI builder. When a user describes what they want to build, you MUST respond with a SINGLE complete HTML file that includes all CSS and JavaScript inline. 

Rules:
- Always output a complete, beautiful, working HTML file
- Use modern design: dark backgrounds (#060614), gradient accents (cyan #00E5FF, violet #7B2FFF, fuchsia #FF3DFF)
- Make it responsive and visually stunning
- Add interactivity with JavaScript where relevant
- No external dependencies except Google Fonts
- Start your response with a SHORT one-line description in plain text (not HTML), then on a new line output the full HTML starting with <!DOCTYPE html>
- The HTML must be complete and self-contained`,
      messages,
    }),
  });
  const data = await res.json();
  return data.content?.map(b => b.text || "").join("") || "";
}

export default function FluxioMVP() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("");
  const [previewDesc, setPreviewDesc] = useState("");
  const [tab, setTab] = useState("preview"); // preview | code
  const [copied, setCopied] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef();
  const textareaRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const extractHTML = (text) => {
    const match = text.match(/<!DOCTYPE html[\s\S]*/i);
    return match ? match[0] : null;
  };

  const extractDesc = (text) => {
    const lines = text.trim().split("\n");
    const firstLine = lines[0];
    if (firstLine && !firstLine.trim().toLowerCase().startsWith("<!doctype")) return firstLine;
    return "Aapka creation ready hai!";
  };

  const send = async (msg) => {
    if (!msg.trim() || loading) return;
    setStarted(true);
    const userMsg = { role: "user", content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const reply = await callClaude(newMessages);
      const html = extractHTML(reply);
      const desc = extractDesc(reply);

      setMessages(prev => [...prev, { role: "assistant", content: reply, html, desc }]);
      if (html) { setPreview(html); setPreviewDesc(desc); setTab("preview"); }
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Kuch error aaya. Dobara try karo!", html: null }]);
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(preview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const blob = new Blob([preview], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "fluxio-creation.html";
    a.click();
  };

  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", background:VOID, fontFamily:"'Segoe UI',system-ui,sans-serif", color:"#fff", overflow:"hidden" }}>

      {/* NAV */}
      <nav style={{ height:"52px", background:"rgba(10,10,26,0.95)", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", flexShrink:0 }}>
        <Logo/>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", background:"rgba(255,255,255,0.05)", padding:"3px 10px", borderRadius:"100px" }}>MVP Beta</span>
          {preview && (
            <>
              <button onClick={copyCode} style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", color:"rgba(255,255,255,0.7)", padding:"5px 12px", fontSize:"12px", cursor:"pointer" }}>
                {copied ? "✓ Copied!" : "📋 Code Copy"}
              </button>
              <button onClick={downloadCode} style={{ background:`linear-gradient(135deg,${VIOLET},${CYAN})`, border:"none", borderRadius:"8px", color:"#fff", padding:"5px 14px", fontSize:"12px", fontWeight:"600", cursor:"pointer" }}>
                ⬇ Download
              </button>
            </>
          )}
        </div>
      </nav>

      {/* MAIN */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* LEFT — CHAT */}
        <div style={{ width:"380px", flexShrink:0, display:"flex", flexDirection:"column", borderRight:"1px solid rgba(255,255,255,0.06)", background:DARK }}>

          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"20px 16px" }}>

            {/* Welcome screen */}
            {!started && (
              <div style={{ textAlign:"center", paddingTop:"40px" }}>
                <div style={{ fontSize:"36px", marginBottom:"12px" }}>✨</div>
                <h2 style={{ fontSize:"18px", fontWeight:"800", marginBottom:"8px" }}>Fluxio Builder</h2>
                <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"13px", lineHeight:"1.7", marginBottom:"28px" }}>
                  Apna idea batao — website, app, ya agent.<br/>Main seconds mein bana deta hoon!
                </p>
                <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                  {SUGGESTIONS.map((s, i) => (
                    <button key={i} onClick={() => send(s)} style={{
                      background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
                      borderRadius:"12px", color:"rgba(255,255,255,0.6)", padding:"10px 14px",
                      fontSize:"12px", cursor:"pointer", textAlign:"left", lineHeight:"1.5",
                      transition:"all 0.2s",
                    }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor=VIOLET; e.currentTarget.style.color="#fff"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"; e.currentTarget.style.color="rgba(255,255,255,0.6)"; }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message list */}
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom:"16px", display:"flex", flexDirection:"column", alignItems: m.role==="user" ? "flex-end" : "flex-start" }}>
                {m.role === "assistant" && (
                  <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"6px" }}>
                    <div style={{ width:"22px", height:"22px", borderRadius:"50%", background:`linear-gradient(135deg,${VIOLET},${CYAN})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", fontWeight:"800" }}>F</div>
                    <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)" }}>Fluxio</span>
                  </div>
                )}
                <div style={{
                  maxWidth:"90%",
                  background: m.role==="user" ? `linear-gradient(135deg,${VIOLET}55,${VIOLET}22)` : "rgba(255,255,255,0.05)",
                  border: `1px solid ${m.role==="user" ? `${VIOLET}66` : "rgba(255,255,255,0.07)"}`,
                  borderRadius: m.role==="user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  padding:"10px 14px", fontSize:"13px", lineHeight:"1.6", color:"rgba(255,255,255,0.85)",
                }}>
                  {m.role === "assistant" ? (m.desc || "Ready!") : m.content}
                </div>
                {m.role === "assistant" && m.html && (
                  <button onClick={() => { setPreview(m.html); setPreviewDesc(m.desc); setTab("preview"); }} style={{
                    marginTop:"6px", background:`${CYAN}15`, border:`1px solid ${CYAN}44`, borderRadius:"100px",
                    color:CYAN, fontSize:"11px", padding:"4px 12px", cursor:"pointer", fontWeight:"600",
                  }}>
                    👁 Preview Dekho
                  </button>
                )}
              </div>
            ))}

            {/* Loading */}
            {loading && (
              <div style={{ display:"flex", gap:"6px", alignItems:"center", padding:"12px 14px", background:"rgba(255,255,255,0.04)", borderRadius:"16px", width:"fit-content" }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width:"6px", height:"6px", borderRadius:"50%", background:CYAN, animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite` }}/>
                ))}
                <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.4)", marginLeft:"8px" }}>Ban raha hai...</span>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          <div style={{ padding:"16px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"16px", display:"flex", gap:"8px", padding:"10px 12px", alignItems:"flex-end" }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Kya banana hai? (Enter to send)"
                rows={2}
                style={{ flex:1, background:"transparent", border:"none", color:"#fff", fontSize:"13px", resize:"none", outline:"none", lineHeight:"1.6", fontFamily:"inherit", maxHeight:"120px" }}
              />
              <button onClick={() => send(input)} disabled={!input.trim() || loading} style={{
                background: input.trim() && !loading ? `linear-gradient(135deg,${VIOLET},${CYAN})` : "rgba(255,255,255,0.08)",
                border:"none", borderRadius:"10px", color:"#fff", width:"36px", height:"36px",
                fontSize:"16px", cursor: input.trim() && !loading ? "pointer" : "default",
                flexShrink:0, transition:"all 0.2s",
              }}>
                {loading ? "⏳" : "→"}
              </button>
            </div>
            <p style={{ fontSize:"10px", color:"rgba(255,255,255,0.2)", textAlign:"center", marginTop:"8px" }}>
              Shift+Enter for new line · Enter to send
            </p>
          </div>
        </div>

        {/* RIGHT — PREVIEW */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

          {/* Preview tabs */}
          {preview && (
            <div style={{ height:"44px", background:"rgba(10,10,26,0.8)", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", padding:"0 16px", gap:"4px", flexShrink:0 }}>
              {["preview","code"].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  background: tab===t ? "rgba(255,255,255,0.08)" : "transparent",
                  border: tab===t ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
                  borderRadius:"8px", color: tab===t ? "#fff" : "rgba(255,255,255,0.4)",
                  padding:"4px 14px", fontSize:"12px", cursor:"pointer", fontWeight: tab===t ? "600" : "400",
                }}>
                  {t === "preview" ? "👁 Preview" : "💻 Code"}
                </button>
              ))}
              {previewDesc && <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.3)", marginLeft:"8px" }}>— {previewDesc}</span>}
            </div>
          )}

          {/* Preview area */}
          <div style={{ flex:1, overflow:"hidden", position:"relative" }}>
            {preview ? (
              tab === "preview" ? (
                <iframe
                  srcDoc={preview}
                  style={{ width:"100%", height:"100%", border:"none", background:"#fff" }}
                  title="Fluxio Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <div style={{ height:"100%", overflowY:"auto", padding:"20px" }}>
                  <pre style={{ color:"rgba(255,255,255,0.75)", fontSize:"12px", lineHeight:"1.7", whiteSpace:"pre-wrap", fontFamily:"'Courier New',monospace" }}>
                    {preview}
                  </pre>
                </div>
              )
            ) : (
              <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"40px" }}>
                <div style={{ fontSize:"64px", marginBottom:"20px", opacity:0.4 }}>🖥️</div>
                <h3 style={{ fontSize:"20px", fontWeight:"700", color:"rgba(255,255,255,0.5)", marginBottom:"10px" }}>Preview yahaan dikhega</h3>
                <p style={{ color:"rgba(255,255,255,0.25)", fontSize:"14px", maxWidth:"300px", lineHeight:"1.7" }}>
                  Left side mein apna idea type karo — Fluxio seconds mein bana dega aur yahaan live preview show hoga
                </p>
                {/* Animated grid */}
                <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(123,47,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(123,47,255,0.03) 1px,transparent 1px)", backgroundSize:"40px 40px", pointerEvents:"none" }}/>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes bounce { 0%,80%,100%{transform:scale(0.8);opacity:0.4} 40%{transform:scale(1.2);opacity:1} }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:${VIOLET}66;border-radius:2px}
        textarea::placeholder{color:rgba(255,255,255,0.25)}
        input::placeholder{color:rgba(255,255,255,0.25)}
      `}</style>
    </div>
  );
}
