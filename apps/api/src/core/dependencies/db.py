# Stdlib
from typing import Annotated

# Third-party
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

# Local
from core.db import get_db

DbSession = Annotated[AsyncSession, Depends(get_db)]
