"""Drives the game in a real Chrome and measures it:  python tools/perf.py <plan.json> [--out DIR] [--headless] [--sound]

A plan is a list of steps run in order. Each step can have:
  name    label for the printed row
  js      JavaScript to run first (e.g. a button click)
  css     CSS for an injected <style> (replaces the previous step's), to switch something off and compare
  settle  seconds to wait before measuring (default 3)
  dur     seconds to measure (default 8); 0 only runs js, shot and info
  shot    file name for a screenshot taken after settle (saved in --out)
  info    JavaScript whose value is printed on the row
  dark    true or false: switch the page to the dark or light theme (prefers-color-scheme) first
  layers  true to print Chrome's composited layers with their reasons (what the GPU keeps separately)
Rows show frames per second, Chrome's CPU (all its processes, % of one core), the busiest GPU engine (Windows),
and main-thread time spent in tasks, scripts, style and layout. JavaScript errors are collected in window.__errs.
Dev builds expose window.__fc (flies, bugs, ants, glass) for plans that need game state.

--headless runs Chrome without a window, so the mouse can't disturb a test (use it for checks, not for speed).
--sound lets the game make sound without a real tap, as in real play (sound costs CPU too).

Uses only the Python standard library. Needs Chrome, and pwsh for the CPU and GPU counters.
"""
import base64, json, os, socket, struct, subprocess, sys, tempfile, time, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
PORT, DBG = 8765, 9333
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
PROFILE = os.path.join(tempfile.gettempdir(), "fly-catch-perf-profile")


class WS:
    """Just enough of a WebSocket client for the DevTools protocol."""
    def __init__(self, url):
        hp, path = url[len("ws://"):].split("/", 1)
        h, p = hp.split(":")
        self.s = socket.create_connection((h, int(p)))
        key = base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET /{path} HTTP/1.1\r\nHost: {hp}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n"
                        f"Sec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        buf = b""
        while b"\r\n\r\n" not in buf:
            buf += self.s.recv(4096)
        self.rest, self.id = buf.split(b"\r\n\r\n", 1)[1], 0

    def _read(self, n):
        while len(self.rest) < n:
            self.rest += self.s.recv(65536)
        d, self.rest = self.rest[:n], self.rest[n:]
        return d

    def send(self, text):
        data, n = text.encode(), len(text.encode())
        hdr = bytes([0x81]) + (bytes([0x80 | n]) if n < 126 else bytes([0x80 | 126]) + struct.pack(">H", n)
                               if n < 65536 else bytes([0x80 | 127]) + struct.pack(">Q", n))
        mask = os.urandom(4)
        self.s.sendall(hdr + mask + bytes(b ^ mask[i % 4] for i, b in enumerate(data)))

    def recv(self):
        out = b""
        while True:
            b1, b2 = self._read(2)
            n = b2 & 0x7F
            if n == 126: n = struct.unpack(">H", self._read(2))[0]
            elif n == 127: n = struct.unpack(">Q", self._read(8))[0]
            out += self._read(n)
            if b1 & 0x80: return out.decode("utf-8", "replace")

    def call(self, method, **params):
        self.id += 1
        self.send(json.dumps({"id": self.id, "method": method, "params": params}))
        while True:
            m = json.loads(self.recv())
            if m.get("id") == self.id:
                return m.get("result", m.get("error"))

    def js(self, expr):
        r = self.call("Runtime.evaluate", expression=expr, returnByValue=True, awaitPromise=True)
        return (r or {}).get("result", {}).get("value")


PS_MEASURE = r"""
$ids = @(Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | Where-Object { $_.CommandLine -like '*fly-catch-perf-profile*' } | ForEach-Object { $_.ProcessId })
$cpu = { ((Get-Process -Id $ids -ErrorAction SilentlyContinue) | ForEach-Object { $_.TotalProcessorTime.TotalSeconds } | Measure-Object -Sum).Sum }
$t0 = & $cpu
$paths = @(); foreach ($i in $ids) { $paths += "\GPU Engine(pid_$($i)_*)\Utilization Percentage" }
$s = Get-Counter -Counter $paths -SampleInterval 1 -MaxSamples DUR -ErrorAction SilentlyContinue
$t1 = & $cpu
$per = @{}
foreach ($set in $s) { foreach ($c in $set.CounterSamples) { $e = $c.InstanceName -replace '^pid_\d+_', ''; if (-not $per[$e]) { $per[$e] = 0 }; $per[$e] += $c.CookedValue } }
$n = [Math]::Max(1, @($s).Count)
$top = ($per.GetEnumerator() | ForEach-Object { $_.Value / $n } | Measure-Object -Maximum).Maximum
"{0}|{1}" -f ($t1 - $t0), $top
"""


def measure(dur):
    out = subprocess.run(["pwsh", "-NoProfile", "-Command", PS_MEASURE.replace("DUR", str(dur))],
                         capture_output=True, text=True).stdout.strip().splitlines()
    try:
        cpu, gpu = out[-1].split("|")
        return float(cpu.replace(",", ".")) / dur * 100, float((gpu or "0").replace(",", "."))
    except (IndexError, ValueError):
        return float("nan"), float("nan")


