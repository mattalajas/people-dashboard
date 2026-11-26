# Designing the next version calibration at Halter
# Outline:

A dashboard for team and individual performance reviews. The dashboard must present an overview of the performance reviews across departments, teams, and individuals and a way to edit and manage these performance reviews. All is kept secure and private through provisioned roles and secure databases

#### Build scenarios:

- A department view showing the flagged team and why
    - Must contain a collection of spread per group including the managers assessment of individual employees and their own self reviews
    - Show how groups get closed and moves onto the next group
    - Apply the rules for each flagged team
- A rating change with its reason shown in history
    - Display a change in rating visually and in its history when clicked
- An AI summary for the flagged team

#### Datamodel

- User
    - _id
    - manager_id
    - Team
    - Department
- User review
    - _id
    - user_id
    - Craft_review
    - Culture_review
    - Whats_next_review
    - Timestamps
- Manager review
    - _id
    - user_id
    - manager_id (user_id)
    - Craft_score
    - Culture_score
    - Craft_score_justification
    - Culture_score_justification
    - Locked
    - Timestamps
    - Calibration_history (list per changed audit)
        - Craft_score
        - Culture_score
        - Justification
        - Timestamps
        - Session
- Calibration
    - _id
    - manager_id (user_id)
    - group_reviews (list per user_id)
        - User_review_id
        - Manager_review_id
    - Ai_review

## Dashboard View

For now, just a department view that shows flagged teams and other teams. Each team would have its own ratings. An individual and aggregated rating. A spread is shown per group outlining the collective performance of its members. The spread shows a graph of its team members' scores.

- Need to have explanation on the flagged teams
    - Refer to rules to flag a particular team slice:
        - 5 scores (Below, Developing, Strong, Exceeding, Exceptional)
        - More than 40% Exceeding or Exceptional. Exactly 40% is not a flag
        - Under 5 people, hide the histogram and say why
            - Roll those ratings into the parent
            - The team stays visible and is still assessed
        - Every change needs a written response once the manager has proposed
    - Need an AI summary of these flagged teams
        - Only provide an AI summary for flagged teams. Why were they flagged and any analysis with the manager written evidences
- People information sits in a database where some fields are more sensitive than others
    - Encrypt particular columns
    - Only provision read privileges to specific users
    - Could also have different collections for different levels of field privacy
- Only specific users can access this dashboard
    - Would need new authentication role for this
    - Could enforce read and write privileges through an org-charts relational graph
    - MongoDB is one database example that can leverage this
    - PostgreSQL in Databricks Lakebase is also another applicable database service

## Rating and Calibration

Allow managers to edit the rating with a reason. All edits and changes must be audited

- Need to audit every user and AI-made decision or changes
    - The flag is a rule. The AI summary only explains it
    - User changes must be audited
    - Need to also audit provision changes
- We can start simple. People managers are the only ones who can access the dashboard
    - People Ops admins see everything, except their own assessment
    - People Partners see only their portfolio
- Current calibration process
    - Calibration runs in levels. A higher group level only opens once every group below its level has closed
    - Changes must be audited in a group sheet. Only managers of that current group can calibrate their teams scores
    - For this mockup, focus on the department level, but design must be able to stack different levels of groups needing calibration

## Technical foundations

Need to deal with testing, auditing, and security. Individual people performance reviews are at the atomic level. They build teams and the each of their performance reviews goes through the calibration cycle. Ratings are flagged, changed, and audited accordingly. 

Testing is done with either mock or staging data from previous performance review cycles. Preferably mock data to avoid leakage of performance reviews

- Deterministic rules are easy to enforce and test
- AI evaluation is much more complicated

Auditing needs to be comprehensive. We need to audit:

- The flag is a rule. The AI summary only explains it
- User changes must be audited
- Need to also audit provision changes

Security

- Roles are provisioned
    - Only certain groups of users can access the database and even only further access certain columns
- Databases are secured and encrypted
- Can have two separate collections / databases for different levels of data encryption
- AI model input would not include any PII

## Future considerations

- How to ensure security and privacy is scalable and robust
- Expand to leaders and managers