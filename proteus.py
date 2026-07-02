#!/usr/bin/env python3
"""PROTEUS CLI — single command to run the Next.js app."""
import os, sys, subprocess
from pathlib import Path

ROOT = Path(__file__).parent
NEXT = ROOT / "proteus-next"
G, R, C, B, W = "\033[92m", "\033[91m", "\033[96m", "\033[1m", "\033[0m"

def log(svc, msg, c=C): print(f"{c}{B}[{svc}]{W} {msg}")

def cmd_run():
    log("proteus", f"App -> http://localhost:3000")
    log("proteus", f"\n  {G}PROTEUS is running{W}")
    log("proteus", f"  Press {R}Ctrl+C{W} to stop\n")
    subprocess.run(["npx", "next", "dev"], cwd=NEXT)

def cmd_install():
    log("proteus", "Installing dependencies...")
    subprocess.run(["npm", "install"], cwd=NEXT, check=True)
    log("proteus", f"{G}Done.{W}")

def cmd_build():
    subprocess.run(["npx", "next", "build"], cwd=NEXT, check=True)
    log("proteus", f"{G}Built.{W}")

def cmd_seed():
    subprocess.run(["npx", "tsx", "seed.ts"], cwd=NEXT, check=True)

if __name__ == "__main__":
    if len(sys.argv) < 2: print("Usage: proteus <run|install|build|seed>"); sys.exit(0)
    c = sys.argv[1]
    if c == "run": cmd_run()
    elif c == "install": cmd_install()
    elif c == "build": cmd_build()
    elif c == "seed": cmd_seed()
    else: print(f"Unknown: {c}"); sys.exit(1)
