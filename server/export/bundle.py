# server/export/bundle.py
"""
Creates a signed ZIP bundle containing all export artifacts.
SHA-256 hash of all file contents is embedded in manifest.json.
"""




from __future__ import annotations

import hashlib
import io
import json
import re
import zipfile
from datetime import datetime, timezone






def _sha256_of_files(files: dict[str, bytes]) -> str:
    """Compute SHA-256 over all file contents (sorted by filename for determinism)."""
    h = hashlib.sha256()
    for name in sorted(files.keys()):
        h.update(name.encode())
        h.update(files[name])
    return h.hexdigest()





def create_bundle(
    task_name: str,
    arm_name: str,
    arduino_src: str,
    python_src: str,
    bom_csv: str,
    bom_json: dict,
    urdf_xml: str,
    qr_png: bytes,
) -> tuple[bytes, str]:
    """
    Build a signed ZIP and return (zip_bytes, sha256_hex).

    The ZIP contains:
      {slug}/
        ├── {slug}.ino
        ├── {slug}.py
        ├── bom.csv
        ├── bom.json
        ├── robot.urdf
        ├── qr_code.png
        └── manifest.json
    """
    generated_at = datetime.now(timezone.utc).isoformat()
    # Keep archive paths Windows-safe: ASCII letters/digits/underscore/hyphen only.
    safe_slug = re.sub(r"[^a-z0-9_-]+", "_", task_name.lower()).strip("_-")[:32]
    slug = safe_slug or "mirai_task"

    # Collect all files (name → bytes)
    files: dict[str, bytes] = {
        f"{slug}/{slug}.ino":     arduino_src.encode(),
        f"{slug}/{slug}.py":      python_src.encode(),
        f"{slug}/bom.csv":        bom_csv.encode(),
        f"{slug}/bom.json":       json.dumps(bom_json, indent=2).encode(),
        f"{slug}/robot.urdf":     urdf_xml.encode(),
        f"{slug}/qr_code.png":    qr_png,
    }

    sha256 = _sha256_of_files(files)

    manifest = {
        "task_name":    task_name,
        "arm_name":     arm_name,
        "generated_at": generated_at,
        "files":        list(files.keys()),
        "sha256_hash":  sha256,
        "mirai_version": "0.1.0",
        "verify": "sha256sum -c <(echo '{sha256}  {slug}.zip')".format(
            sha256=sha256, slug=slug
        ),
    }
    files[f"{slug}/manifest.json"] = json.dumps(manifest, indent=2).encode()

    # Pack ZIP (stored, not deflated — faster, and .ino files are small)
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for name, data in files.items():
            zf.writestr(name, data)

    return buf.getvalue(), sha256
