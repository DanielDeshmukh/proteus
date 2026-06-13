#!/usr/bin/env python3
"""PROTEUS CLI — single command to run everything."""
import os, sys, subprocess, signal, time
from pathlib import Path

ROOT = Path(__file__).parent
BACKEND = ROOT / "backend"
FRONTEND = ROOT / "frontend"
BE_PORT = int(os.environ.get("BACKEND_PORT", "8000"))
FE_PORT = int(os.environ.get("FRONTEND_PORT", "5173"))
G, Y, R, C, B, W = "\033[92m", "\033[93m", "\033[91m", "\033[96m", "\033[1m", "\033[0m"

def log(svc, msg, c=C): print(f"{c}{B}[{svc}]{W} {msg}")
def nt(): return os.name == "nt"
def npm(): return "npm.cmd" if nt() else "npm"

def run_be():
    log("proteus", f"Backend  → http://localhost:{BE_PORT}")
    return subprocess.Popen([sys.executable, "-m", "uvicorn", "main:app", "--reload", "--port", str(BE_PORT)], cwd=BACKEND, shell=nt())

def run_fe():
    log("proteus", f"Frontend → http://localhost:{FE_PORT}")
    return subprocess.Popen([npm(), "run", "dev", "--", "--port", str(FE_PORT)], cwd=FRONTEND, shell=nt())

def install():
    log("proteus", "Installing backend...")
    subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], cwd=BACKEND, check=True)
    log("proteus", "Installing frontend...")
    subprocess.run([npm(), "install"], cwd=FRONTEND, check=True)
    log("proteus", f"{G}Done.{W}")

def test():
    r1 = subprocess.run([sys.executable, "-m", "pytest", "tests/", "-q"], cwd=BACKEND)
    r2 = subprocess.run([npm(), "run", "build"], cwd=FRONTEND)
    if r1.returncode == 0 and r2.returncode == 0:
        log("proteus", f"{G}All passed.{W}")
    else:
        sys.exit(1)

def build():
    subprocess.run([npm(), "run", "build"], cwd=FRONTEND, check=True)
    log("proteus", f"{G}Built to frontend/dist/{W}")

def cmd_run(target="all"):
    procs = []
    if target in ("all", "backend"): procs.append(("backend", run_be()))
    if target in ("all", "frontend"): procs.append(("frontend", run_fe()))
    if not procs: log("proteus", f"{R}Unknown: {target}{W}"); sys.exit(1)
    log("proteus", f"\n  {G}PROTEUS is running{W}")
    log("proteus", f"  API docs: {C}http://localhost:{BE_PORT}/api/docs{W}")
    log("proteus", f"  Press {Y}Ctrl+C{W} to stop\n")
    def shutdown(*_):
        for _, p in procs:
            try: p.terminate(); p.wait(timeout=5)
            except: p.kill()
        log("proteus", f"{G}Stopped.{W}"); sys.exit(0)
    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)
    try:
        while True:
            for n, p in procs:
                if p.poll() is not None: log("proteus", f"{R}{n} died ({p.returncode}){W}"); shutdown()
            time.sleep(1)
    except KeyboardInterrupt: shutdown()

if __name__ == "__main__":
    if len(sys.argv) < 2: print("Usage: proteus <run|install|test|build>"); sys.exit(0)
    c = sys.argv[1]
    if c == "run": cmd_run(sys.argv[2] if len(sys.argv) > 2 else "all")
    elif c == "install": install()
    elif c == "test": test()
    elif c == "build": build()
    else: print(f"Unknown: {c}"); sys.exit(1)
