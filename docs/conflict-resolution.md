# Conflict Resolution & Message Defense Strategy

## Core Principle
**Recency is evidence about time, not proof of authority or correctness.**
The system never automatically accepts a message simply because its timestamp is newer.

## Resolution Workflow
1. **Source Authority**:
   - The Dean's office holds budgetary and event duration authority.
   - The Caterer holds catering unit rates authority.
   - Student Society messages are unauthorized suggestions unless countersigned by Finance/Dean.
2. **Outdated vs Superseded**:
   - Caterer's 20 Oct rate (Rs 1,000) is superseded by Caterer's 12 Nov message ("Salam bhai! Standard lunch box ab Rs 1,200 per head hoga, basic wala Rs 800. Delivery free hai").
3. **Placing Constraints Above Claims**:
   - If an incoming message proposes ordering 100 lunch boxes ("to keep costs low"), the validation engine rejects the proposal because it contradicts the hard requirement of feeding all 177 confirmed participants (150 students + 10 staff + 17 judges).
4. **Preserving Rejected Evidence**:
   - Every rejected proposal is preserved in `rejectedMessages` and logged in the execution trace with an explicit reason code and justification.
