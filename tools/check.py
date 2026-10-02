"""Release checks for Fly Catcher. Run before every push:  python tools/check.py

Uses only the Python standard library. Exits with 1 if any check fails.
"""
import json, os, re, shutil, struct, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

failures, warnings = [], []
def check(name, problems):
    print(("  ok    " if not problems else "  FAIL  ") + name)
    for p in problems:
        print("          - " + p)
    failures.extend(problems)
def warn(name, notes):
    if notes:
        print("  note  " + name)
        for n in notes:
            print("          - " + n)
        warnings.extend(notes)

def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()

sw, html, css = read("sw.js"), read("index.html"), read("css/style.css")
# The game's TypeScript source, all of it; js/game.js is its minified build
game = "\n".join(read(os.path.join(d, f)) for d, _, fs in sorted(os.walk("src")) for f in sorted(fs) if f.endswith(".ts"))

# JSON files parse
langs, problems = {}, []
for path in ["manifest.webmanifest"] + ["lang/" + f for f in sorted(os.listdir("lang")) if f.endswith(".json")]:
    try:
        data = json.loads(read(path))
        if path.startswith("lang/"):
            langs[os.path.basename(path)[:-5]] = data
    except ValueError as e:
        problems.append(f"{path}: {e}")
check("JSON files are valid", problems)
manifest = json.loads(read("manifest.webmanifest")) if not problems else {}

# Languages listed in the game, the service worker and lang/ agree
listed = re.findall(r'"(\w+)"', re.search(r"const LANGUAGES = \[([^\]]*)\]", game).group(1))
cached = re.findall(r'\./lang/(\w+)\.json', sw)
problems = [f"lang/{c}.json is missing" for c in listed if c not in langs]
problems += [f"lang/{c}.json is not in LANGUAGES in src/main.ts" for c in langs if c not in listed]
problems += [f"lang/{c}.json is not cached in sw.js" for c in listed if c not in cached]
check("Every language is listed in the game and cached for offline", problems)

# Every language has the same keys, with the same kind of value
problems = []
all_keys = set().union(*[set(d) for d in langs.values()]) if langs else set()
for code, d in langs.items():
    for k in sorted(all_keys - set(d)):
        problems.append(f"{code}.json has no \"{k}\"")
    for k, v in d.items():
        for other, od in langs.items():
            if k in od and type(od[k]) is not type(v) and code < other:
                problems.append(f"\"{k}\" is a {type(v).__name__} in {code}.json but a {type(od[k]).__name__} in {other}.json")
            if isinstance(v, (list, dict)) and k in od and type(od[k]) is type(v) and len(od[k]) != len(v) and code < other:
                problems.append(f"\"{k}\" has {len(v)} items in {code}.json but {len(od[k])} in {other}.json")
        if isinstance(v, str) and not v.strip() and k != "dir":
            problems.append(f"{code}.json: \"{k}\" is empty")
check("Every language has the same text keys", problems)

# Every key the page and the game ask for exists
used = set(re.findall(r'data-i18n(?:-aria|-title)?="(\w+)"', html + game))
used |= set(re.findall(r'\bT\("(\w+)"', game))
used |= set(re.findall(r'\bk: "(\w+)"', game))   # What's new entries
used |= set(re.findall(r'beeAlert\([^)]*?,\s*"(\w+)"\)', game))
for line in re.findall(r"dataset\.i18n = [^;]+", game):
    used |= set(re.findall(r'"(all\w+)"', line))   # end-screen messages
used |= set(re.findall(r'function beeAlert\([^)]*=\s*"(\w+)"', game))
problems = [f"\"{k}\" is used but missing from {c}.json" for k in sorted(used) for c, d in langs.items() if k not in d]
check("Every text the game uses exists in every language", problems)
warn("Text keys no code seems to use (fine if used indirectly)",
     [k for k in sorted(all_keys - used) if k not in ("langName", "dir")])

# Version numbers agree, and the changelog has this version
gv = re.search(r'const VERSION = "([\d.]+)"', game).group(1)
sv = re.search(r'const VERSION = "([\d.]+)"', sw).group(1)
problems = [] if gv == sv else [f"src/main.ts says {gv} but sw.js says {sv}"]
if not re.search(r"^## " + re.escape(gv) + r"\b", read("CHANGELOG.md"), re.M):
    problems.append(f"CHANGELOG.md has no \"## {gv}\" entry")
newest = re.search(r'const NEWS = \[\s*\{ v: "([\d.]+)"', game)
if newest and newest.group(1) != gv:
    warnings.append(f"newest What's new entry is {newest.group(1)}, the game is {gv} (fine if this release has nothing a child would notice)")
    print(f"  note  newest What's new entry is {newest.group(1)}, the game is {gv} (fine if this release has nothing a child would notice)")
check(f"Version {gv} matches in src/main.ts, sw.js and CHANGELOG.md", problems)

# Development build numbers match each other
b1 = re.search(r"const BUILD = (\d+);", game)
b2 = re.search(r"--build:(\d+);", css)
check("Build number matches in src/main.ts and css/style.css",
      [] if b1 and b2 and b1.group(1) == b2.group(1) else [f"src/main.ts BUILD {b1 and b1.group(1)} vs css/style.css --build {b2 and b2.group(1)}"])

