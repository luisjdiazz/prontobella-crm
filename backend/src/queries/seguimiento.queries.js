const { query } = require('../config/db');

/**
 * Get all clients with follow-up status.
 * Categorizes each client by urgency based on their last visit.
 */
exports.getFollowUpList = () =>
  query(`
    SELECT
      c.id,
      c.name,
      c.phone,
      c.birthday,
      c.vip_code,
      c.created_at,
      COUNT(v.id)::int AS visit_count,
      MAX(v.visited_at) AS last_visit,
      EXTRACT(DAY FROM NOW() - MAX(v.visited_at))::int AS days_since_visit,
      (
        SELECT sp.procedure_type FROM special_procedures sp
        WHERE sp.client_id = c.id
        ORDER BY sp.performed_at DESC LIMIT 1
      ) AS last_procedure,
      (
        SELECT sp.next_retouch FROM special_procedures sp
        WHERE sp.client_id = c.id AND sp.next_retouch IS NOT NULL
        ORDER BY sp.next_retouch ASC LIMIT 1
      ) AS next_retouch,
      (
        SELECT al.created_at FROM automation_log al
        WHERE al.client_id = c.id
        ORDER BY al.created_at DESC LIMIT 1
      ) AS last_contacted
    FROM clients c
    LEFT JOIN visits v ON v.client_id = c.id
    GROUP BY c.id
    ORDER BY
      -- Prioritize: clients needing follow-up first
      CASE
        WHEN MAX(v.visited_at) IS NULL THEN 1                                          -- never visited
        WHEN NOW() - MAX(v.visited_at) > INTERVAL '60 days' THEN 2                    -- 60d+ inactive
        WHEN NOW() - MAX(v.visited_at) > INTERVAL '30 days' THEN 3                    -- 30d+ inactive
        WHEN NOW() - MAX(v.visited_at) > INTERVAL '15 days' THEN 4                    -- 15d+ no visit
        ELSE 5                                                                          -- recent
      END,
      MAX(v.visited_at) ASC NULLS FIRST
  `);

/**
 * Get follow-up stats summary
 */
exports.getFollowUpStats = () =>
  query(`
    SELECT
      COUNT(*) FILTER (
        WHERE last_visit IS NULL
      )::int AS never_visited,
      COUNT(*) FILTER (
        WHERE last_visit IS NOT NULL AND NOW() - last_visit > INTERVAL '60 days'
      )::int AS inactive_60d,
      COUNT(*) FILTER (
        WHERE last_visit IS NOT NULL AND NOW() - last_visit BETWEEN INTERVAL '30 days' AND INTERVAL '60 days'
      )::int AS inactive_30d,
      COUNT(*) FILTER (
        WHERE last_visit IS NOT NULL AND NOW() - last_visit BETWEEN INTERVAL '15 days' AND INTERVAL '30 days'
      )::int AS needs_followup,
      COUNT(*) FILTER (
        WHERE last_visit IS NOT NULL AND NOW() - last_visit < INTERVAL '15 days'
      )::int AS active,
      COUNT(*) FILTER (
        WHERE birthday IS NOT NULL
        AND to_char(CURRENT_DATE, 'DD/MM') = birthday
      )::int AS birthday_today,
      COUNT(*)::int AS total
    FROM (
      SELECT
        c.id,
        c.birthday,
        MAX(v.visited_at) AS last_visit
      FROM clients c
      LEFT JOIN visits v ON v.client_id = c.id
      GROUP BY c.id
    ) sub
  `);

/**
 * Log a manual follow-up action (when staff clicks "send WhatsApp")
 */
exports.logFollowUp = (clientId, messageType, messageText) =>
  query(`
    INSERT INTO automation_log (client_id, type, channel, status, message_text, scheduled_for, sent_at)
    VALUES ($1, $2, 'whatsapp', 'sent', $3, NOW(), NOW())
    RETURNING *
  `, [clientId, messageType, messageText]);
