# Calibration is a group tree, not a manager's list

A **calibration session** belongs to a **group** in a tree, because a manager's flat list of reviews cannot close level by level or roll a **hidden spread** into its parent. A person belongs to one leaf **group**. The reporting line does not decide who is in a session. A **group** with fewer than 5 people still runs a full session and is shown like any other **group**; only its **spread** histogram is omitted, and those **ratings** roll into the parent when the parent opens. The cutoff is applied again at each level. A **rating change** is allowed in any session whose **spread** contains that person, so a shown child is calibrated only in its own session, while a hidden child's people can be changed again by the parent.

## Considered options

- Team and department fields on the person, plus a calibration bundle owned by the manager. Rejected: two fixed columns and a flat list cannot stack levels or reapply the cutoff after rollup.
- Groups under 5 have no session and are assessed only once the parent opens. Rejected: they go through the same calibration process as any other group. The histogram is the only difference.

## Consequences

The parent **spread** contains hidden children and people whose leaf **group** is the parent. It does not contain people from a child whose histogram is shown. A department made only of large teams has no histogram. **Person lines** stay on the leaf **group**, including when that **group** is flagged and its histogram is hidden.
