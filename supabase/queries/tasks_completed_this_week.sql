-- Get tasks completed within the current week (starting Monday)
select *
from tasks
where status in ('done', 'complete')
  and completed_at >= date_trunc('week', current_date);
