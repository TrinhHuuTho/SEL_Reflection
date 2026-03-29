"""
Blooket Blook Icon Downloader
==============================
Script này tải về tất cả icon "blook" dễ thương từ Blooket.
Chạy: python download_blooket_icons.py

Yêu cầu: pip install requests beautifulsoup4
"""

import os
import re
import json
import time
import requests
from pathlib import Path
from bs4 import BeautifulSoup

# ── Cấu hình ──────────────────────────────────────────────────────────────────
OUTPUT_DIR = Path("blooket_icons")        # Thư mục lưu ảnh
OUTPUT_EXT = ".svg"                       # Lưu SVG trực tiếp
DELAY      = 0.2                           # Giây chờ giữa mỗi request (lịch sự với server)
BASE_CDN   = "https://ac.blooket.com/marketassets/blooks"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/124.0.0.0 Safari/537.36",
    "Referer": "https://www.blooket.com/",
}

# ── Danh sách đầy đủ blook names (lấy từ source code Blooket) ─────────────────
# Nguồn: https://github.com/Blooket/blooket-js hoặc phân tích JS bundle
BLOOK_NAMES = [
    # ── Starters ──
    "blook", "fish", "frog",
    # ── Aquatic ──
    "anglerfish", "barreleye", "blobfish", "clownfish", "crab", "cuttlefish",
    "dolphin", "dumbooctopus", "electriceel", "fishingrod", "flyingfish",
    "hammerheadshark", "jellyfish", "koi", "lobster", "mantaray", "narwhal",
    "oarfish", "octopus", "pufferfish", "salamander", "seahorse", "seal",
    "shark", "shrimp", "squid", "swordfish", "turtle", "walrus", "whale",
    "whipnoseanglerfish",
    # ── Arctic ──
    "arcticfox", "arcticowl", "bunny", "dove", "husky", "penguin", "polarbear",
    "rabbit", "reindeer", "seal2", "snowleopard", "wolf",
    # ── Bot ──
    "bot",
    # ── Breakfast ──
    "baconandeggsblook", "biscuit", "blueberry", "blueberrymuffin",
    "blueberrypancakes", "butterflywaffles", "chocolatechippancakes",
    "cinnamonroll", "classicbagel", "coffeecup", "creamcheesebagel",
    "croissant", "donut", "egg", "frenchtoast", "friedegg", "grapejuice",
    "granolabar", "hashbrown", "honeybutter", "ivorymuffin", "maplesyrup",
    "orangejuice", "pancake", "rainbowsherbet", "scrambledegg", "strawberry",
    "strawberryivorymuffin", "strawberrymilk", "strawberrywaffle", "waffle",
    # ── Castle ──
    "blackdragon", "dragon", "fairy", "ghost", "king", "knight", "ogre",
    "prince", "princess", "queen", "rook", "unicorn", "witch", "wizard",
    # ── Café ──
    "biscotti", "browniecookie", "cake", "coffeecookies", "cookiesandcream",
    "espresso", "gingerbreadman", "lavenderdrink", "latte", "macaron",
    "matchadrink", "matcharoll", "mochafrappe", "oreo", "pinkdrink", "tiramisu",
    # ── Camping ──
    "bear", "beaver", "deer", "eagle", "elk", "fox", "moose", "owl", "rabbit2",
    "raccoon", "squirrel",
    # ── Chillhop ──
    "bearblook", "cat", "catblook", "dog", "dogblook", "frogblook",
    # ── Christmas ──
    "christmasblook", "christmastree", "elf", "gingerbread", "ornament",
    "present", "santa", "snowman", "stocking",
    # ── Crypto ──
    "bitcoinblook", "dogeblook", "ethereumblook", "litecoinblook", "nftblook",
    # ── Default / Common ──
    "black", "blue", "brown", "green", "orange", "pink", "purple",
    "red", "white", "yellow",
    # ── Dino ──
    "ankylosaurus", "brachiosaurus", "parasaurolophus", "pterodactyl",
    "stegosaurus", "trex", "triceratops", "velociraptor",
    # ── Food ──
    "avocadotoast", "burrito", "cheeseburger", "chickennuggets", "chips",
    "cottagecheese", "fries", "hotdog", "icecream", "nacho", "noodles",
    "picklejar", "pizza", "pretzel", "ramen", "sushi", "taco", "waffle2",
    # ── Galaxy ──
    "alien", "astronaut", "blackhole", "comet", "mars", "moon", "planet",
    "rocket", "saturn", "spaceshuttle", "star", "ufo",
    # ── Halloween ──
    "bat", "blackcat", "cauldron", "frankenstein", "gravestone", "jackolantern",
    "mummy", "pumpkin", "skull", "spider", "vampire", "werewolf", "witch2",
    # ── Jungle ──
    "butterfly", "chameleon", "crocodile", "elephant", "flamingo", "gorilla",
    "hippo", "jaguar", "lemur", "lion", "macaw", "meerkat", "monkey",
    "rhinoceros", "sloth", "snake", "tiger", "toucan", "zebra",
    # ── Medieval ──
    "archer", "jester", "medievalking", "medievalknight", "medievalqueen",
    "monk", "peasant", "royalguard", "viking",
    # ── Plants ──
    "cactus", "daisyblook", "fernblook", "flowerblook", "leafblook",
    "mushroomblook", "peabudblook", "rosebud", "sproutblook", "succulentblook",
    "sunflowerblook", "treeblook", "tulipblook",
    # ── Safari ──
    "cheetah", "giraffe", "hyena", "leopard", "lion2", "ostrich", "warthog",
    "wildebeest",
    # ── Space ──
    "blackholemonster", "cosmiccat", "galaxybrain", "nebulacreature",
    "spaceoctopus",
    # ── Sports ──
    "baseball", "basketball", "football", "golf", "hockey", "soccer",
    "tennis", "volleyball",
    # ── St. Patrick's ──
    "clover", "gnome", "leprechaun", "pot", "rainbow", "shamrock",
    # ── Swamp ──
    "axolotl", "firefly", "heron", "mudpuppy", "newt", "toad",
    # ── Tim ──
    "tim",
    # ── Valentine's ──
    "cupid", "heartblook", "lovebird", "teddybear",
    # ── Woodland ──
    "badger", "chipmunk", "groundhog", "hedgehog", "mole", "mouse",
    "opossum", "porcupine", "skunk",
]

