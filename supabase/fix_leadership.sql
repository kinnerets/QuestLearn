-- Clean up malformed leadership questions: the auto-generator wrongly produced
-- multiple-choice rows (no prompt / no icon choices) into leadership topics,
-- which broke the leadership screen. Remove any leadership question that isn't a
-- proper reflective one (must have a "prompt"). The curated worlds are kept.
delete from questions_bank q
 using curriculum_topics t
 where q.topic_id = t.id
   and t.subject = 'leadership'
   and (q.payload ->> 'prompt') is null;