# Every file the service worker caches exists
core = re.findall(r'"\./([^"]*)"', re.search(r"const CORE = \[(.*?)\];", sw, re.S).group(1))
problems = [f"sw.js caches \"{p}\" but it doesn't exist" for p in core if p and not os.path.isfile(p)]
local = set(re.findall(r'(?:href|src)="((?:css|js|fonts|icons|lang)/[^"]+|privacy\.html)"', html))
local |= {"fonts/" + f for f in re.findall(r"url\(\.\./fonts/([^)]+)\)", css)}
problems += [f"{p} is used by the page but not cached in sw.js" for p in sorted(local) if p not in core and not p.startswith("icons/share")]
check("Offline files exist and everything the page needs is cached", problems)

# Manifest images exist and have the size they claim
def image_size(path):
    with open(path, "rb") as f:
        head = f.read(64)
    if head[:8] == b"\x89PNG\r\n\x1a\n":
        return struct.unpack(">II", head[16:24])
    if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        kind = head[12:16]
        if kind == b"VP8 ":
            w, h = struct.unpack("<HH", head[26:30]); return w & 0x3FFF, h & 0x3FFF
        if kind == b"VP8L":
            b = int.from_bytes(head[21:25], "little"); return (b & 0x3FFF) + 1, ((b >> 14) & 0x3FFF) + 1
        if kind == b"VP8X":
            return int.from_bytes(head[24:27], "little") + 1, int.from_bytes(head[27:30], "little") + 1
    return None
problems = []
for item in manifest.get("icons", []) + manifest.get("screenshots", []):
    src = item["src"]
    if not os.path.isfile(src):
        problems.append(f"{src} is missing"); continue
    size, claimed = image_size(src), item.get("sizes", "")
    if size and claimed and f"{size[0]}x{size[1]}" != claimed:
        problems.append(f"{src} is {size[0]}x{size[1]} but the manifest says {claimed}")
forms = {s.get("form_factor", "narrow") for s in manifest.get("screenshots", [])}
if manifest.get("screenshots") and not {"wide", "narrow"} <= forms:
    problems.append("the install window needs both wide and narrow screenshots")
check("Manifest icons and screenshots exist with the right sizes", problems)

# The sharing preview stays small enough for WhatsApp
og = re.search(r'property="og:image" content="[^"]*/([^"/]+/[^"/]+)"', html)
problems = []
if og:
    p = og.group(1)
    if not os.path.isfile(p):
        problems.append(f"{p} is missing")
    elif os.path.getsize(p) > 300 * 1024:
        problems.append(f"{p} is {os.path.getsize(p) // 1024} KB; WhatsApp ignores previews over 300 KB")
else:
    problems.append("index.html has no og:image")
check("Sharing preview image exists and is under 300 KB", problems)

# Nothing loads from outside the game
outside = [u for u in re.findall(r'(?:href|src)="(https?://[^"]+)"', html) if "github.io/fly-catch-app" not in u]
outside += re.findall(r"url\((https?://[^)]+)\)", css)
check("Nothing loads from other websites", [f"loads {u}" for u in outside])

# The privacy page still lists everything the game saves
keys = sorted(set(re.findall(r'localStorage\.setItem\("([\w.]+)"', game)))
known = {"flyCatch.lang", "flyCatch.best", "flyCatch.seen"}
check("The game saves only what privacy.html lists",
      [f"the game now saves \"{k}\": add it to privacy.html (both languages) and update its date, then add it here" for k in keys if k not in known])

# JavaScript syntax (needs Node.js, on the PATH or through fnm; skipped otherwise)
node = [shutil.which("node")] if shutil.which("node") else ["fnm", "exec", "--using=default", "node"] if shutil.which("fnm") else None
if node:
    problems = []
    for path in ("js/game.js", "sw.js"):
        r = subprocess.run(node + ["--check", path], capture_output=True, text=True)
        if r.returncode:
            problems.append(f"{path}: {r.stderr.strip().splitlines()[-1] if r.stderr.strip() else 'syntax error'}")
    check("JavaScript has no syntax errors", problems)

    # js/game.js is committed, so it must be the build of src/ as it is now
    esb = os.path.join("node_modules", "esbuild", "bin", "esbuild")
    if os.path.exists(esb):
        out = os.path.join("node_modules", ".check-game.js")
        args = json.loads(read("package.json"))["scripts"]["build"].split()[1:]
        args = [f"--outfile={out}" if a.startswith("--outfile=") else a for a in args]
        r = subprocess.run(node + [esb] + args, capture_output=True, text=True)
        built = read(out) if r.returncode == 0 else None
        check("js/game.js is built from src/ (npm run build)",
              [r.stderr.strip() or "build failed"] if built is None else [] if built == read("js/game.js") else ["js/game.js is out of date: run npm run build"])
    else:
        print("  skip  js/game.js matches src/ (run npm install to check it)")
else:
    print("  skip  JavaScript syntax (install Node.js to check it)")

print()
if failures:
    print(f"{len(failures)} problem(s) to fix before releasing.")
    sys.exit(1)
print("All checks passed." + (f" ({len(warnings)} note(s) above)" if warnings else ""))
