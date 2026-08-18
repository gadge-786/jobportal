import supabaseAdmin from '../../../../lib/supabaseAdmin'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const body = await request.json()
  const { examId, candidateName, userId, userEmail, userPhoto, answers, timeTakenSeconds } = body

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
    .select('id, question_order, question_text, question_text_mr, option_a, option_b, option_c, option_d, option_a_mr, option_b_mr, option_c_mr, option_d_mr, correct_option, marks')
    .eq('exam_id', examId)
    .order('question_order', { ascending: true })

  if (qError || !questions) {
    return NextResponse.json({ error: 'Could not load answer key' }, { status: 500 })
  }

  let correctCount = 0
  let wrongCount = 0
  let unattemptedCount = 0
  let score = 0
  const review = []

  for (const q of questions) {
    const givenAnswer = answers[q.id] || null
    let status = 'unattempted'

    if (!givenAnswer) {
      unattemptedCount++
    } else if (givenAnswer === q.correct_option) {
      correctCount++
      score += Number(q.marks)
      status = 'correct'
    } else {
      wrongCount++
      score -= Number(exam.negative_marking)
      status = 'wrong'
    }

    review.push({
      id: q.id,
      question_text: q.question_text,
      question_text_mr: q.question_text_mr,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      option_a_mr: q.option_a_mr,
      option_b_mr: q.option_b_mr,
      option_c_mr: q.option_c_mr,
      option_d_mr: q.option_d_mr,
      correct_option: q.correct_option,
      given_answer: givenAnswer,
      status
    })
  }

  const { data: attempt, error: insertError } = await supabaseAdmin
    .from('exam_attempts')
    .insert({
      exam_id: examId,
      candidate_name: candidateName || 'Anonymous',
      user_id: userId,
      user_email: userEmail,
      user_photo: userPhoto,
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
    review,
    attemptId: attempt.id
  })
}