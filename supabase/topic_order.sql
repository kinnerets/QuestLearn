-- Normalize curriculum_topics.order_index so the soft prerequisite gate has a
-- clean 1,2,3… sequence inside every (subject, grade).
--
-- Why you might need this: the seed content is already ordered (1, 2, …), so
-- gating works out of the box. But order_index defaults to 0, so any sub-topic
-- added later WITHOUT an explicit order_index sits at 0 and ties with others —
-- and the gate can't tell which comes first. This renumbers everyone in place,
-- keeping the existing order and only breaking ties deterministically.
--
-- Safe to run and re-run: it preserves the current ordering (it sorts by the
-- existing order_index first) and just closes gaps / breaks ties by name.

with ranked as (
  select
    id,
    row_number() over (
      partition by subject, grade
      order by order_index, sub_topic      -- keep current order; break ties by name
    ) as rn
  from curriculum_topics
)
update curriculum_topics t
set order_index = r.rn
from ranked r
where t.id = r.id
  and t.order_index is distinct from r.rn; -- only touch rows that actually change

-- Peek at the result (optional):
-- select subject, grade, order_index, sub_topic
-- from curriculum_topics order by subject, grade, order_index;
