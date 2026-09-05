-- Optional, for an immediate clean slate: delete AI-generated questions so the
-- bank refills under the hardened validator (grade rules + Hebrew + no-answer-
-- in-stem). KEEPS the hand-curated seed content (source='curated'). The generator
-- refills the emptied topics automatically (on-demand while playing + nightly).
--
-- Use this if you'd rather not wait for the nightly self-revalidation to work
-- through the existing questions.
delete from questions_bank
where source = 'ai_generated';
