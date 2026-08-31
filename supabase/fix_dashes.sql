-- Replace wide dashes (em "—" / en "–") with a plain hyphen in existing content
-- the girls actually see. The seed SQL files were also cleaned, but rows already
-- inserted keep their old text until this runs. Safe to run and re-run.

-- Questions (stem, hint, choices, explanation… all live inside payload jsonb).
update questions_bank
set payload = replace(replace(payload::text, '—', '-'), '–', '-')::jsonb
where payload::text like '%—%' or payload::text like '%–%';

-- Sub-topic names, just in case.
update curriculum_topics
set sub_topic = replace(replace(sub_topic, '—', '-'), '–', '-')
where sub_topic like '%—%' or sub_topic like '%–%';
