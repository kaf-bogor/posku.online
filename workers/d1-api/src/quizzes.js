// API quiz (Cloudflare Worker, D1). Data sumber: fs_quiz / fs_quiz_question / fs_quiz_attempt.
//
// Endpoint:
//   GET    /api/quizzes                        -> daftar quiz (createdAt desc)
//   GET    /api/quizzes/attempts               -> semua attempt user yang login  [user login]
//   GET    /api/quizzes/:id                    -> detail quiz (dengan soal terurut)
//   GET    /api/quizzes/:id/attempt            -> attempt terakhir user utk quiz  [user login]
//   POST   /api/quizzes/:id/attempts           -> simpan hasil pengerjaan quiz  [user login]
//   GET    /api/quizzes/:id/leaderboard?limit= -> papan peringkat                [user login]
//   GET    /api/quizzes/:id/attempts           -> daftar percobaan               [admin]
//   DELETE /api/quizzes/:id                    -> hapus quiz                     [admin]

import { requireAdmin, requireUser } from './auth';
import { json } from './json';

function genId() {
  const abc =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  let s = '';
  for (const b of bytes) s += abc[b % abc.length];
  return s;
}

const parseArr = (s) => {
  try {
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
};

async function rowToQuiz(env, row) {
  const qRes = await env.DB.prepare(
    `SELECT id, title, answer, level, media, options
     FROM fs_quiz_question WHERE quiz_id = ? ORDER BY position ASC`
  )
    .bind(row.id)
    .all();

  const questions = qRes.results.map((q) => ({
    id: q.id,
    title: q.title,
    answer: q.answer,
    level: q.level,
    media: q.media,
    options: parseArr(q.options),
  }));

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    level: row.level,
    timeLimit: row.time_limit === null ? undefined : Number(row.time_limit),
    questions,
    createdBy: row.created_by,
    createdAt: row.created_at_iso,
    updatedAt: row.updated_at_iso,
  };
}

async function attemptToRow(row) {
  return {
    id: row.id,
    quizId: row.quiz_id,
    userId: row.user_id,
    userName: row.user_name,
    score: Number(row.score),
    totalQuestions: Number(row.total_questions),
    timeSpent: Number(row.time_spent),
    submittedAt: row.submitted_at,
    answers: (() => {
      try {
        return row.answers ? JSON.parse(row.answers) : {};
      } catch {
        return {};
      }
    })(),
  };
}

// ---------- handlers ----------
async function listQuizzes(env) {
  const { results } = await env.DB.prepare(
    `SELECT * FROM fs_quiz
     WHERE (is_delete IS NULL OR is_delete = 0)
     ORDER BY (created_at_iso IS NULL), created_at_iso DESC`
  ).all();
  const data = [];
  for (const row of results) data.push(await rowToQuiz(env, row));
  return json({ data, count: data.length });
}

async function getOne(env, id) {
  const { results } = await env.DB.prepare('SELECT * FROM fs_quiz WHERE id = ?')
    .bind(id)
    .all();
  if (results.length === 0) return json({ error: 'Not found' }, 404);
  return json(await rowToQuiz(env, results[0]));
}

