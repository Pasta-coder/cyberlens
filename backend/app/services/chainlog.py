from datetime import datetime
import json
import os

LOG_FILE = "app/data/chainlog.jsonl"

def chain_log(action: str, actor: str, target: str, sha256: str = None, meta: dict = None):
    entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "action": action,
        "actor": actor,
        "target": target,
        "sha256": sha256,
        "meta": meta or {}
    }

    with open(LOG_FILE, "a") as f:
        f.write(json.dumps(entry) + "\n")
