# app/schemas/__init__.py
# This file makes the schemas directory a Python package

from .received_letter_schema import (
    ReceivedLetterCreate, ReceivedLetterRead, ReceivedLetterUpdate,
    ReceivedLetterList, LetterStatistics, LetterFilters,
    LetterStatus, LetterPriority, LetterCategory
)

from .meeting_program_schema import (
    MeetingProgramCreate, MeetingProgramRead, MeetingProgramUpdate,
    MeetingProgramKPIs, MeetingProgramStats
) 