# MTM Agent System — System Architecture

## 1. System Overview
The **MTM Agent System** is a message-driven AI event planning architecture designed to read an unseen collection of messages in English and Roman Urdu, extract verified facts, resolve conflicts and outdated assertions, enforce hard constraints, and generate a verifiably valid four-hour physical hackathon plan in Islamabad for 150 students in 50 teams.

## 2. Core Architectural Separation
- **AI Language Engine**: Reads unstructured messages in English and Roman Urdu, identifies candidate facts, evaluates semantics, and proposes structured area plans.
- **JavaScript Engine**: Computes exact arithmetic (totals, fees, subtotals, margins), allocations, and enforces hard constraints. The AI is never permitted to declare its own calculations valid.
- **Validation Engine**: Independently verifies the 6 official checks:
  1. Correct numerical figures
  2. Within budget (PKR 650,000 all-in)
  3. Venue fit (capacity >= total attendees: 150 students + 10 staff + 17 judges = 177 heads)
  4. Valid schedule (exactly 240 minutes, including mandatory 15-min prayer break)
  5. Sufficient judges (at least 17 judges for 50 teams at max 3 teams/judge, 15 min/team)
  6. All 5 areas covered (Venue, Schedule, Food, Judging, Budget)
- **Persistence Layer**: MongoDB Atlas with resilient in-memory session synchronization.
- **Provenance & Execution Trace**: Real-time recording of every actual model invocation with real model IDs, area tags, exact prompts, exact responses, and provider-reported tokens.

## 3. Five Planning Modules
1. **Venue Agent (`area: venue`)**: Compares hall capacities, rates, and generator facilities. Selects Hall A (200 seats, PKR 120,000) accommodating 177 attendees.
2. **Schedule Agent (`area: schedule`)**: Produces non-overlapping 240-minute timetable with 15-min prayer break and 45-min judging window.
3. **Food Agent (`area: food`)**: Selects updated standard lunch box (PKR 1,200/head, superseding older quote) with free delivery for 177 attendees.
4. **Judging Agent (`area: judging`)**: Allocates 17 judges across 50 teams (max 3 teams/judge, 15 min/team, PKR 5,000 honorarium each).
5. **Budget Agent (`area: budget`)**: Consolidates venue, catering, judging honorariums, and pre-committed expenses (prizes PKR 100,000, backup internet PKR 20,000, printing PKR 10,000). Remaining funds: PKR 102,600.
