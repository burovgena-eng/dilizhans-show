#!/usr/bin/env python3
"""Fetch ALL costume photos per category with their alt-text titles.
Saves a manifest.json: { category: [{src, title}] }"""
import re, os, urllib.request, ssl, time, json, hashlib
from urllib.parse import quote, urlsplit, urlunsplit
from concurrent.futures import ThreadPoolExecutor

OUT_ROOT = "/home/z/my-project/public/images/real"
MANIFEST_PATH = "/home/z/my-project/src/lib/data/photos-manifest.json"
os.makedirs(OUT_ROOT, exist_ok=True)

PAGES = {
    "Новогодние":        ("newyear",    "https://dilizhans-show.ru/novogodnie-kostjumy/"),
    "Детские новогодние":("children",  "https://dilizhans-show.ru/novogodnie-detskie-kostjumy/"),
    "Ретро и Гэтсби":    ("retro",      "https://dilizhans-show.ru/stiljagi-retro-disko-chikago/"),
    "Хэллоуин":          ("halloween",  "https://dilizhans-show.ru/kostjumy-dlja-hjellouina/"),
    "Восточные":         ("eastern",    "https://dilizhans-show.ru/vostochnye-motivy/"),
    "Бальные платья":    ("ball",        "https://dilizhans-show.ru/balnye-platja-dlja-vzroslyh/"),
    "Коктейльные платья":("cocktail",   "https://dilizhans-show.ru/vechernie-koktejlnye-platja/"),
    "Свадебные":         ("wedding",    "https://dilizhans-show.ru/svadebnye-platja/"),
    "Смокинги и фраки":  ("tuxedo",      "https://dilizhans-show.ru/kostjumy-smokingi-fraki/"),
    "Для мальчиков":     ("boys",       "https://dilizhans-show.ru/malchiki/"),
    "Для девочек":       ("girls",      "https://dilizhans-show.ru/devochki/"),
    "Сказочные животные":("animals",    "https://dilizhans-show.ru/skazochnye-zhivotnye-zverki-ptichki-i-nasekomye/"),
    "Испанские":         ("spanish",    "https://dilizhans-show.ru/ispanskie-nacionalnye-kostjumy/"),
    "Японские":          ("japanese",   "https://dilizhans-show.ru/japonskie-nacionalnye-kostjumy/"),
    "Арабские":          ("arabic",     "https://dilizhans-show.ru/arabskie-nacionalnye-kostjumy/"),
    "Цыганские":         ("gypsy",      "https://dilizhans-show.ru/cyganskie-narodnye-kostjumy/"),
    "Исторические":      ("historical", "https://dilizhans-show.ru/istoricheskie-teatralnye-kostjumy/"),
    "Осенний бал":       ("autumn",     "https://dilizhans-show.ru/osennij-bal/"),
    "Овощи и фрукты":    ("vegetables", "https://dilizhans-show.ru/ovoshhi-frukty-griby-jagody/"),
}

