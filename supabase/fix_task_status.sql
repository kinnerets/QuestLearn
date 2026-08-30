-- One-time cleanup: when the `status` column was added it defaulted every
-- existing completion (from before the approval flow) to 'pending'. Those older
-- rows were already done under the old flow, so mark anything from before today
-- as 'approved'. Today's real pending requests are left untouched.
update home_task_done
   set status = 'approved'
 where status = 'pending'
   and day < (now() at time zone 'utc')::date;
