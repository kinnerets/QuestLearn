-- Optional: make ALL of Mili's (grade 3) questions vocalized.
-- Clears the current grade-3 questions so the generator refills them WITH nikud
-- automatically (on-demand while she plays + the nightly job). Leadership is left
-- alone. Grade-3 topics are briefly empty until they fill back in.
--
-- Trade-off: this replaces the hand-curated grade-3 seed questions with fresh
-- AI-generated (auto-verified) ones. Run it only if you want full consistency.
delete from questions_bank q
using curriculum_topics t
where q.topic_id = t.id
  and t.grade = 'grade_3'
  and t.subject <> 'leadership';
