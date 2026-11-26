# Calibration

Language for how performance reviews are grouped, rated, and rolled up on the calibration dashboard.

## Structure

**Group**:
A node in the calibration tree. It has a parent **Group**, except at the root, and a level such as team or department. A person belongs to one leaf **Group**.
_Avoid_: Org unit, team (as a record type), department (as a record type)

**Cycle**:
One performance-review calibration run. Every **Calibration session** belongs to one **Cycle**.
_Avoid_: Round, period

**Calibration session**:
One **Group**'s turn in a **Cycle**. It is open or closed. A parent **Group**'s session opens only after every child session has closed, including a child whose **Spread** is hidden.
_Avoid_: Calibration bundle, review round

**Manager**:
The person someone reports to. The reporting line does not decide which **Group** calibrates them.
_Avoid_: Calibration owner, people manager

## Reviews

**Manager assessment**:
The Craft **Rating**, the Culture **Rating**, and a written justification for each, recorded by a **Manager** for a person.
_Avoid_: Manager review, score

**Self review**:
The employee's written craft, culture, and what's next. It has no **Rating**.
_Avoid_: User review

**Rating**:
One of Below, Developing, Strong, Exceeding, or Exceptional. A **Manager assessment** has one **Rating** for Craft and one for Culture.
_Avoid_: Score, grade

**Spread**:
The **Group**'s aggregated rating: the unnamed distribution of **Ratings** across the five bands. Each person in it contributes a Craft **Rating** and a Culture **Rating**.
_Avoid_: Average, mean, overall score

**Hidden spread**:
A **Spread** whose histogram is not drawn, because that **Spread** contains fewer than 5 people. The **Group** is still shown and analysed like any other **Group**. A **Group** with nobody in its **Spread** has no histogram.
_Avoid_: Suppressed team, private group

**Person line**:
A person shown on their leaf **Group**: both **Ratings**, both justifications, and their **Self review**, with no name. A parent **Group** does not repeat it.
_Avoid_: Row, employee card, name

**Rollup**:
Inclusion of a **Hidden spread**'s **Ratings** in the parent **Group**'s **Spread** when that parent's **Calibration session** opens. If the parent **Spread** still contains fewer than 5 people, it stays hidden and rolls onward.
_Avoid_: Merge, skip-level

**Flag**:
A **Group** whose own **Spread** has more than 40% of its **Ratings** at Exceeding or Exceptional. Exactly 40% is not a **Flag**. A **Hidden spread** can still be a **Flag**.
_Avoid_: AI flag, alert

**Rating change**:
A change to one **Rating** made in a **Calibration session** whose **Spread** contains that person, kept with the axis, both bands, and the written reason. The **Manager assessment** shows the current **Ratings**.
_Avoid_: Audit log, calibration history

**AI summary**:
Text that explains a **Flag**, shown on that **Group** even when its **Spread** is hidden. It does not decide the **Flag**.
_Avoid_: AI review, AI decision
