const { query } = require('../config/db');

exports.getStats = async () => {
  const [totalClients, newThisMonth, visitsToday, visitsThisMonth, noShows, returnRate] = await Promise.all([
    query('SELECT COUNT(*) AS total FROM clients'),
    query(`SELECT COUNT(*) AS total FROM clients WHERE created_at >= date_trunc('month', CURRENT_DATE)`),
    query(`SELECT COUNT(*) AS total FROM visits WHERE visited_at::date = CURRENT_DATE`),
    query(`SELECT COUNT(*) AS total FROM visits WHERE visited_at >= date_trunc('month', CURRENT_DATE)`),
    // Clients who haven't visited in 30+ days
    query(`SELECT COUNT(DISTINCT c.id) AS total FROM clients c
           WHERE c.id NOT IN (SELECT client_id FROM visits WHERE visited_at > NOW() - INTERVAL '30 days')
           AND c.id IN (SELECT client_id FROM visits)`),
    // Return rate: clients with 2+ visits / total clients with visits
    query(`SELECT
           CASE WHEN COUNT(DISTINCT v1.client_id) = 0 THEN 0
           ELSE ROUND(COUNT(DISTINCT v2.client_id)::numeric / COUNT(DISTINCT v1.client_id) * 100) END AS rate
           FROM (SELECT DISTINCT client_id FROM visits) v1
           LEFT JOIN (SELECT client_id FROM visits GROUP BY client_id HAVING COUNT(*) >= 2) v2
           ON v1.client_id = v2.client_id`),
  ]);

  return {
    total_clients: parseInt(totalClients.rows[0].total),
    new_this_month: parseInt(newThisMonth.rows[0].total),
    visits_today: parseInt(visitsToday.rows[0].total),
    visits_this_month: parseInt(visitsThisMonth.rows[0].total),
    no_shows: parseInt(noShows.rows[0].total),
    return_rate: parseInt(returnRate.rows[0].rate),
  };
};

exports.getPipeline = async () => {
  const result = await query(`
    SELECT
      COUNT(*) FILTER (WHERE visit_count = 0) AS new_lead,
      COUNT(*) FILTER (WHERE visit_count = 1) AS first_visit,
      COUNT(*) FILTER (WHERE visit_count >= 2 AND last_visit > NOW() - INTERVAL '30 days') AS regular,
      COUNT(*) FILTER (WHERE visit_count >= 1 AND last_visit <= NOW() - INTERVAL '30 days') AS inactive
    FROM (
      SELECT c.id,
        COUNT(v.id) AS visit_count,
        MAX(v.visited_at) AS last_visit
      FROM clients c LEFT JOIN visits v ON c.id = v.client_id
      GROUP BY c.id
    ) sub
  `);
  return result.rows[0];
};

exports.getUpcomingRetouches = () =>
  query(`
    SELECT sp.*, c.name AS client_name, c.phone AS client_phone
    FROM special_procedures sp JOIN clients c ON sp.client_id = c.id
    WHERE sp.next_retouch >= CURRENT_DATE
    AND sp.reminder_sent = FALSE
    ORDER BY sp.next_retouch ASC
    LIMIT 20
  `);

exports.getPopularServices = () =>
  query(`
    SELECT procedure_type, COUNT(*) AS total
    FROM special_procedures
    GROUP BY procedure_type
    ORDER BY total DESC
  `);