# Loại bỏ trùng lặp, giữ thứ tự
seen = set()
BLOOK_NAMES_UNIQUE = [x for x in BLOOK_NAMES if not (x in seen or seen.add(x))]


# ── Hàm tải ảnh ──────────────────────────────────────────────────────────────
def download_blook(name: str, session: requests.Session) -> bool:
    """Tải một blook icon SVG, trả về True nếu thành công."""
    url = f"{BASE_CDN}/{name}.svg"
    try:
        resp = session.get(url, headers=HEADERS, timeout=10)
        if resp.status_code == 200 and len(resp.content) > 100:
            out_path = OUTPUT_DIR / f"{name}{OUTPUT_EXT}"
            out_path.write_bytes(resp.content)
            return True
        return False
    except Exception as e:
        print(f"  ⚠  Lỗi khi tải {name}: {e}")
        return False


def try_discover_from_js(session: requests.Session) -> list[str]:
    """
    Cố gắng lấy thêm tên blook từ JS bundle của Blooket.
    Trả về danh sách tên mới tìm được.
    """
    extra = []
    try:
        # Lấy trang chủ để tìm link JS bundle
        r = session.get("https://www.blooket.com/", headers=HEADERS, timeout=15)
        # Tìm các file JS chunk
        js_files = re.findall(r'src="(/static/js/[^"]+\.js)"', r.text)
        
        for js_path in js_files[:5]:  # Chỉ kiểm tra 5 file đầu
            js_url = "https://www.blooket.com" + js_path
            jr = session.get(js_url, headers=HEADERS, timeout=15)
            # Tìm pattern blook name: "hedgehog","axolotl",...
            found = re.findall(r'"([a-z][a-z0-9]+)\.svg"', jr.text)
            extra.extend(found)
            time.sleep(0.1)
    except Exception as e:
        print(f"  ℹ  Không thể tự động khám phá từ JS bundle: {e}")
    
    return list(set(extra))


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    OUTPUT_DIR.mkdir(exist_ok=True)

    # Nếu đã có file cũ (.png hoặc .img), đổi sang .svg theo yêu cầu
    for old_file in OUTPUT_DIR.glob('*'):
        if old_file.suffix in ['.png', '.img']:
            target = old_file.with_suffix(OUTPUT_EXT)
            if not target.exists():
                old_file.rename(target)

    session = requests.Session()

    print("🔍 Đang khám phá blook names từ JS bundle Blooket...")
    extra_names = try_discover_from_js(session)
    all_names = list(dict.fromkeys(BLOOK_NAMES_UNIQUE + extra_names))
    print(f"   → Tổng cộng {len(all_names)} blook names để thử tải.\n")

    success, failed = [], []

    for i, name in enumerate(all_names, 1):
        out_path = OUTPUT_DIR / f"{name}{OUTPUT_EXT}"
        if out_path.exists():
            print(f"  ✓ [{i:>3}/{len(all_names)}] {name}{OUTPUT_EXT}  (đã có)")
            success.append(name)
            continue

        ok = download_blook(name, session)
        if ok:
            print(f"  ✅ [{i:>3}/{len(all_names)}] {name}.svg")
            success.append(name)
        else:
            print(f"  ❌ [{i:>3}/{len(all_names)}] {name}  (không tìm thấy)")
            failed.append(name)

        time.sleep(DELAY)

    # ── Tạo file HTML gallery để xem tất cả icon ──
    html_items = "\n".join(
        f'  <div class="item">'
        f'<img src="{name}{OUTPUT_EXT}" alt="{name}" title="{name}"><br>'
        f'<small>{name}</small></div>'
        for name in success
    )
    gallery_html = f"""<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Blooket Icons Gallery</title>
  <style>
    body {{ font-family: sans-serif; background: #1a1a2e; color: #eee; padding: 20px; }}
    h1   {{ text-align: center; color: #f0a500; }}
    .grid {{ display: flex; flex-wrap: wrap; gap: 14px; justify-content: center; }}
    .item {{ background: #16213e; border-radius: 12px; padding: 12px; text-align: center;
             width: 90px; transition: transform .2s; }}
    .item:hover {{ transform: scale(1.15); }}
    .item img {{ width: 64px; height: 64px; object-fit: contain; }}
    small {{ font-size: 10px; color: #aaa; word-break: break-all; }}
  </style>
</head>
<body>
  <h1>🐾 Blooket Icons ({len(success)} icons)</h1>
  <div class="grid">
{html_items}
  </div>
</body>
</html>"""
    (OUTPUT_DIR / "gallery.html").write_text(gallery_html, encoding="utf-8")

    # ── Tóm tắt ──
    print(f"\n{'─'*50}")
    print(f"✅ Tải thành công : {len(success)} icons  →  thư mục '{OUTPUT_DIR}/'")
    print(f"❌ Không tìm thấy: {len(failed)} names")
    print(f"🖼  Xem gallery   : mở file  '{OUTPUT_DIR}/gallery.html'  trong trình duyệt")
    if failed:
        print(f"\nDanh sách không tải được:\n  {', '.join(failed)}")


if __name__ == "__main__":
    main()