async function submitAttempt(env, id, body, user) {
  const exists = await env.DB.prepare('SELECT id FROM fs_quiz WHERE id = ? AND (is_delete IS NULL OR is_delete = 0)')
    .bind(id)
    .all();
  if (exists.results.length === 0) return json({ error: 'Not found' }, 404);

  const attemptId = genId();
  const now = new Date().toISOString();

  await env.DB.prepare(
    `INSERT INTO fs_quiz_attempt
       (id, quiz_id, user_id, user_name, user_email, score, total_questions,
        time_spent, submitted_at, answers)
     VALUES (?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    attemptId,
    id,
    user.uid,
    user.name,
    user.email,
    body.score ?? 0,
    body.totalQuestions ?? 0,
    body.timeSpent ?? 0,
    now,
    JSON.stringify(body.answers ?? {})
  ).run();

  return json({
    id: attemptId,
    quizId: id,
    userId: user.uid,
    score: body.score ?? 0,
    totalQuestions: body.totalQuestions ?? 0,
    timeSpent: body.timeSpent ?? 0,
    submittedAt: now,
    answers: body.answers ?? {},
  }, 201);
}

async function leaderboard(env, url, id) {
  const limit = Math.min(Number(url.searchParams.get('limit')) || 10, 100);
  const { results } = await env.DB.prepare(
    `SELECT id, quiz_id, user_id, user_name, user_email, score,
            total_questions, time_spent, submitted_at
     FROM fs_quiz_attempt
     WHERE quiz_id = ?
     ORDER BY score DESC, time_spent ASC, submitted_at ASC
     LIMIT ?`
  )
    .bind(id, limit)
    .all();

  const data = results.map((r) => ({
    id: r.id,
    quizId: r.quiz_id,
    userId: r.user_id,
    userName: r.user_name || r.user_email || 'Unknown User',
    score: Number(r.score),
    totalQuestions: Number(r.total_questions),
    timeSpent: Number(r.time_spent),
    submittedAt: r.submitted_at,
  }));
  return json({ data });
}

async function attemptsForQuiz(env, id) {
  const { results } = await env.DB.prepare(
    `SELECT * FROM fs_quiz_attempt WHERE quiz_id = ? ORDER BY submitted_at DESC`
  )
    .bind(id)
    .all();
  const data = [];
  for (const row of results) data.push(await attemptToRow(row));
  return json({ data });
}

async function removeQuiz(env, id) {
  const exists = await env.DB.prepare('SELECT id FROM fs_quiz WHERE id = ? AND (is_delete IS NULL OR is_delete = 0)')
    .bind(id)
    .all();
  if (exists.results.length === 0) return json({ error: 'Not found' }, 404);

  await env.DB.prepare('UPDATE fs_quiz SET is_delete = 1 WHERE id = ?').bind(id).run();
  return json({ ok: true });
}

async function myAttempts(env, user) {
  const { results } = await env.DB.prepare(
    `SELECT * FROM fs_quiz_attempt WHERE user_id = ? ORDER BY submitted_at DESC`
  )
    .bind(user.uid)
    .all();
  const data = [];
  for (const row of results) data.push(await attemptToRow(row));
  return json({ data });
}

async function myAttemptForQuiz(env, user, quizId) {
  const { results } = await env.DB.prepare(
    `SELECT * FROM fs_quiz_attempt
     WHERE quiz_id = ? AND user_id = ?
     ORDER BY submitted_at DESC LIMIT 1`
  )
    .bind(quizId, user.uid)
    .all();
  if (results.length === 0) return json({ error: 'Not found' }, 404);
  return json(await attemptToRow(results[0]));
}

// ---------- router ----------
export async function handleQuizzes(request, env, url) {
  const path = url.pathname;
  const idMatch = path.match(/^\/api\/quizzes\/([^/]+)$/);
  const subMatch = path.match(/^\/api\/quizzes\/([^/]+)\/([^/]+)$/);

  try {
    if (path === '/api/quizzes' || path === '/api/quizzes/') {
      if (request.method === 'GET') return await listQuizzes(env);
      return json({ error: 'Method not allowed' }, 405);
    }

    if (path === '/api/quizzes/attempts') {
      if (request.method === 'GET') {
        const guard = await requireUser(request);
        if (guard.error) return guard.error;
        return await myAttempts(env, guard.user);
      }
      return json({ error: 'Method not allowed' }, 405);
    }

    const attemptMatch = path.match(/^\/api\/quizzes\/([^/]+)\/attempt$/);
    if (attemptMatch) {
      const [, id] = attemptMatch;
      if (request.method === 'GET') {
        const guard = await requireUser(request);
        if (guard.error) return guard.error;
        return await myAttemptForQuiz(env, guard.user, id);
      }
      return json({ error: 'Method not allowed' }, 405);
    }

    if (subMatch) {
      const [, id, sub] = subMatch;
      if (request.method === 'GET' && sub === 'attempts') {
        const guard = await requireAdmin(request, env);
        if (guard.error) return guard.error;
        return await attemptsForQuiz(env, id);
      }
      if (request.method === 'GET' && sub === 'leaderboard') {
        const guard = await requireUser(request);
        if (guard.error) return guard.error;
        return await leaderboard(env, url, id);
      }
      if (request.method === 'POST' && sub === 'attempts') {
        const guard = await requireUser(request);
        if (guard.error) return guard.error;
        const body = await request.json();
        return await submitAttempt(env, id, body, guard.user);
      }
      return json({ error: 'Not found' }, 404);
    }

    if (idMatch) {
      const [, id] = idMatch;
      if (request.method === 'GET') return await getOne(env, id);
      if (request.method === 'DELETE') {
        const guard = await requireAdmin(request, env);
        if (guard.error) return guard.error;
        return await removeQuiz(env, id);
      }
      return json({ error: 'Method not allowed' }, 405);
    }

    return json({ error: 'Not found' }, 404);
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      500
    );
  }
}
