import supabaseAdmin from '../../../../lib/supabaseAdmin'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const body = await request.json()
  const { examId, candidateName, answers, timeTakenSeconds } = body
  // answers format: { questionId: "A" | "B" | "C" | "D" | null }

  if (!examId || !answers) {
    return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
  }

  const { data: exam } = await supabaseAdmin
    .from('exam_tests')
    .select('negative_marking')
    .eq('id', examId)
    .single()

  if (!exam) {
    return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
  }

  const { data: questions, error: qError } = await supabaseAdmin
    .from('exam_questions')
    .select('id, correct_option, marks')
    .eq('exam_id', examId)

  if (qError || !questions) {
    return NextResponse.json({ error: 'Could not load answer key' }, { status: 500 })
  }

  let correctCount = 0
  let wrongCount = 0
  let unattemptedCount = 0
  let score = 0

  for (const q of questions) {
    const givenAnswer = answers[q.id]
    if (!givenAnswer) {
      unattemptedCount++
    } else if (givenAnswer === q.correct_option) {
      correctCount++
      score += Number(q.marks)
    } else {
      wrongCount++
      score -= Number(exam.negative_marking)
    }
  }

  const { data: attempt, error: insertError } = await supabaseAdmin
    .from('exam_attempts')
    .insert({
      exam_id: examId,
      candidate_name: candidateName || 'Anonymous',
      total_questions: questions.length,
      correct_count: correctCount,
      wrong_count: wrongCount,
      unattempted_count: unattemptedCount,
      score: score,
      time_taken_seconds: timeTakenSeconds || null
    })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: 'Could not save attempt' }, { status: 500 })
  }

  return NextResponse.json({
    result: {
      totalQuestions: questions.length,
      correctCount,
      wrongCount,
      unattemptedCount,
      score
    },
    attemptId: attempt.id
  })
}