def print_layers(ws):
    ws.call("DOM.enable"); ws.call("LayerTree.disable")
    ws.id += 1
    ws.send(json.dumps({"id": ws.id, "method": "LayerTree.enable", "params": {}}))
    layers, end = [], time.time() + 3
    while time.time() < end:
        m = json.loads(ws.recv())
        if m.get("method") == "LayerTree.layerTreeDidChange" and m["params"].get("layers"):
            layers = m["params"]["layers"]
            break
    for L in layers:
        if not L.get("drawsContent"):
            continue
        why = ws.call("LayerTree.compositingReasons", layerId=L["layerId"]) or {}
        name = ""
        if L.get("backendNodeId"):
            d = (ws.call("DOM.describeNode", backendNodeId=L["backendNodeId"]) or {}).get("node", {})
            a = dict(zip(d.get("attributes", [])[::2], d.get("attributes", [])[1::2]))
            name = d.get("localName", "") + ("#" + a["id"] if "id" in a else "") + ("." + a["class"].replace(" ", ".") if a.get("class") else "")
        print(f"    {int(L['width']):5}x{int(L['height']):<5} {name[:50]:50} {','.join(why.get('compositingReasonIds', []))}")
    ws.call("LayerTree.disable")


def stop_chrome():
    subprocess.run(["pwsh", "-NoProfile", "-Command",
                    "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | Where-Object { $_.CommandLine -like "
                    "'*fly-catch-perf-profile*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"],
                   capture_output=True)


def main():
    args = sys.argv[1:]
    out_dir = args[args.index("--out") + 1] if "--out" in args else tempfile.gettempdir()
    headless = ["--headless=new"] if "--headless" in args else []
    sound = ["--autoplay-policy=no-user-gesture-required"] if "--sound" in args else []   # plays sound without a real tap
    plan = json.load(open(args[0], encoding="utf-8"))
    srv = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1"], cwd=ROOT,
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    chrome = subprocess.Popen([CHROME, f"--user-data-dir={PROFILE}", f"--remote-debugging-port={DBG}",
                               "--no-first-run", "--no-default-browser-check", "--mute-audio",
                               "--window-position=0,0", "--window-size=1600,900",
                               "--disable-features=CalculateNativeWinOcclusion",
                               "--disable-background-timer-throttling", "--disable-renderer-backgrounding",
                               *headless, *sound, "about:blank"])
    try:
        page = None
        for _ in range(60):
            try:
                page = next(t for t in json.load(urllib.request.urlopen(f"http://127.0.0.1:{DBG}/json")) if t["type"] == "page")
                break
            except Exception:
                time.sleep(.3)
        ws = WS(page["webSocketDebuggerUrl"])
        for m in ("Page.enable", "Runtime.enable", "Performance.enable"):
            ws.call(m)
        ws.call("Page.addScriptToEvaluateOnNewDocument", source="window.__errs=[];"
                "addEventListener('error',e=>__errs.push(e.message+' @'+e.lineno));"
                "addEventListener('unhandledrejection',e=>__errs.push('rejected: '+e.reason))")
        ws.call("Network.enable"); ws.call("Network.setCacheDisabled", cacheDisabled=True)
        ws.call("Page.navigate", url=f"http://127.0.0.1:{PORT}/")
        ws.call("Page.bringToFront")
        time.sleep(4)
        ws.js("window.__fr=0;(function c(){__fr++;requestAnimationFrame(c)})()")
        for step in plan:
            if "dark" in step:
                ws.call("Emulation.setEmulatedMedia", features=[{"name": "prefers-color-scheme", "value": "dark" if step["dark"] else "light"}])
            if "js" in step:
                ws.js(step["js"])
            ws.js("(()=>{let s=document.getElementById('__probe');if(!s){s=document.createElement('style');"
                  "s.id='__probe';document.head.appendChild(s)}s.textContent=%s})()" % json.dumps(step.get("css", "")))
            time.sleep(step.get("settle", 3))
            if "shot" in step:
                png = ws.call("Page.captureScreenshot", format="png")["data"]
                open(os.path.join(out_dir, step["shot"]), "wb").write(base64.b64decode(png))
            if step.get("layers"):
                print_layers(ws)
            info = step.get("info", "''")
            dur = step.get("dur", 8)
            if not dur:
                print(f"{step['name']:<34} {ws.js(info)}", flush=True)
                continue
            m0 = {x["name"]: x["value"] for x in ws.call("Performance.getMetrics")["metrics"]}
            f0 = ws.js("__fr")
            cpu, gpu = measure(dur)
            m1 = {x["name"]: x["value"] for x in ws.call("Performance.getMetrics")["metrics"]}
            f1 = ws.js("__fr")
            el = m1["Timestamp"] - m0["Timestamp"]
            pct = lambda k: (m1[k] - m0[k]) / el * 100
            print(f"{step['name']:<34} fps {(f1 - f0) / el:4.0f}  cpu {cpu:5.1f}%  gpu {gpu:5.1f}%  "
                  f"main {pct('TaskDuration'):4.1f}%  js {pct('ScriptDuration'):4.1f}%  style {pct('RecalcStyleDuration'):4.1f}%  "
                  f"layout {pct('LayoutDuration'):4.1f}%  {ws.js(info)}", flush=True)
    finally:
        chrome.terminate(); srv.terminate(); stop_chrome()


main()
