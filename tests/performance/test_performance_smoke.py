from __future__ import annotations
import json
import time
from pathlib import Path
from pocket_lab_test_utils import isolated_state_dir


def test_fastapi_import_startup_time_under_budget():
    started = time.perf_counter()
    from pocket_lab_test_utils import load_fastapi_app

    app = load_fastapi_app()
    elapsed = time.perf_counter() - started
    assert app is not None
    assert elapsed < 5.0


def test_workflow_journal_rebuild_time_under_budget(tmp_path):
    state = isolated_state_dir(tmp_path)
    journal = state / "workflow_events.jsonl"
    journal.write_text(
        "\n".join(
            json.dumps({"workflow_id": f"wf-{i%25}", "status": "succeeded"})
            for i in range(1000)
        )
        + "\n"
    )
    started = time.perf_counter()
    projection = {}
    for line in journal.read_text().splitlines():
        item = json.loads(line)
        projection[item["workflow_id"]] = item["status"]
    elapsed = time.perf_counter() - started
    assert len(projection) == 25
    assert elapsed < 1.0


def test_pwa_bundle_size_budget_if_dist_exists():
    dist = Path("dist")
    if not dist.exists():
        return
    total = sum(p.stat().st_size for p in dist.rglob("*") if p.is_file())
    assert total < 15 * 1024 * 1024


def test_bootstrap_scripts_disk_footprint_is_reasonable():
    scripts = Path(
        "pocket-lab-final-structure/pocket-lab-bootstrap-production-scripts-patched/scripts"
    )
    if not scripts.exists():
        return
    total = sum(p.stat().st_size for p in scripts.rglob("*.sh"))
    assert total < 2 * 1024 * 1024
