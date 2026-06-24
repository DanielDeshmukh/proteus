"""initial schema

Revision ID: 001_initial
Revises:
Create Date: 2026-06-24
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "application_runs",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("created_at", sa.Text(), nullable=False),
        sa.Column("jd_text", sa.Text(), nullable=True),
        sa.Column("jd_source", sa.Text(), nullable=True),
        sa.Column("resume_text", sa.Text(), nullable=True),
        sa.Column("resume_source", sa.Text(), nullable=True),
        sa.Column("overall_score", sa.Float(), nullable=True),
        sa.Column("section_scores", sa.Text(), nullable=True),
        sa.Column("gap_analysis", sa.Text(), nullable=True),
        sa.Column("rewrite_suggestions", sa.Text(), nullable=True),
        sa.Column("cover_letter", sa.Text(), nullable=True),
        sa.Column("action_list", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="pending"),
        sa.Column("error_message", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("application_runs")
