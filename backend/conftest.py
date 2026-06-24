import os
import sys
from pathlib import Path

os.environ["PROTEUS_ENV"] = "test"

sys.path.insert(0, str(Path(__file__).resolve().parent))