MAX_PER_CATEGORY = 30  # cap to keep downloads manageable

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def fetch(url, timeout=25):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html,*/*"})
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
            return r.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"  ! fetch error {url}: {e}")
        return ""

def normalize_full_size(url):
    m = re.search(r"-(\d{2,4})x(\d{2,4})\.([a-z]+)$", url, re.IGNORECASE)
    if m:
        return url[:m.start()] + "." + m.group(3)
    return url

def is_costume_photo(url):
    low = url.lower()
    if "/wp-content/uploads/" not in url and not url.startswith("/wp-content/uploads/"):
        return False
    if any(s in url for s in ("/uploads/2017/12/", "/uploads/2018/11/", "/uploads/2019/03/", "/uploads/2021/04/")):
        return False
    if any(s in low for s in ("fav", "logo", "icon", "sprite", "pixel", "blank", "loader", "placeholder", "tracking", "no-right-click", "yandex", "metrika", ".js", ".css", ".svg", ".gif", ".webp")):
        return False
    if not re.search(r"\.(jpg|jpeg|png)(\?|$)", low):
        return False
    return True

def find_imgs_with_alt(html):
    """Return list of (full_size_url, alt_text, title_attr) tuples."""
    out = []
    # match img tags and capture src, alt, title
    for m in re.finditer(r'<img\b([^>]*)/?>', html, re.IGNORECASE):
        attrs = m.group(1)
        # extract each attribute
        src = None
        alt = ""
        title = ""
        for am in re.finditer(r'(\w[\w-]*)\s*=\s*["\']([^"\']*)["\']', attrs):
            name = am.group(1).lower()
            val = am.group(2)
            if name in ("src", "data-src", "data-lazy-src", "data-original"):
                if is_costume_photo(val):
                    src = normalize_full_size(val)
            elif name == "alt":
                alt = val.strip()
            elif name == "title":
                title = val.strip()
        # also try srcset for largest
        for sm in re.finditer(r'(?:srcset|data-lazy-srcset)\s*=\s*["\']([^"\']*)["\']', attrs):
            parts = sm.group(1).split(",")
            largest_url = None
            largest_w = 0
            for p in parts:
                bits = p.strip().split(" ")
                u = bits[0]
                if is_costume_photo(u) and len(bits) > 1:
                    try:
                        w = int(bits[1].rstrip("w"))
                        if w > largest_w:
                            largest_w = w
                            largest_url = normalize_full_size(u)
                    except ValueError:
                        pass
                elif is_costume_photo(u) and not largest_url:
                    largest_url = normalize_full_size(u)
            if largest_url:
                src = largest_url  # prefer largest from srcset
        if src:
            out.append((src, alt, title))
    # dedupe by URL
    seen = set()
    res = []
    for src, alt, title in out:
        if src in seen:
            continue
        seen.add(src)
        res.append((src, alt, title))
    return res

def make_title(alt, title, url):
    """Build a clean human-readable title from alt text or filename."""
    import html as html_mod
    from urllib.parse import unquote
    t = (title or alt or "").strip()
    # URL-decode and HTML-unescape FIRST (before any truncation)
    if '%' in t:
        t = unquote(t)
    t = html_mod.unescape(t)
    # strip common noise
    t = re.sub(r"^(фото|image|img)\s*[-:]?\s*", "", t, flags=re.IGNORECASE)
    if t and len(t) > 1 and not t.lower().startswith(("dilizh", "http", "www")):
        # fix underscores/dashes to spaces, capitalize
        t = re.sub(r"[_\-]+", " ", t).strip()
        t = re.sub(r"\s+", " ", t)
        if len(t) > 80:
            t = t[:77].rstrip() + "…"
        return t[:1].upper() + t[1:] if t else "Костюм"
    # fall back to filename
    fname = url.rsplit("/", 1)[-1]
    # URL-decode filename
    fname = unquote(fname)
    base = re.sub(r"\.(jpg|jpeg|png)$", "", fname, flags=re.IGNORECASE)
    base = re.sub(r"-\d+x\d+$", "", base)
    base = re.sub(r"^[0-9-]+\.-\s*", "", base)  # strip leading number
    base = re.sub(r"[_\-]+", " ", base).strip()
    base = re.sub(r"\s+", " ", base)
    if not base:
        base = "Костюм"
    if len(base) > 80:
        base = base[:77].rstrip() + "…"
    return base[:1].upper() + base[1:] if base else "Костюм"

def normalize_url(u):
    BASE = "https://dilizhans-show.ru"
    if u.startswith("/"):
        u = BASE + u
    try:
        parts = urlsplit(u)
        encoded_path = quote(parts.path, safe="/:.,()-")
        return urlunsplit((parts.scheme, parts.netloc, encoded_path, parts.query, parts.fragment))
    except Exception:
        return u

def download_one(url, path, timeout=20):
    if os.path.exists(path) and os.path.getsize(path) > 5000:
        return "skip"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "image/*"})
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
            data = r.read()
        if len(data) < 3000:
            return "too-small"
        with open(path, "wb") as f:
            f.write(data)
        return "ok"
    except Exception as e:
        return f"err:{e}"

def process_page(category_label, slug, url, manifest):
    print(f"\n→ {category_label}: {url}")
    html = fetch(url)
    if not html:
        return
    items = find_imgs_with_alt(html)
    print(f"  found {len(items)} unique photos with alt text")
    items = items[:MAX_PER_CATEGORY]
    entries = []
    for i, (img_url, alt, title) in enumerate(items):
        img_url = normalize_url(img_url)
        url_hash = hashlib.md5(img_url.encode()).hexdigest()[:8]
        # determine extension
        ext = ".jpg"
        m = re.search(r"\.(jpg|jpeg|png)(\?|$)", img_url, re.I)
        if m:
            ext = "." + m.group(1).lower()
        local_name = f"{slug}_{i+1}_{url_hash}{ext}"
        local_path = os.path.join(OUT_ROOT, local_name)
        status = download_one(img_url, local_path)
        if status in ("ok", "skip"):
            clean_title = make_title(alt, title, img_url)
            entries.append({
                "src": f"/images/real/{local_name}",
                "title": clean_title,
                "alt": alt,
                "sourceUrl": img_url,
                "category": category_label,
                "slug": slug,
            })
            if status == "ok":
                print(f"  ✓ {local_name} → «{clean_title[:40]}»")
    manifest[category_label] = {
        "slug": slug,
        "label": category_label,
        "items": entries,
        "count": len(entries),
    }
    print(f"  → {len(entries)} photos saved for {category_label}")

if __name__ == "__main__":
    manifest = {}
    for label, (slug, url) in PAGES.items():
        process_page(label, slug, url, manifest)
        time.sleep(0.4)
    # write manifest
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print(f"\n=== Summary ===")
    total = sum(c["count"] for c in manifest.values())
    print(f"Total: {total} photos across {len(manifest)} categories")
    for label, c in manifest.items():
        print(f"  {label}: {c['count']}")
    print(f"\nManifest: {MANIFEST_PATH}")
