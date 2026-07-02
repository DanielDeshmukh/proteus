#!/usr/bin/env python3
"""PROTEUS — single command to run everything."""
import os, sys, subprocess, time, signal
from pathlib import Path

ROOT = Path(__file__).parent
NEXT = ROOT / "proteus-next"
PORT = int(os.environ.get("PORT", "3000"))
G, R, B, W = "\033[92m", "\033[91m", "\033[1m", "\033[0m"

def log(msg, c=""): print(f"{c}{B}[proteus]{W} {msg}")

def cmd_run():
    log(f"Starting Next.js on http://localhost:{PORT}")
    log(f"Press {R}Ctrl+C{W} to stop\n")
    p = subprocess.Popen(["node", "node_modules/next/dist/bin/next", "dev", "-p", str(PORT)], cwd=NEXT)
    def shutdown(*_):
        p.terminate()
        try: p.wait(timeout=5)
        except: p.kill()
        log(f"{G}Stopped.{W}")
        sys.exit(0)
    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)
    p.wait()

def cmd_install():
    log("Installing dependencies...")
    subprocess.run(["npm", "install"], cwd=NEXT, check=True)
    log(f"{G}Done.{W}")

def cmd_build():
    subprocess.run(["npx", "next", "build"], cwd=NEXT, check=True)
    log(f"{G}Built.{W}")

def cmd_seed():
    subprocess.run(["npx", "tsx", "seed.ts"], cwd=NEXT, check=True)

if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "run"
    {"run": cmd_run, "install": cmd_install, "build": cmd_build, "seed": cmd_seed}.get(cmd, lambda: (print(f"Unknown: {cmd}"), sys.exit(1)))()
