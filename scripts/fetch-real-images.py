#!/usr/bin/env python3
"""Fetch real full-size costume photos from dilizhans-show.ru category pages."""
import re, os, urllib.request, ssl, time, hashlib
from collections import Counter

OUT_ROOT = "/home/z/my-project/public/images/real"
os.makedirs(OUT_ROOT, exist_ok=True)

# Banner image basenames used site-wide (skip these)
SKIP_BASENAMES = {
    "pirate_v", "she", "he", "01d1-ban", "02cocktail_dress",
    "04сг", "05ростовые-костюмы-нов", "pirate", "banner", "logo", "fav",
}

# Map: local name -> source page URL
PAGES = {
    "newyear":   "https://dilizhans-show.ru/novogodnie-kostjumy/",
    "children":  "https://dilizhans-show.ru/novogodnie-detskie-kostjumy/",
    "retro":     "https://dilizhans-show.ru/stiljagi-retro-disko-chikago/",
    "halloween": "https://dilizhans-show.ru/kostjumy-dlja-hjellouina/",
    "eastern":   "https://dilizhans-show.ru/vostochnye-motivy/",
    "russian":   "https://dilizhans-show.ru/russkie-narodnye-kostjumy/",
    "ball":      "https://dilizhans-show.ru/balnye-platja-dlja-vzroslyh/",
    "cocktail":  "https://dilizhans-show.ru/vechernie-koktejlnye-platja/",
    "wedding":   "https://dilizhans-show.ru/svadebnye-platja/",
    "tuxedo":    "https://dilizhans-show.ru/kostjumy-smokingi-fraki/",
    "boys":      "https://dilizhans-show.ru/malchiki/",
    "girls":     "https://dilizhans-show.ru/devochki/",
    "vegetables":"https://dilizhans-show.ru/ovoshhi-frukty-griby-jagody/",
    "animals":   "https://dilizhans-show.ru/skazochnye-zhivotnye-zverki-ptichki-i-nasekomye/",
    "spanish":   "https://dilizhans-show.ru/ispanskie-nacionalnye-kostjumy/",
    "japanese":  "https://dilizhans-show.ru/japonskie-nacionalnye-kostjumy/",
    "arabic":    "https://dilizhans-show.ru/arabskie-nacionalnye-kostjumy/",
    "gypsy":     "https://dilizhans-show.ru/cyganskie-narodnye-kostjumy/",
    "historical":"https://dilizhans-show.ru/istoricheskie-teatralnye-kostjumy/",
    "vegetables2":"https://dilizhans-show.ru/osennij-bal/",
}

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
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
    """Strip -<W>x<H> suffix to get full-size variant.
    e.g. /foo-150x225.jpg → /foo.jpg
    """
    m = re.search(r"-(\d{2,4})x(\d{2,4})\.([a-z]+)$", url, re.IGNORECASE)
    if m:
        return url[:m.start()] + "." + m.group(3)
    return url

def is_costume_photo(url):
    """Return True if URL points to a real costume photo (not banner/icon)."""
    low = url.lower()
    # must be from uploads
    if "/wp-content/uploads/" not in url and not url.startswith("/wp-content/uploads/"):
        return False
    # skip site-wide banners
    if "/uploads/2017/12/" in url:  # sidebar banners
        return False
    if "/uploads/2018/11/" in url:  # gjetsbi/otzyv banners
        return False
    if "/uploads/2019/03/" in url:  # logo
        return False
    if "/uploads/2021/04/" in url:  # favicon
        return False
    if any(s in low for s in ("fav", "logo", "icon", "sprite", "pixel", "blank", "loader", "placeholder", "tracking", "no-right-click", "yandex", "metrika")):
        return False
    if any(s in low for s in (".js?", ".css?", ".js", ".css", ".svg", ".gif", ".webp")):
        return False
    if not re.search(r"\.(jpg|jpeg|png)(\?|$)", low):
        return False
    return True

def find_imgs(html):
    """Return list of full-size costume photo URLs (unique, deduped)."""
    found = []
    # look at all src/data-src/data-lazy-src attributes
    for m in re.finditer(r'(?:src|data-src|data-lazy-src|data-original)=["\']([^"\']+)["\']', html, re.I):
        u = m.group(1)
        if is_costume_photo(u):
            found.append(normalize_full_size(u))
    # srcset
    for m in re.finditer(r'(?:srcset|data-lazy-srcset)=["\']([^"\']+)["\']', html, re.I):
        for part in m.group(1).split(","):
            url = part.strip().split(" ")[0]
            if is_costume_photo(url):
                found.append(normalize_full_size(url))
    # normalize: prefix relative URLs and percent-encode Cyrillic
    BASE = "https://dilizhans-show.ru"
    from urllib.parse import quote, urlsplit, urlunsplit
    normalized = []
    for u in found:
        if u.startswith("/"):
            u = BASE + u
        # percent-encode path part (keep /, : , .)
        try:
            parts = urlsplit(u)
            # encode the path preserving slashes
            encoded_path = quote(parts.path, safe="/:.,()-")
            u = urlunsplit((parts.scheme, parts.netloc, encoded_path, parts.query, parts.fragment))
        except Exception:
            pass
        normalized.append(u)
    # dedupe preserving order
    seen = set()
    res = []
    for u in normalized:
        if u not in seen:
            seen.add(u)
            res.append(u)
    return res

def download(url, path, timeout=25):
    if os.path.exists(path) and os.path.getsize(path) > 5000:
        return ("skip", 0)
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "image/*"})
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
            data = r.read()
        if len(data) < 5000:
            return ("too-small", len(data))
        with open(path, "wb") as f:
            f.write(data)
        return ("ok", len(data))
    except Exception as e:
        return (f"err:{e}", 0)

def process_page(name, url, max_per_page=8):
    print(f"\n→ {name}: {url}")
    html = fetch(url)
    if not html:
        return []
    imgs = find_imgs(html)
    print(f"  found {len(imgs)} unique costume photos")
    results = []
    for i, img_url in enumerate(imgs[:max_per_page]):
        # extension
        ext = ".jpg"
        m = re.search(r"\.(jpg|jpeg|png|webp)(\?|$)", img_url, re.I)
        if m:
            ext = "." + m.group(1).lower()
        # Use a hash of the URL to dedupe across pages (same image appears in multiple pages)
        url_hash = hashlib.md5(img_url.encode()).hexdigest()[:8]
        local = f"{name}_{i+1}_{url_hash}{ext}"
        path = os.path.join(OUT_ROOT, local)
        status, size = download(img_url, path)
        if status == "ok":
            print(f"  ✓ {local} ({size//1024} KB)")
            results.append((local, img_url))
        elif status == "skip":
            print(f"  ⏭  {local} (cached)")
            results.append((local, img_url))
        else:
            # try thumbnail variant if full-size fails
            if "-150x225" in img_url or "-150x150" in img_url:
                pass  # already tried normalized; nothing else
            print(f"  ✗ {local}: {status}")
    return results

if __name__ == "__main__":
    all_results = {}
    for name, url in PAGES.items():
        all_results[name] = process_page(name, url)
        time.sleep(0.4)
    print("\n=== Summary ===")
    total = sum(len(v) for v in all_results.values())
    print(f"Downloaded {total} real photos to {OUT_ROOT}")
    for name, items in all_results.items():
        print(f"  {name}: {len(items)} photos")
